import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/Primitives";
import { SectionTitle } from "../../../components/landing/SectionTitle";

const PARTNERS = ["CROUS THIÈS", "UCAD · FMPO", "UGB SANTÉ", "UT THIÈS", "ONG SANTÉ+"];

export function PartnersSection() {
  return (
    <section className="border-y border-line bg-white px-5 py-20 dark:border-white/8 dark:bg-panel">
      <SectionTitle eyebrow="Ensemble" title="Des partenaires engagés pour la réussite" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4">
        {PARTNERS.map((x) => (
          <div
            key={x}
            className="rounded-xl border border-line px-6 py-4 text-sm font-extrabold text-slate-400 dark:border-white/8"
          >
            {x}
          </div>
        ))}
      </div>
      <div className="mt-9 text-center">
        <Link to="/partenaires">
          <Button variant="secondary">
            Devenir partenaire <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </section>
  );
}
