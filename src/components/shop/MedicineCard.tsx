import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatINR, stockStatus, type Medicine } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

export function StockBadge({ stock }: { stock: number }) {
  const { label, tone } = stockStatus(stock);
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[0.68rem] font-semibold",
        tone === "in" && "bg-mint text-forest",
        tone === "low" && "bg-lime/40 text-lime-foreground",
        tone === "out" && "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export function MedicineCard({ medicine }: { medicine: Medicine }) {
  const { add } = useCart();
  const discount = Math.round(((medicine.mrp - medicine.price) / medicine.mrp) * 100);

  return (
    <article className="card-premium flex flex-col overflow-hidden">
      <Link
        to="/medicines/$slug"
        params={{ slug: medicine.slug }}
        className="block h-40 gradient-leaf"
        aria-label={medicine.name}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf">
            {medicine.brand}
          </p>
          <StockBadge stock={medicine.stock} />
        </div>
        <h3 className="mt-2 text-base font-semibold leading-snug text-navy">
          <Link to="/medicines/$slug" params={{ slug: medicine.slug }}>
            {medicine.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{medicine.pack}</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-lime text-lime" />
          {medicine.rating} · {medicine.reviews} reviews
        </p>
        <div className="mt-4 flex flex-1 items-end justify-between gap-3">
          <div>
            <p className="font-display text-xl text-navy">{formatINR(medicine.price)}</p>
            <p className="text-xs text-muted-foreground">
              <s>{formatINR(medicine.mrp)}</s> · {discount}% off
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            className="h-11 flex-1 rounded-full"
            disabled={medicine.stock === 0}
            onClick={() => {
              add(medicine.slug);
              toast.success(`${medicine.name} added to cart`);
            }}
          >
            Add to cart
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full">
            <Link to="/medicines/$slug" params={{ slug: medicine.slug }}>
              View
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
