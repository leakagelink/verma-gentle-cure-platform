import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

const patient = "00000000-0000-4000-8000-000000000001";
const other = "00000000-0000-4000-8000-000000000002";
let db: PGlite;
async function asPatient(sql: string) {
  return db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${patient}',false),set_config('request.jwt.claim.role','authenticated',false); ${sql}`);
}
async function reset() { await db.exec("RESET ROLE; SELECT set_config('request.jwt.claim.role','',false);"); }
describe("direct PostgreSQL security regression", () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE SCHEMA auth; CREATE SCHEMA storage;
      CREATE TABLE auth.users(id uuid PRIMARY KEY,raw_user_meta_data jsonb DEFAULT '{}');
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$SELECT current_setting('request.jwt.claim.role',true)$$;
      GRANT USAGE ON SCHEMA auth TO authenticated,service_role;
      CREATE TABLE storage.objects(id uuid,bucket_id text,name text,metadata jsonb); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);
    for (const path of readdirSync("supabase/migrations").sort()) await db.exec(readFileSync(`supabase/migrations/${path}`, "utf8"));
    await db.exec(`CREATE TABLE public.case_records(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),patient_id uuid NOT NULL,appointment_id uuid,status text DEFAULT 'draft',attachments jsonb DEFAULT '[]',created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
      GRANT SELECT,INSERT,UPDATE ON public.case_records TO authenticated; GRANT ALL ON public.case_records TO service_role;
      ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY; CREATE POLICY own_case ON public.case_records FOR ALL TO authenticated USING(patient_id=auth.uid()) WITH CHECK(patient_id=auth.uid());
      CREATE TABLE public.clinical_assignments(patient_id uuid,doctor_id uuid,assigned_by uuid,UNIQUE(patient_id,doctor_id));
      ALTER TABLE public.appointments ADD COLUMN consultation_type text DEFAULT 'new';`);
    // Financial types/tables precede recovered functions; consent depends on those functions.
    for (const path of readdirSync("drizzle/migrations").filter(p => p.endsWith(".sql")).sort()) {
      if (path.startsWith("0006_")) await db.exec(readFileSync("src/lib/__tests__/verified-baseline.sql", "utf8"));
      await db.exec(readFileSync(`drizzle/migrations/${path}`, "utf8"));
    }
    await db.exec(`CREATE TRIGGER appointment_security BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.guard_appointment_write();
      CREATE TRIGGER payment_security BEFORE INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.guard_payment_write();
      INSERT INTO auth.users(id) VALUES('${patient}'),('${other}');
      SELECT set_config('request.jwt.claim.role','service_role',false);
      INSERT INTO public.appointments(id,patient_id,patient_name,phone,mode,appointment_date,slot,concern,fee) VALUES('00000000-0000-4000-8000-000000000010','${patient}','Test Patient','9000000000','video',current_date+1,'10:00 AM','Synthetic concern',700);`);
  }, 30000);
  afterAll(async () => { await db?.close(); });
  it("rejects direct appointment fee tampering", async () => {
    await expect(asPatient("UPDATE public.appointments SET fee=1 WHERE id='00000000-0000-4000-8000-000000000010';")).rejects.toThrow(); await reset();
  });
  it("rejects direct paid payment forgery", async () => {
    await expect(asPatient(`INSERT INTO public.payments(user_id,kind,amount,method,status) VALUES('${patient}','order',1,'card','paid');`)).rejects.toThrow(); await reset();
  });
  it("rejects direct underpriced order creation", async () => {
    await expect(asPatient(`INSERT INTO public.orders(user_id,customer_name,phone,email,address,city,state,pincode,payment_method,subtotal,total) VALUES('${patient}','Test Patient','9000000000','test@example.invalid','Synthetic Address','Test','Test','831005','cod',1,1);`)).rejects.toThrow(); await reset();
  });
  it("rejects direct order-item insertion", async () => {
    await expect(asPatient("INSERT INTO public.order_items(order_id,slug,name,pack,price,qty,line_total) VALUES('00000000-0000-4000-8000-000000000099','fake','fake','fake',1,1,1);")).rejects.toThrow(); await reset();
  });
  it("rejects missing consent even for patient self-access", async () => {
    await expect(asPatient(`INSERT INTO public.case_records(patient_id) VALUES('${patient}');`)).rejects.toThrow("consent"); await reset();
  });
  for (const [name, version, timestamp] of [
    ["invalid version", "invalid", "now()"], ["stale timestamp", "health-2026-10-24", "now()-interval '16 minutes'"], ["future timestamp", "health-2026-10-24", "now()+interval '1 minute'"],
  ]) it(`rejects consent ${name}`, async () => {
    await reset();
    const result = await db.query<{ id: string }>(`INSERT INTO public.health_consent_receipts(user_id,purpose,notice_version,accepted_at) VALUES('${patient}','case','${version}',${timestamp}) RETURNING id`);
    await expect(asPatient(`INSERT INTO public.case_records(patient_id,health_consent_receipt_id) VALUES('${patient}','${result.rows[0]?.id}');`)).rejects.toThrow("consent"); await reset();
  });
  it("accepts server-issued consent once and rejects replay", async () => {
    await reset();
    const result = await db.query<{ id: string }>(`INSERT INTO public.health_consent_receipts(user_id,purpose,notice_version) VALUES('${patient}','case','health-2026-10-24') RETURNING id`);
    const sql = `INSERT INTO public.case_records(patient_id,health_consent_receipt_id) VALUES('${patient}','${result.rows[0]?.id}');`;
    await asPatient(sql); await reset(); await expect(asPatient(sql)).rejects.toThrow("consent"); await reset();
  });
  it("patients cannot create arbitrary consent receipts", async () => {
    await expect(asPatient(`INSERT INTO public.health_consent_receipts(user_id,purpose,notice_version) VALUES('${patient}','case','health-2026-10-24');`)).rejects.toThrow(); await reset();
  });
  it("patients cannot invoke service-only settlement", async () => {
    await expect(asPatient(`SELECT public.settle_gateway_payment('00000000-0000-4000-8000-000000000099','${patient}','order_test','pay_test',1,'card');`)).rejects.toThrow(); await reset();
  });
});