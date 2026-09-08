import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { CLINIC } from "@/lib/site-data";

const QUICK = [
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
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            A homeopathic care platform for personalised consultation, digital prescriptions and
            authentic medicine delivery.
          </p>
          <div className="flex gap-2">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <span
                key={i}
                className="grid size-9 place-items-center rounded-full border border-border bg-card text-navy"
                aria-hidden
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
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
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-leaf" />
              <span>{CLINIC.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-leaf" />
              <a href={`tel:${CLINIC.phone.replace(/\s/g, "")}`}>{CLINIC.phone}</a>
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
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-navy">Medical disclaimer:</span> {CLINIC.disclaimer}
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {CLINIC.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
