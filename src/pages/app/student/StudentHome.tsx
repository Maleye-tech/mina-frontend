import { Flame, Sparkles } from "lucide-react";
import { Badge } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useAuthStore } from "../../../store/authStore";

export function StudentHome() {
  const user = useAuthStore((s) => s.user)!;
  return (
    <>
      <PageHeader
        eyebrow="Tableau de bord"
        title={`Bonjour ${user.name.split(" ")[0]}, prête à avancer ?`}
        description="Ton programme est ajusté à tes objectifs et à ton rythme."
        action={
          <Badge tone="amber">
            <Flame size={14} className="mr-1.5" />
            Série en cours
          </Badge>
        }
      />
      <EmptyState
        icon={<Sparkles size={24} />}
        title="Ton tableau de bord se prépare"
        description="La progression, le programme du jour et tes statistiques seront chargés depuis l’API Mina dès que son endpoint sera disponible."
      />
    </>
  );
}
