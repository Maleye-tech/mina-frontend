import { ShieldCheck } from "lucide-react";
import { SectionTitle } from "../../../components/landing/SectionTitle";

const GUARANTEES = [
  ["E2E", "Chiffrement de bout en bout"],
  ["CDP", "Conformité Sénégal"],
  ["RGPD", "Contrôle des données"],
] as const;

export function TrustSection() {
  return (
    <section className="bg-ink px-5 py-20 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <ShieldCheck size={42} className="text-sun" />
          <h2 className="mt-5 text-3xl font-extrabold">La confiance n’est pas une option.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Sécurité et confidentialité sont intégrées dès la conception.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {GUARANTEES.map((x) => (
            <div key={x[0]} className="rounded-2xl bg-white/6 p-5">
              <p className="text-xl font-extrabold text-sun">{x[0]}</p>
              <p className="mt-2 text-xs text-slate-300">{x[1]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
