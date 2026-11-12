import { Card } from "../../../components/ui/Primitives";
import { SectionTitle } from "../../../components/landing/SectionTitle";
import { testimonials } from "../../../data/mocks";

export function TestimonialsSection() {
  return (
    <section className="px-5 py-24">
      <SectionTitle eyebrow="Ils en parlent" title="Une plateforme qui comprend le terrain" />
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.name}>
            <div className="text-3xl font-extrabold text-sun">“</div>
            <p className="mt-3 min-h-24 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t.quote}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mina/10 text-xs font-extrabold text-mina">
                {t.initials}
              </div>
              <p className="text-xs font-bold">
                {t.name}
                <br />
                <span className="font-normal text-slate-400">
                  Témoignage fictif à titre d’exemple
                </span>
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
