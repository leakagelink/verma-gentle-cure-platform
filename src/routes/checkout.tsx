import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart-store";
import { COUPON_STORAGE_KEY, useStoreSettings, type PaymentMethod } from "@/lib/products";
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

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user, loading } = useAuth();
  const { settings } = useStoreSettings();
  const navigate = useNavigate();

  const [placed, setPlaced] = useState<{ orderNo: string; method: PaymentMethod } | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [saving, setSaving] = useState(false);
  const [coupon, setCoupon] = useState<{ code: string; rate: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COUPON_STORAGE_KEY);
      if (raw) setCoupon(JSON.parse(raw) as { code: string; rate: number });
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  useEffect(() => {
    if (user?.email) setForm((f) => (f.email ? f : { ...f, email: user.email ?? "" }));
  }, [user]);

  // Keep the selected payment method valid for the current store configuration.
  useEffect(() => {
    const allowed: PaymentMethod[] = [];
    if (settings.online_payment_enabled) allowed.push("online");
    if (settings.upi_enabled) allowed.push("upi");
    if (settings.cod_enabled) allowed.push("cod");
    if (allowed.length > 0 && !allowed.includes(method)) setMethod(allowed[0] as PaymentMethod);
  }, [settings, method]);

  const discount = coupon ? Math.round(subtotal * coupon.rate) : 0;
  const payable = Math.max(0, subtotal - discount);
  const delivery =
    subtotal === 0 || payable >= settings.free_delivery_over ? 0 : settings.delivery_fee;
  const total = payable + delivery;

  const codBlocked =
    !settings.cod_enabled ||
    total < settings.cod_min_order ||
    total > settings.cod_max_order;

  async function placeOrder() {
    if (!user) {
      toast.error("Please sign in to place your order.");
      void navigate({ to: "/auth" });
      return;
    }

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
    if (method === "cod" && codBlocked) {
      toast.error("Cash on delivery is not available for this order.");
      return;
    }

    setSaving(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name: form.name.trim(),
        phone: form.mobile.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        payment_method: method,
        payment_status: "pending",
        status: "placed",
        subtotal,
        discount,
        delivery_fee: delivery,
        total,
        coupon: coupon?.code ?? null,
        notes: form.notes.trim() || null,
      })
      .select("id, order_no")
      .single();

    if (error || !order) {
      setSaving(false);
      toast.error("We could not place your order. Please try again.");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map(({ medicine, qty }) => ({
        order_id: order.id,
        slug: medicine.slug,
        name: medicine.name,
        pack: medicine.pack,
        price: medicine.price,
        qty,
        line_total: medicine.price * qty,
      })),
    );
    setSaving(false);
    if (itemsError) {
      toast.error("Order saved, but some items could not be added. Our team will call you.");
    }

    setPlaced({ orderNo: order.order_no, method });
    clear();
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      /* ignore */
    }
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
          Order ID <strong className="text-navy">{placed.orderNo}</strong> · Payment status:{" "}
          {placed.method === "cod" ? "Pending (Cash on Delivery)" : "Pending"}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link to="/orders">Track my orders</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/medicines">Continue shopping</Link>
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

  const methodOptions: { value: PaymentMethod; title: string; body: string; disabled: boolean }[] = [
    {
      value: "online",
      title: "Online payment",
      body: settings.online_payment_enabled ? "Card / Netbanking" : "Not enabled yet",
      disabled: !settings.online_payment_enabled,
    },
    {
      value: "upi",
      title: "UPI",
      body: settings.upi_enabled ? "Any UPI app" : "Not enabled yet",
      disabled: !settings.upi_enabled,
    },
    {
      value: "cod",
      title: "Cash on Delivery",
      body: settings.cod_enabled
        ? codBlocked
          ? `Available for orders ${formatINR(settings.cod_min_order)}–${formatINR(settings.cod_max_order)}`
          : "Pay the delivery partner"
        : "Currently turned off",
      disabled: codBlocked,
    },
  ];

  return (
    <>
      <PageHero eyebrow="Checkout" title="Delivery details" />
      <section className="container-page grid gap-8 py-12 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="card-premium p-6 lg:p-8">
          {!loading && !user && (
            <div className="mb-6 rounded-2xl border border-border surface-ivory p-4 text-sm text-muted-foreground">
              Please{" "}
              <Link to="/auth" className="font-semibold text-leaf underline">
                sign in
              </Link>{" "}
              so your order is saved to your account and you can track it.
            </div>
          )}
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
            <Field label="Delivery notes (optional)" className="sm:col-span-2">
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Landmark, preferred delivery time, etc."
              />
            </Field>
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
            Payment method
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {methodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => setMethod(option.value)}
                className={cn(
                  "rounded-2xl border p-4 text-left disabled:opacity-40",
                  method === option.value ? "border-leaf bg-mint/50" : "border-border",
                )}
              >
                <p className="font-semibold text-navy">{option.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{option.body}</p>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Payment options are managed by the clinic. Orders paid online or by UPI are recorded with
            payment status Pending until the gateway is connected.
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
            {discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Coupon {coupon?.code}</dt>
                <dd className="text-forest">− {formatINR(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-navy">{delivery ? formatINR(delivery) : "Free"}</dd>
            </div>
          </dl>
          <p className="mt-4 flex items-center justify-between border-t border-border pt-4 font-display text-2xl text-navy">
            <span className="font-sans text-sm text-muted-foreground">Total</span>
            {formatINR(total)}
          </p>
          <Button
            className="mt-6 h-12 w-full rounded-full"
            onClick={() => void placeOrder()}
            disabled={saving}
          >
            {saving ? "Placing order…" : "Place order"}
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
