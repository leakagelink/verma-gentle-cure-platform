import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  COUPON_POLICY_NOTE,
  KIND_LABEL,
  PAY_METHOD_LABEL,
  PAY_STATUS_LABEL,
  REFUND_LABEL,
  formatMoney,
  formatStamp,
  type PaymentRow,
} from "@/lib/billing";
import { CLINIC } from "@/lib/site-data";

export const Route = createFileRoute("/receipts/$id")({
  head: () => ({
    meta: [
      { title: "Payment Receipt | Verma Gentle Cure" },
      {
        name: "description",
        content: "View, download or share your Verma Gentle Cure payment receipt and invoice.",
      },
      { property: "og:title", content: "Payment Receipt | Verma Gentle Cure" },
      { property: "og:description", content: "Your clinic payment receipt and invoice." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/receipts" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { id } = useParams({ from: "/receipts/$id" });
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentRow | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void (async () => {
      const { data } = await supabase.from("payments").select("*").eq("id", id).maybeSingle();
      if (!active) return;
      setPayment(data ?? null);
      setBusy(false);
    })();
    return () => {
      active = false;
    };
  }, [user, id]);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `Receipt ${payment?.receipt_no ?? ""}`, url });
        return;
      } catch {
        /* user dismissed */
      }
    }
    await navigator.clipboard?.writeText(url);
    toast.success("Receipt link copied");
  }

  if (loading || busy) {
    return <p className="container-page py-20 text-sm text-muted-foreground">Loading receipt…</p>;
  }

  if (!payment) {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="text-2xl text-navy">Receipt not found</h1>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/billing">Back to payments</Link>
        </Button>
      </section>
    );
  }

  const isInvoice = payment.status === "paid";

  return (
    <section className="container-page py-6 sm:py-12">
      <div className="flex flex-wrap gap-3 print:hidden">
        <Button variant="outline" className="rounded-full" onClick={() => void share()}>
          <Share2 className="mr-1.5 size-4" /> Share
        </Button>
        <Button className="rounded-full" onClick={() => window.print()}>
          <Download className="mr-1.5 size-4" /> Download {isInvoice ? "invoice" : "receipt"}
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/billing">Back to payments</Link>
        </Button>
      </div>

      <article className="card-premium mt-5 p-5 sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <Logo />
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-display text-base text-navy">{CLINIC.name}</p>
            <p>Call: {CLINIC.phone}</p>
            <p>WhatsApp: {CLINIC.whatsapp}</p>
            <p>{CLINIC.email}</p>
          </div>
        </header>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field k={isInvoice ? "Invoice / receipt no." : "Payment reference no."} v={payment.receipt_no} />
          <Field k="Date" v={formatStamp(payment.created_at)} />
          <Field k="Billed for" v={KIND_LABEL[payment.kind] ?? payment.kind} />
          <Field k="Payment method" v={PAY_METHOD_LABEL[payment.method] ?? payment.method} />
          <Field k="Status" v={PAY_STATUS_LABEL[payment.status]} />
          <Field k="Attempt" v={String(payment.attempt)} />
          {payment.gateway_payment_id && (
            <Field k="Transaction reference" v={payment.gateway_payment_id} />
          )}
          {payment.payer_name && <Field k="Paid by" v={payment.payer_name} />}
        </div>

        <div className="mt-6 rounded-2xl border border-border surface-ivory p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-display text-2xl text-navy">{formatMoney(payment.amount)}</span>
          </div>
          {payment.refund_status !== "none" && (
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">
                {REFUND_LABEL[payment.refund_status]}
                {payment.refund_note ? ` · ${payment.refund_note}` : ""}
              </span>
              <span className="text-navy">{formatMoney(payment.refund_amount)}</span>
            </div>
          )}
        </div>

        {payment.notes && <p className="mt-4 text-sm text-muted-foreground">{payment.notes}</p>}
        {payment.status === "failed" && payment.failure_reason && (
          <p className="mt-4 text-sm text-destructive">Failure reason: {payment.failure_reason}</p>
        )}

        <footer className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
          <p>
            {isInvoice
              ? "This is a computer-generated receipt and is valid without a physical signature."
              : "This payment is awaiting confirmation by the clinic desk. A final receipt is issued once confirmed."}
          </p>
          <p className="mt-2">{COUPON_POLICY_NOTE}</p>
        </footer>
      </article>
    </section>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{k}</p>
      <p className="mt-0.5 text-sm font-medium text-navy">{v}</p>
    </div>
  );
}
