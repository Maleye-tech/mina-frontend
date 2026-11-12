import { useState } from "react";
import { ChevronRight, FileQuestion, Flame, Play, Target } from "lucide-react";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { PageHeader, StatCard } from "../../../components/dashboard/Common";

const QUESTIONS = [
  "La diminution du retour veineux",
  "L’augmentation de la fréquence cardiaque et du volume d’éjection",
  "La vasoconstriction des muscles actifs",
  "La diminution de la contractilité myocardique",
];
const CORRECT_INDEX = 1;

function QcmIntro({ onStart }: { onStart: () => void }) {
  return (
    <>
      <PageHeader
        eyebrow="Auto-évaluation"
        title="Entraîne-toi avec les QCM"
        description="Chaque réponse est corrigée et expliquée pour transformer tes erreurs en progrès."
      />
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Questions disponibles"
          value="5 240"
          delta="+120"
          icon={<FileQuestion size={20} />}
        />
        <StatCard label="Ta moyenne" value="84 %" delta="+6 pts" icon={<Target size={20} />} />
        <StatCard
          label="Série en cours"
          value="12 jours"
          delta="Record : 18"
          icon={<Flame size={20} />}
        />
      </div>
      <Card className="mt-5">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_.8fr]">
          <div>
            <Badge>Session recommandée</Badge>
            <h2 className="mt-4 text-xl font-extrabold">Physiologie cardiovasculaire</h2>
            <p className="mt-2 text-sm text-slate-500">
              15 questions · 20 minutes · Difficulté intermédiaire
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Correction détaillée", "Chronomètre", "+150 XP"].map((x) => (
                <Badge key={x} tone="slate">
                  {x}
                </Badge>
              ))}
            </div>
            <Button onClick={onStart} className="mt-7">
              Commencer la série <Play size={15} />
            </Button>
          </div>
          <div className="rounded-2xl bg-teal-50 p-7 text-center dark:bg-mina/10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-8 border-white text-2xl font-extrabold text-mina shadow-sm dark:border-white/10">
              84%
            </div>
            <p className="mt-4 text-xs font-bold text-mina">Ton score sur cette matière</p>
          </div>
        </div>
      </Card>
    </>
  );
}

function QcmQuestion({
  answer,
  onAnswer,
  onNext,
}: {
  answer: number | null;
  onAnswer: (i: number) => void;
  onNext: () => void;
}) {
  const isCorrect = answer === CORRECT_INDEX;
  return (
    <>
      <PageHeader
        eyebrow="Question 1 sur 15"
        title="Physiologie cardiovasculaire"
        description="Temps restant : 18 min 42 s"
      />
      <Card className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-between">
          <Badge>Question à choix unique</Badge>
          <Badge tone="amber">+10 XP</Badge>
        </div>
        <h2 className="text-lg font-extrabold leading-7">
          Quel mécanisme est principalement responsable de l’augmentation du débit cardiaque pendant
          l’effort ?
        </h2>
        <div className="mt-6 space-y-3">
          {QUESTIONS.map((x, i) => (
            <button
              key={x}
              onClick={() => onAnswer(i)}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition ${answer === i ? (i === CORRECT_INDEX ? "border-mina bg-teal-50 text-teal-900 dark:bg-mina/10 dark:text-teal-200" : "border-red-300 bg-red-50 text-red-800 dark:bg-red-500/10") : "border-line dark:border-white/10"}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {x}
            </button>
          ))}
        </div>
        {answer !== null && (
          <div
            className={`mt-5 rounded-xl p-4 text-sm ${isCorrect ? "bg-teal-50 text-teal-900 dark:bg-mina/10 dark:text-teal-200" : "bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"}`}
          >
            <p className="font-extrabold">{isCorrect ? "Bonne réponse !" : "Pas tout à fait."}</p>
            <p className="mt-1 text-xs leading-5">
              À l’effort, l’activation sympathique augmente simultanément la fréquence cardiaque et
              la contractilité, donc le volume d’éjection systolique.
            </p>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button disabled={answer === null} onClick={onNext}>
            Question suivante <ChevronRight size={16} />
          </Button>
        </div>
      </Card>
    </>
  );
}

export function QcmPage() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  if (!started) return <QcmIntro onStart={() => setStarted(true)} />;
  return (
    <QcmQuestion
      answer={answer}
      onAnswer={setAnswer}
      onNext={() => {
        setAnswer(null);
        setStep(step + 1);
      }}
    />
  );
}
