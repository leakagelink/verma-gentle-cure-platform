import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { recordHealthConsent } from "@/lib/trusted-actions.functions";
import { ClipboardList, FileUp, Lock, Paperclip, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  CASE_BUCKET,
  CASE_SECTIONS,
  EMPTY_CASE_FORM,
  formatFileSize,
  parseAttachments,
  toFormValues,
  type CaseAttachment,
  type CaseFormValues,
} from "@/lib/case-form-data";
import { CLINIC } from "@/lib/site-data";
import { HEALTH_NOTICE_VERSION, validReport } from "@/lib/upload-security";
import { hasPrivacyConsent } from "@/lib/privacy-rules";

export const Route = createFileRoute("/case-form")({
  head: () => ({
    meta: [
      { title: "Digital Case-Taking Form | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Fill your detailed homeopathic case history before the consultation — complaints, history, lifestyle and reports — so Dr. Rajshree Verma can review it in advance.",
      },
      { property: "og:title", content: "Digital case-taking form | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Share your complete case history and reports securely before your consultation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:url", content: "/case-form" },
    ],
    links: [{ rel: "canonical", href: "/case-form" }],
  }),
  component: CaseFormPage,
});

function CaseFormPage() {
  const consent = useServerFn(recordHealthConsent);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [recordId, setRecordId] = useState<string | null>(null);
  const [status, setStatus] = useState<"draft" | "submitted">("draft");
  const [form, setForm] = useState<CaseFormValues>(EMPTY_CASE_FORM);
  const [attachments, setAttachments] = useState<CaseAttachment[]>([]);
  const [showWomen, setShowWomen] = useState(false);
  const [showChild, setShowChild] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [healthConsent, setHealthConsent] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) void navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("case_records")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setRecordId(data.id);
      setStatus(data.status === "submitted" ? "submitted" : "draft");
      setForm(toFormValues(data));
      setAttachments(parseAttachments(data.attachments));
      setShowWomen(Boolean(data.menstrual_history || data.reproductive_history));
      setShowChild(
        Boolean(
          data.child_birth_history ||
          data.child_vaccination ||
          data.child_development ||
          data.child_behaviour,
        ),
      );
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, gender")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setForm((f) => ({
          ...f,
          patient_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
          gender: profile.gender ?? "",
        }));
        setShowWomen((profile.gender ?? "").toLowerCase().startsWith("f"));
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const set = (key: keyof CaseFormValues, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function persist(
    nextStatus: "draft" | "submitted",
    nextAttachments: CaseAttachment[] = attachments,
  ) {
    if (!user) return null;
    if (!hasPrivacyConsent(healthConsent)) throw new Error("Health data consent required.");
    const receipt = await consent({
      data: { accepted: true, noticeVersion: HEALTH_NOTICE_VERSION, purpose: "case" },
    });
    const payload = {
      ...form,
      patient_id: user.id,
      health_consent_receipt_id: receipt.id,
      health_consent_at: receipt.accepted_at,
      health_notice_version: HEALTH_NOTICE_VERSION,
      status: nextStatus,
      attachments: nextAttachments as unknown as never,
      ...(nextStatus === "submitted" ? { submitted_at: new Date().toISOString() } : {}),
    };

    if (recordId) {
      const { error } = await supabase.from("case_records").update(payload).eq("id", recordId);
      if (error) throw error;
      return recordId;
    }
    const { data, error } = await supabase
      .from("case_records")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    setRecordId(data.id);
    return data.id;
  }

  async function saveDraft() {
    if (busy) return;
    if (!healthConsent) {
      toast.error("Please consent to sharing your health information first.");
      return;
    }
    setBusy(true);
    try {
      await persist("draft");
      toast.success("Draft saved. You can come back and finish it any time.");
    } catch {
      toast.error("Could not save your form. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!healthConsent) {
      toast.error("Please consent to sharing your health information first.");
      return;
    }
    if (form.patient_name.trim().length < 3) {
      toast.error("Please enter the patient's full name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (form.chief_complaint.trim().length < 10) {
      toast.error("Please describe the main problem in a little more detail.");
      return;
    }
    if (!form.complaint_duration.trim()) {
      toast.error("Please tell us since when the problem has been there.");
      return;
    }
    setBusy(true);
    try {
      await persist("submitted");
      setStatus("submitted");
      toast.success("Case form sent to the clinic. The doctor will review it before your visit.");
    } catch {
      toast.error("Could not send your form. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0 || !user) return;
    if (!healthConsent) {
      toast.error("Please consent before uploading health reports.");
      return;
    }
    if (attachments.length + files.length > 20) {
      toast.error("Attach at most 20 reports.");
      return;
    }
    setUploading(true);
    const added: CaseAttachment[] = [];
    try {
      await consent({ data: { accepted: true, noticeVersion: HEALTH_NOTICE_VERSION, purpose: "case" } });
      for (const file of Array.from(files)) {
        if (!validReport(file)) {
          toast.error("Use a PDF, JPEG, PNG or WebP file up to 10 MB.");
          continue;
        }
        const safeName = file.name.replace(/[^\w.-]+/g, "-").slice(-80);
        const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from(CASE_BUCKET).upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
        if (error) {
          toast.error(`Could not upload ${file.name}.`);
          continue;
        }
        added.push({ path, name: file.name, type: file.type, size: file.size });
      }
      if (added.length > 0) {
        const next = [...attachments, ...added];
        await persist(status, next);
        setAttachments(next);
        toast.success(`${added.length} file(s) attached.`);
      }
    } catch {
      if (added.length > 0) {
        const cleanup = await supabase.storage.from(CASE_BUCKET).remove(added.map((a) => a.path));
        if (cleanup.error)
          toast.error("Upload cleanup could not complete. Please contact the clinic.");
      }
      toast.error("Could not attach your files. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeAttachment(target: CaseAttachment) {
    if (!healthConsent) {
      toast.error("Please confirm consent before changing your saved report list.");
      return;
    }
    const next = attachments.filter((a) => a.path !== target.path);
    try {
      await persist(status, next);
      const removed = await supabase.storage.from(CASE_BUCKET).remove([target.path]);
      if (removed.error) {
        await persist(status, attachments);
        throw new Error("File removal failed");
      }
      setAttachments(next);
    } catch {
      toast.error("Could not remove this report. Please contact the clinic.");
    }
  }

  async function openAttachment(target: CaseAttachment) {
    const { data, error } = await supabase.storage
      .from(CASE_BUCKET)
      .createSignedUrl(target.path, 60 * 10);
    if (error || !data) {
      toast.error("Could not open this file.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function startNewCase() {
    setRecordId(null);
    setStatus("draft");
    setForm(EMPTY_CASE_FORM);
    setAttachments([]);
    await load();
    setStatus("draft");
    setRecordId(null);
  }

  if (authLoading || !user) {
    return (
      <section className="container-page py-24 text-center text-sm text-muted-foreground">
        Loading…
      </section>
    );
  }

  const visibleSections = CASE_SECTIONS.filter((s) =>
    s.audience === "female" ? showWomen : s.audience === "child" ? showChild : true,
  );
  const readOnly = status === "submitted";

  return (
    <>
      <PageHero
        eyebrow="Before your consultation"
        title="Digital case-taking form"
        description="Share your complete case history in advance so your consultation time is spent on care, not paperwork."
      />

      <section className="container-page max-w-4xl py-6 sm:py-12">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your case form…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border surface-ivory p-4 text-sm text-muted-foreground">
              <Lock className="size-4 shrink-0 text-leaf" />
              <span className="min-w-0 flex-1">
                Only you and the clinic&apos;s care team can see this form. The final assessment is
                made by {CLINIC.doctor} after reviewing your case.
              </span>
              <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-forest">
                {readOnly ? "Submitted" : "Draft"}
              </span>
            </div>

            {readOnly && (
              <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground sm:p-6">
                <p className="text-navy">
                  <strong className="font-semibold">Thank you.</strong> Your case form has been sent
                  to the clinic. You can still attach more reports below.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/book-appointment">Book a consultation</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => void startNewCase()}
                  >
                    Start a new case form
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={submitForm} className="mt-6 grid gap-5 sm:gap-6">
              <fieldset className="space-y-3 rounded-lg border border-border bg-mint p-4">
                <legend className="px-1 font-semibold">Your health information</legend>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This form collects symptoms, medical and family history, optional
                  mental/reproductive health information and the reports/photos you choose to
                  upload. Information is stored in access-controlled clinic records and shared with
                  authorized care staff for consultation, not advertising. Optional questions may be
                  left blank. The app is not a medical device and does not diagnose, treat, cure or
                  prevent a condition; consult a healthcare professional for medical advice.
                </p>
                <Label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={healthConsent}
                    onChange={(e) => setHealthConsent(e.target.checked)}
                    className="mt-1"
                  />{" "}
                  I consent to storing and sharing this health information with the clinic for care,
                  and have authority to share it for the patient.
                </Label>
                <p className="text-xs">
                  <Link to="/privacy-policy" className="text-primary underline">
                    Privacy policy
                  </Link>{" "}
                  ·{" "}
                  <Link to="/delete-account" className="text-primary underline">
                    Data deletion requests
                  </Link>
                </p>
              </fieldset>
              {visibleSections.map((section) => (
                <fieldset
                  key={section.id}
                  disabled={readOnly}
                  className="card-premium space-y-4 p-4 disabled:opacity-90 sm:p-6"
                >
                  <div>
                    <h2 className="flex items-center gap-2 text-lg text-navy sm:text-xl">
                      <ClipboardList className="size-5 text-leaf" /> {section.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {section.fields.map((field) => (
                      <div
                        key={field.key}
                        className={`space-y-1.5 ${field.multiline ? "sm:col-span-2" : ""}`}
                      >
                        <Label htmlFor={field.key}>{field.label}</Label>
                        {field.multiline ? (
                          <Textarea
                            id={field.key}
                            rows={3}
                            maxLength={2000}
                            placeholder={field.placeholder}
                            value={form[field.key]}
                            onChange={(e) => set(field.key, e.target.value)}
                          />
                        ) : (
                          <Input
                            id={field.key}
                            maxLength={200}
                            placeholder={field.placeholder}
                            value={form[field.key]}
                            onChange={(e) =>
                              set(
                                field.key,
                                field.key === "phone"
                                  ? e.target.value.replace(/\D/g, "").slice(0, 10)
                                  : e.target.value,
                              )
                            }
                          />
                        )}
                        {field.hint && (
                          <p className="text-xs text-muted-foreground">{field.hint}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}

              <div className="card-premium space-y-3 p-4 sm:p-6">
                <h2 className="text-lg text-navy sm:text-xl">Additional sections</h2>
                <p className="text-sm text-muted-foreground">
                  Add these only if they apply to the patient.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant={showWomen ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setShowWomen((v) => !v)}
                  >
                    {showWomen ? "Hide" : "Add"} women&apos;s health
                  </Button>
                  <Button
                    type="button"
                    variant={showChild ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setShowChild((v) => !v)}
                  >
                    {showChild ? "Hide" : "Add"} child history
                  </Button>
                </div>
              </div>

              <div className="card-premium space-y-4 p-4 sm:p-6">
                <div>
                  <h2 className="flex items-center gap-2 text-lg text-navy sm:text-xl">
                    <Paperclip className="size-5 text-leaf" /> Reports, prescriptions & photographs
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload lab reports, old prescriptions or photographs (max 10 MB each). They stay
                    private to you and the care team.
                  </p>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => void uploadFiles(e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full"
                  disabled={uploading || !healthConsent}
                  onClick={() => fileRef.current?.click()}
                >
                  <FileUp className="size-4" /> {uploading ? "Uploading…" : "Choose files"}
                </Button>

                {attachments.length > 0 && (
                  <ul className="grid gap-2">
                    {attachments.map((file) => (
                      <li
                        key={file.path}
                        className="flex items-center gap-3 rounded-xl border border-border surface-ivory p-3 text-sm"
                      >
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
                        <button
                          type="button"
                          aria-label={`Remove ${file.name}`}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => void removeAttachment(file)}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {!readOnly && (
                <div className="sticky bottom-20 z-10 flex flex-wrap gap-3 rounded-2xl border border-border bg-background/95 p-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1 rounded-full sm:flex-none sm:px-8"
                    disabled={busy || !healthConsent}
                    onClick={() => void saveDraft()}
                  >
                    Save draft
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 flex-1 rounded-full sm:flex-none sm:px-8"
                    disabled={busy || !healthConsent}
                  >
                    {busy ? "Sending…" : "Send to clinic"}
                  </Button>
                </div>
              )}
            </form>

            <p className="mt-8 rounded-2xl border border-border surface-ivory p-5 text-xs leading-relaxed text-muted-foreground">
              {CLINIC.disclaimer}
            </p>
          </>
        )}
      </section>
    </>
  );
}
