import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  FileQuestion,
  Flame,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useAuthStore } from "../../../store/authStore";
import { dashboardService } from "../../../services/dashboardService";
import { flashcardsService } from "../../../services/flashcardsService";
import { qcmService } from "../../../services/qcmService";
import { clinicalCasesService } from "../../../services/clinicalCasesService";
import { errorMessage } from "../../../lib/api";
import type { StudentDashboardData } from "../../../types/dashboard";
import type { FlashcardCard, QcmAttempt, ClinicalCaseAttempt } from "../../../types/assessment";

export function StudentHome() {
  const user = useAuthStore((s) => s.user)!;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [reviewsDue, setReviewsDue] = useState<FlashcardCard[]>([]);
  const [recentQcm, setRecentQcm] = useState<QcmAttempt[]>([]);
  const [recentCases, setRecentCases] = useState<ClinicalCaseAttempt[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, flashRes, qcmRes, casesRes] = await Promise.allSettled([
        dashboardService.getStudentDashboard(),
        flashcardsService.reviewsToday().catch(() => []),
        qcmService.listSessions(5, 1).catch(() => ({ data: [] })),
        clinicalCasesService.listAttempts(5, 1).catch(() => ({ data: [] })),
      ]);

      if (dashRes.status === "fulfilled") {
        setDashboardData(dashRes.value);
      }
      if (flashRes.status === "fulfilled") {
        setReviewsDue(flashRes.value);
      }
      if (qcmRes.status === "fulfilled") {
        setRecentQcm(qcmRes.value.data || []);
      }
      if (casesRes.status === "fulfilled") {
        setRecentCases(casesRes.value.data || []);
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

  const streak =
    dashboardData?.streak_days ??
    (recentQcm.length > 0 || recentCases.length > 0 ? 1 : 0);

  const totalQcmSessions = recentQcm.length;
  const completedQcm = recentQcm.filter((s) => s.completed_at);
  const avgQcmScore = completedQcm.length
    ? Math.round(
        completedQcm.reduce((acc, c) => acc + (c.score ?? 0), 0) /
          completedQcm.length,
      )
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tableau de bord"
        title={`Bonjour ${user.name.split(" ")[0]}, prêt(e) à avancer ?`}
        description="Ton programme est synchronisé avec le backend Mina en temps réel."
        action={
          <div className="flex items-center gap-2">
            <Badge tone="amber">
              <Flame size={14} className="mr-1.5 fill-amber-500" />
              Série : {streak} jour{streak > 1 ? "s" : ""}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void loadData()}
              disabled={loading}
              title="Rafraîchir les données"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        }
      />

      {loading && !dashboardData && recentQcm.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <LoaderCircle size={32} className="animate-spin text-mina" />
          <p className="mt-4 text-sm font-bold text-slate-600 dark:text-slate-300">
            Chargement de tes données depuis le serveur Mina…
          </p>
        </Card>
      )}

      {error && (
        <Card className="!border-red-200 bg-red-50/50 p-4 dark:!border-red-500/20 dark:bg-red-500/10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
            <Button size="sm" variant="secondary" onClick={() => void loadData()}>
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Flashcards à réviser
            </span>
            <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
              <Brain size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight">
              {reviewsDue.length}
            </span>
            <span className="text-xs font-semibold text-slate-400">aujourd’hui</span>
          </div>
          <div className="mt-3">
            <Link
              to="/app/student/flashcards"
              className="inline-flex items-center text-xs font-bold text-mina hover:underline"
            >
              Réviser maintenant <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Sessions QCM
            </span>
            <div className="rounded-xl bg-teal-100 p-2 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <FileQuestion size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight">
              {totalQcmSessions}
            </span>
            <span className="text-xs font-semibold text-slate-400">récentes</span>
          </div>
          <div className="mt-3">
            <Link
              to="/app/student/qcm"
              className="inline-flex items-center text-xs font-bold text-mina hover:underline"
            >
              S'entraîner <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Score moyen QCM
            </span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight">
              {avgQcmScore !== null ? `${avgQcmScore}%` : "—"}
            </span>
            <span className="text-xs font-semibold text-slate-400">réussite</span>
          </div>
          <div className="mt-3">
            <Link
              to="/app/student/progression"
              className="inline-flex items-center text-xs font-bold text-mina hover:underline"
            >
              Voir la progression <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Cas cliniques
            </span>
            <div className="rounded-xl bg-care-100 p-2 text-care dark:bg-care-950/50">
              <Stethoscope size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight">
              {recentCases.length}
            </span>
            <span className="text-xs font-semibold text-slate-400">tentatives</span>
          </div>
          <div className="mt-3">
            <Link
              to="/app/student/cas"
              className="inline-flex items-center text-xs font-bold text-care hover:underline"
            >
              Diagnostiquer <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Daily Actions Banner */}
      <Card className="border-mina/30 bg-gradient-to-r from-mina/10 via-teal-50/50 to-transparent p-6 dark:from-mina/20 dark:via-panel dark:to-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-mina" />
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                Prêt pour la session d'étude du jour ?
              </h3>
            </div>
            <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
              Révise tes flashcards, explore les nouveaux cours de la bibliothèque ou teste-toi sur un cas clinique.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/app/student/cours">
              <Button variant="secondary" size="sm">
                <BookOpen size={14} className="mr-1.5" />
                Cours
              </Button>
            </Link>
            <Link to="/app/student/qcm">
              <Button variant="primary" size="sm">
                <FileQuestion size={14} className="mr-1.5" />
                Lancer un QCM
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Recent Sessions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-line dark:border-white/10">
            <div className="flex items-center gap-2">
              <FileQuestion size={18} className="text-mina" />
              <h3 className="text-sm font-extrabold">Dernières sessions QCM</h3>
            </div>
            <Link to="/app/student/qcm" className="text-xs font-bold text-mina hover:underline">
              Tout voir
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentQcm.length === 0 ? (
              <EmptyState
                icon={<FileQuestion size={20} />}
                title="Aucune session récente"
                description="Lance ton premier entraînement QCM pour évaluer tes connaissances."
              />
            ) : (
              recentQcm.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/5"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold">
                      Session #{session.id}
                      {session.subject?.name ? ` · ${session.subject.name}` : ""}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400">
                      {session.created_at
                        ? new Date(session.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Récemment"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.completed_at ? (
                      <Badge tone="teal">
                        <CheckCircle2 size={12} className="mr-1" />
                        Score: {session.score ?? 0}%
                      </Badge>
                    ) : (
                      <Badge tone="amber">En cours</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-line dark:border-white/10">
            <div className="flex items-center gap-2">
              <Stethoscope size={18} className="text-care" />
              <h3 className="text-sm font-extrabold">Cas cliniques récents</h3>
            </div>
            <Link to="/app/student/cas" className="text-xs font-bold text-care hover:underline">
              Tout voir
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentCases.length === 0 ? (
              <EmptyState
                icon={<Stethoscope size={20} />}
                title="Aucun cas clinique démarré"
                description="Entraîne-toi sur des situations réelles guidées pas-à-pas."
              />
            ) : (
              recentCases.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/5"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold">
                      {attempt.clinical_case?.title ?? `Cas clinique #${attempt.id}`}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400">
                      {attempt.created_at
                        ? new Date(attempt.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Récemment"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {attempt.completed_at ? (
                      <Badge tone="teal">Complété</Badge>
                    ) : (
                      <Badge tone="amber">
                        <Clock size={12} className="mr-1" />
                        Étape {attempt.current_step ?? 1}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
