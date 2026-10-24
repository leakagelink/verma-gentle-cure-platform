import { describe, expect, it } from "vitest";
import { assertCapturedPayment, startPaymentSchema, verifyPaymentSignature } from "./payment-security";

const appointmentId = "00000000-0000-4000-8000-000000000001";
const orderId = "00000000-0000-4000-8000-000000000002";
const payment = { id: "pay_test", order_id: "order_test", amount: 162500, currency: "INR", status: "captured" };
const expected = { paymentId: "pay_test", orderId: "order_test", amountRupees: 1625 };
describe("payment security", () => {
  it("rejects an attempt linked to two bills", () => {
    expect(startPaymentSchema.safeParse({ kind: "order", orderId, appointmentId }).success).toBe(false);
    expect(startPaymentSchema.safeParse({ kind: "order", orderId }).success).toBe(true);
  });
  it("rejects the wrong resource for consultation", () => {
    expect(startPaymentSchema.safeParse({ kind: "consultation", orderId }).success).toBe(false);
  });
  it("rejects unpaid or authorized-only payments", () => {
    expect(() => assertCapturedPayment({ ...payment, status: "authorized" }, expected)).toThrow();
    expect(() => assertCapturedPayment(payment, expected)).not.toThrow();
  });
  it("rejects a different order ID", () => {
    expect(() => assertCapturedPayment({ ...payment, order_id: "order_other" }, expected)).toThrow();
  });
  it("rejects a different payment ID", () => {
    expect(() => assertCapturedPayment({ ...payment, id: "pay_other" }, expected)).toThrow();
  });
  it("requires ₹1500 plus ₹125 in paise for a one-kit charge", () => {
    expect(() => assertCapturedPayment({ ...payment, amount: 1625 }, expected)).toThrow();
    expect(() => assertCapturedPayment({ ...payment, amount: 150000 }, expected)).toThrow();
    expect(() => assertCapturedPayment(payment, expected)).not.toThrow();
  });
  it("rejects non-INR currency", () => {
    expect(() => assertCapturedPayment({ ...payment, currency: "USD" }, expected)).toThrow();
  });
  it("rejects invalid signatures and binds HMAC to the stored order", async () => {
    // Synthetic test secret, never a production credential.
    const secret = "synthetic-test-fixture";
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("order_test|pay_test"));
    const signature = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
    expect(await verifyPaymentSignature(secret, "order_test", "pay_test", signature)).toBe(true);
    expect(await verifyPaymentSignature(secret, "order_other", "pay_test", signature)).toBe(false);
    expect(await verifyPaymentSignature(secret, "order_test", "pay_test", "0".repeat(64))).toBe(false);
    expect(await verifyPaymentSignature(secret, "order_test", "pay_test", "invalid")).toBe(false);
  });
});