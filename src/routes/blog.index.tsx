import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/ui-kit/PageHero";
import { BLOG_POSTS } from "@/lib/site-data";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Health Journal — Homeopathy & Wellness Articles | Verma Gentle Cure" },
      {
        name: "description",
        content:
          "Articles on homeopathic consultation, patient preparation, medicine handling and everyday wellbeing from the Verma Gentle Cure clinic team.",
      },
      { property: "og:title", content: "Health Journal | Verma Gentle Cure" },
      { property: "og:description", content: "Homeopathy and wellness articles from the clinic." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <>
      <PageHero
        eyebrow="Health journal"
        title="Articles from the clinic"
        description="Practical, non-promotional writing on consultation, preparation and everyday wellbeing."
      />
      <section className="container-page grid gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <article key={post.slug} className="card-premium flex flex-col overflow-hidden">
            <div className="h-40 gradient-leaf" aria-hidden />
            <div className="flex flex-1 flex-col p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
                {post.category} ·{" "}
                {new Date(post.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-navy">{post.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf"
              >
                Read article <ArrowRight className="size-4" />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
