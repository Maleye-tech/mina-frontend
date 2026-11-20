import { TrendingUp } from "lucide-react";
import { PageHeader } from "../../../components/dashboard/Common";
import { EmptyState } from "../../../components/ui/EmptyState";

export function ProgressPage() {
  return (
    <>
      <PageHeader
        eyebrow="Analyse"
        title="Ma progression"
        description="Identifie tes forces et concentre tes efforts là où ils comptent."
      />
      <EmptyState
        icon={<TrendingUp size={24} />}
        title="Aucune progression à afficher"
        description="Tes statistiques de réussite et ton historique d’étude seront chargés depuis l’API Mina dès que son endpoint sera disponible."
      />
    </>
  );
}
