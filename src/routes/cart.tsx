import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-store";
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

export const DELIVERY_FEE = 49;
export const FREE_DELIVERY_OVER = 799;
const COUPONS: Record<string, number> = { GENTLE10: 0.1, WELCOME5: 0.05 };

function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; rate: number } | null>(null);

  const discount = applied ? Math.round(subtotal * applied.rate) : 0;
  const delivery = subtotal === 0 || subtotal - discount >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  const total = Math.max(0, subtotal - discount + delivery);

  return (
    <>
      <PageHero eyebrow="Cart" title="Your cart" />
      <section className="container-page grid gap-8 py-12 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-14 text-center">
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
            <ul className="space-y-4">
              {items.map(({ medicine, qty }) => (
                <li key={medicine.slug} className="card-premium flex gap-4 p-4">
                  <span className="size-20 shrink-0 rounded-2xl gradient-leaf" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-navy">{medicine.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {medicine.brand} · {medicine.pack}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
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
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" /> Remove
                      </button>
                    </div>
                  </div>
                  <p className="font-display text-lg text-navy">
                    {formatINR(medicine.price * qty)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-border surface-ivory p-6 lg:sticky lg:top-24">
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
                  toast.success(`Coupon ${code} applied`);
                } else {
                  setApplied(null);
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
