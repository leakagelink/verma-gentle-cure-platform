import { createServerFn } from "@tanstack/react-start";
import { createHmac, timingSafeEqual } from "crypto";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type StartInput = {
  kind: "consultation" | "order";
  appointmentId?: string | null;
  orderId?: string | null;
};

/** Tells the UI whether an online gateway is configured. */
export const getPaymentConfig = createServerFn({ method: "GET" }).handler(async () => {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const secret = process.env["RAZORPAY_KEY_SECRET"];
  return { online: Boolean(keyId && secret), keyId: keyId ?? null };
});

/** Creates a Razorpay order for a pending consultation fee or medicine order. */
export const startOnlinePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: StartInput) => {
    if (data.kind !== "consultation" && data.kind !== "order") throw new Error("Invalid charge type");
    if (!data.appointmentId && !data.orderId) throw new Error("Nothing to pay for");
    return data;
  })
  .handler(async ({ data, context }) => {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) throw new Error("Online payment is not configured yet");

    const { supabase, userId } = context;

    let amount = 0;
    let label = "";
    if (data.kind === "consultation" && data.appointmentId) {
      const { data: appt } = await supabase
        .from("appointments")
        .select("id, fee, appointment_date, slot, patient_name")
        .eq("id", data.appointmentId)
        .maybeSingle();
      if (!appt) throw new Error("Appointment not found");
      amount = appt.fee;
      label = `Consultation ${appt.appointment_date} ${appt.slot}`;
    } else if (data.orderId) {
      const { data: order } = await supabase
        .from("orders")
        .select("id, total, order_no, customer_name")
        .eq("id", data.orderId)
        .maybeSingle();
      if (!order) throw new Error("Order not found");
      amount = order.total;
      label = `Medicine order ${order.order_no}`;
    }
    if (amount <= 0) throw new Error("Nothing to pay");

    const body = new URLSearchParams({
      amount: String(amount * 100),
      currency: "INR",
      receipt: `vgc-${Date.now()}`,
    });
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!res.ok) throw new Error("Could not start the payment. Please try again.");
    const order = (await res.json()) as { id: string };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: userId,
        kind: data.kind,
        appointment_id: data.appointmentId ?? null,
        order_id: data.orderId ?? null,
        amount,
        method: "card",
        status: "pending",
        gateway: "razorpay",
        gateway_order_id: order.id,
        notes: label,
      })
      .select("id, receipt_no")
      .single();
    if (error || !row) throw new Error("Could not record this payment");

    return { paymentId: row.id, orderId: order.id, amount, keyId, label };
  });

/** Verifies the Razorpay signature and marks the payment (and its bill) as paid. */
export const confirmOnlinePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      paymentId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      signature: string;
      method?: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) throw new Error("Online payment is not configured yet");

    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(data.signature || "");
    const valid = a.length === b.length && timingSafeEqual(a, b);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", data.paymentId)
      .maybeSingle();
    if (!row || row.user_id !== context.userId) throw new Error("Payment not found");

    if (!valid) {
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed", failure_reason: "Signature verification failed" })
        .eq("id", row.id);
      throw new Error("Payment could not be verified");
    }

    await supabaseAdmin
      .from("payments")
      .update({
        status: "paid",
        gateway_payment_id: data.razorpayPaymentId,
        method: data.method && data.method !== "" ? data.method : row.method,
      })
      .eq("id", row.id);

    if (row.appointment_id) {
      await supabaseAdmin
        .from("appointments")
        .update({ payment_status: "paid" })
        .eq("id", row.appointment_id);
    }
    if (row.order_id) {
      await supabaseAdmin.from("orders").update({ payment_status: "paid" }).eq("id", row.order_id);
    }

    return { ok: true, receiptId: row.id };
  });

/** Records a cancelled or failed gateway attempt so the patient can retry. */
export const failOnlinePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { paymentId: string; reason: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("payments")
      .select("id, user_id")
      .eq("id", data.paymentId)
      .maybeSingle();
    if (!row || row.user_id !== context.userId) return { ok: false };
    await supabaseAdmin
      .from("payments")
      .update({ status: "failed", failure_reason: data.reason.slice(0, 200) })
      .eq("id", row.id);
    return { ok: true };
  });
