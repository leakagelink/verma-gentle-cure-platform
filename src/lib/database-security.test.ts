import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

const patient = "00000000-0000-4000-8000-000000000001";
const other = "00000000-0000-4000-8000-000000000002";
let db: PGlite;
async function asPatient(sql: string) {
  return db.exec(
    `SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${patient}',false),set_config('request.jwt.claim.role','authenticated',false); ${sql}`,
  );
}
async function reset() {
  await db.exec("RESET ROLE; SELECT set_config('request.jwt.claim.role','',false);");
}
describe("direct PostgreSQL security regression", () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE SCHEMA auth; CREATE SCHEMA storage;
      CREATE TABLE auth.users(id uuid PRIMARY KEY,raw_user_meta_data jsonb DEFAULT '{}');
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$SELECT current_setting('request.jwt.claim.role',true)$$;
      GRANT USAGE ON SCHEMA auth TO authenticated,service_role;
      CREATE TABLE storage.objects(id uuid,bucket_id text,name text,metadata jsonb); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);
    for (const path of readdirSync("supabase/migrations").sort())
      await db.exec(readFileSync(`supabase/migrations/${path}`, "utf8"));
    await db.exec(`CREATE TABLE public.case_records(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),patient_id uuid NOT NULL,appointment_id uuid,status text DEFAULT 'draft',attachments jsonb DEFAULT '[]',created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
      GRANT SELECT,INSERT,UPDATE ON public.case_records TO authenticated; GRANT ALL ON public.case_records TO service_role;
      ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY; CREATE POLICY own_case ON public.case_records FOR ALL TO authenticated USING(patient_id=auth.uid()) WITH CHECK(patient_id=auth.uid());
      CREATE TABLE public.clinical_assignments(patient_id uuid,doctor_id uuid,assigned_by uuid,UNIQUE(patient_id,doctor_id));
      ALTER TABLE public.appointments ADD COLUMN consultation_type text DEFAULT 'new';`);
    await db.exec(`CREATE TABLE public.case_clinical_notes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),case_record_id uuid,doctor_id uuid);
      CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql AS $$SELECT string_to_array($1,'/')$$;
      GRANT USAGE ON SCHEMA storage TO authenticated; GRANT SELECT,INSERT ON storage.objects TO authenticated;`);
    // Financial types/tables precede recovered functions; consent depends on those functions.
    for (const path of readdirSync("drizzle/migrations")
      .filter((p) => p.endsWith(".sql"))
      .sort()) {
      if (path.startsWith("0006_"))
        await db.exec(readFileSync("src/lib/__tests__/verified-baseline.sql", "utf8"));
      await db.exec(readFileSync(`drizzle/migrations/${path}`, "utf8"));
    }
    await db.exec(`CREATE TRIGGER payment_security BEFORE INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.guard_payment_write();
      INSERT INTO auth.users(id) VALUES('${patient}'),('${other}');
      SELECT set_config('request.jwt.claim.role','service_role',false);
      INSERT INTO public.appointments(id,patient_id,patient_name,phone,mode,appointment_date,slot,concern,fee) VALUES('00000000-0000-4000-8000-000000000010','${patient}','Test Patient','9000000000','video',current_date+1,'10:00 AM','Synthetic concern',700);`);
  }, 30000);
  afterAll(async () => {
    await db?.close();
  });
  it("rejects direct appointment fee tampering", async () => {
    await asPatient(
      "UPDATE public.appointments SET fee=1 WHERE id='00000000-0000-4000-8000-000000000010';",
    );
    await reset();
    const result = await db.query<{ fee: number }>(
      "SELECT fee FROM public.appointments WHERE id='00000000-0000-4000-8000-000000000010'",
    );
    expect(result.rows[0]?.fee).toBe(700);
  });
  it("rejects direct paid payment forgery", async () => {
    await expect(
      asPatient(
        `INSERT INTO public.payments(user_id,kind,amount,method,status) VALUES('${patient}','order',1,'card','paid');`,
      ),
    ).rejects.toThrow();
    await reset();
  });
  it("rejects direct underpriced order creation", async () => {
    await expect(
      asPatient(
        `INSERT INTO public.orders(user_id,customer_name,phone,email,address,city,state,pincode,payment_method,subtotal,total) VALUES('${patient}','Test Patient','9000000000','test@example.invalid','Synthetic Address','Test','Test','831005','cod',1,1);`,
      ),
    ).rejects.toThrow();
    await reset();
  });
  it("rejects direct order-item insertion", async () => {
    await expect(
      asPatient(
        "INSERT INTO public.order_items(order_id,slug,name,pack,price,qty,line_total) VALUES('00000000-0000-4000-8000-000000000099','fake','fake','fake',1,1,1);",
      ),
    ).rejects.toThrow();
    await reset();
  });
  it("rejects missing consent even for patient self-access", async () => {
    await expect(
      asPatient(`INSERT INTO public.case_records(patient_id) VALUES('${patient}');`),
    ).rejects.toThrow("consent");
    await reset();
  });
  for (const [name, version, timestamp] of [
    ["invalid version", "invalid", "now()"],
    ["stale timestamp", "health-2026-10-24", "now()-interval '16 minutes'"],
    ["future timestamp", "health-2026-10-24", "now()+interval '1 minute'"],
  ])
    it(`rejects consent ${name}`, async () => {
      await reset();
      const result = await db.query<{ id: string }>(
        `INSERT INTO public.health_consent_receipts(user_id,purpose,notice_version,accepted_at) VALUES('${patient}','case','${version}',${timestamp}) RETURNING id`,
      );
      await expect(
        asPatient(
          `INSERT INTO public.case_records(patient_id,health_consent_receipt_id) VALUES('${patient}','${result.rows[0]?.id}');`,
        ),
      ).rejects.toThrow("consent");
      await reset();
    });
  it("accepts server-issued consent once and rejects replay", async () => {
    await reset();
    const result = await db.query<{ id: string }>(
      `INSERT INTO public.health_consent_receipts(user_id,purpose,notice_version) VALUES('${patient}','case','health-2026-10-24') RETURNING id`,
    );
    const sql = `INSERT INTO public.case_records(patient_id,health_consent_receipt_id) VALUES('${patient}','${result.rows[0]?.id}');`;
    await asPatient(sql);
    await reset();
    await expect(asPatient(sql)).rejects.toThrow("consent");
    await reset();
  });
  it("patients cannot create arbitrary consent receipts", async () => {
    await expect(
      asPatient(
        `INSERT INTO public.health_consent_receipts(user_id,purpose,notice_version) VALUES('${patient}','case','health-2026-10-24');`,
      ),
    ).rejects.toThrow();
    await reset();
  });
  it("patients cannot invoke service-only settlement", async () => {
    await expect(
      asPatient(
        `SELECT public.settle_gateway_payment('00000000-0000-4000-8000-000000000099','${patient}','order_test','pay_test',1,'card');`,
      ),
    ).rejects.toThrow();
    await reset();
  });
  it("cancellation RPC cannot cancel another patient's appointment", async () => {
    await reset();
    await db.exec(
      `SELECT set_config('request.jwt.claim.role','service_role',false); INSERT INTO public.appointments(id,patient_id,patient_name,phone,mode,appointment_date,slot,concern,fee) VALUES('00000000-0000-4000-8000-000000000011','${other}','Other Patient','9000000000','video',current_date+1,'10:00 AM','Synthetic concern',700);`,
    );
    await expect(
      asPatient(
        "SELECT public.cancel_patient_appointment('00000000-0000-4000-8000-000000000011');",
      ),
    ).rejects.toThrow("not cancellable");
    await reset();
  });
  it("authoritative settlement is idempotent and updates both bill and payment", async () => {
    await reset();
    await db.exec(`SELECT set_config('request.jwt.claim.role','service_role',false);
      INSERT INTO public.payments(id,user_id,kind,appointment_id,amount,method,status,gateway,gateway_order_id) VALUES('00000000-0000-4000-8000-000000000020','${patient}','consultation','00000000-0000-4000-8000-000000000010',700,'card','pending','razorpay','order_test');`);
    const sql = `SELECT public.settle_gateway_payment('00000000-0000-4000-8000-000000000020','${patient}','order_test','pay_test',700,'card');`;
    await db.exec(sql);
    await db.exec(sql);
    const result = await db.query<{ status: string; payment_status: string }>(
      "SELECT p.status,a.payment_status FROM public.payments p JOIN public.appointments a ON a.id=p.appointment_id WHERE p.id='00000000-0000-4000-8000-000000000020'",
    );
    expect(result.rows[0]).toEqual({ status: "paid", payment_status: "paid" });
    await expect(
      db.exec(
        `SELECT public.settle_gateway_payment('00000000-0000-4000-8000-000000000020','${patient}','order_wrong','pay_test',700,'card');`,
      ),
    ).rejects.toThrow("binding");
    await reset();
  });
  it("a failed final payment write rolls back the associated bill update", async () => {
    await reset();
    await db.exec(`SELECT set_config('request.jwt.claim.role','service_role',false);
      INSERT INTO public.payments(id,user_id,kind,appointment_id,amount,method,status,gateway,gateway_order_id) VALUES('00000000-0000-4000-8000-000000000021','${other}','consultation','00000000-0000-4000-8000-000000000011',700,'card','pending','razorpay','order_rollback');`);
    // Inject a failure after the bill update, at the final authoritative write.
    await db.exec(
      "ALTER TABLE public.payments ADD CONSTRAINT synthetic_final_write_failure CHECK(id<>'00000000-0000-4000-8000-000000000021' OR status<>'paid');",
    );
    await expect(
      db.exec(
        `SELECT public.settle_gateway_payment('00000000-0000-4000-8000-000000000021','${other}','order_rollback','pay_rollback',700,'card');`,
      ),
    ).rejects.toThrow("synthetic_final_write_failure");
    const bill = await db.query<{ payment_status: string }>(
      "SELECT payment_status FROM public.appointments WHERE id='00000000-0000-4000-8000-000000000011'",
    );
    expect(bill.rows[0]?.payment_status).toBe("pending");
    await reset();
  });
  it("checkout derives ₹1500 plus ₹125 and deduplicates request IDs", async () => {
    const product = await db.query<{ slug: string; stock: number }>(
      "SELECT slug,stock FROM public.products WHERE is_active AND category='homeopathic-kits' LIMIT 1",
    );
    const selected = product.rows[0];
    if (!selected) throw new Error("Test catalogue must contain a kit");
    const payload = {
      customer_name: "Test Patient",
      phone: "9000000000",
      email: "test@example.invalid",
      address: "Synthetic Address",
      city: "Test",
      state: "Test",
      pincode: "831005",
      payment_method: "cod",
      coupon: null,
      notes: "",
      items: [{ slug: selected.slug, qty: 1 }],
    };
    await asPatient("SELECT 1");
    const call = () =>
      db.query<{ result: { id: string; total: number } }>(
        "SELECT public.create_idempotent_order($1::jsonb,$2::uuid) result",
        [JSON.stringify(payload), "00000000-0000-4000-8000-000000000030"],
      );
    const first = await call();
    const repeated = await call();
    expect(first.rows[0]?.result.total).toBe(1625);
    expect(repeated.rows[0]?.result.id).toBe(first.rows[0]?.result.id);
    await expect(
      db.query("SELECT public.create_idempotent_order($1::jsonb,$2::uuid)", [
        JSON.stringify({ ...payload, total: 1 }),
        "00000000-0000-4000-8000-000000000031",
      ]),
    ).rejects.toThrow("Protected order fields");
    await reset();
    const stock = await db.query<{ stock: number }>(
      "SELECT stock FROM public.products WHERE slug=$1",
      [selected.slug],
    );
    expect(stock.rows[0]?.stock).toBe(selected.stock - 1);
  });
  it("patients cannot read another patient's appointment", async () => {
    await asPatient("SELECT 1");
    const result = await db.query("SELECT id FROM public.appointments WHERE patient_id=$1", [
      other,
    ]);
    expect(result.rows).toHaveLength(0);
    await reset();
  });
  it("assigned clinical access does not let a clinician overwrite consent evidence", async () => {
    await reset();
    await db.exec(`INSERT INTO public.user_roles(user_id,role) VALUES('${other}','doctor'); INSERT INTO public.clinical_assignments(patient_id,doctor_id,assigned_by) VALUES('${patient}','${other}','${other}');
      CREATE POLICY test_clinical_case ON public.case_records FOR UPDATE TO authenticated USING(public.can_access_patient(patient_id));
      CREATE POLICY test_clinical_case_read ON public.case_records FOR SELECT TO authenticated USING(public.can_access_patient(patient_id));
      SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${other}',false),set_config('request.jwt.claim.role','authenticated',false);
      UPDATE public.case_records SET health_notice_version='forged' WHERE patient_id='${patient}';`);
    await reset();
    const result = await db.query<{ health_notice_version: string }>(
      "SELECT health_notice_version FROM public.case_records WHERE patient_id=$1",
      [patient],
    );
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows.every((row) => row.health_notice_version === "health-2026-10-24")).toBe(
      true,
    );
  });
  it("blocks automated deletion when medical records require retention review", async () => {
    await reset();
    await db.exec(`INSERT INTO public.user_roles(user_id,role) VALUES('${other}','admin');
      INSERT INTO public.account_deletion_requests(id,user_id,scope) VALUES('00000000-0000-4000-8000-000000000040','${patient}','account');
      SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${other}',false);`);
    const claim = await db.query<{ result: { state: string } }>(
      "SELECT public.claim_account_deletion('00000000-0000-4000-8000-000000000040') result",
    );
    expect(claim.rows[0]?.result.state).toBe("blocked");
    await reset();
    const remains = await db.query("SELECT id FROM public.appointments WHERE patient_id=$1", [
      patient,
    ]);
    expect(remains.rows.length).toBeGreaterThan(0);
  });
  it("unassigned doctors cannot read prescriptions or audit snapshots", async () => {
    const unassigned = "00000000-0000-4000-8000-000000000060";
    await reset();
    await db.exec(`INSERT INTO auth.users(id) VALUES('${unassigned}'); INSERT INTO public.user_roles(user_id,role) VALUES('${unassigned}','doctor');
      SELECT set_config('request.jwt.claim.role','service_role',false);
      INSERT INTO public.prescriptions(patient_id,doctor_id,diagnosis,medicines) VALUES('${patient}','${other}','Synthetic diagnosis','[]');
      SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${unassigned}',false),set_config('request.jwt.claim.role','authenticated',false);`);
    const prescriptions = await db.query(
      "SELECT id FROM public.prescriptions WHERE patient_id=$1",
      [patient],
    );
    const audits = await db.query("SELECT id FROM public.prescription_audit WHERE patient_id=$1", [
      patient,
    ]);
    expect(prescriptions.rows).toHaveLength(0);
    expect(audits.rows).toHaveLength(0);
    await reset();
    const exists = await db.query("SELECT id FROM public.prescriptions WHERE patient_id=$1", [
      patient,
    ]);
    expect(exists.rows.length).toBeGreaterThan(0);
  });
  it("storage rejects upload without a current server-issued case consent receipt", async () => {
    await reset();
    await db.exec(
      `CREATE POLICY synthetic_owner_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='patient-reports' AND (storage.foldername(name))[1]=auth.uid()::text);`,
    );
    const insert = `INSERT INTO storage.objects(bucket_id,name,metadata) VALUES('patient-reports','${patient}/synthetic.pdf','{"mimetype":"application/pdf","size":100}')`;
    await expect(asPatient(insert)).rejects.toThrow();
    await reset();
    await db.exec(
      `INSERT INTO public.health_consent_receipts(user_id,purpose,notice_version) VALUES('${patient}','case','health-2026-10-24')`,
    );
    await asPatient(insert);
    await reset();
    const objects = await db.query("SELECT name FROM storage.objects WHERE name=$1", [
      `${patient}/synthetic.pdf`,
    ]);
    expect(objects.rows).toHaveLength(1);
  });
  it("denies unauthorized deletion claims and direct completion forgery", async () => {
    await expect(
      asPatient("SELECT public.claim_account_deletion('00000000-0000-4000-8000-000000000040')"),
    ).rejects.toThrow("Administrator");
    await reset();
    await expect(
      asPatient(
        "UPDATE public.account_deletion_requests SET processing_state='completed' WHERE user_id=auth.uid()",
      ),
    ).rejects.toThrow();
    await reset();
  });
  it("token-bound deletion removes eligible synthetic profile data and prevents duplicate claims", async () => {
    const disposable = "00000000-0000-4000-8000-000000000050";
    const request = "00000000-0000-4000-8000-000000000051";
    await reset();
    await db.exec(`INSERT INTO auth.users(id) VALUES('${disposable}'); INSERT INTO public.account_deletion_requests(id,user_id,scope) VALUES('${request}','${disposable}','account');
      SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${other}',false);`);
    await reset();
    const before = await db.query("SELECT id FROM public.profiles WHERE id=$1", [disposable]);
    expect(before.rows).toHaveLength(1);
    await db.exec(
      `SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${other}',false);`,
    );
    const claim = await db.query<{ result: { state: string; token: string } }>(
      `SELECT public.claim_account_deletion('${request}') result`,
    );
    const token = claim.rows[0]?.result.token;
    expect(claim.rows[0]?.result.state).toBe("processing");
    if (!token) throw new Error("Missing processing token");
    await expect(db.exec(`SELECT public.claim_account_deletion('${request}')`)).rejects.toThrow(
      "already processing",
    );
    await reset();
    await db.exec("SELECT set_config('request.jwt.claim.role','service_role',false)");
    await expect(
      db.exec(
        `SELECT public.purge_eligible_account_data('${request}','00000000-0000-4000-8000-000000000099')`,
      ),
    ).rejects.toThrow();
    await db.exec(`SELECT public.purge_eligible_account_data('${request}','${token}')`);
    const profiles = await db.query("SELECT id FROM public.profiles WHERE id=$1", [disposable]);
    const roles = await db.query("SELECT id FROM public.user_roles WHERE user_id=$1", [disposable]);
    expect(profiles.rows).toHaveLength(0);
    expect(roles.rows).toHaveLength(0);
    const receipt = await db.query<{ processing_state: string }>(
      "SELECT processing_state FROM public.account_deletion_requests WHERE id=$1",
      [request],
    );
    expect(receipt.rows[0]?.processing_state).toBe("processing");
  });
  it("blocks new clinical dependencies after a deletion claim", async () => {
    await reset();
    await db.exec("SELECT set_config('request.jwt.claim.role','service_role',false)");
    await expect(
      db.exec(
        `INSERT INTO public.clinical_assignments(patient_id,doctor_id,assigned_by) VALUES('00000000-0000-4000-8000-000000000050','${other}','${other}')`,
      ),
    ).rejects.toThrow("privacy processing");
  });
  it("preserves assignments created by a demoted administrator", async () => {
    const former = "00000000-0000-4000-8000-000000000070";
    const request = "00000000-0000-4000-8000-000000000071";
    await reset();
    await db.exec(
      `INSERT INTO auth.users(id) VALUES('${former}'); INSERT INTO public.clinical_assignments(patient_id,doctor_id,assigned_by) VALUES('${other}','${other}','${former}'); INSERT INTO public.account_deletion_requests(id,user_id,scope) VALUES('${request}','${former}','account'); SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${other}',false);`,
    );
    const result = await db.query<{ result: { state: string } }>(
      `SELECT public.claim_account_deletion('${request}') result`,
    );
    expect(result.rows[0]?.result.state).toBe("blocked");
    await reset();
    const assignments = await db.query(
      "SELECT assigned_by FROM public.clinical_assignments WHERE assigned_by=$1",
      [former],
    );
    expect(assignments.rows).toHaveLength(1);
  });
  it("reopens completed data-only requests while preserving the previous receipt", async () => {
    const request = "00000000-0000-4000-8000-000000000080";
    await reset();
    await db.exec(
      `SELECT set_config('request.jwt.claim.role','service_role',false); INSERT INTO public.account_deletion_requests(id,user_id,scope,processing_state,completed_at) VALUES('${request}','${patient}','data','completed',now()); SELECT public.reopen_data_deletion('${request}','${patient}');`,
    );
    const result = await db.query<{ processing_state: string; history: number }>(
      "SELECT processing_state,jsonb_array_length(processing_history) history FROM public.account_deletion_requests WHERE id=$1",
      [request],
    );
    expect(result.rows[0]).toEqual({ processing_state: "pending", history: 1 });
  });
});
