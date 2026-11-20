import { CalendarDays } from "lucide-react";
import { EmptyState } from "../../../../components/ui/EmptyState";

export function CareEvents() {
  return (
    <EmptyState
      icon={<CalendarDays size={24} />}
      title="Aucun événement à venir"
      description="Les événements de prévention seront chargés depuis l’API Mina dès que son endpoint sera disponible."
    />
  );
}
