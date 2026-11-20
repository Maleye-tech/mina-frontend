import { useCallback, useEffect, useState } from "react";
import { Clock, MapPin, MessageCircle, Phone, Siren } from "lucide-react";
import { Badge, Button, Card } from "../../../../components/ui/Primitives";
import { errorMessage } from "../../../../lib/api";
import { wellbeingService } from "../../../../services/wellbeingService";
import type { EmergencyContact } from "../../../../types/wellbeing";
import { ConsentModal } from "./ConsentModal";

export function CareHome({ onOpenChat }: { onOpenChat: () => void }) {
  const [contacts, setContacts] = useState<EmergencyContact[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await wellbeingService.emergencyContacts();
      setContacts(res);
    } catch (e) {
      setContacts(null);
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const consentHint = error.includes("consentement");

  useEffect(() => {
    if (consentHint) setConsentOpen(true);
  }, [consentHint]);

  return (
    <div className="space-y-6">
      <Card className="!border-red-200 dark:!border-red-400/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.2em] text-red-600">
              <Siren size={14} />
              SOS · Aide immédiate
            </p>
            <h2 className="mt-1.5 text-lg font-extrabold">Contacts d’urgence</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Numéros validés par nos partenaires. En cas de danger immédiat, appelle-les
              directement.
            </p>
          </div>
        </div>

        {loading && (
          <p className="mt-4 rounded-xl border border-dashed border-line p-6 text-center text-sm font-bold text-slate-400 dark:border-white/10">
            Chargement des contacts…
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
            <p>{error}</p>
            {consentHint && (
              <Button
                variant="care"
                className="mt-3"
                onClick={() => setConsentOpen(true)}
              >
                Accorder le consentement
              </Button>
            )}
            {!consentHint && (
              <Button variant="secondary" className="mt-3" onClick={() => void load()}>
                Réessayer
              </Button>
            )}
          </div>
        )}

        {!loading && !error && contacts && contacts.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-line p-6 text-center text-sm font-bold text-slate-400 dark:border-white/10">
            Aucun contact d’urgence publié pour le moment.
          </p>
        )}

        {!loading && contacts && contacts.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-white p-4 dark:border-white/8 dark:bg-panel"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold">{c.name}</p>
                  {c.availability && <Badge tone="red">{c.availability}</Badge>}
                </div>
                {c.role_or_description && (
                  <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {c.role_or_description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${c.phone_number.replace(/\s+/g, "")}`}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-red-600 px-4 text-xs font-extrabold text-white transition hover:bg-red-700"
                  >
                    <Phone size={14} />
                    {c.phone_number}
                  </a>
                  {c.address && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      <MapPin size={13} />
                      {c.address}
                    </span>
                  )}
                  {c.availability && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      <Clock size={13} />
                      {c.availability}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-care">
              Écoute bienveillante
            </p>
            <h2 className="mt-1.5 text-lg font-extrabold">Besoin d’en parler maintenant ?</h2>
            <p className="mt-1 max-w-lg text-xs leading-5 text-slate-500 dark:text-slate-400">
              Le tchat sécurisé te met en relation avec une personne de confiance, sans jugement et
              en toute confidentialité.
            </p>
          </div>
          <Button variant="care" onClick={onOpenChat}>
            <MessageCircle size={15} />
            Ouvrir le tchat sécurisé
          </Button>
        </div>
      </Card>

      <ConsentModal
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        onGranted={() => {
          setConsentOpen(false);
          void load();
        }}
      />
    </div>
  );
}
