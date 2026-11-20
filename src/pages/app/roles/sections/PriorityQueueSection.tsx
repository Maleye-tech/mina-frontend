import { ShieldCheck } from "lucide-react";
import { PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";

export function PriorityQueueSection({
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
      <EmptyState
        icon={<ShieldCheck size={24} />}
        title="Aucune demande en attente"
        description="Les demandes et alertes seront chargées depuis l’API Mina dès que son endpoint sera disponible."
      />
    </>
  );
}
