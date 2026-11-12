import { motion } from "motion/react";

export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

export function SectionTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <motion.div {...reveal} className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-mina">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
      {text && <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{text}</p>}
    </motion.div>
  );
}
