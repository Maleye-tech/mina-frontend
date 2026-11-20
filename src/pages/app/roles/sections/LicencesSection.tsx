import { KeyRound } from "lucide-react";
import { PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";

export function LicencesSection({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <PageHeader eyebrow="Accès subventionnés" title={title} description={desc} />
      <EmptyState
        icon={<KeyRound size={24} />}
        title="Aucune licence disponible"
        description="Tes licences, codes d’accès et statistiques d’attribution seront chargés depuis l’API Mina dès que son endpoint sera disponible."
      />
    </>
  );
}
