import { CreditCard } from "lucide-react";
import { PageHeader } from "../../../components/dashboard/Common";
import { EmptyState } from "../../../components/ui/EmptyState";

export function SubscriptionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Abonnement"
        title="Mon offre Mina"
        description="Gère ton accès et tes moyens de paiement en toute simplicité."
      />
      <EmptyState
        icon={<CreditCard size={24} />}
        title="Aucun abonnement actif"
        description="Ton abonnement et tes moyens de paiement seront chargés depuis l’API Mina dès que son endpoint sera disponible."
      />
    </>
  );
}
