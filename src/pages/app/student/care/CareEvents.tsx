import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge, Button, Card } from "../../../../components/ui/Primitives";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { eventsService } from "../../../../services/eventsService";
import { errorMessage } from "../../../../lib/api";
import { toast } from "../../../../store/toastStore";
import type { CareEvent, EventRegistration } from "../../../../types/event";

export function CareEvents() {
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [eventsRes, regsRes] = await Promise.allSettled([
        eventsService.list(),
        eventsService.myRegistrations().catch(() => []),
      ]);

      if (eventsRes.status === "fulfilled") {
        setEvents(eventsRes.value);
      }
      if (regsRes.status === "fulfilled") {
        setMyRegistrations(regsRes.value);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const registeredEventIds = new Set(
    myRegistrations
      .filter((registration) => registration.status === "confirmed")
      .flatMap((registration) => (registration.event ? [registration.event.id] : [])),
  );

  const handleRegister = async (event: CareEvent) => {
    setActionBusy(event.id);
    try {
      const res = await eventsService.register(event.id);
      toast.success(res.message || "Inscription validée !");
      await loadData();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionBusy(null);
    }
  };

  const handleUnregister = async (event: CareEvent) => {
    if (!confirm("Souhaites-tu annuler ton inscription à cet atelier ?")) return;
    setActionBusy(event.id);
    try {
      const res = await eventsService.unregister(event.id);
      toast.success(res.message || "Inscription annulée.");
      await loadData();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold">Événements & Ateliers de prévention</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Sessions interactives animées par des professionnels de santé et le CROUS.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void loadData()}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : "mr-1.5"} />
          Actualiser
        </Button>
      </div>

      {error && (
        <Card className="!border-red-200 bg-red-50/50 p-4 dark:!border-red-500/20 dark:bg-red-500/10">
          <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {loading && events.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <LoaderCircle size={28} className="animate-spin text-care" />
          <p className="mt-4 text-xs font-bold text-slate-400">
            Chargement des événements depuis le serveur Mina…
          </p>
        </Card>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={24} />}
          title="Aucun événement à venir"
          description="De nouveaux ateliers et webinaires de prévention seront programmés prochainement."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((evt) => {
            const startsAt = new Date(evt.starts_at);
            const locationUrl =
              evt.location_or_link && /^https?:\/\//i.test(evt.location_or_link)
                ? evt.location_or_link
                : null;
            const isOnline = evt.type === "webinar" || locationUrl !== null;
            const isRegistered = registeredEventIds.has(evt.id) || evt.is_registered;

            return (
              <Card key={evt.id} className="flex flex-col justify-between p-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge tone={isOnline ? "teal" : "violet"}>
                      {isOnline ? "En ligne · Visioconférence" : evt.type_label ?? "Atelier"}
                    </Badge>
                    <div className="flex flex-wrap gap-2">
                      {evt.is_full && !isRegistered && <Badge tone="red">Complet</Badge>}
                      {isRegistered && (
                        <Badge tone="teal">
                          <CheckCircle2 size={12} className="mr-1" />
                          Inscrit
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-3 text-sm font-extrabold leading-snug">{evt.title}</h3>
                  {evt.description && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-3">
                      {evt.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-2 border-t border-line pt-3 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-care flex-shrink-0" />
                      <span>
                        {startsAt.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        {` à ${startsAt.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                      </span>
                    </div>

                    {evt.location_or_link && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                        {locationUrl ? (
                          <a
                            href={locationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-care hover:underline"
                          >
                            Lien de connexion
                          </a>
                        ) : (
                          <span>{evt.location_or_link}</span>
                        )}
                      </div>
                    )}

                    {evt.presenter_name && (
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500 flex-shrink-0" />
                        <span>Intervenant : {evt.presenter_name}</span>
                      </div>
                    )}

                    {evt.max_participants != null && (
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400 flex-shrink-0" />
                        <span>
                          {evt.current_participants ?? 0} / {evt.max_participants} places réservées
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-line dark:border-white/10">
                  {isRegistered ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center">
                        <CheckCircle2 size={14} className="mr-1.5" />
                        Place confirmée
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-500 hover:text-red-600"
                        disabled={actionBusy === evt.id}
                        onClick={() => void handleUnregister(evt)}
                      >
                        {actionBusy === evt.id ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          "Se désinscrire"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="care"
                      size="sm"
                      className="w-full"
                      disabled={actionBusy === evt.id || evt.is_full}
                      onClick={() => void handleRegister(evt)}
                    >
                      {actionBusy === evt.id ? (
                        <LoaderCircle size={14} className="animate-spin" />
                      ) : evt.is_full ? (
                        "Atelier complet"
                      ) : (
                        "Participer à l'atelier"
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
