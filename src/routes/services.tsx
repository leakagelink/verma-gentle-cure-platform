import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BellRing,
  HeartPulse,
  Package,
  RefreshCw,
  Stethoscope,
  Video,
} from "lucide-react";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/site-data";

const ICONS = { Video, Stethoscope, RefreshCw, HeartPulse, Package, BellRing } as const;

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Consultation, Follow-up & Medicine Delivery | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Online homeopathic consultation, personalised case-taking, follow-up reviews, chronic condition management and medicine delivery across India.",
      },
      { property: "og:title", content: "Services | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Consultation, follow-up care and medicine delivery from Verma Gentle Cure.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything the consultation needs, in one place"
        description="Care is structured around the consultation: preparation before it, clarity during it and support after it."
      />
      <section className="container-page grid gap-6 py-16 md:grid-cols-2">
        {SERVICES.map((s) => {
          const Icon = ICONS[s.icon as keyof typeof ICONS];
          return (
            <article key={s.slug} className="card-premium flex flex-col p-7">
              <span className="grid size-12 place-items-center rounded-2xl bg-mint text-forest">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-navy">{s.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
              <Button asChild variant="outline" className="mt-6 w-fit rounded-full">
                <Link to="/book-appointment">Book this service</Link>
              </Button>
            </article>
          );
        })}
      </section>
    </>
  );
}
