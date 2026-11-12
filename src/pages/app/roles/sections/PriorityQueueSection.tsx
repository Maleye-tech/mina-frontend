import { ShieldCheck } from "lucide-react";
import { Badge, Button, Card } from "../../../../components/ui/Primitives";
import { PageHeader } from "../../../../components/dashboard/Common";

const ITEMS: [string, string, string, string][] = [
  ["Baobab calme 27", "Stress intense avant les examens", "Priorité élevée", "Il y a 8 min"],
  ["Kër 54", "Demande de rendez-vous confidentiel", "Priorité normale", "Il y a 24 min"],
  ["Sunu 18", "Besoin de parler à un pair", "Priorité normale", "Il y a 1 h"],
];

function actionLabel(slug: string) {
  if (slug === "validations") return "Valider";
  if (slug === "alertes") return "Prendre en charge";
  return "Répondre";
}

export function PriorityQueueSection({
  slug,
  title,
  desc,
}: {
  slug: string;
  title: string;
  desc: string;
}) {
  return (
    <>
      <PageHeader eyebrow="File prioritaire" title={title} description={desc} />
      <div className="grid gap-4">
        {ITEMS.map((x, i) => (
          <Card key={x[0]} className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${i === 0 ? "bg-red-50 text-red-600" : "bg-violet-50 text-care"}`}
            >
              <ShieldCheck size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold">{x[0]}</h2>
                <Badge tone={i === 0 ? "red" : "slate"}>{x[2]}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {x[1]} · {x[3]}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">Voir</Button>
              <Button>{actionLabel(slug)}</Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
