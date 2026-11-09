import { Link } from "react-router";
import { ArrowRight, CloudOff, HeartHandshake, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { Badge, Button } from "../../../components/ui/Primitives";
import { AppMockup } from "../../../components/landing/AppMockup";

const TRUST_ITEMS = [
  [CloudOff, "Fonctionne hors-ligne"],
  [ShieldCheck, "100 % confidentiel"],
  [Smartphone, "Wave & Orange Money"],
] as const;

export function HeroSection() {
  return (
    <section className="pattern overflow-hidden px-5 pb-24 pt-16 md:pb-32 md:pt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_.98fr] lg:px-3">
        <div>
          <Badge tone="amber">
            <Sparkles size={13} className="mr-1.5" />
            Pensé au Sénégal, pour l’Afrique
          </Badge>
          <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.08] tracking-[-.045em] md:text-6xl">
            Réussis tes études de santé. <span className="text-mina">Prends soin de toi.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Cours, QCM, coach d’études et soutien psychosocial : Mina t’accompagne chaque jour,
            même sans connexion.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register">
              <Button className="w-full sm:w-auto">
                Commencer gratuitement <ArrowRight size={17} />
              </Button>
            </Link>
            <Link to="/mina-care">
              <Button variant="secondary" className="w-full sm:w-auto">
                <HeartHandshake size={17} className="text-care" />
                Découvrir Mina Care
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-bold text-slate-500 dark:text-slate-400">
            {TRUST_ITEMS.map(([Icon, t]) => (
              <span key={t} className="flex items-center gap-1.5">
                <Icon size={16} className="text-mina" />
                {t}
              </span>
            ))}
          </div>
        </div>
        <AppMockup />
      </div>
    </section>
  );
}
