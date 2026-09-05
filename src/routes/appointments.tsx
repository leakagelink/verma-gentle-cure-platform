import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, FileText, Stethoscope } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  formatDateLong,
  formatDateTime,
  MODE_LABEL,
  parseMedicines,
  PAYMENT_LABEL,
  STATUS_CLASS,
  STATUS_LABEL,
  type AppointmentRow,
  type PrescriptionRow,
} from "@/lib/appointments-data";
import { CLINIC } from "@/lib/site-data";
import { formatINR } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "My Appointments & Prescriptions | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "View your homeopathic consultation appointments, their status, and the digital prescriptions issued by Dr. Rajshree Verma.",
      },
      { property: "og:title", content: "My Appointments | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Track your consultations and view digital prescriptions in one private place.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/appointments" },
    ],
    links: [{ rel: "canonical", href: "/appointments" }],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [appts, rx] = await Promise.all([
      supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", user.id)
        .order("appointment_date", { ascending: false }),
      supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    setAppointments(appts.data ?? []);
    setPrescriptions(rx.data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function cancelAppointment(id: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      toast.error("Could not cancel this appointment.");
      return;
    }
    toast.success("Appointment cancelled");
    void load();
  }

  return (
    <>
      <PageHero
        eyebrow="Patient dashboard"
        title="My appointments & prescriptions"
        description="Everything from your consultations in one private, access-controlled place."
      />

      <section className="container-page py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl text-navy">
            <CalendarDays className="size-5 text-leaf" /> Appointments
          </h2>
          <Button asChild className="rounded-full">
            <Link to="/book-appointment">Book new consultation</Link>
          </Button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading your records…</p>
        ) : appointments.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-border surface-ivory p-6 text-sm text-muted-foreground">
            You have no appointments yet. Book your first consultation with {CLINIC.doctor}.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4">
            {appointments.map((appt) => (
              <li key={appt.id} className="card-premium p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-navy">
                      {formatDateLong(appt.appointment_date)} · {appt.slot}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {MODE_LABEL[appt.mode]} · {formatINR(appt.fee)} ·{" "}
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
                <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                  {appt.concern}
                </p>
                {appt.doctor_notes && (
                  <p className="mt-4 rounded-xl surface-ivory p-4 text-sm text-navy">
                    <strong className="font-semibold">Doctor&apos;s note:</strong>{" "}
                    {appt.doctor_notes}
                  </p>
                )}
                {(appt.status === "pending" || appt.status === "confirmed") && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => void cancelAppointment(appt.id)}
                    >
                      Cancel appointment
                    </Button>
                    <Button asChild variant="ghost" className="rounded-full">
                      <Link to="/book-appointment">Book another slot</Link>
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <h2 className="mt-14 flex items-center gap-2 text-xl text-navy">
          <FileText className="size-5 text-leaf" /> Digital prescriptions
        </h2>
        {loading ? null : prescriptions.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-border surface-ivory p-6 text-sm text-muted-foreground">
            Prescriptions issued after your consultation will appear here.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4">
            {prescriptions.map((rx) => {
              const medicines = parseMedicines(rx.medicines);
              return (
                <li key={rx.id} className="card-premium p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-display text-lg text-navy">{rx.prescription_no}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(rx.created_at)}</p>
                  </div>
                  {rx.diagnosis && (
                    <p className="mt-3 text-sm text-navy">
                      <strong className="font-semibold">Assessment:</strong> {rx.diagnosis}
                    </p>
                  )}
                  <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-sm">
                      <thead className="surface-ivory text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="p-3">Medicine</th>
                          <th className="p-3">Potency</th>
                          <th className="p-3">Dosage</th>
                          <th className="p-3">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((m, i) => (
                          <tr key={`${rx.id}-${i}`} className="border-t border-border">
                            <td className="p-3 font-medium text-navy">{m.name}</td>
                            <td className="p-3">{m.potency || "—"}</td>
                            <td className="p-3">{m.dosage || "—"}</td>
                            <td className="p-3">{m.duration || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rx.advice && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      <strong className="font-semibold text-navy">Advice:</strong> {rx.advice}
                    </p>
                  )}
                  {rx.follow_up_date && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <strong className="font-semibold text-navy">Follow-up:</strong>{" "}
                      {formatDateLong(rx.follow_up_date)}
                    </p>
                  )}
                  <div className="mt-5">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to="/prescriptions/$id" params={{ id: rx.id }}>
                        View / print prescription
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-10 flex items-start gap-2 rounded-2xl border border-border surface-ivory p-5 text-xs leading-relaxed text-muted-foreground">
          <Stethoscope className="mt-0.5 size-4 shrink-0 text-leaf" />
          {CLINIC.disclaimer}
        </p>
      </section>
    </>
  );
}
