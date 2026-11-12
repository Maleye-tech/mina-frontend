import { Link } from "react-router";
import { Check } from "lucide-react";
import { Button, Card } from "../../../components/ui/Primitives";
import { SectionTitle } from "../../../components/landing/SectionTitle";

const PLANS = [
  ["Essai gratuit", "0 FCFA", "3 jours", "Accès à toutes les fonctionnalités"],
  ["Mensuel", "3 000 FCFA", "par mois", "Flexible, annulable à tout moment"],
  ["Annuel", "15 000 FCFA", "par an", "Économise 21 000 FCFA par an"],
] as const;

const FEATURES = [
  "5 000+ QCM expliqués",
  "Tous les cours & podcasts",
  "Mina Care inclus",
  "Mode hors-ligne",
];

function PlanCard({ plan, index }: { plan: (typeof PLANS)[number]; index: number }) {
  const featured = index === 2;
  return (
    <Card
      className={`relative flex flex-col ${featured ? "border-2 border-mina shadow-[0_20px_60px_rgba(15,118,110,.15)]" : ""}`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sun px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink">
          Meilleure offre
        </span>
      )}
      <h3 className="text-lg font-extrabold">{plan[0]}</h3>
      <p className="mt-6 text-3xl font-extrabold">{plan[1]}</p>
      <p className="text-xs text-slate-400">{plan[2]}</p>
      <p className="mt-5 min-h-10 text-sm text-slate-500">{plan[3]}</p>
      <div className="my-6 h-px bg-line dark:bg-white/8" />
      {FEATURES.map((f) => (
        <p key={f} className="mb-3 flex gap-2 text-xs font-semibold">
          <Check size={15} className="text-mina" />
          {f}
        </p>
      ))}
      <Link to="/register" className="mt-auto pt-5">
        <Button variant={featured ? "primary" : "secondary"} className="w-full">
          Choisir cette offre
        </Button>
      </Link>
    </Card>
  );
}

export function PricingSection() {
  return (
    <section id="tarifs" className="px-5 py-24">
      <SectionTitle
        eyebrow="Des tarifs justes"
        title="Investis dans ta réussite, sans surprise"
        text="Commence gratuitement. Aucun moyen de paiement demandé pendant l’essai."
      />
      <div className="mx-auto grid max-w-5xl items-stretch gap-5 md:grid-cols-3">
        {PLANS.map((p, i) => (
          <PlanCard key={p[0]} plan={p} index={i} />
        ))}
      </div>
      <div className="mx-auto mt-6 flex max-w-5xl flex-col items-center justify-between gap-4 rounded-2xl bg-violet-50 p-5 text-center sm:flex-row sm:text-left dark:bg-care/10">
        <p className="text-sm">
          <strong className="text-care">Mina Care peut être gratuit ou subventionné</strong>
          <br />
          <span className="text-slate-500">via nos partenaires : CROUS, universités et ONG.</span>
        </p>
        <Link to="/partenaires">
          <Button variant="care">En savoir plus</Button>
        </Link>
      </div>
      <p className="mt-7 text-center text-xs font-bold text-slate-400">
        Paiements sécurisés via Wave · Orange Money · Carte bancaire
      </p>
    </section>
  );
}
