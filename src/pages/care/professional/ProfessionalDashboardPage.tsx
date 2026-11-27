import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ClipboardCheck,
  MessageCircle,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router";
import { ApiError, errorMessage } from "@/lib/api";
import { careService } from "@/services/careService";
import type { CareAppointment, CareProfessional, CareUrgentAlert } from "@/types/care";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import {
  AppointmentCard,
  CareLoading,
  CarePageHeader,
  EmptyState,
  ErrorBanner,
} from "@/components/care/CarePrimitives";

export function ProfessionalDashboardPage() {
  const [profile, setProfile] = useState<CareProfessional | null>(null);
  const [appointments, setAppointments] = useState<CareAppointment[]>([]);
  const [alerts, setAlerts] = useState<CareUrgentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setForbidden(false);

    const [profileResult, appointmentsResult, alertsResult] = await Promise.allSettled([
      careService.getProfessionalProfile(),
      careService.getProfessionalAppointments({ per_page: 50 }),
      careService.getProfessionalAlerts({ status: "open", per_page: 50 }),
    ]);

    let firstError: unknown = null;
    let accessDenied = false;

    if (profileResult.status === "fulfilled") {
      setProfile(profileResult.value);
    } else {
      firstError ??= profileResult.reason;
      accessDenied ||=
        profileResult.reason instanceof ApiError && profileResult.reason.status === 403;
    }

    if (appointmentsResult.status === "fulfilled") {
      setAppointments(appointmentsResult.value);
    } else {
      firstError ??= appointmentsResult.reason;
      accessDenied ||=
        appointmentsResult.reason instanceof ApiError && appointmentsResult.reason.status === 403;
    }

    if (alertsResult.status === "fulfilled") {
      setAlerts(alertsResult.value);
    } else {
      firstError ??= alertsResult.reason;
      accessDenied ||=
        alertsResult.reason instanceof ApiError && alertsResult.reason.status === 403;
    }

    setForbidden(accessDenied);
    if (firstError) setError(errorMessage(firstError));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingRequests = appointments.filter(
    (appointment) => appointment.status === "requested" || appointment.status === "pending",
  ).length;
  const openAlerts = alerts.filter((alert) => alert.status === "open").length;
  const upcomingAppointments = appointments
    .filter(
      (appointment) =>
        appointment.status === "confirmed" &&
        appointment.scheduled_at !== null &&
        new Date(appointment.scheduled_at).getTime() > Date.now(),
    )
    .sort(
      (left, right) =>
        new Date(left.scheduled_at ?? 0).getTime() - new Date(right.scheduled_at ?? 0).getTime(),
    );
  const nextAppointments = upcomingAppointments.slice(0, 4);

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Espace professionnel"
        title="Tableau de bord"
        description="Retrouve tes prochains rendez-vous, les demandes à traiter et les alertes ouvertes."
        actions={
          <>
            <Link
              to="/pro/disponibilites"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold text-ink hover:border-mina/40 dark:border-white/10 dark:bg-white/8 dark:text-white"
            >
              <Plus size={16} /> Disponibilités
            </Link>
            <Link
              to="/pro/onboarding"
              className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-bold text-mina hover:bg-teal-50 dark:hover:bg-teal-400/10"
            >
              Mon profil
            </Link>
          </>
        }
      />

      {loading ? (
        <CareLoading label="Chargement de ton espace…" />
      ) : (
        <>
          {error && <ErrorBanner message={error} onRetry={() => void load()} />}

          {(forbidden || (profile && (!profile.is_verified || !profile.has_accepted_charter))) && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300"
                    size={23}
                  />
                  <div>
                    <h2 className="font-extrabold text-ink dark:text-white">
                      {profile && !profile.has_accepted_charter
                        ? "Acceptation de la charte requise"
                        : "Validation du profil requise"}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {profile && !profile.has_accepted_charter
                        ? "Accepte la charte de confidentialité et de déontologie avant d’utiliser les disponibilités, les rendez-vous, la messagerie, les notes et les alertes."
                        : "L’accès aux disponibilités, demandes et alertes s’ouvre après la validation de ton profil par l’équipe administrative. Tu ne peux pas vérifier ton propre profil."}
                    </p>
                  </div>
                </div>
                <Link to="/pro/onboarding" className="shrink-0">
                  <Button>
                    {profile && !profile.has_accepted_charter
                      ? "Accepter la charte"
                      : "Compléter mon profil"}
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          <section aria-label="Résumé de l’activité" className="grid gap-3 sm:grid-cols-3">
            <Card className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-mina dark:bg-teal-400/10">
                <CalendarDays size={22} />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-ink dark:text-white">
                  {upcomingAppointments.length}
                </p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Prochains rendez-vous
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                <MessageCircle size={22} />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-ink dark:text-white">
                  {pendingRequests}
                </p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Demandes en attente
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300">
                <Bell size={22} />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-ink dark:text-white">{openAlerts}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Alertes ouvertes
                </p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-ink dark:text-white">
                  Prochains rendez-vous
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Les rendez-vous confirmés à venir.
                </p>
              </div>
              <Link
                to="/pro/demandes"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-mina hover:bg-teal-50 dark:hover:bg-teal-400/10"
              >
                Voir les demandes <ArrowRight size={15} />
              </Link>
            </div>

            {nextAppointments.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {nextAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    perspective="professional"
                    href={`/pro/rendez-vous/${appointment.id}`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarDays size={22} />}
                title="Aucun rendez-vous à venir"
                description="Les rendez-vous confirmés apparaîtront ici. Consulte tes demandes pour répondre aux étudiants."
                action={
                  <Link to="/pro/demandes">
                    <Button variant="secondary">Consulter les demandes</Button>
                  </Link>
                }
              />
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold text-ink dark:text-white">Accès rapides</h2>
              {profile && (
                <Badge
                  tone={profile.is_verified && profile.has_accepted_charter ? "teal" : "amber"}
                >
                  {!profile.has_accepted_charter
                    ? "Charte à accepter"
                    : profile.is_verified
                      ? "Profil vérifié"
                      : "Profil en attente"}
                </Badge>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                to="/pro/disponibilites"
                className="rounded-[22px] border border-line bg-white p-5 shadow-card transition hover:border-mina/40 dark:border-white/8 dark:bg-panel"
              >
                <CalendarDays className="text-mina" size={21} />
                <h3 className="mt-3 font-extrabold text-ink dark:text-white">Disponibilités</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Ouvre et gère tes créneaux de consultation.
                </p>
              </Link>
              <Link
                to="/pro/demandes"
                className="rounded-[22px] border border-line bg-white p-5 shadow-card transition hover:border-mina/40 dark:border-white/8 dark:bg-panel"
              >
                <ClipboardCheck className="text-mina" size={21} />
                <h3 className="mt-3 font-extrabold text-ink dark:text-white">Demandes</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Confirme, décline ou propose un autre créneau.
                </p>
              </Link>
              <Link
                to="/pro/alertes"
                className="rounded-[22px] border border-line bg-white p-5 shadow-card transition hover:border-mina/40 dark:border-white/8 dark:bg-panel"
              >
                <Bell className="text-mina" size={21} />
                <h3 className="mt-3 font-extrabold text-ink dark:text-white">Alertes</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Consulte les alertes ouvertes et leur suivi.
                </p>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
