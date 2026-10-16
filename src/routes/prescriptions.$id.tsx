import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, History, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import logoAsset from "@/assets/verma-gentle-cure-logo.webp.asset.json";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  AUDIT_FIELD_LABEL,
  formatDateLong,
  formatDateTime,
  MODE_LABEL,
  parseMedicines,
  patientCode,
  type PrescriptionAuditRow,
  type PrescriptionRow,
} from "@/lib/appointments-data";
import { CLINIC } from "@/lib/site-data";

export const Route = createFileRoute("/prescriptions/$id")({
  head: () => ({
    meta: [
      { title: "Digital Prescription | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "View, download and share your digital homeopathic prescription issued by Dr. Rajshree Verma at Verma Gentle Cure.",
      },
      { property: "og:title", content: "Digital Prescription | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "A printable copy of your homeopathic prescription, care advice and follow-up date.",
      },
      { property: "og:type", content: "article" },
    ],
  }),
  component: PrescriptionPage,
});

function PrescriptionPage() {
  const { id } = useParams({ from: "/prescriptions/$id" });
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rx, setRx] = useState<PrescriptionRow | null>(null);
  const [history, setHistory] = useState<PrescriptionRow[]>([]);
  const [audit, setAudit] = useState<PrescriptionAuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void (async () => {
      const { data } = await supabase.from("prescriptions").select("*").eq("id", id).maybeSingle();
      if (!active) return;
      setRx(data ?? null);
      setLoading(false);
      if (!data) return;

      const [{ data: all }, { data: trail }] = await Promise.all([
        supabase
          .from("prescriptions")
          .select("*")
          .eq("patient_id", data.patient_id)
          .order("created_at", { ascending: false }),
        supabase
          .from("prescription_audit")
          .select("*")
          .eq("prescription_id", data.id)
          .order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      setHistory(all ?? []);
      setAudit(trail ?? []);
    })();
    return () => {
      active = false;
    };
  }, [id, user]);

  const medicines = rx ? parseMedicines(rx.medicines) : [];

  async function share() {
    const url = window.location.href;
    const text = rx ? `Prescription ${rx.prescription_no} — ${CLINIC.name}` : CLINIC.name;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: text, text, url });
        return;
      } catch {
        /* user dismissed the share sheet */
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Prescription link copied");
  }

  return (
    <section className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/appointments">
            <ArrowLeft className="size-4" /> Back to my records
          </Link>
        </Button>
        {rx && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => void share()}>
              <Share2 className="size-4" /> Share
            </Button>
            <Button className="rounded-full" onClick={() => window.print()}>
              <Download className="size-4" /> Download PDF
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading prescription…</p>
      ) : !rx ? (
        <p className="mt-10 rounded-2xl border border-border surface-ivory p-6 text-sm text-muted-foreground">
          This prescription is not available on your account.
        </p>
      ) : (
        <>
          <article className="mt-6 rounded-3xl border border-border bg-background p-6 sm:p-10 print:border-0 print:p-0">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-3">
                <img src={logoAsset.url} alt="Verma Gentle Cure logo" className="size-14" />
                <div>
                  <h1 className="font-display text-2xl text-navy">{CLINIC.name}</h1>
                  <p className="text-xs text-muted-foreground">{CLINIC.tagline}</p>
                </div>
              </div>
              <div className="text-right text-xs leading-relaxed text-muted-foreground">
                <p className="font-semibold text-navy">{rx.doctor_name || CLINIC.doctor}</p>
                {rx.doctor_qualification && <p>{rx.doctor_qualification}</p>}
                {rx.doctor_registration_no && <p>Reg. No. {rx.doctor_registration_no}</p>}
                <p>Call: {CLINIC.phone}</p>
                <p>WhatsApp: {CLINIC.whatsapp}</p>
                <p>{CLINIC.email}</p>
              </div>
            </header>

            <div className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Prescription no:</span>{" "}
                <strong className="text-navy">{rx.prescription_no}</strong>
              </p>
              <p className="sm:text-right">
                <span className="text-muted-foreground">Issued:</span>{" "}
                <strong className="text-navy">{formatDateTime(rx.created_at)}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Patient ID:</span>{" "}
                <strong className="text-navy">{patientCode(rx.patient_id)}</strong>
              </p>
              <p className="sm:text-right">
                <span className="text-muted-foreground">Consultation mode:</span>{" "}
                <strong className="text-navy">
                  {rx.consultation_mode ? MODE_LABEL[rx.consultation_mode] : "—"}
                </strong>
              </p>
            </div>

            {rx.diagnosis && (
              <p className="mt-6 text-sm text-navy">
                <strong className="font-semibold">Assessment:</strong> {rx.diagnosis}
              </p>
            )}

            <div className="mt-6 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="surface-ivory text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-3">Medicine</th>
                    <th className="p-3">Potency</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m, i) => (
                    <tr key={`${rx.id}-${i}`} className="border-t border-border">
                      <td className="p-3 font-medium text-navy">{m.name}</td>
                      <td className="p-3">{m.potency || "—"}</td>
                      <td className="p-3">{m.dosage || "—"}</td>
                      <td className="p-3">{m.duration || "—"}</td>
                      <td className="p-3">{m.instructions || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rx.advice && (
              <p className="mt-5 text-sm text-muted-foreground">
                <strong className="font-semibold text-navy">Medicine instructions:</strong>{" "}
                {rx.advice}
              </p>
            )}
            {rx.diet_advice && (
              <p className="mt-2 text-sm text-muted-foreground">
                <strong className="font-semibold text-navy">Diet advice:</strong> {rx.diet_advice}
              </p>
            )}
            {rx.general_care && (
              <p className="mt-2 text-sm text-muted-foreground">
                <strong className="font-semibold text-navy">General care:</strong>{" "}
                {rx.general_care}
              </p>
            )}
            {rx.follow_up_date && (
              <p className="mt-2 text-sm text-muted-foreground">
                <strong className="font-semibold text-navy">Follow-up:</strong>{" "}
                {formatDateLong(rx.follow_up_date)}
              </p>
            )}

            <footer className="mt-10 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
              <div className="mb-4 text-right">
                <p className="font-display text-base text-navy">
                  {rx.doctor_name || CLINIC.doctor}
                </p>
                {rx.doctor_qualification && <p>{rx.doctor_qualification}</p>}
                {rx.doctor_registration_no && <p>Reg. No. {rx.doctor_registration_no}</p>}
                <p className="mt-1">
                  Digitally signed{rx.signed_at ? ` on ${formatDateTime(rx.signed_at)}` : ""}
                  {rx.signature_code ? ` · ${rx.signature_code}` : ""}
                </p>
                <p>Version {rx.version}</p>
              </div>
              <p>{CLINIC.address}</p>
              <p className="mt-2">{CLINIC.disclaimer}</p>
              <p className="mt-2">
                This prescription is issued electronically and is valid without a handwritten
                signature. Authenticity can be checked against the signature reference above.
              </p>
            </footer>
          </article>

          {audit.length > 0 && (
            <section className="mt-8 rounded-2xl border border-border surface-ivory p-5 print:hidden">
              <h2 className="flex items-center gap-2 font-display text-lg text-navy">
                <History className="size-4 text-leaf" /> Prescription history
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {audit.map((entry) => (
                  <li key={entry.id} className="border-l-2 border-leaf/40 pl-3">
                    <p className="text-navy">
                      {entry.action === "issued" ? "Issued" : "Edited"} · Version {entry.version}
                    </p>
                    <p className="text-xs">{formatDateTime(entry.created_at)}</p>
                    {entry.changed_fields.length > 0 && (
                      <p className="text-xs">
                        Updated:{" "}
                        {entry.changed_fields
                          .map((field) => AUDIT_FIELD_LABEL[field] ?? field)
                          .join(", ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {history.length > 1 && (
            <section className="mt-6 print:hidden">
              <h2 className="font-display text-lg text-navy">Previous prescriptions</h2>
              <ul className="mt-3 space-y-2">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background p-4 text-sm"
                  >
                    <div>
                      <p className="font-medium text-navy">{item.prescription_no}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(item.created_at)}
                        {item.diagnosis ? ` · ${item.diagnosis}` : ""}
                      </p>
                    </div>
                    {item.id === rx.id ? (
                      <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-forest">
                        Viewing
                      </span>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link to="/prescriptions/$id" params={{ id: item.id }}>
                          Open
                        </Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </section>
  );
}
