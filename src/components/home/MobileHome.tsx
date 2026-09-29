import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
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
import { AWARDS, CONDITIONS, STEPS, TESTIMONIALS } from "@/lib/site-data";

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
      <section className="surface-ivory">
        <div className="container-page pt-5 pb-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-leaf">
            Verma Gentle Cure
          </p>
          <h1 className="mt-2 text-[1.65rem] leading-[1.15] text-navy text-balance-tight">
            Gentle Care. Individual Attention.{" "}
            <span className="text-forest">Welcome to Verma Gentle Cure</span>
          </h1>
          <div className="relative mt-4">
            <span aria-hidden className="absolute inset-x-6 -bottom-2 top-6 rounded-[2rem] bg-mint" />
            <img
              src={doctorImage}
              alt="Dr. Rajshree Verma, Homeopathic Physician"
              width={1024}
              height={1280}
              className="relative h-72 w-full rounded-[1.75rem] border border-border object-cover object-top shadow-[var(--shadow-soft)]"
            />
            <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-border bg-card/95 p-3 backdrop-blur">
              <p className="text-sm font-semibold text-navy">Dr. Rajshree Verma</p>
              <p className="text-xs text-muted-foreground">
                BHMS · Homeopathic Physician · 6 Years of Experience
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A homeopathic healthcare clinic in Jamshedpur founded by Dr. Rajshree Verma (BHMS),
            emphasizing individualized consultation and compassionate care.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild className="h-12 rounded-xl text-sm font-semibold">
              <Link to="/book-appointment">
                Book Appointment <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-xl text-sm">
              <Link to="/contact">Contact Clinic</Link>
            </Button>
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
            { icon: ShieldCheck, text: "6 Years of Professional Experience" },
            { icon: CalendarDays, text: "Established in Jamshedpur" },
            { icon: Star, text: "Patient-Centred Approach" },
            { icon: Award, text: "Media Featured" },
            { icon: Truck, text: "Accessible Clinic Location" },
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
            <p className="truncate text-xs text-muted-foreground">BHMS · Homeopathic Physician · 6 Years of Experience</p>
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
        <Header title="How consultation works" />
        <ol className="mt-3 space-y-2">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest font-display text-xs text-forest-foreground">
                {String(i + 1).padStart(2, "0")}
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

      {/* Awards */}
      <section className="container-page mt-7">
        <Header title="Awards & Recognition" to="/media-recognition" />
        <div className="hide-scrollbar -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
          {AWARDS.map((a) => (
            <div key={a.title} className="w-44 shrink-0 snap-start rounded-2xl border border-lime/50 bg-card p-3">
              <Award className="size-5 text-lime" />
              <p className="mt-2 text-sm font-semibold leading-snug text-navy">{a.title}</p>
              <p className="mt-1 text-[0.68rem] text-muted-foreground">{a.year} · {a.org}</p>
              <p className="mt-1 line-clamp-2 text-[0.68rem] text-muted-foreground">{a.category}</p>
            </div>
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
