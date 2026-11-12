import { Check } from "lucide-react";
import type { Role } from "../../../types";

export function SuccessStep({
  name,
  role,
}: {
  name: string;
  role: Exclude<Role, "super_admin">;
}) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-mina dark:bg-mina/10">
        <Check size={30} />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold">Bienvenue dans Mina, {name.split(" ")[0]} !</h1>
      <p className="mt-3 text-sm text-slate-500">
        {role === "student"
          ? "Ton espace est prêt. Nous préparons ton tableau de bord."
          : "Ta demande a bien été reçue. Ton compte est en attente de validation."}
      </p>
      <p className="mt-6 text-xs font-bold text-mina">Redirection en cours…</p>
    </div>
  );
}
