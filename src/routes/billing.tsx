import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { IndianRupee, ReceiptText, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  COUPON_POLICY_NOTE,
  KIND_LABEL,
  PATIENT_METHODS,
  PAY_METHOD_LABEL,
  PAY_STATUS_CLASS,
  PAY_STATUS_LABEL,
  REFUND_LABEL,
  formatMoney,
  formatStamp,
  type PayMethod,
  type PaymentRow,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Payments & Receipts | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "See your consultation fees, medicine bills, payment receipts, invoices and refund status in one private place.",
      },
      { property: "og:title", content: "Payments & Receipts | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Consultation fees, medicine bills, receipts and refund status.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/billing" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/billing" }],
  }),
  component: BillingPage,
});

type Due = {
  key: string;
  kind: "consultation" | "order";
  label: string;
  amount: number;
  status: string;
  appointment_id: string | null;
  order_id: string | null;
};

function BillingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [busy, setBusy] = useState(true);
  const [payFor, setPayFor] = useState<Due | null>(null);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    const [pay, appts, orders] = await Promise.all([
      supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("appointments")
        .select("id, appointment_date, slot, fee, payment_status, status")
        .eq("patient_id", user.id)
        .neq("status", "cancelled"),
      supabase
        .from("orders")
        .select("id, order_no, total, payment_status, payment_method, status")
        .eq("user_id", user.id)
        .neq("status", "cancelled"),
    ]);

    const open: Due[] = [];
    for (const a of appts.data ?? []) {
      if (a.payment_status === "pending" || a.payment_status === "failed") {
        open.push({
          key: `a-${a.id}`,
          kind: "consultation",
          label: `Consultation on ${a.appointment_date} · ${a.slot}`,
          amount: a.fee,
          status: a.payment_status,
          appointment_id: a.id,
          order_id: null,
        });
      }
    }
    for (const o of orders.data ?? []) {
      if ((o.payment_status === "pending" || o.payment_status === "failed") && o.payment_method !== "cod") {
        open.push({
          key: `o-${o.id}`,
          kind: "order",
          label: `Medicine order ${o.order_no}`,
          amount: o.total,
          status: o.payment_status,
          appointment_id: null,
          order_id: o.id,
        });
      }
    }

    setPayments(pay.data ?? []);
    setDues(open);
    setBusy(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !user) {
    return <p className="container-page py-20 text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <>
      <PageHero
        eyebrow="Payments & billing"
        title="Fees, receipts and refunds"
        description="Consultation fees and medicine bills, with receipts you can download and refund status you can follow."
      />

      <section className="container-page space-y-8 py-6 sm:py-12">
        <div>
          <h2 className="flex items-center gap-2 text-xl text-navy">
            <IndianRupee className="size-5 text-leaf" /> Pending payments
          </h2>
          {busy ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : dues.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-border surface-ivory p-5 text-sm text-muted-foreground">
              Nothing is pending right now.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {dues.map((due) => (
                <li
                  key={due.key}
                  className="card-premium flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-navy">{due.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {KIND_LABEL[due.kind]} · {formatMoney(due.amount)} ·{" "}
                      {due.status === "failed" ? "Last attempt failed" : "Payment pending"}
                    </p>
                  </div>
                  <Button className="rounded-full" onClick={() => setPayFor(due)}>
                    {due.status === "failed" ? (
                      <>
                        <RefreshCcw className="mr-1.5 size-4" /> Retry payment
                      </>
                    ) : (
                      "Pay now"
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {payFor && (
          <PayPanel
            due={payFor}
            userId={user.id}
            attempt={
              payments.filter(
                (p) =>
                  (payFor.appointment_id && p.appointment_id === payFor.appointment_id) ||
                  (payFor.order_id && p.order_id === payFor.order_id),
              ).length + 1
            }
            onClose={() => setPayFor(null)}
            onDone={() => {
              setPayFor(null);
              void load();
            }}
          />
        )}

        <div>
          <h2 className="flex items-center gap-2 text-xl text-navy">
            <ReceiptText className="size-5 text-leaf" /> Payment history & receipts
          </h2>
          {busy ? null : payments.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-border surface-ivory p-5 text-sm text-muted-foreground">
              Your receipts will appear here once a payment is recorded.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {payments.map((p) => (
                <li key={p.id} className="card-premium p-4 sm:p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg text-navy">{p.receipt_no}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatStamp(p.created_at)} · {KIND_LABEL[p.kind] ?? p.kind} ·{" "}
                        {PAY_METHOD_LABEL[p.method] ?? p.method} · {formatMoney(p.amount)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        PAY_STATUS_CLASS[p.status],
                      )}
                    >
                      {PAY_STATUS_LABEL[p.status]}
                    </span>
                  </div>
                  {p.status === "failed" && p.failure_reason && (
                    <p className="mt-3 text-xs text-destructive">Reason: {p.failure_reason}</p>
                  )}
                  {p.refund_status !== "none" && (
                    <p className="mt-3 rounded-xl surface-ivory p-3 text-xs text-navy">
                      {REFUND_LABEL[p.refund_status]}
                      {p.refund_amount ? ` · ${formatMoney(p.refund_amount)}` : ""}
                      {p.refund_note ? ` · ${p.refund_note}` : ""}
                    </p>
                  )}
                  <div className="mt-4">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to="/receipts/$id" params={{ id: p.id }}>
                        View receipt / invoice
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="rounded-2xl border border-border surface-ivory p-5 text-xs leading-relaxed text-muted-foreground">
          {COUPON_POLICY_NOTE} Online payments are confirmed by the clinic desk after the reference
          is verified, usually on the same working day.
        </p>
      </section>
    </>
  );
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadCheckout() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function PayPanel({
  due,
  userId,
  attempt,
  online,
  onClose,
  onDone,
}: {
  due: Due;
  userId: string;
  attempt: number;
  online: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [method, setMethod] = useState<PayMethod>("upi");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [opening, setOpening] = useState(false);
  const startPay = useServerFn(startOnlinePayment);
  const confirmPay = useServerFn(confirmOnlinePayment);
  const failPay = useServerFn(failOnlinePayment);

  async function payOnline() {
    setOpening(true);
    try {
      const ready = await loadCheckout();
      if (!ready) throw new Error("Could not open the payment window");
      const session = await startPay({
        data: {
          kind: due.kind,
          appointmentId: due.appointment_id,
          orderId: due.order_id,
        },
      });
      const rz = new window.Razorpay!({
        key: session.keyId,
        amount: session.amount * 100,
        currency: "INR",
        name: "Verma Gentle Cure",
        description: session.label,
        order_id: session.orderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await confirmPay({
              data: {
                paymentId: session.paymentId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            });
            toast.success("Payment successful — your receipt is ready.");
            onDone();
          } catch {
            toast.error("Payment could not be verified. Please contact the clinic.");
            onDone();
          }
        },
        modal: {
          ondismiss: () => {
            void failPay({ data: { paymentId: session.paymentId, reason: "Cancelled by patient" } });
            onDone();
          },
        },
        theme: { color: "#063B52" },
      });
      rz.open();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.includes("not configured")
          ? "Online payment is not switched on yet. Use the reference option below."
          : "Could not start the online payment. Please try again.",
      );
    } finally {
      setOpening(false);
    }
  }

  async function submit() {
    if (reference.trim().length < 4) {
      toast.error("Please enter the transaction / reference number.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("payments").insert({
      user_id: userId,
      kind: due.kind,
      appointment_id: due.appointment_id,
      order_id: due.order_id,
      amount: due.amount,
      method,
      status: "pending",
      gateway: "manual",
      gateway_payment_id: reference.trim(),
      attempt,
      notes: due.label,
    });
    setSaving(false);
    if (error) {
      toast.error("Could not record this payment. Please try again.");
      return;
    }
    toast.success("Payment submitted — the clinic desk will confirm it shortly.");
    onDone();
  }

  return (
    <div className="card-premium space-y-4 p-5">
      <div>
        <h3 className="text-lg text-navy">Pay {formatMoney(due.amount)}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{due.label}</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-navy">Payment method</Label>
        <div className="flex flex-wrap gap-2">
          {PATIENT_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={cn(
                "min-h-10 rounded-full border px-4 text-sm",
                method === m ? "border-leaf bg-mint text-forest" : "border-border text-muted-foreground",
              )}
            >
              {PAY_METHOD_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-navy">Transaction / reference number</Label>
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g. UPI reference, bank reference or card slip number"
        />
        <p className="text-xs text-muted-foreground">
          Attempt {attempt}. Pay the clinic using your chosen method, then submit the reference here
          so the desk can confirm and issue your receipt.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button className="rounded-full" disabled={saving} onClick={() => void submit()}>
          {saving ? "Submitting…" : "Submit payment"}
        </Button>
        <Button variant="ghost" className="rounded-full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
