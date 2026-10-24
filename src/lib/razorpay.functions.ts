import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { startPaymentSchema, confirmPaymentSchema, verifyPaymentSignature, assertCapturedPayment, type GatewayPayment } from "./payment-security";

export const getPaymentConfig = createServerFn({ method: "GET" }).handler(async () => {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  return { online: Boolean(keyId && process.env["RAZORPAY_KEY_SECRET"]), keyId: keyId ?? null };
});

export const startOnlinePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => startPaymentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) throw new Error("Online payment is not configured yet");
    let amount: number;
    let label: string;
    let payerName: string;
    if (data.kind === "consultation" && data.appointmentId) {
      const { data: appt, error } = await context.supabase.from("appointments")
        .select("id, fee, appointment_date, slot, patient_name, status, payment_status")
        .eq("id", data.appointmentId).eq("patient_id", context.userId).maybeSingle();
      if (error || !appt || appt.status === "cancelled" || !["pending", "failed"].includes(appt.payment_status)) throw new Error("Appointment not payable");
      amount = appt.fee; payerName = appt.patient_name;
      label = "Clinical consultation";
    } else if (data.kind === "order" && data.orderId) {
      const { data: order, error } = await context.supabase.from("orders")
        .select("id, total, order_no, customer_name, status, payment_status")
        .eq("id", data.orderId).eq("user_id", context.userId).maybeSingle();
      if (error || !order || order.status === "cancelled" || !["pending", "failed"].includes(order.payment_status)) throw new Error("Order not payable");
      amount = order.total; payerName = order.customer_name;
      label = `Medicine order ${order.order_no}`;
    } else throw new Error("Invalid payment resource");
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Nothing to pay");
    // Reuse persisted attempts; a durable claim below serializes first initiation.
    let pending = context.supabase.from("payments").select("id, gateway_order_id, amount")
      .eq("user_id", context.userId).eq("gateway", "razorpay").in("status", ["pending", "failed"]);
    pending = data.kind === "order" && data.orderId ? pending.eq("order_id", data.orderId) : pending.eq("appointment_id", data.appointmentId ?? "");
    const prior = await pending.order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (prior.error) throw new Error("Could not check payment attempts");
    if (prior.data?.gateway_order_id && prior.data.amount === amount) return { paymentId: prior.data.id, orderId: prior.data.gateway_order_id, amount, keyId, label };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const resourceId = data.kind === "order" ? data.orderId : data.appointmentId;
    if (!resourceId) throw new Error("Invalid payment resource");
    const claim = await supabaseAdmin.rpc("claim_gateway_initiation", { _user: context.userId, _kind: data.kind, _resource: resourceId });
    if (claim.error || !claim.data) throw new Error("Payment initialization is already recorded. Retry the existing payment or contact the clinic.");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST", headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amount * 100, currency: "INR", receipt: `vgc-${crypto.randomUUID().slice(0, 30)}` }), signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error("Could not start the payment. Please try again.");
    const order = z.object({ id: z.string().regex(/^order_[a-zA-Z0-9]+$/), amount: z.number().int(), currency: z.literal("INR") }).parse(await res.json());
    if (order.amount !== amount * 100) throw new Error("Gateway amount mismatch");
    const { data: row, error } = await supabaseAdmin.from("payments").insert({
      user_id: context.userId, kind: data.kind, appointment_id: data.kind === "consultation" ? data.appointmentId ?? null : null,
      order_id: data.kind === "order" ? data.orderId ?? null : null, amount, payer_name: payerName, method: "card", status: "pending",
      gateway: "razorpay", gateway_order_id: order.id, notes: label,
    }).select("id").single();
    if (error || !row) throw new Error("Could not record this payment");
    const recorded = await supabaseAdmin.from("gateway_initiations").update({ payment_id: row.id }).eq("token", claim.data);
    if (recorded.error) throw new Error("Payment recorded; please retry from billing.");
    return { paymentId: row.id, orderId: order.id, amount, keyId, label };
  });

export const confirmOnlinePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => confirmPaymentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) throw new Error("Online payment is not configured yet");
    const { data: row, error } = await context.supabase.from("payments")
      .select("id, user_id, gateway, gateway_order_id, gateway_payment_id, status, amount")
      .eq("id", data.paymentId).eq("user_id", context.userId).maybeSingle();
    if (error || !row || row.gateway !== "razorpay" || !row.gateway_order_id || row.gateway_order_id !== data.razorpayOrderId) throw new Error("Payment not found");
    if (!await verifyPaymentSignature(keySecret, row.gateway_order_id, data.razorpayPaymentId, data.signature)) throw new Error("Payment could not be verified");
    if (row.status === "paid") {
      if (row.gateway_payment_id !== data.razorpayPaymentId) throw new Error("Payment already settled");
      return { ok: true, receiptId: row.id };
    }
    const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(data.razorpayPaymentId)}`, {
      headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}` }, signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error("Payment verification unavailable. Please retry.");
    const payment = await res.json() as GatewayPayment;
    assertCapturedPayment(payment, { paymentId: data.razorpayPaymentId, orderId: row.gateway_order_id, amountRupees: row.amount });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("settle_gateway_payment", {
      _payment: row.id, _user: context.userId, _gateway_order: row.gateway_order_id,
      _gateway_payment: payment.id, _amount: row.amount, _method: payment.method ?? "online",
    });
    if (result.error) throw new Error("Payment received but receipt update could not complete. Please contact the clinic.");
    return { ok: true, receiptId: row.id };
  });

export const failOnlinePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ paymentId: z.string().uuid(), reason: z.string().max(200) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("payments").select("id")
      .eq("id", data.paymentId).eq("user_id", context.userId).eq("gateway", "razorpay").eq("status", "pending").maybeSingle();
    if (error) throw new Error("Could not check payment");
    if (!row) return { ok: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.from("payments").update({ status: "failed", failure_reason: "Checkout closed or payment incomplete" })
      .eq("id", row.id).eq("status", "pending");
    if (result.error) throw new Error("Could not record payment attempt");
    return { ok: true };
  });
