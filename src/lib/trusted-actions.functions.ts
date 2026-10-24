import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { HEALTH_NOTICE_VERSION } from "./upload-security";

const consentSchema = z.object({
  accepted: z.literal(true),
  noticeVersion: z.literal(HEALTH_NOTICE_VERSION),
  purpose: z.enum(["appointment", "case"]),
});
export const recordHealthConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => consentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin
      .from("health_consent_receipts")
      .insert({
        user_id: context.userId,
        purpose: data.purpose,
        notice_version: data.noticeVersion,
      })
      .select("id, accepted_at")
      .single();
    if (result.error || !result.data) throw new Error("Could not record consent.");
    return result.data;
  });
const bookingSchema = z
  .object({
    patient_name: z.string().trim().min(3).max(120),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    gender: z.string().max(40),
    mode: z.enum(["clinic", "video", "audio"]),
    appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slot: z.string().max(30),
    concern: z.string().min(4).max(10000),
    medical_history: z.string().max(10000).nullable(),
    current_medication: z.string().max(10000).nullable(),
    allergies: z.string().max(10000).nullable(),
    consultation_type: z.enum(["new", "follow-up"]),
    health_consent_receipt_id: z.string().uuid(),
  })
  .strict();
export const bookAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bookingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("book_patient_appointment", { payload: data });
    if (result.error || !result.data) throw new Error("Could not book appointment.");
    return { id: result.data };
  });
export const cancelAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).strict().parse(input))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("cancel_patient_appointment", {
      _appointment: data.id,
    });
    if (result.error) throw new Error("Could not cancel appointment.");
    return { ok: true };
  });
export const submitPaymentReference = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        kind: z.enum(["consultation", "order"]),
        appointment_id: z.string().uuid().nullable(),
        order_id: z.string().uuid().nullable(),
        method: z.enum(["upi", "card", "netbanking"]),
        reference: z.string().trim().min(4).max(100),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("submit_patient_payment", { payload: data });
    if (result.error) throw new Error("Could not submit payment reference.");
    return { id: result.data };
  });
export const recordCounterPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        user_id: z.string().uuid(),
        kind: z.enum(["consultation", "order"]),
        amount: z.number().int().positive().max(1000000),
        method: z.enum(["cash", "upi", "card", "netbanking", "cod"]),
        payer_name: z.string().trim().min(3).max(120),
        notes: z.string().max(1000),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("record_counter_payment", { payload: data });
    if (result.error) throw new Error("Could not record counter payment.");
    return { id: result.data };
  });
export const reviewPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        values: z
          .object({
            status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
            refund_status: z
              .enum(["none", "requested", "processing", "completed", "rejected"])
              .optional(),
            refund_amount: z.number().int().nonnegative().optional(),
            refund_note: z.string().max(1000).nullable().optional(),
          })
          .strict(),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (result.error || !result.data) throw new Error("Administrator required.");
    const review = await context.supabase.rpc("review_manual_payment", {
      _payment: data.id,
      payload: data.values,
    });
    if (review.error) throw new Error("Could not review payment.");
    return { ok: true };
  });
