import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { CLINIC } from "@/lib/site-data";

const QUICK = [
  { to: "/about", label: "About" },
  { to: "/about-doctor", label: "Dr. Rajshree Verma" },
  { to: "/media-recognition", label: "Media & Recognition" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/consultation", label: "Consultation" },
  { to: "/treatments", label: "Treatments" },
  { to: "/medicines", label: "Medicine Shop" },
  { to: "/blog", label: "Blog" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
] as const;

const LEGAL = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/medical-disclaimer", label: "Medical Disclaimer" },
  { to: "/appointment-policy", label: "Cancellation / Appointment Policy" },
  { to: "/accessibility", label: "Accessibility" },
  { to: "/corporate-information", label: "Corporate Information" },
  { to: "/shipping-policy", label: "Shipping Policy" },
  { to: "/refund-policy", label: "Refund Policy" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 hidden border-t border-border surface-ivory lg:block">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm font-semibold text-navy">{CLINIC.corporateLine}</p>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Patient-centred, individualized homeopathic healthcare in Jamshedpur, founded by Dr.
            Rajshree Verma (BHMS).
          </p>
          <a
            href={CLINIC.instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-leaf"
          >
            <Instagram className="size-4 text-leaf" />
            Instagram: {CLINIC.instagram}
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy">Quick Links</h3>
          <ul className="mt-4 space-y-2.5">
            {QUICK.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-leaf"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy">Legal</h3>
          <ul className="mt-4 space-y-2.5">
            {LEGAL.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-leaf"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy">Clinic</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground lg:pr-20">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-leaf" />
              <span>{CLINIC.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-leaf" />
              <a href={CLINIC.phoneHref}>Call Clinic: {CLINIC.phone}</a>
            </li>
            <li className="flex gap-2.5">
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-leaf" />
              <a href={CLINIC.whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp: {CLINIC.whatsapp}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Instagram className="mt-0.5 size-4 shrink-0 text-leaf" />
              <a href={CLINIC.instagramHref} target="_blank" rel="noopener noreferrer">
                Instagram: {CLINIC.instagram}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-leaf" />
              <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>
            </li>
            <li className="text-xs">{CLINIC.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page space-y-3 py-8">
          <p className="text-xs leading-relaxed text-muted-foreground lg:pr-20">
            <span className="font-semibold text-navy">Medical disclaimer:</span> {CLINIC.disclaimer}
          </p>
          <p className="text-xs text-muted-foreground lg:pr-20">
            © {new Date().getFullYear()} {CLINIC.name} — {CLINIC.corporateLine}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
