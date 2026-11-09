import { Clock3, FileQuestion, TrendingUp } from "lucide-react";
import { Card, Progress } from "../../../components/ui/Primitives";
import { ChartCard } from "../../../components/dashboard/ChartCard";
import { DownloadButton, PageHeader, StatCard } from "../../../components/dashboard/Common";

const SUBJECTS = [
  { name: "Anatomie", v: 88 },
  { name: "Physiologie", v: 82 },
  { name: "Biochimie", v: 61 },
  { name: "Histologie", v: 74 },
  { name: "Biophysique", v: 69 },
];

function SubjectProgress({ name, value }: { name: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-bold">
        <span>{name}</span>
        <span className={value < 65 ? "text-amber-600" : "text-mina"}>{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

export function ProgressPage() {
  return (
    <>
      <PageHeader
        eyebrow="Analyse"
        title="Ma progression"
        description="Identifie tes forces et concentre tes efforts là où ils comptent."
        action={<DownloadButton label="Mon bilan PDF" />}
      />
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Progression globale"
          value="68 %"
          delta="+8 pts"
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Questions répondues"
          value="1 248"
          delta="+126"
          icon={<FileQuestion size={20} />}
        />
        <StatCard label="Heures d’étude" value="48h" delta="+6h" icon={<Clock3 size={20} />} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <ChartCard />
        <Card>
          <h2 className="font-extrabold">Réussite par matière</h2>
          <div className="mt-6 space-y-5">
            {SUBJECTS.map((s) => (
              <SubjectProgress key={s.name} name={s.name} value={s.v} />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
