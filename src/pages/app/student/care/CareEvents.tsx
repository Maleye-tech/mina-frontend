import { Calendar } from "lucide-react";
import { Button, Card, Badge } from "../../../../components/ui/Primitives";

const EVENTS: [string, string, string][] = [
  ["Briser le tabou du burnout", "22 juin · 18:00", "Webinaire"],
  ["Gérer la pression des examens", "28 juin · 17:30", "Atelier en ligne"],
  ["Sommeil et mémoire", "3 juillet · 19:00", "Replay disponible"],
];

export function CareEvents() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {EVENTS.map((e, i) => (
        <Card key={e[0]}>
          <Badge tone="violet">{e[2]}</Badge>
          <Calendar className="mt-8 text-care" />
          <h2 className="mt-5 font-extrabold">{e[0]}</h2>
          <p className="mt-2 text-xs text-slate-400">{e[1]}</p>
          <Button variant="care" className="mt-6 w-full">
            {i === 2 ? "Voir le replay" : "S’inscrire"}
          </Button>
        </Card>
      ))}
    </div>
  );
}
