import { MessageCircle, Phone } from "lucide-react";

import { CLINIC } from "@/lib/site-data";

export function FloatingContact() {
  return (
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 z-40 flex flex-col gap-2 lg:bottom-6 lg:right-6">
      <a
        href={CLINIC.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ${CLINIC.whatsapp}`}
        className="grid size-12 place-items-center rounded-full bg-forest text-forest-foreground shadow-[var(--shadow-lift)]"
      >
        <MessageCircle className="size-5" />
      </a>
      <a
        href={CLINIC.phoneHref}
        aria-label={`Call clinic ${CLINIC.phone}`}
        className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)]"
      >
        <Phone className="size-5" />
      </a>
    </div>
  );
}
