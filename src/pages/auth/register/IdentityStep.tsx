import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Badge, Button } from "../../../components/ui/Primitives";
import { Field } from "../../../components/auth/Field";
import type { Role } from "../../../types";

export type RegisterData = {
  name: string;
  email: string;
  institution: string;
  level: string;
  password: string;
};

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-5 flex items-center gap-1 text-xs font-bold text-slate-500"
    >
      <ArrowLeft size={15} />
      Retour
    </button>
  );
}

export function IdentityStep({
  role,
  data,
  onChange,
  onNext,
  onBack,
}: {
  role: Exclude<Role, "super_admin">;
  data: RegisterData;
  onChange: (data: RegisterData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <BackButton onClick={onBack} />
      <Badge>Étape 2 sur 4</Badge>
      <h1 className="mt-4 text-2xl font-extrabold">Faisons connaissance</h1>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field
          label="Nom complet"
          value={data.name}
          onChange={(v) => onChange({ ...data, name: v })}
          placeholder="Aïssatou Ndiaye"
        />
        <Field
          label="Email"
          value={data.email}
          onChange={(v) => onChange({ ...data, email: v })}
          placeholder="toi@universite.sn"
        />
        <Field
          label={role === "professional" ? "Spécialité" : role === "partner_admin" ? "Institution" : "Université"}
          value={data.institution}
          onChange={(v) => onChange({ ...data, institution: v })}
        />
        <Field
          label={
            role === "professional" ? "Numéro d’ordre" : role === "student" ? "Niveau" : "Fonction"
          }
          value={data.level}
          onChange={(v) => onChange({ ...data, level: v })}
        />
      </div>
      {role !== "student" && (
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <ShieldCheck className="mr-2 inline" size={16} />
          Ce profil sera vérifié par l’équipe Mina avant activation complète.
        </div>
      )}
      <Button onClick={onNext} disabled={!data.name || !data.email} className="mt-7 w-full">
        Continuer
      </Button>
    </>
  );
}
