import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  EMPTY_MEDICINE,
  formatDateLong,
  MODE_LABEL,
  PAYMENT_LABEL,
  STATUS_CLASS,
  STATUS_LABEL,
  type AppointmentRow,
  type AppointmentStatus,
  type PrescriptionMedicine,
} from "@/lib/appointments-data";
import { formatINR } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Doctor Dashboard | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Clinic dashboard for reviewing patient consultation requests, confirming appointments and issuing digital homeopathic prescriptions.",
      },
      { property: "og:title", content: "Doctor Dashboard | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Review consultations and issue digital prescriptions.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/doctor" },
    ],
    links: [{ rel: "canonical", href: "/doctor" }],
  }),
  component: DoctorDashboardPage,
});

const STATUSES: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];

function DoctorDashboardPage() {
  const { user, isCareTeam, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");
  const [openRx, setOpenRx] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    if (!user || !isCareTeam) return;
    setLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: false });
    setAppointments(data ?? []);
    setLoading(false);
  }, [user, isCareTeam]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, status: AppointmentStatus) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) {
      toast.error("Could not update this appointment.");
      return;
    }
    toast.success(`Marked as ${STATUS_LABEL[status].toLowerCase()}`);
    void load();
  }

  async function saveNotes(id: string, notes: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ doctor_notes: notes })
      .eq("id", id);
    if (error) {
      toast.error("Could not save the note.");
      return;
    }
    toast.success("Note saved");
    void load();
  }

  if (authLoading || (user && role === null)) {
    return (
      <section className="container-page py-24">
        <p className="text-sm text-muted-foreground">Checking your access…</p>
      </section>
    );
  }

  if (user && !isCareTeam) {
    return (
      <>
        <PageHero
          eyebrow="Restricted area"
          title="Clinic access only"
          description="This dashboard is available to the clinic's doctors and administrators."
        />
        <section className="container-page py-12">
          <p className="rounded-2xl border border-border surface-ivory p-6 text-sm text-muted-foreground">
            Your account does not have clinic access. If you are a patient, your consultations and
            prescriptions are on your appointments page.
          </p>
        </section>
      </>
    );
  }

  const visible =
    filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <>
      <PageHero
        eyebrow="Doctor dashboard"
        title="Consultation requests"
        description="Review patient requests, confirm slots and issue digital prescriptions."
      />

      <section className="container-page py-12">
        <div className="flex flex-wrap gap-2">
          {(["all", ...STATUSES] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                filter === value
                  ? "border-leaf bg-mint text-forest"
                  : "border-border text-muted-foreground hover:border-leaf/40",
              )}
            >
              {value === "all" ? "All" : STATUS_LABEL[value]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading consultations…</p>
        ) : visible.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-border surface-ivory p-6 text-sm text-muted-foreground">
            No consultations in this view yet.
          </p>
        ) : (
          <ul className="mt-8 grid gap-5">
            {visible.map((appt) => (
              <li key={appt.id} className="card-premium p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-navy">{appt.patient_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDateLong(appt.appointment_date)} · {appt.slot} ·{" "}
                      {MODE_LABEL[appt.mode]}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {appt.phone}
                      {appt.email ? ` · ${appt.email}` : ""} · {formatINR(appt.fee)} ·{" "}
                      {PAYMENT_LABEL[appt.payment_status]}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      STATUS_CLASS[appt.status],
                    )}
                  >
                    {STATUS_LABEL[appt.status]}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 rounded-xl surface-ivory p-4 text-sm md:grid-cols-2">
                  <p className="whitespace-pre-line md:col-span-2">
                    <strong className="font-semibold text-navy">Concern:</strong> {appt.concern}
                  </p>
                  <p>
                    <strong className="font-semibold text-navy">Past treatment:</strong>{" "}
                    {appt.medical_history || "—"}
                  </p>
                  <p>
                    <strong className="font-semibold text-navy">Current medicines:</strong>{" "}
                    {appt.current_medication || "—"}
                  </p>
                  <p>
                    <strong className="font-semibold text-navy">Allergies:</strong>{" "}
                    {appt.allergies || "—"}
                  </p>
                  <p>
                    <strong className="font-semibold text-navy">Age / gender:</strong>{" "}
                    {appt.date_of_birth ? formatDateLong(appt.date_of_birth) : "—"} ·{" "}
                    {appt.gender || "—"}
                  </p>
                </div>

                <NotesEditor
                  initial={appt.doctor_notes ?? ""}
                  onSave={(notes) => void saveNotes(appt.id, notes)}
                />

                <div className="mt-5 flex flex-wrap gap-2">
                  {STATUSES.filter((s) => s !== appt.status).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => void updateStatus(appt.id, s)}
                    >
                      Mark {STATUS_LABEL[s].toLowerCase()}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => setOpenRx(openRx === appt.id ? null : appt.id)}
                  >
                    <ClipboardList className="size-4" />
                    {openRx === appt.id ? "Close prescription" : "Write prescription"}
                  </Button>
                </div>

                {openRx === appt.id && (
                  <PrescriptionForm
                    appointment={appt}
                    doctorId={user?.id ?? null}
                    onDone={() => {
                      setOpenRx(null);
                      void load();
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function NotesEditor({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (notes: string) => void;
}) {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial]);
  return (
    <div className="mt-4 space-y-2">
      <Label className="text-sm text-navy">Clinical note for the patient</Label>
      <Textarea
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Short note visible to the patient…"
      />
      <Button
        size="sm"
        variant="ghost"
        className="rounded-full"
        disabled={value === initial}
        onClick={() => onSave(value.trim())}
      >
        Save note
      </Button>
    </div>
  );
}

function PrescriptionForm({
  appointment,
  doctorId,
  onDone,
}: {
  appointment: AppointmentRow;
  doctorId: string | null;
  onDone: () => void;
}) {
  const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([{ ...EMPTY_MEDICINE }]);
  const [saving, setSaving] = useState(false);

  function updateMedicine(index: number, key: keyof PrescriptionMedicine, value: string) {
    setMedicines((list) =>
      list.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  }

  async function save() {
    const cleaned = medicines.filter((m) => m.name.trim().length > 0);
    if (diagnosis.trim().length < 3) {
      toast.error("Add a short assessment first.");
      return;
    }
    if (cleaned.length === 0) {
      toast.error("Add at least one medicine.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("prescriptions").insert({
      appointment_id: appointment.id,
      patient_id: appointment.patient_id,
      doctor_id: doctorId,
      diagnosis: diagnosis.trim(),
      advice: advice.trim() || null,
      follow_up_date: followUp || null,
      medicines: cleaned,
    });
    setSaving(false);
    if (error) {
      toast.error("Could not save this prescription.");
      return;
    }
    toast.success("Prescription issued to the patient");
    onDone();
  }

  return (
    <div className="mt-5 rounded-2xl border border-leaf/40 bg-mint/30 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-sm text-navy">Assessment</Label>
          <Textarea
            rows={2}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Case summary and assessment"
          />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {medicines.map((medicine, index) => (
          <div key={index} className="grid gap-3 rounded-xl border border-border bg-background p-4 md:grid-cols-5">
            <Input
              placeholder="Medicine"
              value={medicine.name}
              onChange={(e) => updateMedicine(index, "name", e.target.value)}
            />
            <Input
              placeholder="Potency"
              value={medicine.potency}
              onChange={(e) => updateMedicine(index, "potency", e.target.value)}
            />
            <Input
              placeholder="Dosage"
              value={medicine.dosage}
              onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
            />
            <Input
              placeholder="Duration"
              value={medicine.duration}
              onChange={(e) => updateMedicine(index, "duration", e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Instructions"
                value={medicine.instructions}
                onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
              />
              {medicines.length > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Remove medicine"
                  onClick={() => setMedicines((list) => list.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => setMedicines((list) => [...list, { ...EMPTY_MEDICINE }])}
        >
          <Plus className="size-4" /> Add medicine
        </Button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm text-navy">Advice</Label>
          <Textarea
            rows={2}
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            placeholder="Diet, lifestyle and care advice"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-navy">Follow-up date</Label>
          <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
        </div>
      </div>

      <Button className="mt-5 rounded-full" onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Issue prescription"}
      </Button>
    </div>
  );
}
