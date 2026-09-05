import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, GraduationCap, Stethoscope } from "lucide-react";

import doctorImage from "@/assets/dr-rajshree-verma.jpg";
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
        description="BHMS · Homeopathic Physician · 20+ years of clinical practice at Verma Gentle Cure."
      >
        <Button asChild size="lg" className="h-12 rounded-full px-6">
          <Link to="/book-appointment">Book a consultation</Link>
        </Button>
      </PageHero>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
          <img
            src={doctorImage}
            alt="Dr. Rajshree Verma"
            loading="lazy"
            width={1024}
            height={1280}
            className="h-[30rem] w-full object-cover object-top"
          />
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl text-navy">Biography</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Dr. Rajshree Verma has practised classical homeopathy for over two decades, with a
                consulting style built on long, detailed case-taking. Patients frequently describe
                the first consultation as the first time their full history has been heard in one
                sitting.
              </p>
              <p>
                Her practice covers chronic and recurring complaints, skin and hair concerns,
                women's health, and paediatric consultation. Each case is assessed individually,
                with a clear explanation of what is being recommended and what to observe before
                the review appointment.
              </p>
              <p>
                Alongside clinic consultations at {CLINIC.address.split(",")[1]?.trim() ?? "the clinic"},
                she consults online so that patients outside the city can maintain continuity of
                care.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: GraduationCap, title: "Qualification", body: "BHMS, classical homeopathy" },
              { icon: Stethoscope, title: "Experience", body: "20+ years in practice" },
              { icon: Award, title: "Recognition", body: "Regional & state honours" },
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
          <SectionHeading eyebrow="Recognition" title="Awards and appreciation" />
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {AWARDS.map((a) => (
              <li key={a.title} className="card-premium p-6">
                <p className="font-display text-2xl text-lime">{a.year}</p>
                <p className="mt-2 font-semibold text-navy">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
