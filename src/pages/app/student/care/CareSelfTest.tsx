import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Badge, Card } from "../../../../components/ui/Primitives";

const OPTIONS = ["Pas du tout", "Un peu", "Souvent", "Presque toujours"];

export function CareSelfTest() {
  const [test, setTest] = useState<number | null>(null);
  return (
    <Card className="mx-auto max-w-2xl">
      <Badge tone="violet">Bien-être · 5 questions</Badge>
      <h2 className="mt-5 text-xl font-extrabold">
        Ces 7 derniers jours, à quel point t’es-tu senti sous pression ?
      </h2>
      <div className="mt-7 grid gap-3 sm:grid-cols-4">
        {OPTIONS.map((x, i) => (
          <button
            key={x}
            onClick={() => setTest(i)}
            className={`rounded-xl border p-4 text-xs font-bold ${test === i ? "border-care bg-care text-white" : "border-line dark:border-white/10"}`}
          >
            {x}
          </button>
        ))}
      </div>
      {test !== null && (
        <div className="mt-6 rounded-xl bg-violet-50 p-4 text-xs leading-5 text-violet-900 dark:bg-care/10 dark:text-violet-200">
          <strong>Merci pour ta réponse.</strong> Continue le test pour obtenir des pistes
          personnalisées et non médicales.
        </div>
      )}
      <p className="mt-6 text-[10px] leading-4 text-slate-400">
        <AlertTriangle className="mr-1 inline" size={12} />
        Ceci n’est pas un diagnostic et ne remplace pas l’avis d’un professionnel de santé.
      </p>
    </Card>
  );
}
