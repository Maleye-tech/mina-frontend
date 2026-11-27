import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AlertTriangle, LoaderCircle, Phone, Siren, X } from "lucide-react";
import { errorMessage } from "../../lib/api";
import { careService } from "../../services/careService";
import { wellbeingService } from "../../services/wellbeingService";
import type { EmergencyContact } from "../../types/wellbeing";
import { Button } from "../ui/Primitives";

export function UrgentHelpModal({
  open,
  appointmentId,
  onClose,
  onSent,
}: {
  open: boolean;
  appointmentId?: number;
  onClose: () => void;
  onSent?: () => void;
}) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError("");
    try {
      setContacts(await wellbeingService.emergencyContacts());
    } catch (reason) {
      setContacts([]);
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSent(false);
    closeRef.current?.focus();
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, sending, onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      await careService.createAlert({
        appointment_id: appointmentId,
        message: message.trim() || undefined,
      });
      setSent(true);
      setMessage("");
      onSent?.();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/60 p-3 sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="urgent-help-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[26px] bg-white p-5 shadow-2xl dark:bg-panel sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10">
            <Siren size={23} />
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer l’aide urgente"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8"
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="urgent-help-title" className="mt-4 text-xl font-extrabold text-ink dark:text-white">
          Besoin d’une aide immédiate ?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          En cas de danger immédiat, contacte directement un service d’urgence local. Les numéros
          ci-dessous proviennent de la configuration de Mina et de ses partenaires.
        </p>

        {loading ? (
          <div role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/5">
            <LoaderCircle className="animate-spin" size={17} /> Chargement des contacts configurés…
          </div>
        ) : contacts.length ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-2xl border border-line p-3 dark:border-white/10">
                <p className="text-sm font-extrabold text-ink dark:text-white">{contact.name}</p>
                {contact.availability && (
                  <p className="mt-0.5 text-[11px] font-bold text-red-600">{contact.availability}</p>
                )}
                <a
                  href={`tel:${contact.phone_number.replace(/\s+/g, "")}`}
                  className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-red-600 px-3 text-xs font-extrabold text-white"
                >
                  <Phone size={14} /> {contact.phone_number}
                </a>
              </div>
            ))}
          </div>
        ) : !error ? (
          <p className="mt-5 rounded-xl border border-dashed border-line p-4 text-xs leading-5 text-slate-500 dark:border-white/10">
            Aucun numéro n’est actuellement publié. Contacte une personne de confiance ou rends-toi
            dans le service de santé le plus proche.
          </p>
        ) : null}

        {error && (
          <div role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold leading-5 text-red-700 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="my-5 h-px bg-line dark:bg-white/8" />
        {sent ? (
          <div role="status" className="rounded-2xl bg-teal-50 p-4 text-sm font-bold leading-6 text-teal-900 dark:bg-teal-400/10 dark:text-teal-100">
            Ton alerte a été transmise aux professionnels vérifiés. Si le danger est immédiat, appelle
            un service d’urgence local sans attendre.
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:bg-amber-400/10 dark:text-amber-100">
              <AlertTriangle className="mt-0.5 shrink-0" size={16} />
              <p>
                Cette alerte ne garantit pas une réponse immédiate et ne remplace pas les services
                d’urgence. Seuls les professionnels vérifiés la consultent.
              </p>
            </div>
            <label className="mt-4 block text-sm font-extrabold text-ink dark:text-white">
              Que se passe-t-il ? <span className="font-normal text-slate-400">(facultatif)</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Décris brièvement ton besoin…"
                className="mt-2 w-full resize-y rounded-xl border border-line bg-white p-3 text-sm font-normal outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5"
              />
            </label>
            {error && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button type="submit" loading={sending} className="!bg-red-600 hover:!bg-red-700">
                  Envoyer l’alerte
                </Button>
                <Link to="/espace/consentement" className="text-xs font-extrabold text-mina">
                  Voir le consentement
                </Link>
              </div>
            )}
            {!error && (
              <Button type="submit" loading={sending} className="mt-4 w-full !bg-red-600 hover:!bg-red-700">
                Transmettre mon alerte
              </Button>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
