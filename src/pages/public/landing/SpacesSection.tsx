import { Check, GraduationCap, HeartHandshake, type LucideIcon } from "lucide-react";
import { Badge } from "../../../components/ui/Primitives";
import { SectionTitle } from "../../../components/landing/SectionTitle";

type Space = {
  icon: LucideIcon;
  badge: string;
  badgeTone: "amber" | "violet";
  title: string;
  desc: string;
  gradient: string;
  descClass: string;
  items: string[];
};

const SPACES: Space[] = [
  {
    icon: GraduationCap,
    badge: "Mina Med Student",
    badgeTone: "amber",
    title: "Ton campus dans la poche",
    desc: "Révise avec des contenus fiables, entraîne-toi et avance selon tes points faibles.",
    gradient: "from-mina to-[#094f4b]",
    descClass: "text-teal-50",
    items: ["Cours & fiches de synthèse", "QCM expliqués et cas cliniques", "Coach IA et progression"],
  },
  {
    icon: HeartHandshake,
    badge: "Mina Care",
    badgeTone: "violet",
    title: "Une écoute, sans jugement",
    desc: "Parle anonymement, trouve des ressources et prends rendez-vous en toute confidentialité.",
    gradient: "from-care to-[#51469c]",
    descClass: "text-violet-50",
    items: ["Tchat sécurisé et anonyme", "Psychologues & ambassadeurs formés", "Auto-évaluations non médicales"],
  },
];

function SpaceCard({ space }: { space: Space }) {
  const Icon = space.icon;
  return (
    <div className={`rounded-[28px] bg-gradient-to-br ${space.gradient} p-8 md:p-10`}>
      <div className="mb-16 inline-flex rounded-2xl bg-white/12 p-3">
        <Icon />
      </div>
      <Badge tone={space.badgeTone}>{space.badge}</Badge>
      <h3 className="mt-4 text-3xl font-extrabold">{space.title}</h3>
      <p className={`mt-3 text-sm leading-6 ${space.descClass}`}>{space.desc}</p>
      <ul className="mt-6 grid gap-3 text-sm">
        {space.items.map((x) => (
          <li key={x} className="flex gap-2">
            <Check size={18} className="text-sun" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SpacesSection() {
  return (
    <section className="bg-ink px-5 py-24 text-white">
      <SectionTitle
        eyebrow="Une plateforme, deux espaces"
        title="Apprendre mieux. Aller mieux."
        text="Une approche intégrée qui prend soin de ta réussite et de ton équilibre."
      />
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
        {SPACES.map((s) => (
          <SpaceCard key={s.badge} space={s} />
        ))}
      </div>
    </section>
  );
}
