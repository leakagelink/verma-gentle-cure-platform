import { z } from "zod";
export const startPaymentSchema = z.object({
 kind: z.enum(["consultation", "order"]), appointmentId: z.string().uuid().nullish(), orderId: z.string().uuid().nullish(),
}).refine(d => d.kind === "order" ? Boolean(d.orderId) && !d.appointmentId : Boolean(d.appointmentId) && !d.orderId, "Exactly one matching resource required");
export const confirmPaymentSchema = z.object({
 paymentId: z.string().uuid(), razorpayOrderId: z.string().regex(/^order_[a-zA-Z0-9]+$/).max(100),
 razorpayPaymentId: z.string().regex(/^pay_[a-zA-Z0-9]+$/).max(100), signature: z.string().regex(/^[a-f0-9]{64}$/), method: z.string().max(30).optional(),
});
export async function verifyPaymentSignature(secret: string, storedOrder: string, payment: string, signature: string) {
 if (!/^[a-f0-9]{64}$/.test(signature)) return false;
 const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
 const bytes = Uint8Array.from(signature.match(/.{2}/g) ?? [], value => parseInt(value, 16));
 return crypto.subtle.verify("HMAC", key, bytes, new TextEncoder().encode(`${storedOrder}|${payment}`));
}
export type GatewayPayment = { id: string; order_id: string; amount: number; currency: string; status: string; method?: string };
export function assertCapturedPayment(payment: GatewayPayment, expected: { paymentId: string; orderId: string; amountRupees: number }) {
 if (payment.id !== expected.paymentId || payment.order_id !== expected.orderId || payment.status !== "captured" || payment.currency !== "INR" || !Number.isSafeInteger(expected.amountRupees) || payment.amount !== expected.amountRupees * 100) throw new Error("Payment could not be verified");
}
