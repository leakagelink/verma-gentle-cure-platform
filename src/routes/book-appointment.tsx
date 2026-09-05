import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Paperclip, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CLINIC, CONSULT_FEES } from "@/lib/site-data";
import { formatINR } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book-appointment")({
  head: () => ({
    meta: [
      { title: "Book an Online Homeopathic Consultation | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Book a new or follow-up homeopathic consultation with Dr. Rajshree Verma: choose a date and time slot, share your health information and confirm your appointment.",
      },
      { property: "og:title", content: "Book Appointment | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Choose a slot, share your health details and confirm your consultation.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/book-appointment" },
    ],
    links: [{ rel: "canonical", href: "/book-appointment" }],
  }),
  component: BookAppointmentPage,
});

const STEP_LABELS = ["Type", "Doctor", "Date", "Time", "Details", "Summary", "Payment", "Done"];

const SLOTS = ["10:00 AM", "11:30 AM", "01:00 PM", "03:30 PM", "05:00 PM", "06:30 PM"];

type Form = {
  type: "new" | "follow-up";
  mode: "video" | "audio";
  date: string;
  slot: string;
  fullName: string;
  gender: string;
  dob: string;
  mobile: string;
  email: string;
  address: string;
  concern: string;
  symptoms: string;
  duration: string;
  previousTreatment: string;
  currentMedicines: string;
  allergies: string;
  notes: string;
  files: string[];
  payment: "online" | "upi";
};

const EMPTY: Form = {
  type: "new",
  mode: "video",
  date: "",
  slot: "",
  fullName: "",
  gender: "",
  dob: "",
  mobile: "",
  email: "",
  address: "",
  concern: "",
  symptoms: "",
  duration: "",
  previousTreatment: "",
  currentMedicines: "",
  allergies: "",
  notes: "",
  files: [],
  payment: "online",
};

function nextDays(count: number) {
  const out: { iso: string; day: string; date: string; month: string; available: boolean }[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      date: String(d.getDate()),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      available: d.getDay() !== 0,
    });
  }
  return out;
}

function BookAppointmentPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const days = useMemo(() => nextDays(12), []);
  const fee = form.type === "new" ? CONSULT_FEES.new : CONSULT_FEES.followUp;

  useEffect(() => {
    if (!user) return;
    setForm((f) => (f.email ? f : { ...f, email: user.email ?? "" }));
  }, [user]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function validate(current: number) {
    const e: Record<string, string> = {};
    if (current === 2 && !form.date) e["date"] = "Select a date to continue.";
    if (current === 3 && !form.slot) e["slot"] = "Select a time slot to continue.";
    if (current === 4) {
      if (form.fullName.trim().length < 3) e["fullName"] = "Enter your full name.";
      if (!/^[6-9]\d{9}$/.test(form.mobile.trim()))
        e["mobile"] = "Enter a valid 10-digit Indian mobile number.";
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e["email"] = "Enter a valid email address.";
      if (!form.dob) e["dob"] = "Enter your date of birth.";
      if (!form.gender) e["gender"] = "Select a gender.";
      if (form.concern.trim().length < 4) e["concern"] = "Describe your primary health concern.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function confirmAppointment() {
    if (!user) {
      toast.error("Please sign in to confirm your appointment.");
      navigate({ to: "/auth" });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: user.id,
        patient_name: form.fullName.trim(),
        phone: form.mobile.trim(),
        email: form.email.trim(),
        date_of_birth: form.dob,
        gender: form.gender,
        mode: form.mode,
        appointment_date: form.date,
        slot: form.slot,
        concern: [form.concern, form.symptoms, form.duration, form.notes]
          .filter((part) => part.trim().length > 0)
          .join("\n\n"),
        medical_history: form.previousTreatment || null,
        current_medication: form.currentMedicines || null,
        allergies: form.allergies || null,
        fee,
        status: "pending",
        payment_status: "pending",
      })
      .select("id")
      .single();
    setSaving(false);

    if (error || !data) {
      toast.error("We could not save your appointment. Please try again.");
      return;
    }

    setAppointmentId(`VGC-${data.id.slice(0, 8).toUpperCase()}`);
    toast.success("Appointment requested");
    setStep(7);
  }

  function goNext() {
    if (!validate(step)) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    if (step === 6) {
      void confirmAppointment();
      return;
    }
    setStep((s) => Math.min(s + 1, 7));
  }

  return (
    <>
      <PageHero
        eyebrow="Book appointment"
        title="Book your consultation"
        description="Eight quick steps. Your medical information stays private and access-controlled."
      />

      <section className="container-page py-12">
        <ol className="flex flex-wrap gap-2" aria-label="Booking progress">
          {STEP_LABELS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                i === step && "border-leaf bg-mint text-forest",
                i < step && "border-transparent bg-forest text-forest-foreground",
                i > step && "border-border text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-3.5" /> : <span>{i + 1}</span>}
              {label}
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="card-premium p-6 lg:p-8">
            {step === 0 && (
              <Step title="Choose consultation type">
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["new", "New Consultation", "First detailed case-taking session.", CONSULT_FEES.new],
                      ["follow-up", "Follow-up Consultation", "Review of your ongoing plan.", CONSULT_FEES.followUp],
                    ] as const
                  ).map(([value, title, body, price]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set("type", value)}
                      className={cn(
                        "rounded-2xl border p-5 text-left transition-colors",
                        form.type === value
                          ? "border-leaf bg-mint/50"
                          : "border-border hover:border-leaf/40",
                      )}
                    >
                      <p className="font-semibold text-navy">{title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                      <p className="mt-3 font-display text-xl text-navy">{formatINR(price)}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <Label className="text-sm">Consultation mode</Label>
                  <div className="mt-2 flex gap-2">
                    {(["video", "audio"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => set("mode", m)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm capitalize",
                          form.mode === m
                            ? "border-leaf bg-mint text-forest"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </Step>
            )}

            {step === 1 && (
              <Step title="Select doctor">
                <button
                  type="button"
                  className="flex w-full items-center gap-4 rounded-2xl border border-leaf bg-mint/40 p-5 text-left"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-navy font-display text-navy-foreground">
                    RV
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-navy">{CLINIC.doctor}</span>
                    <span className="block text-sm text-muted-foreground">
                      BHMS · Homeopathic Physician · 20+ years
                    </span>
                  </span>
                </button>
                <p className="mt-4 text-sm text-muted-foreground">
                  Additional doctors can be added by the clinic administrator.
                </p>
              </Step>
            )}

            {step === 2 && (
              <Step title="Select date" error={errors["date"]}>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {days.map((d) => (
                    <button
                      key={d.iso}
                      type="button"
                      disabled={!d.available}
                      onClick={() => set("date", d.iso)}
                      className={cn(
                        "rounded-2xl border p-3 text-center transition-colors",
                        form.date === d.iso
                          ? "border-leaf bg-mint text-forest"
                          : "border-border hover:border-leaf/40",
                        !d.available && "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span className="block text-xs text-muted-foreground">{d.day}</span>
                      <span className="mt-1 block font-display text-lg text-navy">{d.date}</span>
                      <span className="block text-xs text-muted-foreground">{d.month}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Faded dates are unavailable. Sunday consultations are by request only.
                </p>
              </Step>
            )}

            {step === 3 && (
              <Step title="Select time slot" error={errors["slot"]}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SLOTS.map((s, i) => {
                    const taken = i === 2;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={taken}
                        onClick={() => set("slot", s)}
                        className={cn(
                          "min-h-12 rounded-xl border px-3 text-sm font-medium transition-colors",
                          form.slot === s
                            ? "border-leaf bg-mint text-forest"
                            : "border-border text-navy hover:border-leaf/40",
                          taken && "cursor-not-allowed text-muted-foreground opacity-40",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Step>
            )}

            {step === 4 && (
              <Step title="Patient & medical information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errors["fullName"]}>
                    <Input
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      placeholder="Your full name"
                    />
                  </Field>
                  <Field label="Gender" error={errors["gender"]}>
                    <div className="flex gap-2">
                      {["Female", "Male", "Other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => set("gender", g)}
                          className={cn(
                            "min-h-10 rounded-full border px-4 text-sm",
                            form.gender === g
                              ? "border-leaf bg-mint text-forest"
                              : "border-border text-muted-foreground",
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Date of birth" error={errors["dob"]}>
                    <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
                  </Field>
                  <Field label="Mobile number" error={errors["mobile"]}>
                    <Input
                      inputMode="numeric"
                      value={form.mobile}
                      onChange={(e) => set("mobile", e.target.value)}
                      placeholder="10-digit mobile"
                    />
                  </Field>
                  <Field label="Email address" error={errors["email"]}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Address">
                    <Input
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="City, State"
                    />
                  </Field>
                </div>

                <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
                  Medical information
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Primary health concern" error={errors["concern"]}>
                    <Input value={form.concern} onChange={(e) => set("concern", e.target.value)} />
                  </Field>
                  <Field label="Duration of concern">
                    <Input
                      value={form.duration}
                      onChange={(e) => set("duration", e.target.value)}
                      placeholder="e.g. 6 months"
                    />
                  </Field>
                  <Field label="Symptoms" className="sm:col-span-2">
                    <Textarea
                      rows={3}
                      value={form.symptoms}
                      onChange={(e) => set("symptoms", e.target.value)}
                    />
                  </Field>
                  <Field label="Previous treatment">
                    <Input
                      value={form.previousTreatment}
                      onChange={(e) => set("previousTreatment", e.target.value)}
                    />
                  </Field>
                  <Field label="Current medicines">
                    <Input
                      value={form.currentMedicines}
                      onChange={(e) => set("currentMedicines", e.target.value)}
                    />
                  </Field>
                  <Field label="Allergies">
                    <Input
                      value={form.allergies}
                      onChange={(e) => set("allergies", e.target.value)}
                    />
                  </Field>
                  <Field label="Additional notes">
                    <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                  </Field>
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-border p-5">
                  <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
                    <Paperclip className="size-4 text-leaf" />
                    Upload reports, prescriptions or images
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={(e) =>
                        set("files", Array.from(e.target.files ?? []).map((f) => f.name))
                      }
                    />
                  </Label>
                  {form.files.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {form.files.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 flex items-center gap-2 text-xs text-forest">
                    <ShieldCheck className="size-4" /> Secure medical information
                  </p>
                </div>
              </Step>
            )}

            {step === 5 && (
              <Step title="Appointment summary">
                <dl className="divide-y divide-border rounded-2xl border border-border">
                  {[
                    ["Doctor", CLINIC.doctor],
                    ["Consultation type", form.type === "new" ? "New Consultation" : "Follow-up"],
                    ["Mode", form.mode === "video" ? "Video" : "Audio"],
                    ["Date", form.date || "—"],
                    ["Time", form.slot || "—"],
                    ["Patient", form.fullName || "—"],
                    ["Mobile", form.mobile || "—"],
                    ["Consultation fee", formatINR(fee)],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 gap-4 p-4 text-sm">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium text-navy">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Step>
            )}

            {step === 6 && (
              <Step title="Payment">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["online", "Card / Netbanking", "Processed by the clinic's payment provider"],
                      ["upi", "UPI", "Pay via any UPI app"],
                    ] as const
                  ).map(([value, title, body]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set("payment", value)}
                      className={cn(
                        "rounded-2xl border p-5 text-left",
                        form.payment === value
                          ? "border-leaf bg-mint/50"
                          : "border-border hover:border-leaf/40",
                      )}
                    >
                      <p className="font-semibold text-navy">{title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                    </button>
                  ))}
                </div>
                <p className="mt-5 rounded-xl surface-ivory p-4 text-sm text-muted-foreground">
                  Payment gateway credentials are not configured yet. Confirming here records the
                  appointment with payment status <strong className="text-navy">Pending</strong>.
                </p>
                <p className="mt-4 font-display text-2xl text-navy">Payable: {formatINR(fee)}</p>
                {!authLoading && !user && (
                  <p className="mt-4 rounded-xl border border-leaf/40 bg-mint/40 p-4 text-sm text-forest">
                    Please{" "}
                    <Link to="/auth" className="font-semibold underline">
                      sign in or create an account
                    </Link>{" "}
                    so your appointment and prescriptions stay saved in your private patient record.
                  </p>
                )}
              </Step>
            )}

            {step === 7 && (
              <div className="text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-forest">
                  <Check className="size-7" />
                </span>
                <h2 className="mt-5 text-2xl text-navy">Appointment requested</h2>
                <dl className="mx-auto mt-6 max-w-md divide-y divide-border rounded-2xl border border-border text-left">
                  {[
                    ["Appointment ID", appointmentId],
                    ["Status", "Awaiting clinic confirmation"],
                    ["Date", form.date || "—"],
                    ["Time", form.slot || "—"],
                    ["Doctor", CLINIC.doctor],
                    ["Payment status", "Pending"],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 gap-4 p-4 text-sm">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium text-navy">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Button asChild className="rounded-full">
                    <Link to="/appointments">View my appointments</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/">Go to home</Link>
                  </Button>
                </div>
              </div>
            )}

            {step < 7 && (
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
                <Button
                  variant="ghost"
                  className="rounded-full"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ChevronLeft className="size-4" /> Back
                </Button>
                <Button className="h-12 rounded-full px-6" onClick={goNext} disabled={saving}>
                  {step === 6 ? (saving ? "Saving…" : "Confirm appointment") : "Continue"}
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-3xl border border-border surface-ivory p-6 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
              Your booking
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <SummaryRow k="Doctor" v={CLINIC.doctor} />
              <SummaryRow k="Type" v={form.type === "new" ? "New" : "Follow-up"} />
              <SummaryRow k="Mode" v={form.mode} />
              <SummaryRow k="Date" v={form.date || "Not selected"} />
              <SummaryRow k="Time" v={form.slot || "Not selected"} />
            </ul>
            <p className="mt-5 border-t border-border pt-4 font-display text-2xl text-navy">
              {formatINR(fee)}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{CLINIC.disclaimer}</p>
          </aside>
        </div>
      </section>
    </>
  );
}

function Step({
  title,
  error,
  children,
}: {
  title: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl text-navy">{title}</h2>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string | undefined;
  className?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm text-navy">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium capitalize text-navy">{v}</span>
    </li>
  );
}
