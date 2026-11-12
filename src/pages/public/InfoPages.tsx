import { Link, useLocation } from "react-router";
import {
  ArrowRight,
  Building2,
  Check,
  HeartHandshake,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Footer } from "../../components/layout/Footer";
import { Badge, Button, Card } from "../../components/ui/Primitives";

const content: Record<string, { eyebrow: string; title: string; intro: string; color: string }> = {
  "/mina-care": {
    eyebrow: "Mina Care",
    title: "Un espace sûr pour souffler, parler et être accompagné.",
    intro:
      "Écoute anonyme, rendez-vous confidentiels et ressources pour prendre soin de ta santé mentale sans jugement.",
    color: "care",
  },
  "/partenaires": {
    eyebrow: "Institutions",
    title: "Faisons de la réussite étudiante une responsabilité partagée.",
    intro:
      "Universités, CROUS et ONG : déployez Mina auprès de vos étudiants et mesurez un impact agrégé, jamais intrusif.",
    color: "mina",
  },
  "/contact": {
    eyebrow: "Nous contacter",
    title: "Construisons la suite ensemble.",
    intro:
      "Une question, un partenariat ou une démonstration ? Notre équipe à Dakar te répond rapidement.",
    color: "mina",
  },
  "/tarifs": {
    eyebrow: "Tarifs",
    title: "Un accès simple, transparent et accessible.",
    intro:
      "3 jours gratuits, puis 3 000 FCFA par mois ou 15 000 FCFA par an. Mina Care peut être subventionné.",
    color: "mina",
  },
};

export function InfoPage() {
  const { pathname } = useLocation();
  const c = content[pathname] || content["/contact"];
  return (
    <main>
      <section
        className={`pattern px-5 py-24 ${c.color === "care" ? "bg-violet-50 dark:bg-care/8" : ""}`}
      >
        <div className="mx-auto max-w-4xl text-center">
          <Badge tone={c.color === "care" ? "violet" : "teal"}>{c.eyebrow}</Badge>
          <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
            {c.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600 dark:text-slate-300">
            {c.intro}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register">
              <Button variant={c.color === "care" ? "care" : "primary"}>
                Commencer <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary">Parler à l’équipe</Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {[
            [
              c.color === "care" ? HeartHandshake : Sparkles,
              "Une expérience humaine",
              "Des parcours chaleureux, clairs et adaptés au contexte sénégalais.",
            ],
            [
              ShieldCheck,
              "Confidentialité intégrée",
              "Pseudonymisation et accès strictement contrôlés dès la conception.",
            ],
            [
              c.eyebrow === "Institutions" ? Building2 : Mail,
              c.eyebrow === "Institutions" ? "Pilotage responsable" : "Une équipe disponible",
              c.eyebrow === "Institutions"
                ? "Des indicateurs agrégés pour agir, jamais surveiller."
                : "Échange avec nous pour une démonstration personnalisée.",
            ],
          ].map(([Icon, t, d]) => (
            <Card key={t as string}>
              <div
                className={`inline-flex rounded-2xl p-3 ${c.color === "care" ? "bg-care/10 text-care" : "bg-mina/10 text-mina"}`}
              >
                {<Icon />}
              </div>
              <h2 className="mt-6 text-lg font-extrabold">{t as string}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{d as string}</p>
              <p className="mt-5 flex items-center gap-2 text-xs font-bold text-mina">
                <Check size={14} />
                Disponible dans la démo
              </p>
            </Card>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function ErrorPage({ forbidden = false }: { forbidden?: boolean }) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5 text-center">
      <div>
        <p className="text-7xl font-extrabold text-mina/20">{forbidden ? "403" : "404"}</p>
        <h1 className="mt-4 text-3xl font-extrabold">
          {forbidden ? "Accès non autorisé" : "Cette page s’est égarée"}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          {forbidden
            ? "Ton rôle ne permet pas d’accéder à cet espace."
            : "La page demandée n’existe pas ou a été déplacée."}
        </p>
        <Link to="/" className="mt-7 inline-block">
          <Button>Retour à l’accueil</Button>
        </Link>
      </div>
    </div>
  );
}
