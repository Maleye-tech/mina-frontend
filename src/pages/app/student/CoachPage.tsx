import { Sparkles } from "lucide-react";
import { PageHeader } from "../../../components/dashboard/Common";
import { EmptyState } from "../../../components/ui/EmptyState";

export function CoachPage() {
  return (
    <>
      <PageHeader
        eyebrow="Coach IA"
        title="Ton copilote d’études"
        description="Des recommandations personnalisées à partir de ta progression et de tes objectifs."
      />
      <EmptyState
        icon={<Sparkles size={24} />}
        title="Coach indisponible"
        description="Les conversations et recommandations du coach seront chargées depuis l’API Mina dès que son endpoint sera disponible."
      />
    </>
  );
}
