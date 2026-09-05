import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Verma Gentle Cure" },
      { name: "description", content: "Confirm your delivery details and place your medicine order." },
      { property: "og:title", content: "Checkout | Verma Gentle Cure" },
      { property: "og:description", content: "Confirm delivery details and place your order." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

const DELIVERY_FEE = 49;
const FREE_DELIVERY_OVER = 799;
const COD_ENABLED = true;

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [placed, setPlaced] = useState<string | null>(null);
  const [method, setMethod] = useState<"online" | "upi" | "cod">("online");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const delivery = subtotal >= FREE_DELIVERY_OVER || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;
  const orderId = useMemo(
    () => `VGC-ORD-${Math.floor(100000 + Math.random() * 899999)}`,
    [],
  );

  function placeOrder() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e["name"] = "Enter your full name.";
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) e["mobile"] = "Enter a valid mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e["email"] = "Enter a valid email address.";
    if (form.address.trim().length < 8) e["address"] = "Enter your full address.";
    if (!form.city.trim()) e["city"] = "Enter your city.";
    if (!form.state.trim()) e["state"] = "Enter your state.";
    if (!/^\d{6}$/.test(form.pincode.trim())) e["pincode"] = "Enter a valid 6-digit pincode.";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    setPlaced(orderId);
    clear();
    toast.success("Order placed");
  }

  if (placed) {
    return (
      <section className="container-page py-20 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-forest">
          <Check className="size-7" />
        </span>
        <h1 className="mt-5 text-3xl text-navy">Order placed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order ID <strong className="text-navy">{placed}</strong> · Payment status:{" "}
          {method === "cod" ? "Pending (Cash on Delivery)" : "Pending"}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link to="/medicines">Continue shopping</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="text-2xl text-navy">Your cart is empty</h1>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/medicines">Browse medicines</Link>
        </Button>
      </section>
    );
  }

  return (
    <>
      <PageHero eyebrow="Checkout" title="Delivery details" />
      <section className="container-page grid gap-8 py-12 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="card-premium p-6 lg:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors["name"]}>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Mobile" error={errors["mobile"]}>
              <Input
                inputMode="numeric"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </Field>
            <Field label="Email" error={errors["email"]} className="sm:col-span-2">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Full address" error={errors["address"]} className="sm:col-span-2">
              <Textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <Field label="City" error={errors["city"]}>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>
            <Field label="State" error={errors["state"]}>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </Field>
            <Field label="Pincode" error={errors["pincode"]}>
              <Input
                inputMode="numeric"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </Field>
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
            Payment method
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(
              [
                ["online", "Online payment", "Card / Netbanking"],
                ["upi", "UPI", "Any UPI app"],
                ["cod", "Cash on Delivery", COD_ENABLED ? "Available" : "Disabled by clinic"],
              ] as const
            ).map(([value, title, body]) => (
              <button
                key={value}
                type="button"
                disabled={value === "cod" && !COD_ENABLED}
                onClick={() => setMethod(value)}
                className={cn(
                  "rounded-2xl border p-4 text-left disabled:opacity-40",
                  method === value ? "border-leaf bg-mint/50" : "border-border",
                )}
              >
                <p className="font-semibold text-navy">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{body}</p>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Online payment credentials are not configured yet, so online and UPI orders are recorded
            with payment status Pending until the gateway is connected.
          </p>
        </div>

        <aside className="h-fit rounded-3xl border border-border surface-ivory p-6 lg:sticky lg:top-24">
          <h2 className="text-lg text-navy">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map(({ medicine, qty }) => (
              <li key={medicine.slug} className="flex justify-between gap-4">
                <span className="min-w-0 truncate text-muted-foreground">
                  {medicine.name} × {qty}
                </span>
                <span className="font-medium text-navy">{formatINR(medicine.price * qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-navy">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-navy">{delivery ? formatINR(delivery) : "Free"}</dd>
            </div>
          </dl>
          <p className="mt-4 flex items-center justify-between border-t border-border pt-4 font-display text-2xl text-navy">
            <span className="font-sans text-sm text-muted-foreground">Total</span>
            {formatINR(total)}
          </p>
          <Button className="mt-6 h-12 w-full rounded-full" onClick={placeOrder}>
            Place order
          </Button>
        </aside>
      </section>
    </>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string | undefined;
  className?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm text-navy">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
