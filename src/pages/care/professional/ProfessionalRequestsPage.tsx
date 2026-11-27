import { useCallback, useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, MessageCircle, ShieldCheck, XCircle } from "lucide-react";
import { Link } from "react-router";
import { ApiError, errorMessage } from "@/lib/api";
import { careService } from "@/services/careService";
import type { CareAppointment, CareAvailabilitySlot } from "@/types/care";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import { SlotPicker } from "@/components/care/SlotPicker";
import {
  AppointmentCard,
  CareLoading,
  CarePageHeader,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
} from "@/components/care/CarePrimitives";

type RequestFilter = "requested" | "pending" | "proposed";

const filters: { value: RequestFilter; label: string }[] = [
  { value: "requested", label: "Demandes reçues" },
  { value: "pending", label: "En attente" },
  { value: "proposed", label: "Créneaux proposés" },
];

const emptyGroups: Record<RequestFilter, CareAppointment[]> = {
  requested: [],
  pending: [],
  proposed: [],
};

export function ProfessionalRequestsPage() {
  const [groups, setGroups] = useState<Record<RequestFilter, CareAppointment[]>>(emptyGroups);
  const [filter, setFilter] = useState<RequestFilter>("requested");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [declineId, setDeclineId] = useState<number | null>(null);
  const [declineConfirmOpen, setDeclineConfirmOpen] = useState(false);
  const [proposingId, setProposingId] = useState<number | null>(null);
  const [proposalSlots, setProposalSlots] = useState<CareAvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotsForbidden, setSlotsForbidden] = useState(false);

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError("");
    setForbidden(false);
    try {
      const [requested, pending, proposed] = await Promise.all([
        careService.getProfessionalAppointments({ status: "requested", per_page: 50 }),
        careService.getProfessionalAppointments({ status: "pending", per_page: 50 }),
        careService.getProfessionalAppointments({ status: "proposed", per_page: 50 }),
      ]);
      setGroups({ requested, pending, proposed });
    } catch (reason) {
      setError(errorMessage(reason));
      setForbidden(reason instanceof ApiError && reason.status === 403);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

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

  const closePanels = () => {
    setDeclineId(null);
    setDeclineConfirmOpen(false);
    setProposingId(null);
    setSelectedSlotId(null);
    setProposalSlots([]);
    setSlotsError("");
  };

  const confirmAppointment = async (appointmentId: number) => {
    if (busyId !== null) return;
    setBusyId(appointmentId);
    setError("");
    setSuccess("");
    try {
      await careService.confirmAppointment(appointmentId);
      closePanels();
      setSuccess("Le rendez-vous a été confirmé. La messagerie sécurisée est ouverte.");
      await load();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusyId(null);
    }
  };

  const openDecline = (appointmentId: number) => {
    setDeclineId(appointmentId);
    setDeclineConfirmOpen(true);
    setProposingId(null);
    setSelectedSlotId(null);
    setSuccess("");
  };

  const declineAppointment = async () => {
    if (!declineId || busyId !== null) return;
    setBusyId(declineId);
    setError("");
    setSuccess("");
    try {
      await careService.declineAppointment(declineId);
      setDeclineConfirmOpen(false);
      closePanels();
      setSuccess("La demande a été déclinée et le créneau a été libéré.");
      await load();
    } catch (reason) {
      setError(errorMessage(reason));
      setDeclineConfirmOpen(false);
    } finally {
      setBusyId(null);
    }
  };

  const openProposal = async (appointmentId: number) => {
    setProposingId(appointmentId);
    setSelectedSlotId(null);
    setProposalSlots([]);
    setDeclineId(null);
    setDeclineConfirmOpen(false);
    setSuccess("");
    await loadProposalSlots();
  };

  const proposeSlot = async () => {
    if (!proposingId || !selectedSlotId || busyId !== null) return;
    setBusyId(proposingId);
    setError("");
    setSuccess("");
    try {
      await careService.proposeSlot(proposingId, selectedSlotId);
      closePanels();
      setSuccess("Le nouveau créneau a été proposé à l’étudiant.");
      await load();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusyId(null);
    }
  };

  const visibleAppointments = groups[filter];

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Espace professionnel"
        title="Demandes de rendez-vous"
        description="Réponds aux demandes avec un pseudonyme anonyme, sans accéder à l’identité réelle des étudiants."
      />

      {loading ? (
        <CareLoading label="Chargement des demandes…" />
      ) : (
        <>
          {error && <ErrorBanner message={error} onRetry={() => void load(true)} />}
          {forbidden && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300"
                    size={22}
                  />
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Ton profil doit être vérifié et ta charte acceptée pour consulter les demandes.
                  </p>
                </div>
                <Link to="/pro/onboarding" className="shrink-0">
                  <Button variant="secondary">Voir mon profil</Button>
                </Link>
              </div>
            </Card>
          )}
          {success && (
            <p
              role="status"
              className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-bold text-teal-900 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-100"
            >
              {success}
            </p>
          )}

          <div
            className="flex gap-2 overflow-x-auto pb-1"
            role="group"
            aria-label="Filtrer les demandes par statut"
          >
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={filter === item.value}
                onClick={() => {
                  setFilter(item.value);
                  closePanels();
                }}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mina ${
                  filter === item.value
                    ? "bg-mina text-white"
                    : "border border-line bg-white text-slate-600 hover:border-mina/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                }`}
              >
                {item.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    filter === item.value ? "bg-white/20" : "bg-slate-100 dark:bg-white/10"
                  }`}
                >
                  {groups[item.value].length}
                </span>
              </button>
            ))}
          </div>

          <section className="space-y-4" aria-live="polite">
            {visibleAppointments.length ? (
              visibleAppointments.map((appointment) => (
                <div key={appointment.id} className="space-y-3">
                  <AppointmentCard
                    appointment={appointment}
                    perspective="professional"
                    href={`/pro/rendez-vous/${appointment.id}`}
                    action={
                      <>
                        {appointment.status !== "proposed" && (
                          <Button
                            size="sm"
                            onClick={() => void confirmAppointment(appointment.id)}
                            loading={busyId === appointment.id}
                            disabled={busyId !== null}
                          >
                            <CheckCircle2 size={15} /> Confirmer
                          </Button>
                        )}
                        {appointment.status !== "pending" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void openProposal(appointment.id)}
                            disabled={busyId !== null}
                          >
                            <CalendarClock size={15} /> Proposer
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDecline(appointment.id)}
                          disabled={busyId !== null}
                          className="!text-red-600"
                        >
                          <XCircle size={15} /> Décliner
                        </Button>
                      </>
                    }
                  />

                  {proposingId === appointment.id && (
                    <Card>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-ink dark:text-white">
                            Proposer un autre créneau
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Sélectionne un créneau disponible. Le créneau actuel sera libéré.
                          </p>
                        </div>
                        <Badge tone="violet">Nouvelle proposition</Badge>
                      </div>

                      <div className="mt-5">
                        {slotsLoading ? (
                          <CareLoading label="Chargement des créneaux disponibles…" />
                        ) : slotsError ? (
                          <ErrorBanner
                            message={slotsError}
                            onRetry={() => void loadProposalSlots()}
                          />
                        ) : (
                          <SlotPicker
                            slots={proposalSlots}
                            selectedId={selectedSlotId}
                            onSelect={(slot) => setSelectedSlotId(slot.id)}
                            disabled={busyId !== null}
                          />
                        )}
                      </div>

                      {slotsForbidden && (
                        <div className="mt-4">
                          <Link to="/pro/onboarding" className="text-sm font-bold text-mina">
                            Compléter et faire valider mon profil
                          </Link>
                        </div>
                      )}

                      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={closePanels} disabled={busyId !== null}>
                          Annuler
                        </Button>
                        <Button
                          onClick={() => void proposeSlot()}
                          loading={busyId === appointment.id}
                          disabled={
                            !selectedSlotId ||
                            busyId !== null ||
                            slotsLoading ||
                            Boolean(slotsError)
                          }
                        >
                          Proposer ce créneau
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                icon={<MessageCircle size={22} />}
                title="Aucune demande dans cette catégorie"
                description="Les nouvelles demandes et les propositions en cours apparaîtront ici."
                action={
                  <Button variant="secondary" onClick={() => void load(true)}>
                    Actualiser
                  </Button>
                }
              />
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={declineConfirmOpen && declineId !== null}
        title="Décliner cette demande ?"
        description="L’étudiant sera informé du déclin et le créneau réservé sera libéré."
        confirmLabel="Décliner la demande"
        danger
        loading={busyId !== null && declineId !== null}
        onConfirm={() => void declineAppointment()}
        onClose={() => {
          if (busyId === null) setDeclineConfirmOpen(false);
        }}
      />
    </div>
  );
}
