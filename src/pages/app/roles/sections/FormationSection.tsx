import { GraduationCap } from "lucide-react";
import { PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";

export function FormationSection({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <PageHeader eyebrow="Certification" title={title} description={desc} />
      <EmptyState
        icon={<GraduationCap size={24} />}
        title="Aucun module de formation"
        description="Les modules et ta progression seront chargés depuis l’API Mina dès que son endpoint sera disponible."
      />
    </>
  );
}
