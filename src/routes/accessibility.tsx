import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/ui-kit/LegalPage";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility | Verma Gentle Cure" },
      {
        name: "description",
        content: "Our commitment to making the Verma Gentle Cure website usable for everyone.",
      },
      { property: "og:title", content: "Accessibility | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Our commitment to making the Verma Gentle Cure website usable for everyone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/accessibility" }],
  }),
  component: () => (
    <LegalPage
      title="Accessibility"
      intro="Our commitment to making the Verma Gentle Cure website usable for everyone."
      sections={[
        {
          heading: "Our commitment",
          body: [
            "We aim to keep this website readable, keyboard-accessible and usable with screen readers and on mobile devices.",
          ],
        },
        {
          heading: "Need help?",
          body: [
            "If any part of the website is difficult to use, please call the clinic on 0657-4506627 or message +91 84091 70482 on WhatsApp and the team will assist you.",
          ],
        },
      ]}
    />
  ),
});
