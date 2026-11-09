import { HeartHandshake, LockKeyhole, Stethoscope, Users } from "lucide-react";
import { Badge } from "../../../../components/ui/Primitives";
import { ChartCard } from "../../../../components/dashboard/ChartCard";
import { PageHeader, StatCard } from "../../../../components/dashboard/Common";

export function WellbeingSection({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <PageHeader
        eyebrow="Données anonymes"
        title={title}
        description={desc}
        action={
          <Badge tone="violet">
            <LockKeyhole size={12} className="mr-1" />
            Seuil minimum : 20 réponses
          </Badge>
        }
      />
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Indice de bien-être"
          value="7,2 / 10"
          delta="+0,4"
          icon={<HeartHandshake size={20} />}
        />
        <StatCard label="Participation" value="684" delta="52 %" icon={<Users size={20} />} />
        <StatCard
          label="Orientation Care"
          value="18 %"
          delta="-2 pts"
          icon={<Stethoscope size={20} />}
        />
      </div>
      <div className="mt-5">
        <ChartCard care title="Évolution de l’indice collectif" />
      </div>
    </>
  );
}
