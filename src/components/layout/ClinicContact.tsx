import { MessageCircle, Phone } from "lucide-react";

import { CLINIC } from "@/lib/site-data";

/**
 * One source of truth for the clinic's two contact channels:
 * the landline (Call Clinic) and WhatsApp. Used across every page so
 * both numbers are always mentioned together.
 */

export function ContactLine({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm font-semibold text-navy ${className}`}>
      <a href={CLINIC.phoneHref}>Call Clinic: {CLINIC.phone}</a>
      <span className="font-normal text-muted-foreground"> · </span>
      <a href={CLINIC.whatsappHref} target="_blank" rel="noopener noreferrer">
        WhatsApp: {CLINIC.whatsapp}
      </a>
    </p>
  );
}

export function ContactButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <a
        href={CLINIC.phoneHref}
        className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-forest-foreground transition-opacity hover:opacity-90"
      >
        <Phone className="size-4" />
        Call Clinic: {CLINIC.phone}
      </a>
      <a
        href={CLINIC.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-leaf"
      >
        <MessageCircle className="size-4 text-leaf" />
        WhatsApp: {CLINIC.whatsapp}
      </a>
    </div>
  );
}

/** Compact band shown on every page (above the footer) so both numbers are always on screen. */
export function ContactBand() {
  return (
    <section className="mt-16 border-y border-border surface-ivory print:hidden">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0">
          <p className="font-display text-base text-navy">
            Any question? Call the clinic or message us on WhatsApp.
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{CLINIC.hours}</p>
        </div>
        <ContactButtons />
      </div>
    </section>
  );
}
