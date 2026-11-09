import { motion } from "motion/react";
import { BarChart3, BookOpen, Brain, WifiOff, type LucideIcon } from "lucide-react";
import { Card } from "../../../components/ui/Primitives";
import { SectionTitle, reveal } from "../../../components/landing/SectionTitle";

const PROBLEMS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: BarChart3,
    title: "Échec élevé",
    desc: "Des méthodes de travail peu adaptées au rythme universitaire.",
  },
  {
    icon: BookOpen,
    title: "Supports dispersés",
    desc: "Polycopiés, drives et groupes WhatsApp difficiles à organiser.",
  },
  {
    icon: WifiOff,
    title: "Connexion instable",
    desc: "Des ressources trop lourdes ou indisponibles hors-ligne.",
  },
  {
    icon: Brain,
    title: "Surcharge mentale",
    desc: "Stress, épuisement et tabou qui empêchent de demander de l’aide.",
  },
];

export function ProblemSection() {
  return (
    <section className="px-5 py-24">
      <SectionTitle
        eyebrow="Le constat"
        title="Les études de santé ne devraient pas être un parcours solitaire"
        text="Nous levons les obstacles académiques, numériques et humains qui freinent trop d’étudiants."
      />
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PROBLEMS.map(({ icon: Icon, title, desc }, i) => (
          <motion.div {...reveal} transition={{ delay: i * 0.07 }} key={title}>
            <Card className="h-full">
              <div className="mb-5 inline-flex rounded-2xl bg-red-50 p-3 text-red-500 dark:bg-red-500/10">
                <Icon />
              </div>
              <h3 className="font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
