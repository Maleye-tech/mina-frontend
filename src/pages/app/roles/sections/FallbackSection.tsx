import { ClipboardList } from "lucide-react";
import { PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";

export function FallbackSection({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <PageHeader eyebrow="Gestion" title={title} description={desc} />
      <EmptyState
        icon={<ClipboardList size={24} />}
        title="Aucune donnée disponible"
        description="Cette section sera alimentée par l’API Mina dès que son endpoint sera disponible."
      />
    </>
  );
}
