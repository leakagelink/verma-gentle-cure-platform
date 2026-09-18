import type { Database } from "@/integrations/supabase/types";

export type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
export type PrescriptionRow = Database["public"]["Tables"]["prescriptions"]["Row"];
export type PrescriptionAuditRow =
  Database["public"]["Tables"]["prescription_audit"]["Row"];

export const DOCTOR_DEFAULTS = {
  name: "Dr. Rajshree Verma",
  qualification: "BHMS — Homeopathic Physician",
  registration: "",
};

/** Short, non-sensitive patient reference shown on the prescription. */
export function patientCode(patientId: string) {
  return `VGC-${patientId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function signatureCode() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now());
  return `SIG-${random.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

export const AUDIT_FIELD_LABEL: Record<string, string> = {
  diagnosis: "Assessment",
  advice: "Advice",
  diet_advice: "Diet advice",
  general_care: "General care",
  medicines: "Medicines",
  follow_up_date: "Follow-up date",
};
export type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];
export type ConsultationMode = Database["public"]["Enums"]["consultation_mode"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export type PrescriptionMedicine = {
  name: string;
  potency: string;
  dosage: string;
  duration: string;
  instructions: string;
};

export const EMPTY_MEDICINE: PrescriptionMedicine = {
  name: "",
  potency: "",
  dosage: "",
  duration: "",
  instructions: "",
};

export function parseMedicines(value: unknown): PrescriptionMedicine[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = (item ?? {}) as Partial<PrescriptionMedicine>;
    return {
      name: String(row.name ?? ""),
      potency: String(row.potency ?? ""),
      dosage: String(row.dosage ?? ""),
      duration: String(row.duration ?? ""),
      instructions: String(row.instructions ?? ""),
    };
  });
}

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_CLASS: Record<AppointmentStatus, string> = {
  pending: "bg-lime/25 text-forest",
  confirmed: "bg-mint text-forest",
  completed: "bg-navy/10 text-navy",
  cancelled: "bg-destructive/10 text-destructive",
};

export const MODE_LABEL: Record<ConsultationMode, string> = {
  clinic: "In-clinic",
  video: "Video consultation",
  audio: "Audio consultation",
};

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Payment failed",
};

export function formatDateLong(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string) {
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
