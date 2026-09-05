import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/ui-kit/PageHero";
import { CLINIC, CONDITIONS } from "@/lib/site-data";

export const Route = createFileRoute("/treatments")({
  head: () => ({
    meta: [
      { title: "Health Conditions We Consult On | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Homeopathic consultation for chronic conditions, skin and hair, women's wellness, children's care, lifestyle wellness and sleep concerns.",
      },
      { property: "og:title", content: "Treatments & Health Conditions | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Areas of homeopathic consultation at Verma Gentle Cure.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/treatments" },
    ],
    links: [{ rel: "canonical", href: "/treatments" }],
  }),
  component: TreatmentsPage,
});

function TreatmentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Health conditions"
        title="Areas of consultation"
        description="Each case is assessed individually. Nothing here should be read as a promise of a specific outcome."
      />
      <section className="container-page grid gap-6 py-16 md:grid-cols-2 lg:grid-cols-3">
        {CONDITIONS.map((c) => (
          <article key={c.slug} className="card-premium group relative overflow-hidden p-7">
            <span
              aria-hidden
              className="absolute -right-12 -top-12 size-32 leaf-blob bg-mint/70 transition-transform group-hover:scale-110"
            />
            <div className="relative">
              <h2 className="text-xl font-semibold text-navy">{c.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
              <Link
                to="/book-appointment"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf"
              >
                Discuss this concern <ArrowRight className="size-4" />
              </Link>
            </div>
          </article>
        ))}
      </section>
      <section className="container-page pb-16">
        <p className="rounded-2xl border border-border surface-ivory p-6 text-sm leading-relaxed text-muted-foreground">
          {CLINIC.disclaimer}
        </p>
      </section>
    </>
  );
}
