import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "../../../../components/ui/Primitives";
import { errorMessage } from "../../../../lib/api";
import { authService } from "../../../../services/authService";
import { useAuthStore } from "../../../../store/authStore";
import { toast } from "../../../../store/toastStore";

/**
 * Panneau de consentement « données de santé mentale » affiché dès qu'une
 * route Mina Care renvoie 403 (middleware consent:mental_health_data).
 * Enregistre le consentement via PATCH /auth/settings puis recharge la page.
 */
export function ConsentModal({
  open,
  onClose,
  onGranted,
}: {
  open: boolean;
  onClose: () => void;
  onGranted: () => void;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const accept = async () => {
    setBusy(true);
    setError("");
    try {
      const user = await authService.updateSettings({
        consents: { mental_health_data: true },
      });
      setUser(user);
      toast.success("Consentement enregistré. Mina Care est désormais accessible.");
      setChecked(false);
      onGranted();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        className="w-full max-w-md rounded-[22px] bg-white p-6 shadow-card dark:bg-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-care/10 text-care">
            <ShieldCheck size={22} />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:text-mina dark:hover:bg-white/8"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <h2 id="consent-title" className="mt-4 text-lg font-extrabold">
          Consentement requis pour Mina Care
        </h2>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Avant d’accéder aux tests d’auto-évaluation, aux fiches et aux contacts d’urgence, nous
          avons besoin de ton accord pour traiter tes <strong>données de santé mentale</strong>. Tu
          peux le retirer à tout moment depuis ton profil.
        </p>

        <label className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 text-xs leading-5 dark:bg-white/5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-care"
          />
          <span>
            J’accepte le traitement de mes <strong>données de santé mentale</strong> liées à Mina
            Care.
          </span>
        </label>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-[11px] font-bold text-red-600 dark:bg-red-500/10">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Plus tard
          </Button>
          <Button variant="care" onClick={() => void accept()} disabled={!checked} loading={busy}>
            Accepter et continuer
          </Button>
        </div>
      </div>
    </div>
  );
}
