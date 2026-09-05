import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { BLOG_POSTS, CLINIC } from "@/lib/site-data";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} | Verma Gentle Cure` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${post.slug}` },
      ],
      links: [{ rel: "canonical", href: `/blog/${post.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            datePublished: post.date,
            author: { "@type": "Organization", name: CLINIC.name },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl text-navy">Article not found</h1>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/blog">Back to journal</Link>
      </Button>
    </div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  return (
    <article className="container-page max-w-3xl py-12 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
        {post.category} ·{" "}
        {new Date(post.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · {post.readingTime}
      </p>
      <h1 className="mt-4 text-3xl leading-tight text-navy sm:text-4xl">{post.title}</h1>
      <div className="mt-8 h-56 rounded-[2rem] gradient-leaf" aria-hidden />
      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        {post.body.map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
      </div>
      <p className="mt-10 rounded-2xl border border-border surface-ivory p-5 text-xs leading-relaxed text-muted-foreground">
        {CLINIC.disclaimer}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="rounded-full">
          <Link to="/book-appointment">Book a consultation</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/blog">More articles</Link>
        </Button>
      </div>
    </article>
  );
}
