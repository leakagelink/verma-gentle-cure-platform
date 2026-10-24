import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, GraduationCap, Stethoscope } from "lucide-react";

import heroPortrait from "@/assets/dr-rajshree-verma-hero.jpg.asset.json";
import { PageHero, SectionHeading } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { AWARDS, CLINIC } from "@/lib/site-data";

export const Route = createFileRoute("/about-doctor")({
  head: () => ({
    meta: [
      { title: "Dr. Rajshree Verma — Homeopathic Physician | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Profile of Dr. Rajshree Verma, BHMS homeopathic physician: qualifications, clinical experience, areas of focus and consultation approach.",
      },
      { property: "og:title", content: "Dr. Rajshree Verma — Homeopathic Physician" },
      {
        property: "og:description",
        content: "Qualifications, clinical experience and consultation approach.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/about-doctor" },
    ],
    links: [{ rel: "canonical", href: "/about-doctor" }],
  }),
  component: AboutDoctorPage,
});

function AboutDoctorPage() {
  return (
    <>
      <PageHero
        eyebrow="About the doctor"
        title="Dr. Rajshree Verma"
        description="BHMS · Homeopathic Physician · 6 years of experience · Founder, Verma Gentle Cure."
      >
        <Button asChild size="lg" className="h-12 rounded-full px-6">
          <Link to="/book-appointment">Book a consultation</Link>
        </Button>
      </PageHero>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
          <img
            src={heroPortrait.url}
            alt="Dr. Rajshree Verma"
            loading="lazy"
            width={1024}
            height={1536}
            className="h-[30rem] w-full object-cover object-top"
          />
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl text-navy">Biography</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>Dr. Rajshree Verma (BHMS) is a homeopathic physician and founder of Verma Gentle Cure, Jamshedpur.</p>
              <p>Her professional approach emphasizes individualized consultation and compassionate patient care.</p>
              <p>Beyond clinical practice, her profile also includes work in literature and education, along with awards, media features and professional/academic recognition.</p>
              <p>Her healthcare interview on the future role of homeopathy was carried by multiple publications in March 2026, while the inauguration of Verma Gentle Cure on 23 March 2026 also received coverage across several local and regional media platforms.</p>
              <p className="font-semibold text-navy">
                <a href={CLINIC.phoneHref}>Call Clinic: {CLINIC.phone}</a> · <a href={CLINIC.whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp: {CLINIC.whatsapp}</a>
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: GraduationCap, title: "Qualification", body: "BHMS" },
              { icon: Stethoscope, title: "Experience", body: "6 years" },
              { icon: Award, title: "Recognition", body: "Awards, media & literary" },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="card-premium p-5">
                <Icon className="size-5 text-leaf" />
                <p className="mt-3 font-semibold text-navy">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-ivory py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Recognition" title="Awards, Honours & Recognitions" />
          <p className="mt-3 text-center"><Link to="/media-recognition" className="text-sm font-semibold text-leaf">View full Media & Recognition →</Link></p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {AWARDS.map((a) => (
              <li key={a.title} className="card-premium p-6">
                <p className="font-display text-2xl text-lime">{a.year}</p>
                <p className="mt-2 font-semibold text-navy">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.org}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.category}{a.date ? ` · ${a.date}` : ""}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
