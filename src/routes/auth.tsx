import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
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
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: "/account" });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (mode === "register") {
      if (fullName.trim().length < 3) {
        toast.error("Please enter your full name.");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(phone.trim())) {
        toast.error("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(
            error.message.toLowerCase().includes("invalid")
              ? "Email or password is incorrect."
              : error.message,
          );
          return;
        }
        toast.success("Welcome back.");
        await router.invalidate();
        void navigate({ to: "/account" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: fullName.trim(), phone: phone.trim() },
          },
        });
        if (error) {
          toast.error(
            error.message.toLowerCase().includes("already registered")
              ? "This email is already registered. Please login."
              : error.message,
          );
          return;
        }
        toast.success("Account created. Check your email if confirmation is required.");
        void navigate({ to: "/account" });
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in could not be completed. Please try again.");
        return;
      }
      if (result.redirected) return;
      void navigate({ to: "/account" });
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter your email above, then tap reset.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent to your email.");
  };

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

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Mobile number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  autoComplete="tel"
                />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" disabled={busy} className="h-12 w-full rounded-full">
            {busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={handleGoogle}
          className="h-12 w-full rounded-full"
        >
          Continue with Google
        </Button>

        <p className="mt-5 text-sm text-muted-foreground">
          {mode === "login" ? "Forgot your password? " : "Already registered? "}
          <button
            type="button"
            className="font-semibold text-leaf"
            onClick={() => (mode === "login" ? void handleReset() : setMode("login"))}
          >
            {mode === "login" ? "Reset it" : "Login instead"}
          </button>
        </p>

        <p className="mt-6 rounded-2xl surface-ivory p-4 text-xs leading-relaxed text-muted-foreground">
          Your details are stored securely and only you can access your records. You can also{" "}
          <Link to="/book-appointment" className="font-semibold text-leaf">
            book a consultation
          </Link>{" "}
          without an account.
        </p>
      </div>
    </section>
  );
}
