import { createFileRoute, Link } from "@tanstack/react-router";

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
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
  component: () => (
    <>
    <LegalPage
      title="Privacy Policy"
      intro="How we collect, use and protect the information you share with the clinic."
      sections={[
        {
          heading: "Who operates this service",
          body: ["Verma Gentle Cure is a healthcare initiative of Vermaverse OPC Private Limited, G3, 1st Floor, Sarala Complex, Kadma Market, Jamshedpur, Jharkhand – 831005. For privacy or deletion requests, call 0657-4506627 or WhatsApp +91 84091 70482. Last updated: 24 October 2026."],
        },
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
          heading: "Service providers and payments",
          body: [
            "Lovable Cloud provides hosting, account authentication, application data and private report storage. Razorpay processes online payments; payment identifiers, amount and status are stored for receipts and reconciliation. The app does not collect or store your full card number, CVV or UPI PIN.",
            "WhatsApp, Instagram and map links open third-party services whose own privacy terms apply. Medical reports are not automatically sent to those services. Google Fonts supplies the website fonts. Technical requests may include IP address and browser/device information used by hosting and service providers to deliver and secure the service.",
          ],
        },
        {
          heading: "Device access and local storage",
          body: [
            "Reports and photographs are selected by you through the device file picker. Only the selected files are uploaded; the app does not require broad access to your photo library, contacts, location or SMS. This policy describes the current web app; any future Android permissions must be disclosed before use.",
            "Your device stores the sign-in session and shopping cart to keep you signed in and remember your cart. Sign out on shared devices. Health records are stored in access-controlled clinic records, not in the shopping cart.",
          ],
        },
        {
          heading: "Retention and your rights",
          body: [
            "Records are retained for as long as needed to provide continuity of care and to meet applicable legal requirements.",
            "Request account and associated data deletion, or personal-data-only deletion, at vermagentlecure.com/delete-account or from My account. If you cannot sign in, call or WhatsApp the clinic with your registered email or phone. No app reinstall is required. Do not send passwords or OTPs.",
            "Deletion is processed manually after ownership verification. Non-required profile information and eligible uploaded files are removed; medical, prescription, financial and unresolved transaction records may be retained only where required. The clinic will explain the retained categories, legal reason and applicable period, and confirm the outcome. A request does not mean deletion has already happened.",
          ],
        },
        {
          heading: "Children and health information",
          body: ["Child consultation records should be provided by a parent or legal guardian. Health histories and uploaded reports are used for consultation and care, not advertising. Share only information needed for your consultation; you may leave optional questions blank and contact the clinic to correct your records."],
        },
      ]}
    />
    <div className="container-page max-w-3xl pb-8"><Link to="/delete-account" className="font-semibold text-primary underline">Request account or data deletion</Link></div>
    </>
  ),
});
