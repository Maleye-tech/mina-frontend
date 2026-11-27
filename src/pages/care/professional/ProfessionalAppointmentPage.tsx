import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Link2,
  LockKeyhole,
  MessageCircle,
  NotebookPen,
  Save,
  ShieldCheck,
  Video,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { ApiError, errorMessage } from "@/lib/api";
import { careService } from "@/services/careService";
import type { CareAppointment, CareAvailabilitySlot } from "@/types/care";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import { ChatWindow } from "@/components/care/ChatWindow";
import { SlotPicker } from "@/components/care/SlotPicker";
import {
  CareLoading,
  CarePageHeader,
  ConfidentialityNotice,
  ConfirmDialog,
  ErrorBanner,
  StatusBadge,
  formatCareDate,
  formatCareTime,
} from "@/components/care/CarePrimitives";

type BusyAction = "confirm" | "decline" | "propose" | "complete" | "meeting" | "note" | null;

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isPendingStatus(status: CareAppointment["status"]): boolean {
  return status === "requested" || status === "pending" || status === "proposed";
}

export function ProfessionalAppointmentPage() {
  const { id } = useParams();
  const parsedId = Number(id);
  const appointmentId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;

  const [appointment, setAppointment] = useState<CareAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState<BusyAction>(null);

  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineConfirmOpen, setDeclineConfirmOpen] = useState(false);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalSlots, setProposalSlots] = useState<CareAvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotsForbidden, setSlotsForbidden] = useState(false);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);

  const [meetingDraft, setMeetingDraft] = useState("");
  const [meetingError, setMeetingError] = useState("");

  const [noteBody, setNoteBody] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteLoaded, setNoteLoaded] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [noteSuccess, setNoteSuccess] = useState("");

  const canAccessNote = appointment?.status === "confirmed" || appointment?.status === "completed";

  const loadAppointment = useCallback(async () => {
    if (!appointmentId) {
      setError("L’identifiant du rendez-vous est invalide.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setForbidden(false);
    try {
      const nextAppointment = await careService.getProfessionalAppointment(appointmentId);
      setAppointment(nextAppointment);
      setMeetingDraft(nextAppointment.meeting_url ?? "");
    } catch (reason) {
      setError(errorMessage(reason));
      setForbidden(reason instanceof ApiError && reason.status === 403);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    void loadAppointment();
  }, [loadAppointment]);

  const loadNote = useCallback(async () => {
    if (!appointmentId || !canAccessNote) return;
    setNoteLoading(true);
    setNoteLoaded(false);
    setNoteError("");
    try {
      const note = await careService.getSessionNote(appointmentId);
      setNoteBody(note?.body ?? "");
      setNoteLoaded(true);
    } catch (reason) {
      setNoteError(errorMessage(reason));
    } finally {
      setNoteLoading(false);
    }
  }, [appointmentId, canAccessNote]);

  useEffect(() => {
    if (canAccessNote) {
      void loadNote();
    } else {
      setNoteBody("");
      setNoteLoaded(false);
      setNoteError("");
      setNoteSuccess("");
    }
  }, [canAccessNote, loadNote]);

  const loadProposalSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSlotsError("");
    setSlotsForbidden(false);
    try {
      setProposalSlots(await careService.getProfessionalAvailability());
    } catch (reason) {
      setSlotsError(errorMessage(reason));
      setSlotsForbidden(reason instanceof ApiError && reason.status === 403);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const applyAppointment = (nextAppointment: CareAppointment) => {
    setAppointment(nextAppointment);
    setMeetingDraft(nextAppointment.meeting_url ?? "");
  };

  const confirmAppointment = async () => {
    if (!appointment || busy) return;
    setBusy("confirm");
    setError("");
    setSuccess("");
    try {
      applyAppointment(await careService.confirmAppointment(appointment.id));
      setSuccess("Le rendez-vous a été confirmé. La messagerie sécurisée est ouverte.");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(null);
    }
  };

  const declineAppointment = async () => {
    if (!appointment || busy) return;
    setBusy("decline");
    setError("");
    setSuccess("");
    try {
      applyAppointment(await careService.declineAppointment(appointment.id));
      setDeclineOpen(false);
      setDeclineConfirmOpen(false);
      setSuccess("La demande a été déclinée et le créneau a été libéré.");
    } catch (reason) {
      setError(errorMessage(reason));
      setDeclineConfirmOpen(false);
    } finally {
      setBusy(null);
    }
  };

  const openProposal = async () => {
    if (!appointment || busy) return;
    setProposalOpen(true);
    setSelectedSlotId(null);
    setDeclineOpen(false);
    setDeclineConfirmOpen(false);
    setSuccess("");
    await loadProposalSlots();
  };

  const proposeSlot = async () => {
    if (!appointment || !selectedSlotId || busy) return;
    setBusy("propose");
    setError("");
    setSuccess("");
    try {
      applyAppointment(await careService.proposeSlot(appointment.id, selectedSlotId));
      setProposalOpen(false);
      setSelectedSlotId(null);
      setSuccess("Le nouveau créneau a été proposé à l’étudiant.");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(null);
    }
  };

  const completeAppointment = async () => {
    if (!appointment || busy) return;
    setBusy("complete");
    setError("");
    setSuccess("");
    try {
      applyAppointment(await careService.completeAppointment(appointment.id));
      setCompleteConfirmOpen(false);
      setSuccess("La séance a été marquée comme terminée.");
    } catch (reason) {
      setError(errorMessage(reason));
      setCompleteConfirmOpen(false);
    } finally {
      setBusy(null);
    }
  };

  const saveMeetingUrl = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!appointment || busy) return;
    const value = meetingDraft.trim();
    if (!isHttpsUrl(value) || value.length > 500) {
      setMeetingError("Saisis un lien HTTPS valide de 500 caractères maximum.");
      return;
    }

    setBusy("meeting");
    setMeetingError("");
    setError("");
    setSuccess("");
    try {
      applyAppointment(await careService.updateMeetingUrl(appointment.id, value));
      setSuccess("Le lien sécurisé de visioconférence a été enregistré.");
    } catch (reason) {
      setMeetingError(errorMessage(reason));
    } finally {
      setBusy(null);
    }
  };

  const saveNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!appointment || !canAccessNote || busy) return;
    if (!noteBody.trim()) {
      setNoteError("Le contenu de la note confidentielle est requis.");
      return;
    }
    if (noteBody.length > 20_000) {
      setNoteError("La note ne doit pas dépasser 20 000 caractères.");
      return;
    }

    setBusy("note");
    setNoteError("");
    setNoteSuccess("");
    try {
      const note = await careService.saveSessionNote(appointment.id, noteBody);
      setNoteBody(note.body);
      setAppointment((current) => (current ? { ...current, has_private_note: true } : current));
      setNoteSuccess("Note confidentielle enregistrée explicitement.");
    } catch (reason) {
      setNoteError(errorMessage(reason));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CarePageHeader eyebrow="Espace professionnel" title="Détail du rendez-vous" />
        <CareLoading label="Chargement du rendez-vous…" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-6">
        <CarePageHeader
          eyebrow="Espace professionnel"
          title="Détail du rendez-vous"
          actions={
            <Link
              to="/pro/demandes"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold text-ink dark:border-white/10 dark:bg-white/8 dark:text-white"
            >
              <ArrowLeft size={16} /> Retour aux demandes
            </Link>
          }
        />
        <ErrorBanner
          message={error || "Rendez-vous introuvable."}
          onRetry={() => void loadAppointment()}
        />
        {forbidden && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Ton profil doit être vérifié et ta charte acceptée pour accéder aux rendez-vous.
              </p>
              <Link to="/pro/onboarding" className="shrink-0">
                <Button variant="secondary">Voir mon profil</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    );
  }

  const pending = isPendingStatus(appointment.status);

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Espace professionnel"
        title="Détail du rendez-vous"
        description="Consulte les informations anonymes et pilote le suivi de la consultation."
        actions={
          <Link
            to="/pro/demandes"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold text-ink hover:border-mina/40 dark:border-white/10 dark:bg-white/8 dark:text-white"
          >
            <ArrowLeft size={16} /> Retour aux demandes
          </Link>
        }
      />

      {error && <ErrorBanner message={error} onRetry={() => void loadAppointment()} />}
      {success && (
        <p
          role="status"
          className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-bold text-teal-900 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-100"
        >
          {success}
        </p>
      )}

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-ink dark:text-white">
                {appointment.student?.pseudonym ?? "Étudiant anonyme"}
              </h2>
              <Badge tone="teal">
                <LockKeyhole size={13} /> Identité anonyme
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Seul le pseudonyme est accessible. Aucun nom, e-mail ou identifiant étudiant réel
              n’est affiché.
            </p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <dt className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <CalendarDays size={15} className="text-mina" /> Date
            </dt>
            <dd className="mt-2 text-sm font-extrabold capitalize text-ink dark:text-white">
              {formatCareDate(appointment.scheduled_at)}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <dt className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Clock3 size={15} className="text-mina" /> Horaire
            </dt>
            <dd className="mt-2 text-sm font-extrabold text-ink dark:text-white">
              {formatCareTime(appointment.scheduled_at)} · {appointment.duration_minutes} min
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <dt className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              {appointment.consultation_type === "chat" ? (
                <MessageCircle size={15} className="text-mina" />
              ) : (
                <Video size={15} className="text-mina" />
              )}
              Mode
            </dt>
            <dd className="mt-2 text-sm font-extrabold text-ink dark:text-white">
              {appointment.consultation_type === "chat" ? "Chat écrit" : "Visioconférence"}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <dt className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <ShieldCheck size={15} className="text-mina" /> Confidentialité
            </dt>
            <dd className="mt-2 text-sm font-extrabold text-ink dark:text-white">
              Échanges protégés
            </dd>
          </div>
        </dl>

        <div className="mt-5 rounded-2xl border border-line p-4 dark:border-white/10">
          <h3 className="text-sm font-extrabold text-ink dark:text-white">Motif de consultation</h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
            {appointment.reason || "Aucun motif n’a été renseigné par l’étudiant."}
          </p>
        </div>
      </Card>

      {pending && (
        <Card>
          <h2 className="text-lg font-extrabold text-ink dark:text-white">Répondre à la demande</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Confirme le créneau, décline la demande ou propose une alternative disponible.
          </p>
          {appointment.status === "proposed" && (
            <p className="mt-4 rounded-2xl bg-violet-50 p-4 text-sm font-bold text-violet-800 dark:bg-violet-400/10 dark:text-violet-200">
              Le nouveau créneau a été proposé. Tu peux modifier la proposition ou attendre la
              réponse de l’étudiant avant de confirmer le rendez-vous.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {appointment.status !== "proposed" && (
              <Button
                onClick={() => void confirmAppointment()}
                loading={busy === "confirm"}
                disabled={busy !== null}
              >
                <CheckCircle2 size={17} /> Confirmer le rendez-vous
              </Button>
            )}
            {appointment.status !== "pending" && (
              <Button
                variant="secondary"
                onClick={() => void openProposal()}
                disabled={busy !== null}
              >
                <CalendarClock size={17} /> Proposer un autre créneau
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setDeclineOpen(true);
                setDeclineConfirmOpen(false);
                setProposalOpen(false);
                setSuccess("");
              }}
              disabled={busy !== null}
              className="!text-red-600"
            >
              <XCircle size={17} /> Décliner
            </Button>
          </div>

          {declineOpen && (
            <div className="mt-5 border-t border-line pt-5 dark:border-white/8">
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                Le déclin libérera le créneau réservé. L’API ne conserve pas encore de motif de
                refus.
              </p>
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setDeclineOpen(false)}
                  disabled={busy !== null}
                >
                  Annuler
                </Button>
                <Button onClick={() => setDeclineConfirmOpen(true)} disabled={busy !== null}>
                  Continuer
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {proposalOpen && pending && (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-ink dark:text-white">
                Proposer un autre créneau
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Le créneau actuel sera libéré et le nouveau créneau sera réservé pour cette
                proposition.
              </p>
            </div>
            <Badge tone="violet">Alternative</Badge>
          </div>
          <div className="mt-5">
            {slotsLoading ? (
              <CareLoading label="Chargement des créneaux disponibles…" />
            ) : slotsError ? (
              <ErrorBanner message={slotsError} onRetry={() => void loadProposalSlots()} />
            ) : (
              <SlotPicker
                slots={proposalSlots}
                selectedId={selectedSlotId}
                onSelect={(slot) => setSelectedSlotId(slot.id)}
                disabled={busy !== null}
              />
            )}
          </div>
          {slotsForbidden && (
            <Link to="/pro/onboarding" className="mt-4 inline-block text-sm font-bold text-mina">
              Faire valider mon profil
            </Link>
          )}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setProposalOpen(false)} disabled={busy !== null}>
              Annuler
            </Button>
            <Button
              onClick={() => void proposeSlot()}
              loading={busy === "propose"}
              disabled={!selectedSlotId || busy !== null || slotsLoading || Boolean(slotsError)}
            >
              Proposer ce créneau
            </Button>
          </div>
        </Card>
      )}

      {appointment.status === "confirmed" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {appointment.consultation_type !== "chat" && (
            <Card>
              <div className="flex items-start gap-3">
                <Link2 className="mt-0.5 shrink-0 text-mina" size={21} />
                <div>
                  <h2 className="text-lg font-extrabold text-ink dark:text-white">
                    Lien de visioconférence
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Utilise un lien externe HTTPS. Aucune visioconférence n’est intégrée à Mina.
                  </p>
                </div>
              </div>
              <form onSubmit={saveMeetingUrl} className="mt-5 space-y-4" noValidate>
                <label className="block">
                  <span className="text-sm font-bold text-ink dark:text-white">
                    URL HTTPS sécurisée
                  </span>
                  <input
                    type="url"
                    inputMode="url"
                    value={meetingDraft}
                    onChange={(event) => setMeetingDraft(event.target.value)}
                    maxLength={500}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="https://…"
                    aria-invalid={Boolean(meetingError)}
                    aria-describedby={meetingError ? "meeting-url-error" : "meeting-url-help"}
                    className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5"
                  />
                  <span
                    id="meeting-url-help"
                    className="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                  >
                    500 caractères maximum. Le lien doit commencer par https://.
                  </span>
                  {meetingError && (
                    <span
                      id="meeting-url-error"
                      className="mt-1 block text-xs font-bold text-red-600"
                    >
                      {meetingError}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" loading={busy === "meeting"} disabled={busy !== null}>
                    <Save size={16} /> Enregistrer le lien
                  </Button>
                  {appointment.meeting_url && isHttpsUrl(appointment.meeting_url) && (
                    <a
                      href={appointment.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold text-ink hover:border-mina/40 dark:border-white/10 dark:bg-white/8 dark:text-white"
                    >
                      Ouvrir le lien <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </form>
            </Card>
          )}

          <Card>
            <h2 className="text-lg font-extrabold text-ink dark:text-white">Terminer la séance</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Marque le rendez-vous comme terminé lorsque la consultation est achevée. La messagerie
              restera consultable, mais l’envoi de messages sera fermé.
            </p>
            <Button
              className="mt-5"
              onClick={() => setCompleteConfirmOpen(true)}
              disabled={busy !== null}
            >
              <CheckCircle2 size={17} /> Marquer comme terminé
            </Button>
          </Card>
        </div>
      )}

      {appointment.status === "completed" &&
        appointment.consultation_type !== "chat" &&
        appointment.meeting_url &&
        isHttpsUrl(appointment.meeting_url) && (
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-ink dark:text-white">
                  Lien de visioconférence
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Le lien de la séance reste accessible depuis le détail du rendez-vous.
                </p>
              </div>
              <a
                href={appointment.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold text-ink hover:border-mina/40 dark:border-white/10 dark:bg-white/8 dark:text-white"
              >
                Ouvrir le lien <ExternalLink size={15} />
              </a>
            </div>
          </Card>
        )}

      <section className="space-y-3" aria-labelledby="secure-chat-title">
        <div>
          <h2 id="secure-chat-title" className="text-lg font-extrabold text-ink dark:text-white">
            Conversation sécurisée
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Les messages ne sont jamais conservés dans le stockage local de cet appareil.
          </p>
        </div>
        <ConfidentialityNotice />
        <ChatWindow
          role="professional"
          appointmentId={appointment.id}
          canChat={appointment.can_chat}
          canSendMessages={appointment.can_send_messages}
        />
      </section>

      {canAccessNote && (
        <Card>
          <div className="flex items-start gap-3">
            <NotebookPen className="mt-0.5 shrink-0 text-mina" size={22} />
            <div>
              <h2 className="text-lg font-extrabold text-ink dark:text-white">
                Note privée de séance
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Cette note est réservée au professionnel. Elle n’est pas partagée avec l’étudiant et
                n’est enregistrée que lorsque tu cliques explicitement sur le bouton
                d’enregistrement.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <ConfidentialityNotice />
          </div>

          {noteLoading ? (
            <CareLoading label="Chargement de la note confidentielle…" />
          ) : !noteLoaded ? (
            <div className="mt-5">
              <ErrorBanner
                message={noteError || "La note confidentielle n’a pas pu être chargée."}
                onRetry={() => void loadNote()}
              />
            </div>
          ) : (
            <form onSubmit={saveNote} className="mt-5 space-y-4" noValidate>
              {noteError && <ErrorBanner message={noteError} />}
              {noteSuccess && (
                <p role="status" className="text-sm font-bold text-mina">
                  {noteSuccess}
                </p>
              )}
              <label className="block">
                <span className="flex items-center justify-between text-sm font-bold text-ink dark:text-white">
                  Contenu de la note
                  <span className="text-xs font-normal text-slate-400">
                    {noteBody.length} / 20 000
                  </span>
                </span>
                <textarea
                  value={noteBody}
                  onChange={(event) => setNoteBody(event.target.value)}
                  maxLength={20_000}
                  rows={8}
                  placeholder="Rédige une note clinique factuelle et confidentielle."
                  className="mt-2 w-full resize-y rounded-xl border border-line bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5"
                />
              </label>
              <div className="flex justify-end">
                <Button type="submit" loading={busy === "note"} disabled={busy !== null}>
                  <Save size={16} /> Enregistrer explicitement la note
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={declineConfirmOpen}
        title="Décliner cette demande ?"
        description="L’étudiant sera informé du déclin et le créneau réservé sera libéré."
        confirmLabel="Décliner la demande"
        danger
        loading={busy === "decline"}
        onConfirm={() => void declineAppointment()}
        onClose={() => {
          if (busy === null) setDeclineConfirmOpen(false);
        }}
      />
      <ConfirmDialog
        open={completeConfirmOpen}
        title="Marquer la séance comme terminée ?"
        description="Cette action clôt l’envoi de messages. Tu pourras toujours consulter la conversation et enregistrer une note privée."
        confirmLabel="Marquer comme terminé"
        loading={busy === "complete"}
        onConfirm={() => void completeAppointment()}
        onClose={() => {
          if (busy === null) setCompleteConfirmOpen(false);
        }}
      />
    </div>
  );
}
