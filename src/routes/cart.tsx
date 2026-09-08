import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-store";
import { COUPONS, COUPON_STORAGE_KEY, useStoreSettings } from "@/lib/products";
import { formatINR } from "@/lib/shop-data";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart | Verma Gentle Cure" },
      {
        name: "description",
        content: "Review the homeopathic medicines in your cart, apply a coupon and proceed to checkout.",
      },
      { property: "og:title", content: "Shopping Cart | Verma Gentle Cure" },
      { property: "og:description", content: "Review your medicine order before checkout." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; rate: number } | null>(null);
  const { settings } = useStoreSettings();

  const discount = applied ? Math.round(subtotal * applied.rate) : 0;
  const delivery =
    subtotal === 0 || subtotal - discount >= settings.free_delivery_over ? 0 : settings.delivery_fee;
  const total = Math.max(0, subtotal - discount + delivery);

  return (
    <>
      <PageHero eyebrow="Cart" title="Your cart" />
      <section className="container-page grid gap-6 py-6 sm:py-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-8">
        <div className="min-w-0">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-8 text-center sm:p-14">
              <ShoppingBag className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-4 font-semibold text-navy">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse the shop and add medicines to your order.
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link to="/medicines">Continue shopping</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {items.map(({ medicine, qty }) => (
                <li key={medicine.slug} className="card-premium flex gap-3 p-3 sm:gap-4 sm:p-4">
                  <img
                    src={productImage(medicine.category)}
                    alt={medicine.name}
                    loading="lazy"
                    width={800}
                    height={800}
                    className="size-16 shrink-0 rounded-2xl object-cover sm:size-20"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy sm:text-base">
                          {medicine.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {medicine.brand} · {medicine.pack}
                        </p>
                      </div>
                      <p className="shrink-0 font-display text-base text-navy sm:text-lg">
                        {formatINR(medicine.price * qty)}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2 sm:mt-3">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="grid size-9 place-items-center"
                          onClick={() => setQty(medicine.slug, qty - 1)}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="grid size-9 place-items-center"
                          onClick={() => setQty(medicine.slug, qty + 1)}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(medicine.slug)}
                        aria-label={`Remove ${medicine.name}`}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit min-w-0 rounded-3xl border border-border surface-ivory p-4 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-lg text-navy">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <Row k="Subtotal" v={formatINR(subtotal)} />
            <Row k="Discount" v={discount ? `− ${formatINR(discount)}` : "—"} />
            <Row k="Delivery" v={delivery ? formatINR(delivery) : "Free"} />
          </dl>
          <div className="mt-5 flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              aria-label="Coupon code"
            />
            <Button
              variant="outline"
              className="shrink-0 rounded-full"
              onClick={() => {
                const rate = COUPONS[code];
                if (rate) {
                  setApplied({ code, rate });
                  try {
                    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify({ code, rate }));
                  } catch {
                    /* storage unavailable */
                  }
                  toast.success(`Coupon ${code} applied`);
                } else {
                  setApplied(null);
                  try {
                    localStorage.removeItem(COUPON_STORAGE_KEY);
                  } catch {
                    /* storage unavailable */
                  }
                  toast.error("Invalid coupon code");
                }
              }}
            >
              Apply
            </Button>
          </div>
          <p className="mt-6 flex items-center justify-between border-t border-border pt-5 font-display text-2xl text-navy">
            <span className="text-sm font-sans text-muted-foreground">Total</span>
            {formatINR(total)}
          </p>
          <Button asChild className="mt-6 h-12 w-full rounded-full" disabled={items.length === 0}>
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
            <Link to="/medicines">Continue shopping</Link>
          </Button>
        </aside>
      </section>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-navy">{v}</dd>
    </div>
  );
}
