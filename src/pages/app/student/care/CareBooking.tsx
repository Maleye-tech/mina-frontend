import { CalendarDays } from "lucide-react";
import { EmptyState } from "../../../../components/ui/EmptyState";

export function CareBooking() {
  return (
    <EmptyState
      icon={<CalendarDays size={24} />}
      title="Aucun professionnel disponible"
      description="Les professionnels, créneaux et rendez-vous seront chargés depuis l’API Mina dès que son endpoint sera disponible."
    />
  );
}
