import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileQuestion,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { PendingBanner } from "../../../components/dashboard/PendingBanner";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { EmptyState } from "../../../components/ui/EmptyState";
import { dashboardService } from "../../../services/dashboardService";
import { usersService } from "../../../services/usersService";
import { appointmentsService } from "../../../services/appointmentsService";
import { errorMessage } from "../../../lib/api";
import type { Role, User } from "../../../types";
import type { RoleDashboardData } from "../../../types/dashboard";
import type { Appointment } from "../../../types/appointment";

type NonStudentRole = Exclude<Role, "student">;

export function RoleOverview({ role }: { role: NonStudentRole }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState<RoleDashboardData | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, usersRes, aptsRes] = await Promise.allSettled([
        dashboardService.getRoleDashboard(role).catch(() => null),
        usersService.list({ per_page: 5 }).catch(() => ({ data: [] })),
        appointmentsService.list({ per_page: 5 }).catch(() => []),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value) {
        setDashboardData(dashRes.value);
      }
      if (usersRes.status === "fulfilled") {
        setRecentUsers(usersRes.value.data || []);
      }
      if (aptsRes.status === "fulfilled") {
        setAppointments(aptsRes.value || []);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const baseSlug = role === "partner_admin" ? "partner" : role === "super_admin" ? "admin" : role;

  return (
    <div className="space-y-6">
      <PendingBanner />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
          Indicateurs clés & Activité récente
        </h3>
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

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Étudiants & Utilisateurs</span>
            <div className="rounded-xl bg-teal-100 p-2 text-teal-600 dark:bg-teal-950/50">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight">
            {recentUsers.length > 0 ? recentUsers.length : "—"}
          </p>
          <div className="mt-3">
            <Link
              to={`/app/${baseSlug}/utilisateurs`}
              className="inline-flex items-center text-xs font-bold text-mina hover:underline"
            >
              Gérer les comptes <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Consultations planifiées</span>
            <div className="rounded-xl bg-care-100 p-2 text-care dark:bg-care-950/50">
              <Calendar size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight">
            {appointments.length}
          </p>
          <div className="mt-3">
            <Link
              to={`/app/${baseSlug}/consultations`}
              className="inline-flex items-center text-xs font-bold text-care hover:underline"
            >
              Voir l'agenda <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">File prioritaire</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-950/50">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight">
            {dashboardData?.pending_demands_count ?? 0}
          </p>
          <div className="mt-3">
            <Link
              to={`/app/${baseSlug}/validations`}
              className="inline-flex items-center text-xs font-bold text-amber-600 hover:underline"
            >
              Examiner <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Taux d'engagement</span>
            <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/50">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight">94%</p>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-400">Activité hebdomadaire</span>
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to={`/app/${baseSlug}/utilisateurs`} className="block">
          <Card className="h-full p-5 transition hover:border-mina hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-mina/10 p-2.5 text-mina">
                <Users size={20} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold">Gestion des utilisateurs</h4>
                <p className="text-xs text-slate-400">
                  Création, rôles, activation des étudiants et partenaires.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to={`/app/${baseSlug}/contenus`} className="block">
          <Card className="h-full p-5 transition hover:border-mina hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-600">
                <BookOpen size={20} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold">Bibliothèque médicale</h4>
                <p className="text-xs text-slate-400">
                  Publication de cours, résumés et podcasts audio.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to={`/app/${baseSlug}/imports-qcm`} className="block">
          <Card className="h-full p-5 transition hover:border-mina hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-600">
                <FileQuestion size={20} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold">Banque de QCM</h4>
                <p className="text-xs text-slate-400">
                  Imports en masse CSV/Excel et révision des questions.
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Users list */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-line dark:border-white/10">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-mina" />
            <h3 className="text-sm font-extrabold">Derniers utilisateurs enregistrés</h3>
          </div>
          <Link
            to={`/app/${baseSlug}/utilisateurs`}
            className="text-xs font-bold text-mina hover:underline"
          >
            Voir tous les utilisateurs
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {recentUsers.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              Aucun utilisateur à afficher.
            </p>
          ) : (
            recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-line p-3.5 dark:border-white/5"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold">{u.name}</p>
                  <p className="text-[11px] font-semibold text-slate-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={u.role === "student" ? "teal" : "violet"}>
                    {u.roleLabel ?? u.role}
                  </Badge>
                  {u.emailVerified && (
                    <Badge tone="teal">
                      <CheckCircle2 size={12} className="mr-1" />
                      Vérifié
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
