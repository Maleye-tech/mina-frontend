import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MessageCircle,
  Video,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { ChatWindow } from "../../../components/care/ChatWindow";
import { UrgentHelpModal } from "../../../components/care/UrgentHelpModal";
import {
  CareLoading,
  CarePageHeader,
  ConfirmDialog,
  ConfidentialityNotice,
  EmptyState,
  ErrorBanner,
  StatusBadge,
  formatCareDate,
  formatCareTime,
} from "../../../components/care/CarePrimitives";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { ApiError, errorMessage } from "../../../lib/api";
import { careService } from "../../../services/careService";
import type { CareAppointment } from "../../../types/care";

type Mutation = "accept" | "cancel" | null;

function canCancel(appointment: CareAppointment): boolean {
  return ["requested", "pending", "proposed", "confirmed"].includes(appointment.status);
}

function safeMeetingUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function CareAppointmentDetailPage() {
  const { id } = useParams();
  const appointmentId = Number(id);
  const validAppointmentId = Number.isSafeInteger(appointmentId) && appointmentId > 0;
  const [appointment, setAppointment] = useState<CareAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mutation, setMutation] = useState<Mutation>(null);
  const [mutationError, setMutationError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [urgentOpen, setUrgentOpen] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(
    async (showLoading = true) => {
      if (!validAppointmentId) {
        setLoading(false);
        setLoadError("Ce rendez-vous est introuvable.");
        return;
      }

      const currentRequest = ++requestId.current;
      if (showLoading) setLoading(true);
      setLoadError("");
      try {
        const result = await careService.getAppointment(appointmentId);
        if (currentRequest !== requestId.current) return;
        setAppointment(result);
      } catch (reason) {
        if (currentRequest !== requestId.current) return;
        setLoadError(errorMessage(reason));
      } finally {
        if (showLoading && currentRequest === requestId.current) setLoading(false);
      }
    },
    [appointmentId, validAppointmentId],
  );

  useEffect(() => {
    setAppointment(null);
    setMutationError("");
    setNotice("");
    setConfirmCancelOpen(false);
    setUrgentOpen(false);
    void load();
    return () => {
      requestId.current += 1;
    };
  }, [load]);

  const acceptProposal = async () => {
    if (!appointment || appointment.status !== "proposed" || mutation) return;
    setMutation("accept");
    setMutationError("");
    setNotice("");
    try {
      const updated = await careService.acceptProposal(appointment.id);
      setAppointment(updated);
      setNotice(
        updated.status === "confirmed"
          ? "Le créneau proposé est confirmé. La messagerie est maintenant ouverte : tu peux écrire au professionnel depuis cette page."
          : "La proposition a été acceptée. Consulte le statut ci-dessous.",
      );
      await load(false);
    } catch (reason) {
      setMutationError(errorMessage(reason));
      if (reason instanceof ApiError && reason.status === 422) await load(false);
    } finally {
      setMutation(null);
    }
  };

  const cancelAppointment = async () => {
    if (!appointment || mutation) return;
    setMutation("cancel");
    setMutationError("");
    setNotice("");
    try {
      const updated = await careService.cancelAppointment(appointment.id);
      setAppointment(updated);
      setConfirmCancelOpen(false);
      setNotice("Le rendez-vous a été annulé.");
      await load(false);
    } catch (reason) {
      setConfirmCancelOpen(false);
      setMutationError(errorMessage(reason));
      if (reason instanceof ApiError && reason.status === 422) await load(false);
    } finally {
      setMutation(null);
    }
  };

  const meetingUrl =
    appointment &&
    (appointment.status === "confirmed" || appointment.status === "completed") &&
    appointment.consultation_type !== "chat"
      ? safeMeetingUrl(appointment.meeting_url)
      : null;

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Mes rendez-vous"
        title={
          appointment
            ? `Rendez-vous avec ${appointment.professional.display_name}`
            : "Détail du rendez-vous"
        }
        description="Retrouve les informations utiles et ta conversation avec le professionnel."
        actions={
          <Link
            to="/espace/rendez-vous"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold text-mina hover:border-mina/40 dark:border-white/10 dark:bg-white/8"
          >
            <ArrowLeft size={17} /> Mes rendez-vous
          </Link>
        }
      />

      {loadError && <ErrorBanner message={loadError} onRetry={() => void load()} />}
      {mutationError && <ErrorBanner message={mutationError} />}
      {notice && (
        <div
          role="status"
          className="flex gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-bold leading-6 text-teal-900 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-100"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      {loading && !appointment ? (
        <CareLoading label="Chargement du rendez-vous…" />
      ) : !appointment ? (
        !loadError && (
          <EmptyState
            icon={<CalendarDays size={22} />}
            title="Rendez-vous introuvable"
            description="Ce rendez-vous n’existe pas ou ne t’est pas accessible."
            action={
              <Link
                to="/espace/rendez-vous"
                className="inline-flex min-h-11 items-center rounded-xl bg-mina px-5 text-sm font-bold text-white"
              >
                Voir mes rendez-vous
              </Link>
            }
          />
        )
      ) : (
        <>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400">
                  {appointment.professional.specialty_label}
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-ink dark:text-white">
                  {appointment.professional.display_name}
                </h2>
              </div>
              <StatusBadge status={appointment.status} />
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <CalendarDays size={15} className="text-mina" /> Date
                </dt>
                <dd className="mt-1 text-sm font-extrabold capitalize text-ink dark:text-white">
                  {formatCareDate(appointment.scheduled_at)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Clock3 size={15} className="text-mina" /> Horaire
                </dt>
                <dd className="mt-1 text-sm font-extrabold text-ink dark:text-white">
                  {formatCareTime(appointment.scheduled_at)} · {appointment.duration_minutes} min
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  {appointment.consultation_type === "chat" ? (
                    <MessageCircle size={15} className="text-mina" />
                  ) : (
                    <Video size={15} className="text-mina" />
                  )}
                  Mode
                </dt>
                <dd className="mt-1 text-sm font-extrabold text-ink dark:text-white">
                  {appointment.consultation_type === "chat" ? "Chat écrit" : "Visioconférence"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-400">Statut</dt>
                <dd className="mt-1">
                  <Badge tone="slate">{appointment.status_label}</Badge>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold text-slate-400">Motif de consultation</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  {appointment.reason || "Aucun motif indiqué."}
                </dd>
              </div>
            </dl>

            {appointment.status === "proposed" && (
              <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-900 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-100">
                <p className="font-extrabold">Un nouveau créneau t’est proposé</p>
                <p className="mt-1">
                  Accepte le créneau affiché ci-dessus pour confirmer le rendez-vous. La messagerie
                  ne sera disponible qu’après cette confirmation.
                </p>
              </div>
            )}

            {meetingUrl && (
              <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-400/20 dark:bg-teal-400/10">
                <p className="text-sm font-extrabold text-teal-900 dark:text-teal-100">
                  Lien de visioconférence
                </p>
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-mina px-4 text-sm font-bold text-white hover:bg-mina-dark"
                >
                  Ouvrir la visioconférence <ExternalLink size={16} />
                </a>
              </div>
            )}

            {(appointment.status === "confirmed" || appointment.status === "completed") &&
              appointment.consultation_type !== "chat" &&
              !meetingUrl && (
                <p className="mt-5 rounded-xl border border-dashed border-line p-3 text-xs leading-5 text-slate-500 dark:border-white/10">
                  {appointment.status === "completed"
                    ? "Le lien de visioconférence n’est plus disponible."
                    : "Le professionnel n’a pas encore ajouté de lien de visioconférence."}
                </p>
              )}

            {(appointment.status === "proposed" || canCancel(appointment)) && (
              <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5 dark:border-white/8 sm:flex-row">
                {appointment.status === "proposed" && (
                  <Button
                    type="button"
                    loading={mutation === "accept"}
                    disabled={mutation !== null}
                    onClick={() => void acceptProposal()}
                  >
                    <CheckCircle2 size={17} /> Accepter le nouveau créneau
                  </Button>
                )}
                {canCancel(appointment) && (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={mutation !== null}
                    onClick={() => {
                      setMutationError("");
                      setConfirmCancelOpen(true);
                    }}
                    className="text-red-700 dark:text-red-300"
                  >
                    Annuler le rendez-vous
                  </Button>
                )}
              </div>
            )}
          </Card>

          <section aria-labelledby="care-messages-title" className="space-y-3">
            <div>
              <h2
                id="care-messages-title"
                className="text-lg font-extrabold text-ink dark:text-white"
              >
                Messagerie
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Les messages sont accessibles uniquement après confirmation du rendez-vous.
              </p>
            </div>
            <ConfidentialityNotice />
            <ChatWindow
              role="student"
              appointmentId={appointment.id}
              canChat={appointment.can_chat}
              canSendMessages={appointment.can_send_messages}
            />
          </section>

          <Card className="border-red-200 bg-red-50/60 dark:border-red-400/20 dark:bg-red-500/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <AlertTriangle
                  size={22}
                  className="mt-0.5 shrink-0 text-red-600 dark:text-red-300"
                />
                <div>
                  <h2 className="text-base font-extrabold text-ink dark:text-white">
                    Besoin d’une aide immédiate ?
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Une alerte peut être transmise aux professionnels vérifiés avec ce rendez-vous
                    pour contexte. Elle ne remplace pas les services d’urgence.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setUrgentOpen(true)}
                className="shrink-0 !bg-red-600 hover:!bg-red-700"
              >
                Ouvrir l’aide urgente
              </Button>
            </div>
          </Card>
        </>
      )}

      <UrgentHelpModal
        open={urgentOpen}
        appointmentId={appointment?.id}
        onClose={() => setUrgentOpen(false)}
      />
      <ConfirmDialog
        open={confirmCancelOpen}
        title="Annuler ce rendez-vous ?"
        description="Le professionnel sera informé de l’annulation et le créneau sera libéré. Cette action est définitive."
        confirmLabel="Annuler le rendez-vous"
        danger
        loading={mutation === "cancel"}
        onConfirm={() => void cancelAppointment()}
        onClose={() => {
          if (mutation !== "cancel") setConfirmCancelOpen(false);
        }}
      />
    </div>
  );
}
