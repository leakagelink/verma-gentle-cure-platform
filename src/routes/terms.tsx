import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/ui-kit/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Terms governing use of the Verma Gentle Cure platform, consultations, prescriptions and medicine orders.",
      },
      { property: "og:title", content: "Terms & Conditions | Verma Gentle Cure" },
      { property: "og:description", content: "Terms of use for consultations and orders." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <LegalPage
      title="Terms & Conditions"
      intro="The terms on which consultations, prescriptions and medicine orders are provided."
      sections={[
        {
          heading: "Use of the platform",
          body: [
            "By booking a consultation or placing an order you confirm the information you provide is accurate and that you are of legal age or acting for a minor in your care.",
            "Accounts must not be shared. You are responsible for activity carried out under your login.",
          ],
        },
        {
          heading: "Nature of the service",
          body: [
            "Consultations provide personalised recommendations based on the information shared. No specific outcome is promised and results may vary depending on individual circumstances.",
            "This platform is not intended for emergencies. In an emergency, contact local emergency services immediately.",
          ],
        },
        {
          heading: "Fees and payments",
          body: [
            "Consultation fees and product prices are shown before confirmation. Fees paid for a consultation cover the doctor's time and assessment.",
            "Appointments may be rescheduled or cancelled through your dashboard, subject to the clinic's confirmation.",
          ],
        },
        {
          heading: "Medicines",
          body: [
            "Medicines are dispensed as listed and should be used only as directed by a qualified practitioner.",
            "Do not discontinue any ongoing treatment prescribed by another doctor without consulting them.",
          ],
        },
      ]}
    />
  ),
});
