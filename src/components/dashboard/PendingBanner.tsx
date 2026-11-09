import { Clock3 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function PendingBanner() {
  const user = useAuthStore((s) => s.user)!;
  if (user.status !== "pending") return null;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
      <Clock3 className="mt-0.5 shrink-0" size={18} />
      <div>
        <p className="text-sm font-extrabold">Compte en attente de validation</p>
        <p className="mt-1 text-xs leading-5">
          L’équipe Mina vérifie tes informations. Les fonctionnalités sensibles seront activées
          après validation.
        </p>
      </div>
    </div>
  );
}
