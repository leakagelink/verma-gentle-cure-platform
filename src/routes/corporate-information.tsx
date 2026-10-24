import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/ui-kit/LegalPage";

export const Route = createFileRoute("/corporate-information")({
  head: () => ({
    meta: [
      { title: "Corporate Information | Verma Gentle Cure" },
      {
        name: "description",
        content: "Verma Gentle Cure is a healthcare initiative of Vermaverse OPC Private Limited.",
      },
      { property: "og:title", content: "Corporate Information | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Verma Gentle Cure is a healthcare initiative of Vermaverse OPC Private Limited.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/corporate-information" }],
  }),
  component: () => (
    <LegalPage
      title="Corporate Information"
      intro="Verma Gentle Cure is a healthcare initiative of Vermaverse OPC Private Limited."
      sections={[
        {
          heading: "Corporate entity",
          body: [
            "Verma Gentle Cure — A Healthcare Initiative of Vermaverse OPC Private Limited.",
            "Founder: Dr. Rajshree Verma (BHMS), Homeopathic Physician.",
          ],
        },
        {
          heading: "Clinic",
          body: [
            "G3, 1st Floor, Sarala Complex, Kadma Market, Jamshedpur, Jharkhand.",
            "Clinic Phone: 0657-4506627 · WhatsApp: +91 84091 70482.",
            "Instagram: @vermagentlecure — instagram.com/vermagentlecure.",
            "Established / Inaugurated: 23 March 2026.",
          ],
        },
      ]}
    />
  ),
});
