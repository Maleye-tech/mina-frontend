import { Activity } from "lucide-react";
import { PendingBanner } from "../../../components/dashboard/PendingBanner";
import { EmptyState } from "../../../components/ui/EmptyState";
import type { Role } from "../../../types";

type NonStudentRole = Exclude<Role, "student">;

export function RoleOverview({ role: _role }: { role: NonStudentRole }) {
  return (
    <>
      <PendingBanner />
      <EmptyState
        icon={<Activity size={24} />}
        title="Aucun indicateur disponible"
        description="Tes statistiques, graphiques et activités récentes seront chargés depuis l’API Mina dès que son endpoint sera disponible."
      />
    </>
  );
}
