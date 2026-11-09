import { MoreHorizontal, Plus } from "lucide-react";
import { Badge, Button } from "../../../../components/ui/Primitives";
import { DataTable, PageHeader } from "../../../../components/dashboard/Common";

const USERS = [
  "Aïssatou Ndiaye|Étudiante|UCAD|Actif|12 juin",
  "Moussa Fall|Ambassadeur|UGB|En attente|11 juin",
  "Dr Fatou Diop|Professionnelle|Cabinet Teranga|Actif|10 juin",
  "Cheikh Mbaye|Partenaire|CROUS Thiès|En attente|9 juin",
  "Awa Kane|Étudiante|UT Thiès|Suspendu|8 juin",
];

function statusBadge(status: string) {
  return (
    <Badge tone={status === "Actif" ? "teal" : status === "Suspendu" ? "red" : "amber"}>
      {status}
    </Badge>
  );
}

export function UsersSection({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title={title}
        description={desc}
        action={
          <Button>
            <Plus size={15} />
            Ajouter un utilisateur
          </Button>
        }
      />
      <DataTable
        headers={["Utilisateur", "Rôle", "Institution", "Statut", "Inscription", "Action"]}
        rows={USERS.map((x) => {
          const p = x.split("|");
          return [
            ...p.slice(0, 3),
            statusBadge(p[3]),
            p[4],
            <button key="action" className="text-mina">
              <MoreHorizontal size={17} />
            </button>,
          ];
        })}
      />
    </>
  );
}
