import { MessageCircle } from "lucide-react";
import { EmptyState } from "../../../../components/ui/EmptyState";

export function CareChat() {
  return (
    <EmptyState
      icon={<MessageCircle size={24} />}
      title="Aucune conversation ouverte"
      description="Tes conversations sécurisées seront chargées depuis l’API Mina dès que son endpoint sera disponible."
    />
  );
}
