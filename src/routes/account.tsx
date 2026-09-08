import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, LogOut, Package, ShieldCheck, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "View and update your Verma Gentle Cure patient profile, and reach your appointments, prescriptions and medicine orders.",
      },
      { property: "og:title", content: "My Account | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Your patient profile, appointments, prescriptions and orders.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/account" },
    ],
    links: [{ rel: "canonical", href: "/account" }],
  }),
  component: AccountPage,
});

type ProfileForm = {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  city: string;
};

const empty: ProfileForm = { full_name: "", phone: "", date_of_birth: "", gender: "", city: "" };

function AccountPage() {
  const { user, loading, signOut, isCareTeam } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileForm>(empty);
  const [role, setRole] = useState<string>("patient");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    void (async () => {
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, phone, date_of_birth, gender, city")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (cancelled) return;
      if (profile) {
        setForm({
          full_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
          date_of_birth: profile.date_of_birth ?? "",
          gender: profile.gender ?? "",
          city: profile.city ?? "",
        });
      }
      if (roles && roles.length > 0) {
        setRole(roles.some((r) => r.role === "admin") ? "admin" : (roles[0]?.role ?? "patient"));
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;
    if (form.full_name.trim().length < 3) {
      toast.error("Please enter your full name.");
      return;
    }
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name.trim(),
      phone: form.phone || null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      city: form.city || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Could not save your details. Please try again.");
      return;
    }
    toast.success("Profile saved.");
  };

  if (loading || !user) {
    return (
      <section className="container-page py-24 text-center text-muted-foreground">Loading…</section>
    );
  }

  return (
    <section className="container-page max-w-5xl py-6 sm:py-12 lg:py-16">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl sm:text-3xl">My account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="block truncate">{user.email}</span>
            <span className="capitalize">{role}</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full sm:w-auto sm:px-4"
          onClick={async () => {
            await signOut();
            toast.success("Signed out.");
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={save} className="card-premium space-y-4 p-5 sm:p-6">
          <h2 className="text-xl">Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-phone">Mobile number</Label>
              <Input
                id="acc-phone"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob">Date of birth</Label>
              <Input
                id="dob"
                type="date"
                value={form.date_of_birth}
                onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                value={form.gender}
                placeholder="Female / Male / Other"
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
          </div>
          <Button type="submit" disabled={saving || !ready} className="h-12 rounded-full px-8">
            {saving ? "Saving…" : "Save details"}
          </Button>
        </form>

        <div className="space-y-4">
          <Link to="/appointments" className="card-premium flex items-center gap-3 p-5">
            <CalendarDays className="size-5 text-leaf" />
            <span>
              <span className="block font-semibold">My appointments & prescriptions</span>
              <span className="block text-sm text-muted-foreground">
                Track consultations and view your prescriptions
              </span>
            </span>
          </Link>
          <Link to="/orders" className="card-premium flex items-center gap-3 p-5">
            <Package className="size-5 text-leaf" />
            <span>
              <span className="block font-semibold">My orders</span>
              <span className="block text-sm text-muted-foreground">
                Track medicine orders and delivery status
              </span>
            </span>
          </Link>
          {isCareTeam && (
            <Link to="/doctor" className="card-premium flex items-center gap-3 p-5">
              <Stethoscope className="size-5 text-leaf" />
              <span>
                <span className="block font-semibold">Doctor dashboard</span>
                <span className="block text-sm text-muted-foreground">
                  Review requests and issue prescriptions
                </span>
              </span>
            </Link>
          )}
          {isCareTeam && (
            <Link to="/admin" className="card-premium flex items-center gap-3 p-5">
              <Package className="size-5 text-leaf" />
              <span>
                <span className="block font-semibold">Store admin</span>
                <span className="block text-sm text-muted-foreground">
                  Manage orders, delivery and payment options
                </span>
              </span>
            </Link>
          )}
          <Link to="/book-appointment" className="card-premium flex items-center gap-3 p-5">
            <CalendarDays className="size-5 text-leaf" />
            <span>
              <span className="block font-semibold">Book a consultation</span>
              <span className="block text-sm text-muted-foreground">Video, audio or in-clinic</span>
            </span>
          </Link>
          <Link to="/medicines" className="card-premium flex items-center gap-3 p-5">
            <Package className="size-5 text-leaf" />
            <span>
              <span className="block font-semibold">Medicine shop</span>
              <span className="block text-sm text-muted-foreground">Browse and order</span>
            </span>
          </Link>
          <Link to="/consultation" className="card-premium flex items-center gap-3 p-5">
            <Stethoscope className="size-5 text-leaf" />
            <span>
              <span className="block font-semibold">How consultation works</span>
              <span className="block text-sm text-muted-foreground">Fees, modes and process</span>
            </span>
          </Link>
          <p className="flex gap-2 rounded-2xl surface-ivory p-4 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-leaf" />
            Only you can see your profile, appointments, prescriptions and orders.
          </p>

        </div>
      </div>
    </section>
  );
}
