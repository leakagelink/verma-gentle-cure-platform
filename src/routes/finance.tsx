import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  COUPON_POLICY_NOTE,
  KIND_LABEL,
  PAY_METHOD_LABEL,
  PAY_STATUS_CLASS,
  PAY_STATUS_LABEL,
  REFUND_LABEL,
  REFUND_STATES,
  STAFF_METHODS,
  formatMoney,
  formatStamp,
  summarise,
  type PayMethod,
  type PaymentRow,
  type PaymentStatus,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Financial Dashboard | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Clinic financial dashboard: consultation and medicine collections, cash entries, receipts and refund status.",
      },
      { property: "og:title", content: "Financial Dashboard | Verma Gentle Cure" },
      { property: "og:description", content: "Clinic collections, cash entries and refunds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/finance" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/finance" }],
  }),
  component: FinancePage,
});

const STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

function FinancePage() {
  const { user, loading, isCareTeam, role } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [filter, setFilter] = useState<"all" | PaymentStatus>("all");

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const load = useCallback(async () => {
    if (!user || !isCareTeam) return;
    setBusy(true);
    const { data } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setBusy(false);
  }, [user, isCareTeam]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => summarise(rows), [rows]);

  async function patch(id: string, values: Partial<PaymentRow>) {
    const { error } = await supabase.from("payments").update(values).eq("id", id);
    if (error) {
      toast.error("Could not update this payment.");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...values } : r)));
    toast.success("Payment updated");
  }

  if (loading) {
    return <p className="container-page py-20 text-sm text-muted-foreground">Loading…</p>;
  }

  if (user && !isCareTeam) {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="text-2xl text-navy">This area is for the clinic team</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your account role is {role ?? "patient"}.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/billing">My payments</Link>
        </Button>
      </section>
    );
  }

  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <>
      <PageHero
        eyebrow="Administration"
        title="Financial dashboard"
        description="Collections from consultations and medicines, cash entries at the desk, receipts and refund status."
      />

      <section className="container-page space-y-8 py-6 sm:py-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Collected" value={formatMoney(totals.collected)} />
          <Stat label="Pending" value={formatMoney(totals.pending)} />
          <Stat label="Failed" value={formatMoney(totals.failed)} />
          <Stat label="Refunded" value={formatMoney(totals.refunded)} />
          <Stat label="Consultation fees" value={formatMoney(totals.consultation)} />
          <Stat label="Medicine sales" value={formatMoney(totals.medicine)} />
          <Stat label="Cash / COD" value={formatMoney(totals.cash)} />
          <Stat label="Online (UPI / card / net banking)" value={formatMoney(totals.online)} />
        </div>

        <CashEntry onSaved={() => void load()} staffId={user?.id ?? ""} />

        <div>
          <div className="flex flex-wrap gap-2">
            {(["all", ...STATUSES] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "min-h-9 rounded-full border px-4 text-sm transition-colors",
                  filter === key ? "border-leaf bg-mint text-forest" : "border-border text-muted-foreground",
                )}
              >
                {key === "all" ? "All payments" : PAY_STATUS_LABEL[key]}
              </button>
            ))}
          </div>

          {busy ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading payments…</p>
          ) : visible.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-border p-12 text-center">
              <p className="font-semibold text-navy">No payments in this view</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {visible.map((row) => (
                <article key={row.id} className="card-premium p-4 sm:p-6">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg text-navy">{row.receipt_no}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatStamp(row.created_at)} · {KIND_LABEL[row.kind] ?? row.kind} ·{" "}
                        {PAY_METHOD_LABEL[row.method] ?? row.method} · {formatMoney(row.amount)}
                        {row.payer_name ? ` · ${row.payer_name}` : ""}
                        {row.gateway_payment_id ? ` · Ref ${row.gateway_payment_id}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        PAY_STATUS_CLASS[row.status],
                      )}
                    >
                      {PAY_STATUS_LABEL[row.status]}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-navy">Payment status</Label>
                      <select
                        value={row.status}
                        onChange={(e) =>
                          void patch(row.id, { status: e.target.value as PaymentStatus })
                        }
                        className="min-h-10 w-full rounded-full border border-border bg-card px-4 text-sm text-navy"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {PAY_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-navy">Refund status</Label>
                      <select
                        value={row.refund_status}
                        onChange={(e) => void patch(row.id, { refund_status: e.target.value })}
                        className="min-h-10 w-full rounded-full border border-border bg-card px-4 text-sm text-navy"
                      >
                        {REFUND_STATES.map((s) => (
                          <option key={s} value={s}>
                            {REFUND_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <RefundAmount
                      initial={row.refund_amount}
                      onSave={(amount) => void patch(row.id, { refund_amount: amount })}
                    />
                  </div>

                  <NoteBox
                    label="Note for the patient (refund / failure)"
                    initial={row.refund_note ?? ""}
                    onSave={(note) => void patch(row.id, { refund_note: note || null })}
                  />

                  <div className="mt-4">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to="/receipts/$id" params={{ id: row.id }}>
                        Open receipt
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <p className="rounded-2xl border border-border surface-ivory p-5 text-xs leading-relaxed text-muted-foreground">
          {COUPON_POLICY_NOTE}
        </p>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-premium p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl text-navy">{value}</p>
    </div>
  );
}

function CashEntry({ onSaved, staffId }: { onSaved: () => void; staffId: string }) {
  const [patientEmail, setPatientEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PayMethod>("cash");
  const [kind, setKind] = useState("consultation");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    const value = Number(amount.replace(/\D/g, ""));
    if (!value) {
      toast.error("Enter the amount received.");
      return;
    }
    if (payerName.trim().length < 3) {
      toast.error("Enter the patient's name.");
      return;
    }
    setSaving(true);
    let userId = staffId;
    if (patientEmail.trim()) {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .ilike("full_name", `%${patientEmail.trim()}%`)
        .limit(1)
        .maybeSingle();
      if (data?.id) userId = data.id;
    }
    const { error } = await supabase.from("payments").insert({
      user_id: userId,
      kind,
      amount: value,
      method,
      status: "paid",
      payer_name: payerName.trim(),
      notes: notes.trim() || null,
      recorded_by: staffId,
      gateway: "counter",
    });
    setSaving(false);
    if (error) {
      toast.error("Could not save this entry.");
      return;
    }
    setAmount("");
    setNotes("");
    setPayerName("");
    setPatientEmail("");
    toast.success("Payment recorded and receipt generated");
    onSaved();
  }

  return (
    <div className="card-premium p-5 sm:p-6">
      <h2 className="text-lg text-navy">Record a payment at the desk</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        For cash or counter payments. A receipt number is generated automatically.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm text-navy">Patient name (on receipt)</Label>
          <Input value={payerName} onChange={(e) => setPayerName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-navy">Link to patient profile (name search, optional)</Label>
          <Input
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            placeholder="Registered patient name"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-navy">Amount (₹)</Label>
          <Input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-navy">Method</Label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PayMethod)}
            className="min-h-10 w-full rounded-full border border-border bg-card px-4 text-sm text-navy"
          >
            {STAFF_METHODS.map((m) => (
              <option key={m} value={m}>
                {PAY_METHOD_LABEL[m]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-navy">Charge type</Label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="min-h-10 w-full rounded-full border border-border bg-card px-4 text-sm text-navy"
          >
            {["consultation", "order", "other"].map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-navy">Notes</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <Button className="mt-5 rounded-full" disabled={saving} onClick={() => void save()}>
        {saving ? "Saving…" : "Record payment"}
      </Button>
    </div>
  );
}

function RefundAmount({
  initial,
  onSave,
}: {
  initial: number;
  onSave: (amount: number) => void;
}) {
  const [value, setValue] = useState(String(initial));
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-navy">Refund amount (₹)</Label>
      <div className="flex gap-2">
        <Input
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        />
        <Button variant="outline" className="rounded-full" onClick={() => onSave(Number(value) || 0)}>
          Save
        </Button>
      </div>
    </div>
  );
}

function NoteBox({
  label,
  initial,
  onSave,
}: {
  label: string;
  initial: string;
  onSave: (note: string) => void;
}) {
  const [note, setNote] = useState(initial);
  return (
    <div className="mt-4 space-y-1.5">
      <Label className="text-sm text-navy">{label}</Label>
      <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      <Button variant="outline" className="rounded-full" onClick={() => onSave(note.trim())}>
        Save note
      </Button>
    </div>
  );
}
