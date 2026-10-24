import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClipboardList, Lock, Paperclip } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/appointments-data";
import {
  CASE_BUCKET,
  CASE_SECTIONS,
  formatFileSize,
  parseAttachments,
  type CaseAttachment,
  type CaseClinicalNoteRow,
  type CaseRecordRow,
} from "@/lib/case-form-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/case-records")({
  head: () => ({
    meta: [
      { title: "Patient Case Records | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Clinic view of patient case-taking forms, uploaded reports and the doctor's confidential clinical notes and assessment.",
      },
      { property: "og:title", content: "Patient case records | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Review submitted case histories and record the clinical assessment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:url", content: "/case-records" },
    ],
    links: [{ rel: "canonical", href: "/case-records" }],
  }),
  component: CaseRecordsPage,
});

type NoteDraft = { assessment: string; confidential_notes: string };

function CaseRecordsPage() {
  const { user, isCareTeam, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<CaseRecordRow[]>([]);
  const [notes, setNotes] = useState<Record<string, CaseClinicalNoteRow>>({});
  const [drafts, setDrafts] = useState<Record<string, NoteDraft>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"submitted" | "draft" | "all">("submitted");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) void navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    if (!user || !isCareTeam) return;
    setLoading(true);
    const [{ data: cases }, { data: clinicalNotes }] = await Promise.all([
      supabase.from("case_records").select("*").order("created_at", { ascending: false }),
      supabase.from("case_clinical_notes").select("*"),
    ]);
    setRecords(cases ?? []);
    const map: Record<string, CaseClinicalNoteRow> = {};
    const draftMap: Record<string, NoteDraft> = {};
    (clinicalNotes ?? []).forEach((note) => {
      map[note.case_record_id] = note;
      draftMap[note.case_record_id] = {
        assessment: note.assessment ?? "",
        confidential_notes: note.confidential_notes ?? "",
      };
    });
    setNotes(map);
    setDrafts(draftMap);
    setLoading(false);
  }, [user, isCareTeam]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveNote(caseId: string) {
    if (!user) return;
    const draft = drafts[caseId] ?? { assessment: "", confidential_notes: "" };
    setSaving(caseId);
    const existing = notes[caseId];
    const result = existing
      ? await supabase
          .from("case_clinical_notes")
          .update({
            assessment: draft.assessment,
            confidential_notes: draft.confidential_notes,
          })
          .eq("id", existing.id)
      : await supabase.from("case_clinical_notes").insert({
          case_record_id: caseId,
          doctor_id: user.id,
          assessment: draft.assessment,
          confidential_notes: draft.confidential_notes,
        });
    setSaving(null);
    if (result.error) {
      toast.error("Could not save the clinical note.");
      return;
    }
    toast.success("Clinical assessment saved.");
    void load();
  }

  async function markReviewed(caseId: string) {
    const { error } = await supabase
      .from("case_records")
      .update({ status: "reviewed" })
      .eq("id", caseId);
    if (error) {
      toast.error("Could not update this case.");
      return;
    }
    toast.success("Case marked as reviewed.");
    void load();
  }

  async function openAttachment(file: CaseAttachment) {
    const { data, error } = await supabase.storage
      .from(CASE_BUCKET)
      .createSignedUrl(file.path, 60 * 10);
    if (error || !data) {
      toast.error("Could not open this file.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
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
          description="Patient case records are visible to the clinic's doctors and administrators."
        />
        <section className="container-page py-12">
          <p className="rounded-2xl border border-border surface-ivory p-6 text-sm text-muted-foreground">
            If you are a patient, you can fill and review your own case form from your account.
          </p>
        </section>
      </>
    );
  }

  const visible = records.filter((r) =>
    filter === "all" ? true : filter === "draft" ? r.status === "draft" : r.status !== "draft",
  );

  return (
    <>
      <PageHero
        eyebrow="Doctor dashboard"
        title="Patient case records"
        description="Review detailed case histories submitted before consultation, then record your assessment."
      />

      <section className="container-page py-6 sm:py-12">
        <div className="flex flex-wrap gap-2">
          {(["submitted", "draft", "all"] as const).map((value) => (
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
              {value === "submitted"
                ? "Submitted"
                : value === "draft"
                  ? "Patient drafts"
                  : "All cases"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading case records…</p>
        ) : visible.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-border surface-ivory p-6 text-sm text-muted-foreground">
            No case forms in this view yet.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:gap-5">
            {visible.map((record) => {
              const attachments = parseAttachments(record.attachments);
              const isOpen = openId === record.id;
              const draft = drafts[record.id] ?? { assessment: "", confidential_notes: "" };
              return (
                <li key={record.id} className="card-premium p-4 sm:p-6">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg text-navy">{record.patient_name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {record.age || "—"} · {record.gender || "—"} · {record.phone}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {record.submitted_at
                          ? `Submitted ${formatDateTime(record.submitted_at)}`
                          : `Started ${formatDateTime(record.created_at)}`}
                      </p>
                    </div>
                    <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold capitalize text-forest">
                      {record.status}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">
                    <strong className="font-semibold text-navy">Chief complaint:</strong>{" "}
                    {record.chief_complaint || "—"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setOpenId(isOpen ? null : record.id)}
                    >
                      <ClipboardList className="size-4" />
                      {isOpen ? "Hide full case" : "Open full case"}
                    </Button>
                    {record.status !== "reviewed" && (
                      <Button
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => void markReviewed(record.id)}
                      >
                        Mark reviewed
                      </Button>
                    )}
                  </div>

                  {isOpen && (
                    <div className="mt-5 space-y-5">
                      {CASE_SECTIONS.map((section) => {
                        const rows = section.fields
                          .map((field) => ({
                            label: field.label,
                            value: (record[field.key] as string | null) ?? "",
                          }))
                          .filter((row) => row.value.trim().length > 0);
                        if (rows.length === 0) return null;
                        return (
                          <div
                            key={section.id}
                            className="rounded-xl surface-ivory p-4 text-sm text-muted-foreground"
                          >
                            <p className="font-display text-base text-navy">{section.title}</p>
                            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                              {rows.map((row) => (
                                <div key={row.label} className="min-w-0">
                                  <dt className="text-xs font-semibold uppercase tracking-wide text-navy/70">
                                    {row.label}
                                  </dt>
                                  <dd className="whitespace-pre-line">{row.value}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        );
                      })}

                      {attachments.length > 0 && (
                        <div className="rounded-xl border border-border p-4">
                          <p className="flex items-center gap-2 font-display text-base text-navy">
                            <Paperclip className="size-4 text-leaf" /> Uploaded reports
                          </p>
                          <ul className="mt-3 grid gap-2">
                            {attachments.map((file) => (
                              <li key={file.path} className="flex items-center gap-3 text-sm">
                                <button
                                  type="button"
                                  className="min-w-0 flex-1 truncate text-left font-medium text-navy underline-offset-2 hover:underline"
                                  onClick={() => void openAttachment(file)}
                                >
                                  {file.name}
                                </button>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="rounded-xl border border-leaf/30 bg-mint/30 p-4">
                        <p className="flex items-center gap-2 font-display text-base text-navy">
                          <Lock className="size-4 text-leaf" /> Doctor&apos;s assessment
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Only the clinic&apos;s care team can see these notes. The patient never
                          sees them.
                        </p>
                        <div className="mt-4 grid gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor={`assessment-${record.id}`}>Clinical assessment</Label>
                            <Textarea
                              id={`assessment-${record.id}`}
                              rows={3}
                              value={draft.assessment}
                              onChange={(e) =>
                                setDrafts((d) => ({
                                  ...d,
                                  [record.id]: { ...draft, assessment: e.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`confidential-${record.id}`}>
                              Confidential clinical notes
                            </Label>
                            <Textarea
                              id={`confidential-${record.id}`}
                              rows={4}
                              value={draft.confidential_notes}
                              onChange={(e) =>
                                setDrafts((d) => ({
                                  ...d,
                                  [record.id]: { ...draft, confidential_notes: e.target.value },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Button
                              className="rounded-full"
                              disabled={saving === record.id}
                              onClick={() => void saveNote(record.id)}
                            >
                              {saving === record.id ? "Saving…" : "Save assessment"}
                            </Button>
                          </div>
                          {notes[record.id] && (
                            <p className="text-xs text-muted-foreground">
                              Last updated {formatDateTime(notes[record.id]!.updated_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
