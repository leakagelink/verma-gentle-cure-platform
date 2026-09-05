import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarDays,
  HeartPulse,
  LifeBuoy,
  Package,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Truck,
  UserRoundCheck,
  Video,
} from "lucide-react";

import heroImage from "@/assets/hero-remedies.jpg";
import doctorImage from "@/assets/dr-rajshree-verma.jpg";
import { SectionHeading } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  BLOG_POSTS,
  CLINIC,
  CONDITIONS,
  FAQS,
  SERVICES,
  STEPS,
  TESTIMONIALS,
  TRUST_POINTS,
  WHY_US,
} from "@/lib/site-data";

const ICONS = {
  BadgeCheck,
  UserRoundCheck,
  Video,
  Truck,
  ShieldCheck,
  LifeBuoy,
  Stethoscope,
  RefreshCw,
  HeartPulse,
  Package,
  BellRing,
} as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verma Gentle Cure — Homeopathic Consultation & Medicine Delivery" },
      {
        name: "description",
        content:
          "Book an online homeopathic consultation with Dr. Rajshree Verma, receive a digital prescription and order authentic homeopathic medicines with delivery across India.",
      },
      { property: "og:title", content: "Verma Gentle Cure — Natural Healing. Personalized Care." },
      {
        property: "og:description",
        content:
          "Personalised homeopathic consultation, digital prescriptions and authentic medicine delivery.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalClinic",
          name: CLINIC.name,
          medicalSpecialty: "Homeopathic",
          address: CLINIC.address,
          telephone: CLINIC.phone,
          email: CLINIC.email,
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <AboutDoctor />
      <Services />
      <HowItWorks />
      <HealthConditions />
      <WhyUs />
      <Testimonials />
      <BlogPreview />
      <Faq />
      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden surface-ivory">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 size-96 leaf-blob bg-mint/60 blur-3xl"
      />
      <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-card px-3.5 py-1.5 text-xs font-semibold text-forest">
            <span className="size-1.5 rounded-full bg-lime" />
            Online consultation available today
          </span>
          <h1 className="mt-6 text-4xl leading-[1.08] text-navy text-balance-tight sm:text-5xl lg:text-6xl">
            Natural Healing.
            <br />
            <span className="text-forest">Personalized Care.</span>
          </h1>
          <p className="mt-3 font-display text-lg text-teal">
            Personalized homeopathic consultation designed around you.
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Connect with a qualified homeopathic doctor, discuss your health concerns, and receive
            personalized consultation and treatment recommendations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-13 rounded-full px-7 text-base">
              <Link to="/book-appointment">
                Book Online Consultation <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-13 rounded-full border-navy/25 px-7 text-base text-navy"
            >
              <Link to="/medicines">Explore Medicines</Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
            {[
              ["20+ yrs", "Clinical practice"],
              ["Secure", "Medical records"],
              ["Pan-India", "Medicine delivery"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-display text-lg text-navy">{k}</dt>
                <dd className="text-xs text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-lift)]">
            <img
              src={heroImage}
              alt="Homeopathic globules, glass vials and fresh leaves on a warm ivory surface"
              width={1280}
              height={1600}
              className="h-[26rem] w-full object-cover lg:h-[34rem]"
            />
          </div>
          <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] sm:left-8 sm:right-auto sm:w-72">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-forest">
                <CalendarDays className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy">Next available slot</p>
                <p className="truncate text-xs text-muted-foreground">Today · 5:30 PM · Video</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="container-page py-16 lg:py-20">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRUST_POINTS.map((point) => {
          const Icon = ICONS[point.icon as keyof typeof ICONS];
          return (
            <div key={point.title} className="card-premium flex items-start gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-forest">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-navy">{point.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{point.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AboutDoctor() {
  return (
    <section className="surface-ivory py-16 lg:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
            <img
              src={doctorImage}
              alt="Dr. Rajshree Verma, homeopathic physician"
              loading="lazy"
              width={1024}
              height={1280}
              className="h-[28rem] w-full object-cover object-top"
            />
          </div>
          <span className="absolute -right-3 bottom-6 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-navy shadow-[var(--shadow-soft)]">
            BHMS · Homeopathic Physician
          </span>
        </div>

        <div>
          <SectionHeading
            eyebrow="About the doctor"
            title="Dr. Rajshree Verma"
            description="Homeopathic physician with two decades of clinical practice, known for detailed case-taking and an unhurried, patient-first consultation style."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ["Qualifications", "BHMS, with continued clinical education in classical homeopathy"],
              ["Experience", "20+ years of consulting practice across chronic and acute cases"],
              [
                "Areas of focus",
                "Chronic conditions, skin & hair, women's wellness, children's care",
              ],
              ["Approach", "Detailed history, clear explanations, structured follow-up reviews"],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <Button asChild className="mt-8 h-12 rounded-full px-6">
            <Link to="/about-doctor">
              View Doctor Profile <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="container-page py-16 lg:py-24">
      <SectionHeading
        eyebrow="Services"
        title="Care that continues beyond the consultation"
        description="From the first conversation to your follow-up review and medicine delivery."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => {
          const Icon = ICONS[service.icon as keyof typeof ICONS];
          return (
            <article key={service.slug} className="card-premium group flex flex-col p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-mint text-forest transition-colors group-hover:bg-leaf group-hover:text-leaf-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-navy">{service.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <Link
                to="/services"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf"
              >
                Learn more
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-navy py-16 text-navy-foreground lg:py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">How it works</p>
          <h2 className="mt-3 text-2xl text-navy-foreground sm:text-3xl lg:text-4xl">
            Four simple steps from booking to treatment plan
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <span className="grid size-10 place-items-center rounded-full gradient-leaf font-display text-base text-navy">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-navy-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mint/90">{step.description}</p>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute right-0 top-11 hidden h-px w-6 translate-x-full bg-lime/40 lg:block"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function HealthConditions() {
  return (
    <section className="container-page py-16 lg:py-24">
      <SectionHeading
        eyebrow="Health conditions"
        title="Areas we commonly consult on"
        description="Every case is assessed individually. Outcomes vary depending on individual circumstances."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CONDITIONS.map((condition) => (
          <Link
            key={condition.slug}
            to="/treatments"
            className="card-premium group relative overflow-hidden p-6"
          >
            <span
              aria-hidden
              className="absolute -right-10 -top-10 size-28 leaf-blob bg-mint/70 transition-transform group-hover:scale-110"
            />
            <div className="relative">
              <h3 className="text-lg font-semibold text-navy">{condition.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {condition.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf">
                Explore <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section className="surface-ivory py-16 lg:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionHeading
          eyebrow="Why Verma Gentle Cure"
          title="A consultation that actually listens"
          description="The platform exists to support the consultation, not replace it. Everything here is built around the conversation you have with your doctor."
        />
        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2">
          {WHY_US.map((item, i) => (
            <div key={item.title} className="bg-card p-6">
              <p className="font-display text-2xl text-lime">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-semibold text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="container-page py-16 lg:py-24">
      <SectionHeading
        eyebrow="Patient experiences"
        title="In the words of our patients"
        description="Individual experiences shared with consent. Results may vary depending on individual circumstances."
      />
      <Carousel opts={{ align: "start" }} className="mt-10">
        <CarouselContent>
          {TESTIMONIALS.map((t) => (
            <CarouselItem key={t.name} className="sm:basis-1/2 lg:basis-1/3">
              <figure className="card-premium flex h-full flex-col p-6">
                <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint font-semibold text-forest">
                    {t.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.location} · {t.category}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-6 flex justify-end gap-2">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </section>
  );
}

function BlogPreview() {
  return (
    <section className="surface-ivory py-16 lg:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Health journal"
          title="Latest health and wellness articles"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {BLOG_POSTS.slice(0, 3).map((post) => (
            <article key={post.slug} className="card-premium group flex flex-col overflow-hidden">
              <div className="h-40 gradient-leaf" aria-hidden />
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
                  {post.category} ·{" "}
                  {new Date(post.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-3 text-lg font-semibold leading-snug text-navy">{post.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf"
                >
                  Read article <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="container-page py-16 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading eyebrow="FAQ" title="Questions patients ask us" />
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q} className="border-border">
              <AccordionTrigger className="text-left text-base font-semibold text-navy">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="container-page pb-8">
      <div className="relative overflow-hidden rounded-[2rem] gradient-hero px-6 py-14 text-center text-navy-foreground lg:px-16 lg:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 size-64 leaf-blob bg-lime/20 blur-2xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl text-navy-foreground sm:text-4xl">
            Begin your consultation journey
          </h2>
          <p className="mt-4 text-base leading-relaxed text-mint/90">
            Book a slot, share your health information securely, and speak with a qualified
            homeopathic physician.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-13 rounded-full bg-lime px-8 text-base text-lime-foreground hover:bg-lime/90"
          >
            <Link to="/book-appointment">Book Consultation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
