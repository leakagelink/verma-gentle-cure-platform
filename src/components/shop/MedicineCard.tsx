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
        className="block h-28 gradient-leaf sm:h-40"
        aria-label={medicine.name}
      />
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-leaf sm:text-xs sm:tracking-[0.16em]">
            {medicine.brand}
          </p>
          <StockBadge stock={medicine.stock} />
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-navy sm:min-h-0 sm:text-base">
          <Link to="/medicines/$slug" params={{ slug: medicine.slug }}>
            {medicine.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{medicine.pack}</p>
        <p className="mt-2 hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <Star className="size-3.5 fill-lime text-lime" />
          {medicine.rating} · {medicine.reviews} reviews
        </p>
        <div className="mt-4 flex flex-1 items-end justify-between gap-3">
          <div>
            <p className="font-display text-lg text-navy sm:text-xl">{formatINR(medicine.price)}</p>
            <p className="text-[0.65rem] text-muted-foreground sm:text-xs">
              <s>{formatINR(medicine.mrp)}</s> · {discount}% off
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 sm:mt-4">
          <Button
            className="h-10 flex-1 rounded-xl px-2 text-xs sm:h-11 sm:rounded-full sm:px-4 sm:text-sm"
            disabled={medicine.stock === 0}
            onClick={() => {
              add(medicine.slug);
              toast.success(`${medicine.name} added to cart`);
            }}
          >
            Add to cart
          </Button>
          <Button asChild variant="outline" className="hidden h-11 rounded-full sm:inline-flex">
            <Link to="/medicines/$slug" params={{ slug: medicine.slug }}>
              View
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
