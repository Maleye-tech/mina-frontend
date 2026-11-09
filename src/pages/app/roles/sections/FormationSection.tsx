import { Button, Card, Progress } from "../../../../components/ui/Primitives";
import { Badge } from "../../../../components/ui/Primitives";
import { PageHeader } from "../../../../components/dashboard/Common";

const MODULES: [string, string, string, "teal" | "amber" | "slate"][] = [
  ["Écoute active", "100", "Terminé", "teal"],
  ["Repérer la détresse", "72", "En cours", "amber"],
  ["Orienter sans diagnostiquer", "25", "À poursuivre", "slate"],
];

export function FormationSection({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <PageHeader eyebrow="Certification" title={title} description={desc} />
      <div className="grid gap-5 md:grid-cols-3">
        {MODULES.map((x, i) => (
          <Card key={x[0]}>
            <Badge tone={x[3]}>Module {i + 1}</Badge>
            <h2 className="mt-5 font-extrabold">{x[0]}</h2>
            <p className="mt-2 text-xs text-slate-400">
              Cours, mises en situation et quiz de validation.
            </p>
            <div className="mt-6">
              <Progress value={+x[1]} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-bold">
              <span>{x[2]}</span>
              <span>{x[1]} %</span>
            </div>
            <Button variant={i === 0 ? "secondary" : "primary"} className="mt-5 w-full">
              {i === 0 ? "Revoir" : "Continuer"}
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
