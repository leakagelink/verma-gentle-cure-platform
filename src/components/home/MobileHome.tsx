import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Package,
  Pill,
  ShieldCheck,
  Star,
  Truck,
  Video,
} from "lucide-react";

import doctorImage from "@/assets/dr-rajshree-verma.jpg";
import { Button } from "@/components/ui/button";
import { productImage } from "@/lib/product-images";
import { MEDICINE_CATEGORIES } from "@/lib/shop-data";
import { CONDITIONS, STEPS, TESTIMONIALS } from "@/lib/site-data";

const QUICK_ACTIONS = [
  { to: "/book-appointment", label: "Book consult", icon: Video, tone: "bg-mint text-forest" },
  { to: "/medicines", label: "Medicines", icon: Pill, tone: "bg-lime/30 text-forest" },
  { to: "/appointments", label: "My visits", icon: ClipboardList, tone: "bg-teal/10 text-teal" },
  { to: "/orders", label: "My orders", icon: Package, tone: "bg-navy/10 text-navy" },
] as const;

export function MobileHome() {
  return (
    <div className="md:hidden">
      {/* Hero */}
      <section className="container-page pt-4">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-navy p-5 text-navy-foreground shadow-[var(--shadow-lift)]">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-14 size-40 leaf-blob bg-lime/25 blur-xl"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold text-lime">
              <span className="size-1.5 rounded-full bg-lime" />
              Slots open today
            </span>
            <h1 className="mt-3 text-[1.7rem] leading-[1.12] text-navy-foreground text-balance-tight">
              Natural healing,
              <br />
              <span className="text-lime">personalised for you</span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-mint/85">
              Consult Dr. Rajshree Verma online and get a digital prescription with medicines
              delivered to your door.
            </p>
            <div className="mt-4 flex gap-2">
              <Button asChild className="h-11 flex-1 rounded-xl bg-lime text-sm font-semibold text-navy hover:bg-lime/90">
                <Link to="/book-appointment">
                  Book consultation <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 shrink-0 rounded-xl border-white/25 bg-transparent px-4 text-sm text-navy-foreground hover:bg-white/10"
              >
                <Link to="/medicines">Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="container-page mt-4">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map(({ to, label, icon: Icon, tone }) => (
            <Link
              key={to}
              to={to}
              className="flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-1 py-3 text-center"
            >
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-4.5" />
              </span>
              <span className="w-full truncate text-[0.68rem] font-semibold text-navy">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust pills */}
      <section className="container-page mt-4">
        <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {[
            { icon: ShieldCheck, text: "Verified BHMS doctor" },
            { icon: Truck, text: "Pan-India delivery" },
            { icon: CalendarDays, text: "Free follow-up review" },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-navy"
            >
              <Icon className="size-3.5 text-leaf" /> {text}
            </span>
          ))}
        </div>
      </section>

      {/* Shop categories */}
      <section className="container-page mt-7">
        <Header title="Shop medicines" to="/medicines" />
        <div className="hide-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
          {MEDICINE_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/medicines/category/$slug"
              params={{ slug: c.slug }}
              className="w-32 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card"
            >
              <img
                src={productImage(c.slug)}
                alt={c.name}
                loading="lazy"
                width={800}
                height={800}
                className="h-20 w-full object-cover"
              />
              <p className="line-clamp-2 p-2 text-[0.72rem] font-semibold leading-snug text-navy">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Doctor */}
      <section className="container-page mt-7">
        <div className="flex items-center gap-3 rounded-2xl border border-border surface-ivory p-3">
          <img
            src={doctorImage}
            alt="Dr. Rajshree Verma"
            loading="lazy"
            width={512}
            height={512}
            className="size-16 shrink-0 rounded-2xl object-cover object-top"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-navy">Dr. Rajshree Verma</p>
            <p className="truncate text-xs text-muted-foreground">BHMS · 20+ years experience</p>
            <Link
              to="/about-doctor"
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-leaf"
            >
              View profile <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page mt-7">
        <Header title="How it works" />
        <ol className="mt-3 space-y-2">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full gradient-leaf font-display text-sm text-navy">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">{step.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Conditions */}
      <section className="container-page mt-7">
        <Header title="We consult on" to="/treatments" />
        <div className="mt-3 flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <Link
              key={c.slug}
              to="/treatments"
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-navy"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page mt-7">
        <Header title="Patient experiences" />
        <div className="hide-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
          {TESTIMONIALS.slice(0, 5).map((t) => (
            <figure
              key={t.name}
              className="w-[80vw] shrink-0 snap-start rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-1 text-lime">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-3.5 fill-lime" />
                ))}
              </div>
              <blockquote className="mt-2 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-3 truncate text-xs font-semibold text-navy">
                {t.name} · <span className="font-normal text-muted-foreground">{t.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-2 text-[0.68rem] leading-relaxed text-muted-foreground">
          Individual experiences shared with consent. Results may vary from person to person.
        </p>
      </section>

      {/* CTA */}
      <section className="container-page mt-7 pb-2">
        <div className="rounded-2xl border border-border surface-ivory p-4 text-center">
          <p className="font-display text-lg text-navy">Not sure where to start?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Share your concern and the clinic team will guide you to the right consultation.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button asChild className="h-11 rounded-xl text-sm">
              <Link to="/book-appointment">Book now</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl text-sm">
              <Link to="/contact">Contact clinic</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Header({ title, to }: { title: string; to?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-navy">{title}</h2>
      {to ? (
        <Link to={to} className="shrink-0 text-xs font-semibold text-leaf">
          See all
        </Link>
      ) : null}
    </div>
  );
}
