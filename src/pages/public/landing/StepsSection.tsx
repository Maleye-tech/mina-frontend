import { ChevronRight } from "lucide-react";
import { SectionTitle } from "../../../components/landing/SectionTitle";

const STEPS = [
  ["01", "Inscris-toi", "Crée ton espace en toute simplicité."],
  ["02", "Choisis ton niveau", "Mina adapte les contenus à ton cursus."],
  ["03", "Étudie & évalue-toi", "Avance avec un plan clair et des QCM."],
  ["04", "Sois accompagné", "Accède à Mina Care quand tu en as besoin."],
] as const;

export function StepsSection() {
  return (
    <section className="px-5 py-24">
      <SectionTitle eyebrow="Simplement" title="Commence en quelques minutes" />
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        {STEPS.map(([num, title, desc], i) => (
          <div key={num} className="relative">
            <span className="text-5xl font-extrabold text-mina/12">{num}</span>
            <h3 className="mt-3 font-extrabold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
            {i < 3 && (
              <ChevronRight className="absolute -right-5 top-5 hidden text-mina/20 md:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
