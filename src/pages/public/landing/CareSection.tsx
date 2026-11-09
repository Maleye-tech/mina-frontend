import { Link } from "react-router";
import {
  ArrowRight,
  CalendarHeart,
  CirclePlay,
  LockKeyhole,
  MessageCircleHeart,
  MoonStar,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button, Card } from "../../../components/ui/Primitives";
import { SectionTitle } from "../../../components/landing/SectionTitle";

const CARE_FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: MessageCircleHeart, title: "Écoute anonyme", desc: "Choisis un pseudonyme et parle sans crainte." },
  { icon: CalendarHeart, title: "Rendez-vous", desc: "Trouve un professionnel et un créneau confidentiel." },
  { icon: LockKeyhole, title: "Tchat sécurisé", desc: "Architecture prête pour le chiffrement de bout en bout." },
  { icon: MoonStar, title: "Ressources bien-être", desc: "Stress, sommeil, burnout et concentration." },
  { icon: Users, title: "Ambassadeurs formés", desc: "Des pairs qui comprennent ton quotidien." },
  { icon: CirclePlay, title: "Webinaires", desc: "Des échanges pour briser le tabou." },
];

function CareFeatureCard({ feature }: { feature: (typeof CARE_FEATURES)[number] }) {
  const Icon = feature.icon;
  return (
    <Card className="border-white/60">
      <div className="mb-4 inline-flex rounded-xl bg-care/10 p-2.5 text-care">
        <Icon size={20} />
      </div>
      <h3 className="font-extrabold">{feature.title}</h3>
      <p className="mt-1.5 text-xs leading-5 text-slate-500">{feature.desc}</p>
    </Card>
  );
}

function PrivacyPanel() {
  return (
    <div className="relative rounded-[30px] bg-care p-7 text-white md:p-10">
      <ShieldCheck size={36} />
      <h3 className="mt-8 text-3xl font-extrabold">Ta parole t’appartient.</h3>
      <p className="mt-3 leading-7 text-violet-100">
        Pseudonymisation par défaut, contrôle de tes données et orientation uniquement avec ton
        accord, sauf urgence vitale selon le protocole.
      </p>
      <div className="mt-8 rounded-2xl bg-white/12 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-200">
          Aujourd’hui, comment te sens-tu ?
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["Difficile", "Moyen", "Bien"].map((x, i) => (
            <span
              key={x}
              className={`rounded-lg py-2 text-center text-xs font-bold ${i === 2 ? "bg-white/20" : "bg-white/10"}`}
            >
              {x}
            </span>
          ))}
        </div>
      </div>
      <Link to="/mina-care">
        <Button className="mt-6 bg-white text-care hover:bg-violet-50">
          Découvrir l’espace <ArrowRight size={16} />
        </Button>
      </Link>
    </div>
  );
}

export function CareSection() {
  return (
    <section className="overflow-hidden bg-[#f2f0ff] px-5 py-24 dark:bg-care/8">
      <SectionTitle
        eyebrow="Mina Care"
        title="Tu peux parler. Nous sommes là."
        text="Un espace doux, confidentiel et accessible pour prévenir l’épuisement et rompre l’isolement."
      />
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {CARE_FEATURES.map((f) => (
            <CareFeatureCard key={f.title} feature={f} />
          ))}
        </div>
        <PrivacyPanel />
      </div>
    </section>
  );
}
