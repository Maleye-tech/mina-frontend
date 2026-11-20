import { LockKeyhole, TrendingUp } from "lucide-react";
import { Badge } from "../../../../components/ui/Primitives";
import { PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";

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
      <EmptyState
        icon={<TrendingUp size={24} />}
        title="Aucune donnée agrégée"
        description="L’indice de bien-être et la participation seront chargés depuis l’API Mina dès que son endpoint sera disponible."
      />
    </>
  );
}
