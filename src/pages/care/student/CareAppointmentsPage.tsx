import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, Plus } from "lucide-react";
import { Link } from "react-router";
import {
  AppointmentCard,
  CareLoading,
  CarePageHeader,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  formatCareDate,
} from "../../../components/care/CarePrimitives";
import { Button, Card } from "../../../components/ui/Primitives";
import { ApiError, errorMessage } from "../../../lib/api";
import { careService } from "../../../services/careService";
import type { CareAppointment, CareAppointmentStatus } from "../../../types/care";

type StatusFilter = CareAppointmentStatus | "all";
type Mutation = "accept" | "cancel" | null;

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous les rendez-vous" },
  { value: "requested", label: "Demandes envoyées" },
  { value: "pending", label: "En attente" },
  { value: "proposed", label: "Créneaux proposés" },
  { value: "confirmed", label: "Confirmés" },
  { value: "completed", label: "Terminés" },
  { value: "declined", label: "Déclinés" },
  { value: "cancelled", label: "Annulés" },
];

function canCancel(appointment: CareAppointment): boolean {
  return ["requested", "pending", "proposed", "confirmed"].includes(appointment.status);
}

export function CareAppointmentsPage() {
  const [appointments, setAppointments] = useState<CareAppointment[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [mutation, setMutation] = useState<Mutation>(null);
  const [mutationId, setMutationId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CareAppointment | null>(null);
  const requestId = useRef(0);

  const load = useCallback(
    async (showLoading = true) => {
      const currentRequest = ++requestId.current;
      if (showLoading) setLoading(true);
      setLoadError("");
      try {
        const result = await careService.getAppointments({
          ...(status === "all" ? {} : { status }),
          per_page: 50,
        });
        if (currentRequest !== requestId.current) return;
        setAppointments(result);
      } catch (reason) {
        if (currentRequest !== requestId.current) return;
        setLoadError(errorMessage(reason));
      } finally {
        if (showLoading && currentRequest === requestId.current) setLoading(false);
      }
    },
    [status],
  );

  useEffect(() => {
    setAppointments([]);
    setNotice("");
    setMutationError("");
    void load();
    return () => {
      requestId.current += 1;
    };
  }, [load]);

  const acceptProposal = async (appointment: CareAppointment) => {
    if (mutation || appointment.status !== "proposed") return;
    setMutation("accept");
    setMutationId(appointment.id);
    setMutationError("");
    setNotice("");
    try {
      const updated = await careService.acceptProposal(appointment.id);
      setNotice(
        updated.status === "confirmed"
          ? "Le nouveau créneau est confirmé. Tu peux maintenant ouvrir la conversation depuis le détail du rendez-vous."
          : "La proposition a été acceptée. Consulte le détail pour vérifier le statut du rendez-vous.",
      );
      await load(false);
    } catch (reason) {
      setMutationError(errorMessage(reason));
      if (reason instanceof ApiError && reason.status === 422) await load(false);
    } finally {
      setMutation(null);
      setMutationId(null);
    }
  };

  const cancelAppointment = async () => {
    if (!cancelTarget || mutation) return;
    const target = cancelTarget;
    setMutation("cancel");
    setMutationId(target.id);
    setMutationError("");
    setNotice("");
    try {
      await careService.cancelAppointment(target.id);
      setCancelTarget(null);
      setNotice("Le rendez-vous a été annulé. Le créneau est de nouveau disponible.");
      await load(false);
    } catch (reason) {
      setCancelTarget(null);
      setMutationError(errorMessage(reason));
      if (reason instanceof ApiError && reason.status === 422) await load(false);
    } finally {
      setMutation(null);
      setMutationId(null);
    }
  };

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Mon espace"
        title="Mes rendez-vous"
        description="Suis tes demandes, accepte un nouveau créneau et retrouve tes échanges confirmés."
        actions={
          <Link
            to="/espace/accompagnement"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-mina px-4 text-sm font-bold text-white hover:bg-mina-dark"
          >
            <Plus size={17} /> Prendre rendez-vous
          </Link>
        }
      />

      <Card>
        <label
          htmlFor="care-appointment-status"
          className="block text-xs font-extrabold text-ink dark:text-white"
        >
          Filtrer par statut
        </label>
        <select
          id="care-appointment-status"
          value={status}
          disabled={mutation !== null}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-3 text-sm font-bold text-ink outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 disabled:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:disabled:bg-white/[.02] sm:max-w-xs"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Card>

      {notice && (
        <div
          role="status"
          className="flex gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-bold leading-6 text-teal-900 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-100"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      {loadError && <ErrorBanner message={loadError} onRetry={() => void load()} />}
      {mutationError && <ErrorBanner message={mutationError} />}

      {loading ? (
        <CareLoading label="Chargement de tes rendez-vous…" />
      ) : appointments.length === 0 && !loadError ? (
        <EmptyState
          icon={<CalendarDays size={22} />}
          title={status === "all" ? "Aucun rendez-vous" : "Aucun rendez-vous avec ce statut"}
          description={
            status === "all"
              ? "Choisis un professionnel et un créneau pour envoyer ta première demande."
              : "Modifie le filtre pour consulter tes autres rendez-vous."
          }
          action={
            status === "all" ? (
              <Link
                to="/espace/accompagnement"
                className="inline-flex min-h-11 items-center rounded-xl bg-mina px-5 text-sm font-bold text-white"
              >
                Trouver un professionnel
              </Link>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setStatus("all")}>
                Voir tous les rendez-vous
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {appointments.map((appointment) => {
            const isMutating = mutation !== null && mutationId === appointment.id;
            return (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                perspective="student"
                href={`/espace/rendez-vous/${appointment.id}`}
                action={
                  <>
                    {appointment.status === "proposed" && (
                      <Button
                        type="button"
                        size="sm"
                        loading={isMutating && mutation === "accept"}
                        disabled={mutation !== null}
                        onClick={() => void acceptProposal(appointment)}
                      >
                        Accepter le créneau
                      </Button>
                    )}
                    {canCancel(appointment) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={mutation !== null}
                        onClick={() => {
                          setMutationError("");
                          setCancelTarget(appointment);
                        }}
                      >
                        Annuler
                      </Button>
                    )}
                  </>
                }
              />
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Annuler ce rendez-vous ?"
        description={
          cancelTarget
            ? `Le rendez-vous avec ${cancelTarget.professional.display_name} du ${formatCareDate(cancelTarget.scheduled_at)} sera annulé. Cette action est définitive.`
            : ""
        }
        confirmLabel="Annuler le rendez-vous"
        danger
        loading={mutation === "cancel"}
        onConfirm={() => void cancelAppointment()}
        onClose={() => {
          if (mutation !== "cancel") setCancelTarget(null);
        }}
      />
    </div>
  );
}
