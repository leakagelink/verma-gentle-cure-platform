import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/ui-kit/LegalPage";

export const Route = createFileRoute("/medical-disclaimer")({
  head: () => ({
    meta: [
      { title: "Medical Disclaimer | Verma Gentle Cure" },
      {
        name: "description",
        content: "Important information about the health content on this website.",
      },
      { property: "og:title", content: "Medical Disclaimer | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Important information about the health content on this website.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/medical-disclaimer" }],
  }),
  component: () => (
    <LegalPage
      title="Medical Disclaimer"
      intro="Important information about the health content on this website."
      sections={[
        {
          heading: "The app is not a medical device",
          body: [
            "Verma Gentle Cure is a consultation, appointment and patient-record service. The app itself is not a medical device and does not diagnose, treat, cure or prevent any medical condition. Medical advice, diagnosis and treatment decisions must be made by an appropriately qualified healthcare professional, not by the app.",
          ],
        },
        {
          heading: "General information only",
          body: [
            "The information provided on the Verma Gentle Cure website is intended for general educational and informational purposes and should not be considered a substitute for individualized medical advice, diagnosis or treatment.",
          ],
        },
        {
          heading: "Individual consultation",
          body: [
            "Treatment recommendations can vary depending on a patient's individual circumstances and should be made after an appropriate professional consultation. Individual results may vary.",
          ],
        },
        {
          heading: "Emergencies",
          body: [
            "For a medical emergency or potentially life-threatening condition, patients should seek immediate emergency medical assistance from an appropriate healthcare facility. Homeopathic care does not replace emergency or essential conventional medical care.",
          ],
        },
      ]}
    />
  ),
});
