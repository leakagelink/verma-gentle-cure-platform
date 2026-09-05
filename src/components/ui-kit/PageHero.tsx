import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border surface-ivory">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 size-80 leaf-blob bg-mint/70 blur-2xl"
      />
      <div className="container-page relative py-14 lg:py-20">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-leaf">{eyebrow}</p>
        )}
        <h1 className="mt-3 max-w-3xl text-3xl leading-tight text-navy text-balance-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-leaf">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-2xl text-navy text-balance-tight sm:text-3xl lg:text-4xl">{title}</h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
