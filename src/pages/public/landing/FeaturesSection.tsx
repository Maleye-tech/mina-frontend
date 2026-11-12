import { motion } from "motion/react";
import {
  BookOpen,
  Download,
  FileQuestion,
  Headphones,
  Sparkles,
  Stethoscope,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Card } from "../../../components/ui/Primitives";
import { SectionTitle, reveal } from "../../../components/landing/SectionTitle";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  span?: string;
  highlight?: boolean;
};

const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: "Bibliothèque structurée",
    desc: "Cours, fiches et résumés classés par niveau et matière.",
    span: "lg:col-span-2",
    highlight: true,
  },
  { icon: Headphones, title: "Podcasts audio", desc: "Révise en mobilité avec des formats compressés." },
  { icon: FileQuestion, title: "QCM expliqués", desc: "Comprends chaque bonne et mauvaise réponse." },
  {
    icon: Target,
    title: "Flashcards intelligentes",
    desc: "La répétition espacée au rythme de ta mémoire.",
  },
  {
    icon: Stethoscope,
    title: "Cas cliniques locaux",
    desc: "Paludisme, drépanocytose, tuberculose et plus.",
  },
  {
    icon: Sparkles,
    title: "Coach IA personnalisé",
    desc: "Un planning qui s’adapte à tes lacunes.",
    span: "lg:col-span-2",
  },
  { icon: Download, title: "Mode hors-ligne", desc: "Télécharge en Wi-Fi, étudie partout." },
];

const SUBJECTS = ["Anatomie", "Biochimie", "Physiologie"];
const SUBJECT_COLORS = ["bg-mina", "bg-sun", "bg-blue-500"];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div {...reveal} className={feature.span ?? ""}>
      <Card
        className={`h-full overflow-hidden ${index === 0 ? "bg-gradient-to-br from-teal-50 to-white dark:from-teal-500/10 dark:to-panel" : ""}`}
      >
        <div className="flex items-start justify-between">
          <div className="rounded-2xl bg-mina/10 p-3 text-mina">
            <Icon />
          </div>
          <span className="text-xs font-bold text-slate-300">0{index + 1}</span>
        </div>
        <h3 className="mt-7 text-lg font-extrabold">{feature.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.desc}</p>
        {feature.highlight && (
          <div className="mt-6 grid grid-cols-3 gap-2">
            {SUBJECTS.map((x, j) => (
              <div
                key={x}
                className="rounded-xl bg-white p-3 text-xs font-bold shadow-sm dark:bg-white/8"
              >
                <div className={`mb-4 h-1.5 rounded-full ${SUBJECT_COLORS[j]}`} />
                {x}
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="px-5 py-24">
      <SectionTitle
        eyebrow="Mina Med Student"
        title="Tout ce qu’il te faut pour progresser"
        text="Des outils courts, contextualisés et conçus pour ton quotidien."
      />
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
}
