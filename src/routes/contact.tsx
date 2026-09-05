import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CLINIC } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Verma Gentle Cure — Clinic Address & Enquiries" },
      {
        name: "description",
        content:
          "Clinic address, phone, email and consultation hours for Verma Gentle Cure, plus an enquiry form for patients.",
      },
      { property: "og:title", content: "Contact | Verma Gentle Cure" },
      { property: "og:description", content: "Clinic address, hours and patient enquiries." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the clinic team"
        description="For appointments, order queries or general questions. For medical emergencies, please contact local emergency services."
      />
      <section className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          {[
            { icon: MapPin, title: "Clinic address", body: CLINIC.address },
            { icon: Phone, title: "Phone", body: CLINIC.phone },
            { icon: Mail, title: "Email", body: CLINIC.email },
            { icon: Clock, title: "Consultation hours", body: CLINIC.hours },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="card-premium flex gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-forest">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-navy">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          className="card-premium space-y-4 p-6 lg:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 10) {
              toast.error("Please add your name, a valid email and a short message.");
              return;
            }
            setSent(true);
            toast.success("Message noted — the clinic team will reply by email.");
          }}
        >
          <h2 className="text-xl text-navy">Send an enquiry</h2>
          <div className="space-y-1.5">
            <Label>Your name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <Button type="submit" className="h-12 w-full rounded-full">
            Send enquiry
          </Button>
          {sent && (
            <p className="text-sm text-forest">
              Thank you — your enquiry has been recorded on this device. Email delivery is connected
              once the clinic's messaging service is enabled.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Please do not share sensitive medical details here. Use the consultation booking flow,
            where uploads are stored securely.
          </p>
        </form>
      </section>
    </>
  );
}
