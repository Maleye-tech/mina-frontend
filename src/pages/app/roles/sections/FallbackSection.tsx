import { Plus } from "lucide-react";
import { Badge, Button, Card } from "../../../../components/ui/Primitives";
import { ActivityItem, DataTable, PageHeader } from "../../../../components/dashboard/Common";

export function FallbackSection({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <PageHeader
        eyebrow="Gestion"
        title={title}
        description={desc}
        action={
          <Button>
            <Plus size={15} />
            Nouvelle action
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <Card>
          <h2 className="font-extrabold">Vue opérationnelle</h2>
          <DataTable
            headers={["Élément", "Responsable", "Date", "Statut"]}
            rows={[
              [title, "Équipe Mina", "18 juin", <Badge>Actif</Badge>],
              ["Session de suivi", "Fatou Diop", "20 juin", <Badge tone="amber">Planifié</Badge>],
              ["Rapport mensuel", "Cheikh Mbaye", "30 juin", <Badge tone="slate">Brouillon</Badge>],
            ]}
          />
        </Card>
        <Card>
          <h2 className="font-extrabold">Prochaines étapes</h2>
          <div className="mt-4">
            <ActivityItem title="Vérifier les informations" meta="Aujourd’hui" />
            <ActivityItem title="Confirmer avec l’équipe" meta="Demain" />
            <ActivityItem title="Publier la mise à jour" meta="Vendredi" />
          </div>
        </Card>
      </div>
    </>
  );
}
