import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/ui-kit/LegalPage";

export const Route = createFileRoute("/appointment-policy")({
  head: () => ({
    meta: [
      { title: "Cancellation / Appointment Policy | Verma Gentle Cure" },
      { name: "description", content: "How appointments are booked, rescheduled and cancelled at Verma Gentle Cure." },
      { property: "og:title", content: "Cancellation / Appointment Policy | Verma Gentle Cure" },
      { property: "og:description", content: "How appointments are booked, rescheduled and cancelled at Verma Gentle Cure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/appointment-policy" }],
  }),
  component: () => (
    <LegalPage
      title="Cancellation / Appointment Policy"
      intro="How appointments are booked, rescheduled and cancelled at Verma Gentle Cure."
      sections={[
        { heading: "Booking", body: ["Appointments can be booked online, by calling the clinic on 0657-4506627 or on WhatsApp at +91 84091 70482."] },
        { heading: "Rescheduling and cancellation", body: ["Please inform the clinic as early as possible if you need to reschedule or cancel. Contact the clinic by phone or WhatsApp and the team will help you choose another slot."] },
        { heading: "Refunds", body: ["Where a consultation fee has been paid online and the appointment is cancelled in advance, refunds are handled as described in the Refund Policy."] },
      ]}
    />
  ),
});
