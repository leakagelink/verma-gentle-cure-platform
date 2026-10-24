import { Instagram, MessageCircle, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { CLINIC } from "@/lib/site-data";

/**
 * One source of truth for the clinic's contact channels: the landline
 * (Call Clinic), WhatsApp and the Instagram page. Used across every page
 * so all three are always mentioned together.
 */

export function ContactLine({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm font-semibold text-navy ${className}`}>
      <a href={CLINIC.phoneHref}>Call Clinic: {CLINIC.phone}</a>
      <span className="font-normal text-muted-foreground"> · </span>
      <a href={CLINIC.whatsappHref} target="_blank" rel="noopener noreferrer">
        WhatsApp: {CLINIC.whatsapp}
      </a>
      <span className="font-normal text-muted-foreground"> · </span>
      <a href={CLINIC.instagramHref} target="_blank" rel="noopener noreferrer">
        Instagram: {CLINIC.instagram}
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
      <a
        href={CLINIC.instagramHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-leaf"
      >
        <Instagram className="size-4 text-leaf" />
        Instagram: {CLINIC.instagram}
      </a>
    </div>
  );
}

/** Compact band shown on every page (above the footer) so both numbers are always on screen. */
export function ContactBand() {
  return (
    <section className="mt-16 border-y border-border surface-ivory print:hidden">
      <div className="container-page py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pr-16 lg:pr-0">
          <div className="min-w-0">
            <p className="font-display text-base text-navy">
              Any question? Call the clinic, message us on WhatsApp or follow us on Instagram.
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{CLINIC.hours}</p>
          </div>
          <ContactButtons />
        </div>
        <div className="mt-3 space-y-2 pr-16 text-xs leading-relaxed text-muted-foreground lg:pr-0">
          <p>The app is not a medical device and does not diagnose, treat, cure or prevent any medical condition. Consult a healthcare professional for medical advice, diagnosis or treatment. For emergencies, seek immediate medical assistance.</p>
          <p className="flex flex-wrap gap-x-4 gap-y-2"><Link to="/privacy-policy" className="underline">Privacy policy</Link><Link to="/delete-account" className="underline">Account & data deletion</Link><Link to="/medical-disclaimer" className="underline">Medical disclaimer</Link></p>
        </div>
      </div>
    </section>
  );
}
