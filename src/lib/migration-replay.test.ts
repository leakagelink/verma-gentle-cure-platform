import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { replayDatabase } from "./__tests__/replay-database";

describe("explicit recovered baseline replay", () => {
  let db: PGlite;
  let applied: string[];
  beforeAll(async () => {
    ({ db, applied } = await replayDatabase());
  }, 30000);
  afterAll(async () => {
    await db?.close();
  });
  it("reproduces the missing case_records failure without the baseline", async () => {
    await expect(replayDatabase(false)).rejects.toThrow(
      'relation "public.case_records" does not exist',
    );
  }, 30000);
  it("applies the entire immutable history and forward changes", () => {
    expect(applied[0]).toBe("0000_prescription_details_and_audit.sql");
    expect(applied).toContain("0017_deletion_retention_fence_and_processing_generations.sql");
    expect(applied.length).toBeGreaterThanOrEqual(18);
  });
  it("reconstructs actual clinical fields, not an empty placeholder table", async () => {
    const result = await db.query<{ column_name: string }>(
      "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='case_records'",
    );
    expect(result.rows.map((r) => r.column_name)).toEqual(
      expect.arrayContaining([
        "chief_complaint",
        "child_development",
        "health_consent_receipt_id",
        "attachments",
        "submitted_at",
      ]),
    );
    const required = await db.query<{ is_nullable: string }>(
      "SELECT is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='clinical_assignments' AND column_name='doctor_id'",
    );
    expect(required.rows[0]?.is_nullable).toBe("NO");
  });
  it("keeps consent, clinical and financial triggers installed", async () => {
    const result = await db.query<{ tgname: string }>(
      "SELECT tgname FROM pg_trigger WHERE NOT tgisinternal",
    );
    expect(result.rows.map((r) => r.tgname)).toEqual(
      expect.arrayContaining([
        "case_security",
        "payment_security",
        "appointment_security",
        "case_consent",
        "order_security",
        "prescription_security",
        "deletion_dependency_fence",
      ]),
    );
  });
  it("keeps direct financial writes and service settlement inaccessible to patients", async () => {
    const result = await db.query<{
      insert_orders: boolean;
      insert_payments: boolean;
      settle: boolean;
    }>(
      "SELECT has_table_privilege('authenticated','public.orders','INSERT') AS insert_orders, has_table_privilege('authenticated','public.payments','INSERT') AS insert_payments, has_function_privilege('authenticated','public.settle_gateway_payment(uuid,uuid,text,text,integer,text)','EXECUTE') AS settle",
    );
    expect(result.rows[0]).toEqual({ insert_orders: false, insert_payments: false, settle: false });
  });
});
