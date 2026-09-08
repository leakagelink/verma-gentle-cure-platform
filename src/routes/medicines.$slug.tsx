import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StockBadge } from "@/components/shop/MedicineCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { productImage } from "@/lib/product-images";
import { useProduct } from "@/lib/products";
import { MEDICINES, MEDICINE_CATEGORIES, PRODUCT_DISCLAIMER, formatINR } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/medicines/$slug")({
  loader: ({ params }) => {
    const medicine = MEDICINES.find((m) => m.slug === params.slug);
    if (!medicine) throw notFound();
    return { medicine };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Medicine not found" }, { name: "robots", content: "noindex" }] };
    }
    const { medicine } = loaderData;
    return {
      meta: [
        { title: `${medicine.name} — ${medicine.brand} | Verma Gentle Cure` },
        { name: "description", content: medicine.description },
        { property: "og:title", content: medicine.name },
        { property: "og:description", content: medicine.description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/medicines/${medicine.slug}` },
      ],
      links: [{ rel: "canonical", href: `/medicines/${medicine.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl text-navy">Medicine not found</h1>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/medicines">Back to shop</Link>
      </Button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { medicine: seed } = Route.useLoaderData();
  const { product } = useProduct(seed.slug);
  const medicine = product ?? seed;
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const category = MEDICINE_CATEGORIES.find((c) => c.slug === medicine.category);
  const discount = Math.round(((medicine.mrp - medicine.price) / medicine.mrp) * 100);

  return (
    <section className="container-page grid gap-8 py-6 sm:py-12 lg:grid-cols-2 lg:gap-12 lg:py-16">
      <div className="min-w-0">
        <div className="h-64 overflow-hidden rounded-[2rem] border border-border surface-ivory sm:h-80 lg:h-[28rem]">
          <img
            src={productImage(medicine.category)}
            alt={medicine.name}
            width={800}
            height={800}
            className="size-full object-cover"
          />
        </div>
        <div className="mt-3 flex gap-3 sm:mt-4">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImage(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "h-16 flex-1 overflow-hidden rounded-2xl border opacity-70 sm:h-20",
                activeImage === i ? "border-leaf opacity-100" : "border-border",
              )}
            >
              <img
                src={productImage(medicine.category)}
                alt=""
                loading="lazy"
                width={800}
                height={800}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <nav className="text-xs text-muted-foreground">
          <Link to="/medicines" className="hover:text-leaf">
            Shop
          </Link>
          {category && (
            <>
              {" / "}
              <Link
                to="/medicines/category/$slug"
                params={{ slug: category.slug }}
                className="hover:text-leaf"
              >
                {category.name}
              </Link>
            </>
          )}
        </nav>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
          {medicine.brand}
        </p>
        <h1 className="mt-2 text-3xl text-navy">{medicine.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="size-4 fill-lime text-lime" /> {medicine.rating} ({medicine.reviews})
          </span>
          <StockBadge stock={medicine.stock} />
          <span>{medicine.pack}</span>
        </div>

        <div className="mt-6 flex items-end gap-3">
          <p className="font-display text-3xl text-navy">{formatINR(medicine.price)}</p>
          <p className="pb-1 text-sm text-muted-foreground">
            <s>{formatINR(medicine.mrp)}</s> · {discount}% off
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="grid size-11 place-items-center"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center font-semibold text-navy">{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="grid size-11 place-items-center"
              onClick={() => setQty((q) => Math.min(20, q + 1))}
            >
              <Plus className="size-4" />
            </button>
          </div>
          <Button
            className="h-12 rounded-full px-7"
            disabled={medicine.stock === 0}
            onClick={() => {
              add(medicine.slug, qty);
              toast.success("Added to cart");
            }}
          >
            Add to cart
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full px-7"
            disabled={medicine.stock === 0}
          >
            <Link
              to="/checkout"
              onClick={() => {
                add(medicine.slug, qty);
              }}
            >
              Buy now
            </Link>
          </Button>
        </div>

        <dl className="mt-9 space-y-5 border-t border-border pt-7 text-sm">
          {[
            ["Description", medicine.description],
            ["Ingredients", medicine.ingredients],
            ["Usage information", medicine.usage],
            ["Pack size", medicine.pack],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-semibold text-navy">{k}</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 rounded-2xl border border-border surface-ivory p-5 text-xs leading-relaxed text-muted-foreground">
          {PRODUCT_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}
