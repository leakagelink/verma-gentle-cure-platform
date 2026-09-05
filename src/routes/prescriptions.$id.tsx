import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { useEffect, useState } from "react";

import logoAsset from "@/assets/verma-gentle-cure-logo.webp.asset.json";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  formatDateLong,
  formatDateTime,
  parseMedicines,
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
          "View and print your digital homeopathic prescription issued by Dr. Rajshree Verma at Verma Gentle Cure.",
      },
      { property: "og:title", content: "Digital Prescription | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "A printable copy of your homeopathic prescription and follow-up advice.",
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
    })();
    return () => {
      active = false;
    };
  }, [id, user]);

  const medicines = rx ? parseMedicines(rx.medicines) : [];

  return (
    <section className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/appointments">
            <ArrowLeft className="size-4" /> Back to my records
          </Link>
        </Button>
        {rx && (
          <Button className="rounded-full" onClick={() => window.print()}>
            <Printer className="size-4" /> Print / save as PDF
          </Button>
        )}
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading prescription…</p>
      ) : !rx ? (
        <p className="mt-10 rounded-2xl border border-border surface-ivory p-6 text-sm text-muted-foreground">
          This prescription is not available on your account.
        </p>
      ) : (
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
              <p className="font-semibold text-navy">{CLINIC.doctor}</p>
              <p>{CLINIC.phone}</p>
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
            <p className="mt-5 text-sm text-muted-foreground">
              <strong className="font-semibold text-navy">Advice:</strong> {rx.advice}
            </p>
          )}
          {rx.follow_up_date && (
            <p className="mt-2 text-sm text-muted-foreground">
              <strong className="font-semibold text-navy">Follow-up:</strong>{" "}
              {formatDateLong(rx.follow_up_date)}
            </p>
          )}

          <footer className="mt-10 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
            <p className="mb-3 text-right font-display text-base text-navy">{CLINIC.doctor}</p>
            <p>{CLINIC.address}</p>
            <p className="mt-2">{CLINIC.disclaimer}</p>
          </footer>
        </article>
      )}
    </section>
  );
}
