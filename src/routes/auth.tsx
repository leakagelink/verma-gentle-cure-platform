import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login or Register | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Sign in to your Verma Gentle Cure patient account to view appointments, prescriptions, medical reports and orders.",
      },
      { property: "og:title", content: "Patient Login | Verma Gentle Cure" },
      { property: "og:description", content: "Access appointments, prescriptions and orders." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/auth" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <section className="container-page grid max-w-5xl gap-10 py-14 lg:grid-cols-2 lg:py-20">
      <div className="hidden rounded-[2rem] gradient-hero p-10 text-navy-foreground lg:block">
        <Logo tone="inverse" />
        <h1 className="mt-10 text-3xl text-navy-foreground">
          Your consultations, prescriptions and orders in one place
        </h1>
        <ul className="mt-8 space-y-3 text-sm text-mint/90">
          {[
            "Upcoming and past appointments",
            "Digital prescriptions from your doctor",
            "Securely stored medical reports",
            "Medicine orders and delivery tracking",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lime" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-10 flex items-center gap-2 text-xs text-mint">
          <ShieldCheck className="size-4" /> Medical records are access-controlled
        </p>
      </div>

      <div className="card-premium p-6 lg:p-8">
        <div className="flex rounded-full border border-border p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "min-h-10 flex-1 rounded-full text-sm font-semibold capitalize transition-colors",
                mode === m ? "bg-navy text-navy-foreground" : "text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.info("Accounts activate once the secure backend is switched on.");
          }}
        >
          {mode === "register" && (
            <>
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input placeholder="Your full name" autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile number</Label>
                <Input inputMode="numeric" placeholder="10-digit mobile" autoComplete="tel" />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label>Email address</Label>
            <Input type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="h-12 w-full rounded-full">
            {mode === "login" ? "Login" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          {mode === "login" ? "Forgot your password? " : "Already registered? "}
          <button
            type="button"
            className="font-semibold text-leaf"
            onClick={() =>
              mode === "login"
                ? toast.info("Password reset arrives with the secure backend.")
                : setMode("login")
            }
          >
            {mode === "login" ? "Reset it" : "Login instead"}
          </button>
        </p>

        <p className="mt-6 rounded-2xl surface-ivory p-4 text-xs leading-relaxed text-muted-foreground">
          Patient, doctor and admin accounts, protected dashboards and secure record storage are the
          next stage of the build. Meanwhile you can{" "}
          <Link to="/book-appointment" className="font-semibold text-leaf">
            book a consultation
          </Link>{" "}
          without an account.
        </p>
      </div>
    </section>
  );
}
