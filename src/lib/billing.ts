import type { Database } from "@/integrations/supabase/types";

export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export type PaymentKind = "consultation" | "order" | "other";
export type PayMethod = "upi" | "card" | "netbanking" | "cash" | "cod";
export type RefundState = "none" | "requested" | "processing" | "completed" | "rejected";

export const PAY_METHOD_LABEL: Record<string, string> = {
  upi: "UPI",
  card: "Debit / Credit card",
  netbanking: "Net banking",
  cash: "Cash at clinic",
  cod: "Cash on delivery",
};

/** Methods a patient can use to report an online payment themselves. */
export const PATIENT_METHODS: PayMethod[] = ["upi", "card", "netbanking"];

/** Methods the clinic desk can record. */
export const STAFF_METHODS: PayMethod[] = ["cash", "upi", "card", "netbanking", "cod"];

export const PAY_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Awaiting confirmation",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export const PAY_STATUS_CLASS: Record<PaymentStatus, string> = {
  pending: "bg-lime/25 text-forest",
  paid: "bg-mint text-forest",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-navy/10 text-navy",
};

export const REFUND_STATES: RefundState[] = [
  "none",
  "requested",
  "processing",
  "completed",
  "rejected",
];

export const REFUND_LABEL: Record<string, string> = {
  none: "No refund",
  requested: "Refund requested",
  processing: "Refund processing",
  completed: "Refund completed",
  rejected: "Refund not approved",
};

export const KIND_LABEL: Record<string, string> = {
  consultation: "Consultation fee",
  order: "Medicine order",
  other: "Other charge",
};

export function formatMoney(paise: number) {
  return `₹${Number(paise || 0).toLocaleString("en-IN")}`;
}

export function formatStamp(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDay(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export type FinanceTotals = {
  collected: number;
  pending: number;
  failed: number;
  refunded: number;
  consultation: number;
  medicine: number;
  cash: number;
  online: number;
  count: number;
};

export function summarise(rows: PaymentRow[]): FinanceTotals {
  const t: FinanceTotals = {
    collected: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    consultation: 0,
    medicine: 0,
    cash: 0,
    online: 0,
    count: rows.length,
  };
  for (const row of rows) {
    if (row.status === "paid") {
      t.collected += row.amount;
      if (row.kind === "consultation") t.consultation += row.amount;
      if (row.kind === "order") t.medicine += row.amount;
      if (row.method === "cash" || row.method === "cod") t.cash += row.amount;
      else t.online += row.amount;
    }
    if (row.status === "pending") t.pending += row.amount;
    if (row.status === "failed") t.failed += row.amount;
    if (row.status === "refunded" || row.refund_amount > 0)
      t.refunded += row.refund_amount || row.amount;
  }
  return t;
}

/** Coupons apply to medicine billing only — never to clinical decisions or advice. */
export const COUPON_POLICY_NOTE =
  "Discount coupons apply only to medicine billing. They never influence clinical assessment, prescription or the doctor's advice.";
