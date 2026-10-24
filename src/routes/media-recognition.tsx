import { createFileRoute } from "@tanstack/react-router";
import { Award, BookOpen, CalendarDays, Newspaper } from "lucide-react";

import { PageHero, SectionHeading } from "@/components/ui-kit/PageHero";
import {
  AWARD_NOTE,
  AWARDS,
  CLINIC,
  INAUGURATION_COVERAGE,
  INTERVIEW,
  PRINT_FEATURE,
  type AwardItem,
} from "@/lib/site-data";

export const Route = createFileRoute("/media-recognition")({
  head: () => ({
    meta: [
      { title: "Media & Recognition | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Clinic inauguration, media coverage, featured healthcare interview, awards and literary recognitions of Dr. Rajshree Verma and Verma Gentle Cure.",
      },
      { property: "og:title", content: "Media & Recognition | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Inauguration, media coverage and awards of Dr. Rajshree Verma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/media-recognition" }],
  }),
  component: MediaPage,
});

function AwardCard({ a }: { a: AwardItem }) {
  return (
    <li className="card-premium border-t-2 border-t-lime p-5">
      <Award className="size-5 text-lime" />
      <h3 className="mt-3 font-display text-lg text-navy">{a.title}</h3>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div>
          <dt className="inline font-semibold text-navy">Awarding organization: </dt>
          <dd className="inline text-muted-foreground">{a.org}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-navy">Year: </dt>
          <dd className="inline text-muted-foreground">
            {a.year}
            {a.date ? ` · ${a.date}` : ""}
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold text-navy">Recognition: </dt>
          <dd className="inline text-muted-foreground">{a.category}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-navy">Certificate: </dt>
          <dd className="inline text-muted-foreground">On record with the clinic</dd>
        </div>
      </dl>
    </li>
  );
}

function MediaPage() {
  const honours = AWARDS.filter((a) => a.group === "honours");
  const literary = AWARDS.filter((a) => a.group === "literary");
  return (
    <>
      <PageHero
        eyebrow="Media & Recognition"
        title="Media & Recognition"
        description="Milestones, media coverage and recognitions of Verma Gentle Cure and Dr. Rajshree Verma. Media coverage is listed for information and is not an endorsement by the publications."
      />

      <section className="container-page py-14">
        <div className="card-premium grid gap-6 p-6 lg:grid-cols-[auto_1fr] lg:p-8">
          <span className="grid size-14 place-items-center rounded-2xl bg-mint text-forest">
            <CalendarDays className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">Milestone</p>
            <h2 className="mt-1 text-2xl text-navy">Clinic Inauguration — 23 March 2026</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Verma Gentle Cure was formally inaugurated on 23 March 2026 at Sarala Complex, Kadma
              Market, Jamshedpur, Jharkhand. Bharat News reported the clinic as an initiative of{" "}
              {CLINIC.corporate} established by homeopathic physician and author Dr. Rajshree Verma
              (BHMS). Local dignitaries and citizens were reported to have attended, and Dr.
              Rajshree Verma emphasized compassionate and individualized treatment.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Launch coverage highlighted the aim of accessible healthcare, particularly for
              middle-income and needy patients, and mentioned consultation areas including acute and
              chronic conditions, women's health, child health, lifestyle-related conditions and
              mental-health-related concerns.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-ivory py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Media coverage" title="Inauguration Media Coverage" />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {INAUGURATION_COVERAGE.map((m) => (
              <li key={m.outlet} className="card-premium p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
                  <Newspaper className="size-4" /> {m.outlet} · {m.date}
                </div>
                {m.headline && (
                  <p className="mt-2 font-semibold leading-snug text-navy">“{m.headline}”</p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">{m.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-14">
        <SectionHeading
          eyebrow="Featured interview"
          title={INTERVIEW.title}
          description={INTERVIEW.summary}
        />
        <p className="mt-3 text-center text-sm font-semibold text-navy">{INTERVIEW.expert}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INTERVIEW.publications.map((p) => (
            <li key={p.outlet} className="card-premium p-4">
              <p className="font-semibold text-navy">{p.outlet}</p>
              <p className="text-xs text-muted-foreground">
                {p.date} · {p.note}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-ivory py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Print & digital" title="Print & Digital Media Coverage" />
          <div className="card-premium mx-auto mt-8 max-w-xl p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
              Featured in
            </p>
            <p className="mt-1 font-display text-2xl text-navy">{PRINT_FEATURE.outlet}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Print Media Coverage | {PRINT_FEATURE.date} | {PRINT_FEATURE.page} ·{" "}
              {PRINT_FEATURE.edition} edition · {PRINT_FEATURE.section}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <SectionHeading eyebrow="Awards" title="Awards & Honours" />
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {honours.map((a) => (
            <AwardCard key={a.title} a={a} />
          ))}
        </ul>
      </section>

      <section className="surface-ivory py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Literature & academia" title="Academic & Literary Recognition" />
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {literary.map((a) => (
              <AwardCard key={a.title} a={a} />
            ))}
          </ul>
          <p className="mx-auto mt-8 flex max-w-3xl gap-2 text-xs leading-relaxed text-muted-foreground">
            <BookOpen className="size-4 shrink-0 text-leaf" /> {AWARD_NOTE}
          </p>
        </div>
      </section>
    </>
  );
}
