import { ArrowRight, Building2, GraduationCap, HeartHandshake } from "lucide-react";
import { Badge, Button } from "../../../components/ui/Primitives";
import type { AvailableRole } from "../../../types/api";

export type MinaRoleKey = "student" | "ambassador" | "partner";

const iconMap: Record<string, typeof GraduationCap> = {
  "graduation-cap": GraduationCap,
  "heart-handshake": HeartHandshake,
  "building-columns": Building2,
  building2: Building2,
};

const DEFAULT_ROLES: {
  id: MinaRoleKey;
  icon: typeof GraduationCap;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "student",
    icon: GraduationCap,
    title: "Étudiant",
    subtitle: "Médecine, pharmacie, odontologie ou filière santé",
  },
  {
    id: "ambassador",
    icon: HeartHandshake,
    title: "Ambassadeur",
    subtitle: "Étudiant relais formé à l’écoute",
  },
  {
    id: "partner",
    icon: Building2,
    title: "Partenaire",
    subtitle: "Université, CROUS, ONG ou institution",
  },
];

export function RoleStep({
  role,
  onSelect,
  onNext,
  availableRoles,
}: {
  role: MinaRoleKey;
  onSelect: (role: MinaRoleKey) => void;
  onNext: () => void;
  availableRoles?: AvailableRole[];
}) {
  const options =
    availableRoles && availableRoles.length > 0
      ? availableRoles.map((r) => ({
          id: r.id,
          icon: iconMap[r.icon] || GraduationCap,
          title: r.title,
          subtitle: r.subtitle,
        }))
      : DEFAULT_ROLES;

  return (
    <>
      <Badge>Étape 1 sur 4</Badge>
      <h1 className="mt-4 text-2xl font-extrabold">Quel profil te correspond ?</h1>
      <p className="mt-2 text-sm text-slate-500">
        Nous personnaliserons ton expérience dès le départ.
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {options.map((o) => {
          const isSelected = role === o.id;
          const Icon = o.icon;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(o.id as MinaRoleKey)}
              className={`rounded-2xl border p-5 text-left transition ${
                isSelected
                  ? "border-mina bg-teal-50 ring-2 ring-mina/10 dark:bg-mina/10"
                  : "border-line hover:border-mina/40 dark:border-white/10"
              }`}
            >
              <Icon className={isSelected ? "text-mina" : "text-slate-400"} size={24} />
              <p className="mt-4 font-extrabold">{o.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{o.subtitle}</p>
            </button>
          );
        })}
      </div>
      <Button onClick={onNext} className="mt-7 w-full">
        Continuer <ArrowRight size={16} />
      </Button>
    </>
  );
}
