import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { MedicineCard } from "@/components/shop/MedicineCard";
import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/lib/products";
import { MEDICINE_CATEGORIES, PRODUCT_DISCLAIMER } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/medicines/")({
  head: () => ({
    meta: [
      { title: "Homeopathic Medicine Shop — Dilutions, Tinctures & Care | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Buy authentic homeopathic medicines, mother tinctures, biochemic tablets, personal care and supplements with delivery across India.",
      },
      { property: "og:title", content: "Medicine Shop | Verma Gentle Cure" },
      {
        property: "og:description",
        content: "Authentic homeopathic medicines with delivery across India.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/medicines" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/medicines" }],
  }),
  component: ShopPage,
});

const SORTS = [
  { key: "popular", label: "Popular" },
  { key: "price-low", label: "Price: Low to High" },
  { key: "price-high", label: "Price: High to Low" },
  { key: "rating", label: "Top rated" },
] as const;

function ShopPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("popular");
  const [inStockOnly, setInStockOnly] = useState(false);
  const { products } = useProducts();

  const filters = (
    <>
      <div>
        <Label>Search</Label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines or brands"
            className="pl-9"
            aria-label="Search medicines"
          />
        </div>
      </div>

      <div>
        <Label>Categories</Label>
        <div className="mt-2 flex flex-wrap gap-2 lg:flex-col lg:items-start">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            All medicines
          </FilterChip>
          {MEDICINE_CATEGORIES.map((c) => (
            <FilterChip
              key={c.slug}
              active={category === c.slug}
              onClick={() => setCategory(c.slug)}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <div>
        <Label>Availability</Label>
        <label className="mt-2 flex min-h-11 items-center gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="size-5 accent-[var(--leaf)]"
          />
          In stock only
        </label>
      </div>
    </>
  );

  const results = useMemo(() => {
    let list = products.filter((m) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || m.name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q);
      const matchesCategory = category === "all" || m.category === category;
      const matchesStock = !inStockOnly || m.stock > 0;
      return matchesQuery && matchesCategory && matchesStock;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });
    return list;
  }, [products, query, category, sort, inStockOnly]);

  return (
    <>
      <PageHero
        eyebrow="Medicine shop"
        title="Authentic homeopathic medicines, delivered"
        description="Dilutions, mother tinctures, biochemic tablets, personal care and daily wellness supplements."
      />

      <section className="container-page py-6 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside className="hidden space-y-6 lg:sticky lg:top-24 lg:block lg:h-fit">
            {filters}
          </aside>

          <div className="min-w-0">
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:flex sm:flex-wrap sm:justify-between sm:gap-3">
              <p className="truncate text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? "product" : "products"}
              </p>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-full px-3 lg:hidden">
                    <SlidersHorizontal className="size-4" /> Filters
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[86dvh] rounded-t-3xl pb-[env(safe-area-inset-bottom)] lg:hidden">
                  <DrawerHeader className="text-left">
                    <DrawerTitle className="font-display text-xl text-navy">Filter medicines</DrawerTitle>
                    <DrawerDescription>Narrow products by category and availability.</DrawerDescription>
                  </DrawerHeader>
                  <div className="space-y-6 overflow-y-auto px-4 pb-2">{filters}</div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button className="min-h-12 rounded-xl">Show {results.length} products</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
              <div className="flex items-center gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  aria-label="Sort products"
                  className="min-h-10 max-w-32 rounded-full border border-border bg-card px-3 text-sm text-navy sm:max-w-none sm:px-4"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="mt-10 rounded-3xl border border-dashed border-border p-12 text-center">
                <p className="font-semibold text-navy">No medicines match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search term or clear the category filter.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-5 xl:grid-cols-3">
                {results.map((m) => (
                  <MedicineCard key={m.slug} medicine={m} />
                ))}
              </div>
            )}

            <div className="hide-scrollbar -mx-4 mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3">
              {MEDICINE_CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to="/medicines/category/$slug"
                  params={{ slug: c.slug }}
                  className="card-premium w-[72vw] shrink-0 snap-start p-4 sm:w-auto sm:p-5"
                >
                  <p className="font-semibold text-navy">{c.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:line-clamp-none sm:text-sm">{c.description}</p>
                </Link>
              ))}
            </div>

            <p className="mt-7 rounded-xl border border-border surface-ivory p-4 text-xs leading-relaxed text-muted-foreground sm:mt-10 sm:rounded-2xl sm:p-5">
              {PRODUCT_DISCLAIMER}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">{children}</p>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-full px-4 text-sm font-medium",
        active ? "border-leaf bg-mint text-forest hover:bg-mint" : "text-muted-foreground",
      )}
    >
      {children}
    </Button>
  );
}
