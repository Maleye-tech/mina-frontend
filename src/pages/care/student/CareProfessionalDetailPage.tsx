import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, BadgeCheck, CalendarDays, Languages, LockKeyhole } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { SlotPicker } from "../../../components/care/SlotPicker";
import {
  CareLoading,
  CarePageHeader,
  ConfidentialityNotice,
  EmptyState,
  ErrorBanner,
  formatCareDate,
  formatCareTime,
} from "../../../components/care/CarePrimitives";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { ApiError, errorMessage } from "../../../lib/api";
import { careService } from "../../../services/careService";
import type { CareAvailabilitySlot, CareProfessional } from "../../../types/care";

export function CareProfessionalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const professionalId = Number(id);
  const validProfessionalId = Number.isSafeInteger(professionalId) && professionalId > 0;
  const [professional, setProfessional] = useState<CareProfessional | null>(null);
  const [slots, setSlots] = useState<CareAvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CareAvailabilitySlot | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!validProfessionalId) {
      setLoading(false);
      setLoadError("Ce professionnel est introuvable.");
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    setLoadError("");
    try {
      const [nextProfessional, nextSlots] = await Promise.all([
        careService.getProfessional(professionalId),
        careService.getProfessionalSlots(professionalId),
      ]);
      if (currentRequest !== requestId.current) return;
      if (!nextProfessional.is_verified) {
        setLoadError("Ce professionnel n’est pas disponible.");
        return;
      }
      setProfessional(nextProfessional);
      setSlots(nextSlots);
    } catch (bookingError) {
      if (currentRequest !== requestId.current) return;
      setLoadError(errorMessage(bookingError));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [professionalId, validProfessionalId]);

  useEffect(() => {
    setProfessional(null);
    setSlots([]);
    setSelectedSlot(null);
    setReason("");
    setBookingError("");
    void load();
    return () => {
      requestId.current += 1;
    };
  }, [load]);

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSlot || booking) return;

    const trimmedReason = reason.trim();
    if (trimmedReason.length > 255) {
      setBookingError("Le motif ne doit pas dépasser 255 caractères.");
      return;
    }

    const slotToBook = selectedSlot;
    setBooking(true);
    setBookingError("");
    try {
      const appointment = await careService.bookAppointment({
        availability_slot_id: slotToBook.id,
        ...(trimmedReason ? { reason: trimmedReason } : {}),
      });
      navigate(`/espace/rendez-vous/${appointment.id}`);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 422) {
        setSelectedSlot(null);
        setSlots((current) =>
          current.map((slot) => (slot.id === slotToBook.id ? { ...slot, is_booked: true } : slot)),
        );
        setBookingError(
          "Ce créneau vient d’être réservé ou n’est plus disponible. Choisis un autre horaire.",
        );
      } else {
        setBookingError(errorMessage(reason));
      }
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Accompagnement"
        title={professional?.display_name ?? "Disponibilités du professionnel"}
        description="Choisis un créneau et partage uniquement ce que tu souhaites transmettre."
        actions={
          <Link
            to="/espace/accompagnement"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold text-mina hover:border-mina/40 dark:border-white/10 dark:bg-white/8"
          >
            <ArrowLeft size={17} /> Retour aux professionnels
          </Link>
        }
      />

      {loadError && <ErrorBanner message={loadError} onRetry={() => void load()} />}

      {loading && !professional ? (
        <CareLoading label="Chargement du profil et des créneaux…" />
      ) : !professional ? (
        !loadError && (
          <EmptyState
            icon={<CalendarDays size={22} />}
            title="Professionnel introuvable"
            description="Ce profil n’est plus disponible. Consulte un autre professionnel vérifié."
            action={
              <Link
                to="/espace/accompagnement"
                className="inline-flex min-h-11 items-center rounded-xl bg-mina px-5 text-sm font-bold text-white"
              >
                Voir les professionnels
              </Link>
            }
          />
        )
      ) : (
        <>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-ink dark:text-white">
                    {professional.display_name}
                  </h2>
                  <BadgeCheck size={21} className="text-mina" aria-label="Professionnel vérifié" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="teal">{professional.specialty_label}</Badge>
                  <Badge tone="slate">Profil vérifié</Badge>
                </div>
              </div>
              <p className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                <Languages size={18} className="shrink-0 text-mina" aria-hidden="true" />
                {professional.languages.length > 0
                  ? professional.languages.join(", ")
                  : "Langues non précisées"}
              </p>
            </div>
            <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-500 dark:text-slate-400">
              {professional.bio || "Ce professionnel n’a pas encore ajouté de présentation."}
            </p>
          </Card>

          <Card>
            <div className="max-w-3xl">
              <h2 className="text-lg font-extrabold text-ink dark:text-white">
                Choisir un créneau
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Ta demande sera envoyée au professionnel. Le rendez-vous n’est confirmé qu’après son
                accord ; la messagerie s’ouvre uniquement à ce moment-là.
              </p>
            </div>

            <form onSubmit={submitBooking} className="mt-6 space-y-6">
              <SlotPicker
                slots={slots}
                selectedId={selectedSlot?.id ?? null}
                onSelect={setSelectedSlot}
                disabled={booking}
              />

              <div className="max-w-3xl">
                <label
                  htmlFor="care-booking-reason"
                  className="text-sm font-extrabold text-ink dark:text-white"
                >
                  Motif de consultation{" "}
                  <span className="font-normal text-slate-400">(facultatif)</span>
                </label>
                <textarea
                  id="care-booking-reason"
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setBookingError("");
                  }}
                  maxLength={255}
                  rows={4}
                  aria-describedby="care-booking-reason-help"
                  placeholder="Ce que tu souhaites aborder, en quelques mots…"
                  className="mt-2 w-full resize-y rounded-xl border border-line bg-white p-3 text-sm leading-6 text-ink outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <div
                  id="care-booking-reason-help"
                  className="mt-1 flex flex-wrap justify-between gap-2 text-[11px] text-slate-400"
                >
                  <span>Ce motif sera visible par le professionnel.</span>
                  <span>{reason.length}/255</span>
                </div>
              </div>

              {selectedSlot && (
                <p
                  role="status"
                  className="rounded-xl bg-teal-50 p-3 text-sm font-bold leading-6 text-teal-900 dark:bg-teal-400/10 dark:text-teal-100"
                >
                  Créneau sélectionné : {formatCareDate(selectedSlot.starts_at)}, de{" "}
                  {formatCareTime(selectedSlot.starts_at)} à {formatCareTime(selectedSlot.ends_at)}{" "}
                  · {selectedSlot.mode === "chat" ? "Chat écrit" : "Visioconférence"}
                </p>
              )}

              {bookingError && <ErrorBanner message={bookingError} />}

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  loading={booking}
                  disabled={!selectedSlot}
                  className="sm:min-w-56"
                >
                  Envoyer ma demande
                </Button>
                {!selectedSlot && !booking && (
                  <p className="text-xs font-bold text-slate-400">
                    Sélectionne d’abord un créneau disponible.
                  </p>
                )}
              </div>
            </form>
          </Card>

          <ConfidentialityNotice />
          <p className="flex gap-2 text-xs leading-5 text-slate-400">
            <LockKeyhole size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            Ne partage pas de mot de passe ni de document d’identité dans le motif de consultation.
          </p>
        </>
      )}
    </div>
  );
}
