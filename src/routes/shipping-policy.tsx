import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/ui-kit/LegalPage";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Dispatch timelines, delivery charges, serviceable areas and order tracking for medicines ordered from Verma Gentle Cure.",
      },
      { property: "og:title", content: "Shipping Policy | Verma Gentle Cure" },
      { property: "og:description", content: "Dispatch timelines, charges and tracking." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shipping-policy" },
    ],
    links: [{ rel: "canonical", href: "/shipping-policy" }],
  }),
  component: () => (
    <LegalPage
      title="Shipping Policy"
      intro="How medicine orders are packed, dispatched and delivered."
      sections={[
        {
          heading: "Dispatch timelines",
          body: [
            "Orders confirmed before 3:00 PM on a working day are usually packed the same day. Orders placed on Sundays and holidays are processed on the next working day.",
          ],
        },
        {
          heading: "Delivery charges",
          body: [
            "A flat delivery charge of ₹49 applies to orders below ₹799. Orders of ₹799 and above are delivered free.",
          ],
        },
        {
          heading: "Delivery times and tracking",
          body: [
            "Metro locations typically receive orders in 2–4 working days; other locations may take 4–7 working days.",
            "Order status moves through Order Placed, Processing, Packed, Shipped and Delivered, and is visible in your dashboard.",
          ],
        },
        {
          heading: "Undelivered orders",
          body: [
            "If a delivery attempt fails due to an incorrect address or unavailability, the courier will retry. Repeated failures return the order to the clinic and we will contact you.",
          ],
        },
      ]}
    />
  ),
});
