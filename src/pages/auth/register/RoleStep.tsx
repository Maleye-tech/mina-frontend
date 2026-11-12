import { ArrowRight, Building2, GraduationCap, HeartHandshake, Stethoscope } from "lucide-react";
import { Badge, Button } from "../../../components/ui/Primitives";
import type { Role } from "../../../types";

const profileOptions: {
  role: Exclude<Role, "super_admin">;
  icon: typeof GraduationCap;
  title: string;
  desc: string;
}[] = [
  {
    role: "student",
    icon: GraduationCap,
    title: "Étudiant",
    desc: "Médecine, pharmacie, odontologie ou filière santé",
  },
  {
    role: "ambassador",
    icon: HeartHandshake,
    title: "Ambassadeur",
    desc: "Étudiant relais formé à l’écoute",
  },
  {
    role: "professional",
    icon: Stethoscope,
    title: "Professionnel",
    desc: "Psychologue, psychiatre ou conseiller",
  },
  {
    role: "partner_admin",
    icon: Building2,
    title: "Partenaire",
    desc: "Université, CROUS, ONG ou institution",
  },
];

export function RoleStep({
  role,
  onSelect,
  onNext,
}: {
  role: Exclude<Role, "super_admin">;
  onSelect: (role: Exclude<Role, "super_admin">) => void;
  onNext: () => void;
}) {
  return (
    <>
      <Badge>Étape 1 sur 4</Badge>
      <h1 className="mt-4 text-2xl font-extrabold">Quel profil te correspond ?</h1>
      <p className="mt-2 text-sm text-slate-500">
        Nous personnaliserons ton expérience dès le départ.
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {profileOptions.map((o) => (
          <button
            key={o.role}
            onClick={() => onSelect(o.role)}
            className={`rounded-2xl border p-5 text-left transition ${role === o.role ? "border-mina bg-teal-50 ring-2 ring-mina/10 dark:bg-mina/10" : "border-line hover:border-mina/40 dark:border-white/10"}`}
          >
            <o.icon className={role === o.role ? "text-mina" : "text-slate-400"} />
            <p className="mt-4 font-extrabold">{o.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{o.desc}</p>
          </button>
        ))}
      </div>
      <Button onClick={onNext} className="mt-7 w-full">
        Continuer <ArrowRight size={16} />
      </Button>
    </>
  );
}
