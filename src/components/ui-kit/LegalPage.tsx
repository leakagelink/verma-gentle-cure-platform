import { PageHero } from "@/components/ui-kit/PageHero";
import { CLINIC } from "@/lib/site-data";

export type LegalSection = { heading: string; body: string[] };

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={intro} />
      <section className="container-page max-w-3xl py-12">
        <div className="space-y-9">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-xl text-navy">{s.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {s.body.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-12 rounded-2xl border border-border surface-ivory p-5 text-xs leading-relaxed text-muted-foreground">
          {CLINIC.disclaimer} For questions about this page, write to {CLINIC.email}.
        </p>
      </section>
    </>
  );
}
