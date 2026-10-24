import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";

import { PageHero } from "@/components/ui-kit/PageHero";
import { TESTIMONIALS } from "@/lib/site-data";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Patient Testimonials | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Experiences shared by patients of Verma Gentle Cure, Jamshedpur. Individual results may vary.",
      },
      { property: "og:title", content: "Patient Testimonials | Verma Gentle Cure" },
      { property: "og:description", content: "Patient experiences at Verma Gentle Cure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="Patient experiences"
        description="Individual experiences shared with consent. Individual results may vary."
      />
      <section className="container-page grid gap-4 py-14 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="card-premium p-6">
            <div className="flex gap-1 text-lime">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="size-4 fill-lime" />
              ))}
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-navy">
              {t.name} · <span className="font-normal text-muted-foreground">{t.location}</span>
            </figcaption>
          </figure>
        ))}
      </section>
    </>
  ),
});
