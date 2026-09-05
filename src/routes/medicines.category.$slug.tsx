import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { MedicineCard } from "@/components/shop/MedicineCard";
import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { MEDICINES, MEDICINE_CATEGORIES } from "@/lib/shop-data";

export const Route = createFileRoute("/medicines/category/$slug")({
  loader: ({ params }) => {
    const category = MEDICINE_CATEGORIES.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { category, items: MEDICINES.filter((m) => m.category === category.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Category not found" }, { name: "robots", content: "noindex" }] };
    }
    const { category } = loaderData;
    return {
      meta: [
        { title: `${category.name} — Homeopathic Medicines | Verma Gentle Cure` },
        { name: "description", content: category.description },
        { property: "og:title", content: `${category.name} | Verma Gentle Cure` },
        { property: "og:description", content: category.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/medicines/category/${category.slug}` },
      ],
      links: [{ rel: "canonical", href: `/medicines/category/${category.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl text-navy">Category not found</h1>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/medicines">Back to shop</Link>
      </Button>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, items } = Route.useLoaderData();
  return (
    <>
      <PageHero eyebrow="Category" title={category.name} description={category.description} />
      <section className="container-page py-12">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <p className="font-semibold text-navy">Nothing listed in this category yet</p>
            <Button asChild variant="outline" className="mt-5 rounded-full">
              <Link to="/medicines">Browse all medicines</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <MedicineCard key={m.slug} medicine={m} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
