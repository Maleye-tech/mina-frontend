import { BookOpen, Brain } from "lucide-react";
import { Button, Card } from "../../../../components/ui/Primitives";

const RESOURCES: [string, string][] = [
  ["Stress avant les examens", "Guide · 8 min"],
  ["Prévenir le burnout", "Fiche · 6 min"],
  ["Retrouver un sommeil régulier", "Audio · 12 min"],
  ["Respiration guidée", "Audio · 5 min"],
  ["Demander de l’aide", "Guide · 7 min"],
  ["Soutenir un proche", "Fiche · 9 min"],
];

export function CareResources() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {RESOURCES.map((r, i) => (
        <Card key={r[0]}>
          <div className="flex h-28 items-center justify-center rounded-2xl bg-violet-50 text-care dark:bg-care/10">
            {i % 2 ? <BookOpen /> : <Brain />}
          </div>
          <h2 className="mt-5 font-extrabold">{r[0]}</h2>
          <p className="mt-1 text-xs text-slate-400">{r[1]}</p>
          <Button variant="secondary" className="mt-5 w-full">
            Consulter
          </Button>
        </Card>
      ))}
    </div>
  );
}
