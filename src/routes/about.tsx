import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero, SectionHeading } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { CLINIC, TIMELINE } from "@/lib/site-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Verma Gentle Cure — Homeopathic Clinic, Jamshedpur" },
      { name: "description", content: "Verma Gentle Cure is a homeopathic healthcare clinic in Jamshedpur founded by Dr. Rajshree Verma (BHMS), a healthcare initiative of Vermaverse OPC Private Limited." },
      { property: "og:title", content: "About Verma Gentle Cure" },
      { property: "og:description", content: "Patient-centred, individualized homeopathic healthcare in Jamshedpur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="About Verma Gentle Cure"
        description="Verma Gentle Cure is a healthcare initiative of Vermaverse OPC Private Limited, founded by Dr. Rajshree Verma."
      >
        <Button asChild size="lg" className="h-12 rounded-full px-6"><Link to="/book-appointment">Book Appointment</Link></Button>
      </PageHero>
      <section className="container-page grid gap-10 py-14 lg:grid-cols-2">
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>Verma Gentle Cure is a homeopathic healthcare clinic in Jamshedpur, Jharkhand, founded by Dr. Rajshree Verma (BHMS).</p>
          <p>The clinic focuses on a patient-centred and individualized approach to homeopathic consultation and care.</p>
          <p>Verma Gentle Cure was formally inaugurated on 23 March 2026 at Sarala Complex, Kadma Market, Jamshedpur. Contemporary media coverage described the clinic as an initiative of {CLINIC.corporate} founded by Dr. Rajshree Verma.</p>
          <p>The clinic's launch coverage emphasized accessible, gentle and individualized homeopathic care, with particular attention to the individual patient rather than symptoms alone.</p>
          <h2 className="pt-4 text-2xl text-navy">Our Approach</h2>
          <p>At Verma Gentle Cure, the emphasis is on personalized homeopathic consultation, compassionate patient care and accessibility.</p>
          <p>The clinic aims to provide a welcoming healthcare environment where each patient can receive individualized attention based on their healthcare needs.</p>
        </div>
        <div className="card-premium p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">Organization</p>
          <ol className="mt-4 space-y-2 text-center">
            <li className="rounded-xl bg-mint p-3 font-semibold text-navy">{CLINIC.corporate}</li>
            <li aria-hidden className="text-muted-foreground">↓</li>
            <li className="rounded-xl bg-mint p-3 font-semibold text-navy">Verma Gentle Cure</li>
            <li aria-hidden className="text-muted-foreground">↓</li>
            <li className="rounded-xl bg-mint p-3 font-semibold text-navy">Founder — Dr. Rajshree Verma (BHMS)</li>
          </ol>
        </div>
      </section>
      <section className="surface-ivory py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Milestones" title="Timeline" />
          <ol className="relative mx-auto mt-10 max-w-2xl border-l-2 border-mint pl-6">
            {TIMELINE.map((t) => (
              <li key={t.date + t.text} className="relative pb-6 last:pb-0">
                <span className={`absolute -left-[1.95rem] top-1 size-3.5 rounded-full border-2 border-background ${t.milestone ? "bg-lime" : "bg-forest"}`} />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf">{t.date}</p>
                <p className="mt-1 text-sm text-foreground">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
