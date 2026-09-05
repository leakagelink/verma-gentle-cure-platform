import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/ui-kit/LegalPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "How Verma Gentle Cure collects, stores and protects patient information, medical records and uploaded reports.",
      },
      { property: "og:title", content: "Privacy Policy | Verma Gentle Cure" },
      { property: "og:description", content: "How patient information is handled and protected." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      intro="How we collect, use and protect the information you share with the clinic."
      sections={[
        {
          heading: "Information we collect",
          body: [
            "We collect the details you provide when registering, booking a consultation or placing an order: name, contact details, date of birth, address, and the medical information you choose to share.",
            "Uploaded documents such as reports and previous prescriptions are stored as part of your medical record.",
          ],
        },
        {
          heading: "How the information is used",
          body: [
            "Your information is used to deliver the consultation, prepare prescriptions, fulfil medicine orders and provide follow-up support.",
            "We do not sell patient information. We do not use medical records for advertising.",
          ],
        },
        {
          heading: "Who can access it",
          body: [
            "Medical records are visible to you and the treating doctor. Clinic administrators can access appointment and order records needed to run the service.",
            "Uploaded medical documents are held in access-controlled storage and are not publicly accessible.",
          ],
        },
        {
          heading: "Retention and your rights",
          body: [
            "Records are retained for as long as needed to provide continuity of care and to meet applicable legal requirements.",
            "You may request a copy of your data or ask for your account to be closed by writing to the clinic.",
          ],
        },
      ]}
    />
  ),
});
