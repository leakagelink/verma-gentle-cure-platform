import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/ui-kit/LegalPage";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Refund and cancellation terms for consultations and medicine orders at Verma Gentle Cure, including damaged or incorrect items.",
      },
      { property: "og:title", content: "Refund Policy | Verma Gentle Cure" },
      { property: "og:description", content: "Refund and cancellation terms." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/refund-policy" },
    ],
    links: [{ rel: "canonical", href: "/refund-policy" }],
  }),
  component: () => (
    <LegalPage
      title="Refund & Cancellation Policy"
      intro="When a consultation or order can be cancelled, and how refunds are handled."
      sections={[
        {
          heading: "Consultation cancellations",
          body: [
            "Consultations cancelled at least 12 hours before the scheduled slot are eligible for a full refund of the consultation fee.",
            "Cancellations within 12 hours, or missed appointments, are not refundable, though the clinic may offer a one-time reschedule at its discretion.",
          ],
        },
        {
          heading: "Order cancellations",
          body: [
            "Orders can be cancelled from your dashboard until they move to the Packed status. Once shipped, an order cannot be cancelled.",
          ],
        },
        {
          heading: "Damaged or incorrect items",
          body: [
            "If an item arrives damaged, incorrect or past expiry, report it within 48 hours of delivery with photographs. A replacement or refund will be arranged.",
            "For hygiene and safety reasons, opened medicine packs cannot be returned unless the issue is a dispensing error.",
          ],
        },
        {
          heading: "Refund processing",
          body: [
            "Approved refunds are credited to the original payment method, usually within 5–7 working days of approval.",
          ],
        },
      ]}
    />
  ),
});
