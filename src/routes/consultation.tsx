import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones, MonitorSmartphone, RefreshCw, ShieldCheck } from "lucide-react";

import { PageHero, SectionHeading } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { CONSULT_FEES, STEPS } from "@/lib/site-data";
import { formatINR } from "@/lib/shop-data";

export const Route = createFileRoute("/consultation")({
  head: () => ({
    meta: [
      { title: "Online Homeopathic Consultation — Video & Audio | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Consult a qualified homeopathic physician online by video or audio. Share reports securely, receive a digital prescription and book follow-up reviews.",
      },
      { property: "og:title", content: "Online Consultation | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Secure video and audio homeopathic consultations with digital prescriptions.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/consultation" },
    ],
    links: [{ rel: "canonical", href: "/consultation" }],
  }),
  component: ConsultationPage,
});

const MODES = [
  {
    icon: MonitorSmartphone,
    title: "Online Video Consultation",
    body: "A face-to-face session in your browser. Best for first consultations and visible concerns.",
    fee: CONSULT_FEES.new,
  },
  {
    icon: Headphones,
    title: "Audio Consultation",
    body: "For patients on limited connectivity. Same case-taking, without video.",
    fee: CONSULT_FEES.new,
  },
  {
    icon: RefreshCw,
    title: "Follow-up Consultation",
    body: "A shorter review of your response to the current plan, with adjustments as needed.",
    fee: CONSULT_FEES.followUp,
  },
];

function ConsultationPage() {
  return (
    <>
      <PageHero
        eyebrow="Online consultation"
        title="Consult from home, with the same depth as the clinic"
        description="Book a slot, share your health information securely, and speak with the doctor over video or audio."
      >
        <Button asChild size="lg" className="h-12 rounded-full px-6">
          <Link to="/book-appointment">Book consultation</Link>
        </Button>
      </PageHero>

      <section className="container-page grid gap-6 py-16 md:grid-cols-3">
        {MODES.map(({ icon: Icon, title, body, fee }) => (
          <article key={title} className="card-premium flex flex-col p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-mint text-forest">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-navy">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            <p className="mt-5 font-display text-2xl text-navy">{formatINR(fee)}</p>
          </article>
        ))}
      </section>

      <section className="surface-ivory py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Process" title="How an online consultation runs" />
          <ol className="mt-8 grid gap-5 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card-premium p-6">
                <span className="grid size-9 place-items-center rounded-full bg-navy font-display text-sm text-navy-foreground">
                  {i + 1}
                </span>
                <p className="mt-4 font-semibold text-navy">{s.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-forest" />
            Medical information and uploaded reports are stored in access-controlled storage and are
            visible only to you and the treating doctor.
          </p>
        </div>
      </section>
    </>
  );
}
