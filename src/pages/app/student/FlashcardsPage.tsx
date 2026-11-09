import { useState } from "react";
import { Brain } from "lucide-react";
import { Badge, Progress } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";

const CARDS: [string, string][] = [
  [
    "Définis la précharge cardiaque.",
    "La tension du myocarde en fin de diastole, liée au volume télédiastolique.",
  ],
  [
    "Quel est le rôle du nœud sinusal ?",
    "Il génère spontanément l’influx électrique et impose le rythme cardiaque.",
  ],
  ["Quelle valve sépare l’oreillette et le ventricule gauches ?", "La valve mitrale."],
];

const RATINGS: [string, string][] = [
  ["Difficile", "bg-red-500"],
  ["Moyen", "bg-sun"],
  ["Facile", "bg-mina"],
];

export function FlashcardsPage() {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="Répétition espacée"
        title="Flashcards à réviser"
        description="Mina reprogramme les cartes selon ta mémorisation."
        action={<Badge tone="amber">18 cartes aujourd’hui</Badge>}
      />
      <div className="mx-auto max-w-2xl">
        <div className="mb-3 flex justify-between text-xs font-bold text-slate-400">
          <span>
            Carte {i + 1} sur {CARDS.length}
          </span>
          <span>Physiologie</span>
        </div>
        <Progress value={((i + 1) / CARDS.length) * 100} />
        <button
          onClick={() => setFlip(!flip)}
          className={`mt-6 flex min-h-[300px] w-full flex-col items-center justify-center rounded-[28px] border p-8 text-center shadow-card transition ${flip ? "border-mina bg-mina text-white" : "border-line bg-white dark:border-white/8 dark:bg-panel"}`}
        >
          <Brain size={34} className={flip ? "text-sun" : "text-mina"} />
          <p className="mt-8 text-xl font-extrabold leading-8">{flip ? CARDS[i][1] : CARDS[i][0]}</p>
          <p className={`mt-7 text-xs font-semibold ${flip ? "text-teal-100" : "text-slate-400"}`}>
            {flip ? "Évalue ta maîtrise ci-dessous" : "Touche la carte pour voir la réponse"}
          </p>
        </button>
        {flip && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            {RATINGS.map(([x, c]) => (
              <button
                key={x}
                onClick={() => {
                  setI((i + 1) % CARDS.length);
                  setFlip(false);
                }}
                className={`rounded-xl py-3 text-xs font-extrabold text-white ${c}`}
              >
                {x}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
