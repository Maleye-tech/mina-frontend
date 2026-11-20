import { MailWarning } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function PendingBanner() {
  const user = useAuthStore((s) => s.user);
  if (!user || user.emailVerified !== false) return null;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
      <MailWarning className="mt-0.5 shrink-0" size={18} />
      <div>
        <p className="text-sm font-extrabold">Adresse e-mail non vérifiée</p>
        <p className="mt-1 text-xs leading-5">
          Consulte l’email envoyé à <strong>{user.email}</strong> et clique sur le lien de
          vérification pour activer toutes les fonctions.
        </p>
      </div>
    </div>
  );
}
