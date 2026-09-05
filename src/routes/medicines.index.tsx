import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { MedicineCard } from "@/components/shop/MedicineCard";
import { PageHero } from "@/components/ui-kit/PageHero";
import { Input } from "@/components/ui/input";
import { MEDICINES, MEDICINE_CATEGORIES, PRODUCT_DISCLAIMER } from "@/lib/shop-data";
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

  const results = useMemo(() => {
    let list = MEDICINES.filter((m) => {
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
  }, [query, category, sort, inStockOnly]);

  return (
    <>
      <PageHero
        eyebrow="Medicine shop"
        title="Authentic homeopathic medicines, delivered"
        description="Dilutions, mother tinctures, biochemic tablets, personal care and daily wellness supplements."
      />

      <section className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
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
              <Label>Filters</Label>
              <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="size-4 accent-[var(--leaf)]"
                />
                In stock only
              </label>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? "product" : "products"}
              </p>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  aria-label="Sort products"
                  className="min-h-10 rounded-full border border-border bg-card px-4 text-sm text-navy"
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
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((m) => (
                  <MedicineCard key={m.slug} medicine={m} />
                ))}
              </div>
            )}

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MEDICINE_CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to="/medicines/category/$slug"
                  params={{ slug: c.slug }}
                  className="card-premium p-5"
                >
                  <p className="font-semibold text-navy">{c.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                </Link>
              ))}
            </div>

            <p className="mt-10 rounded-2xl border border-border surface-ivory p-5 text-xs leading-relaxed text-muted-foreground">
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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-9 rounded-full border px-4 text-sm transition-colors",
        active ? "border-leaf bg-mint text-forest" : "border-border text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
