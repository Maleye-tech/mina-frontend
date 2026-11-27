import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileQuestion,
  Flame,
  Lightbulb,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";
import { EmptyState } from "../../../components/ui/EmptyState";
import { progressService } from "../../../services/progressService";
import { qcmService } from "../../../services/qcmService";
import { clinicalCasesService } from "../../../services/clinicalCasesService";
import { libraryService } from "../../../services/libraryService";
import { errorMessage } from "../../../lib/api";
import type { Subject } from "../../../types/library";
import type { QcmAttempt, ClinicalCaseAttempt } from "../../../types/assessment";
import type { ProgressItem, ProgressStats, WeakPoint } from "../../../types/progress";

export function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [qcmSessions, setQcmSessions] = useState<QcmAttempt[]>([]);
  const [caseAttempts, setCaseAttempts] = useState<ClinicalCaseAttempt[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "weak_points" | "history">("overview");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, weakRes, qcmRes, casesRes, subsRes] = await Promise.allSettled([
        progressService.getStats().catch(() => null),
        progressService.getWeakPoints().catch(() => []),
        qcmService.listSessions(20, 1).catch(() => ({ data: [] })),
        clinicalCasesService.listAttempts(20, 1).catch(() => ({ data: [] })),
        libraryService.subjects().catch(() => []),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(statsRes.value);
      }
      if (weakRes.status === "fulfilled") {
        setWeakPoints(weakRes.value);
      }
      if (qcmRes.status === "fulfilled") setQcmSessions(qcmRes.value.data || []);
      if (casesRes.status === "fulfilled") setCaseAttempts(casesRes.value.data || []);
      if (subsRes.status === "fulfilled") setSubjects(subsRes.value || []);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const completedQcm = qcmSessions.filter((s) => s.completed_at);
  const calculatedAvgScore = completedQcm.length
    ? Math.round(completedQcm.reduce((acc, s) => acc + (s.score ?? 0), 0) / completedQcm.length)
    : 0;

  const avgScore = stats?.average_score ?? calculatedAvgScore;
  const completedCases = caseAttempts.filter((c) => c.completed_at);
  const totalActivities = qcmSessions.length + caseAttempts.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analyse & Performance"
        title="Ma progression d'études"
        description="Statistiques en direct, points faibles identifiés et historique d'entraînement Mina."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void loadData()}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : "mr-1.5"} />
            Actualiser
          </Button>
        }
      />

      {error && (
        <Card className="!border-red-200 bg-red-50/50 p-4 dark:!border-red-500/20 dark:bg-red-500/10">
          <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {loading && totalActivities === 0 && !stats && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <LoaderCircle size={32} className="animate-spin text-mina" />
          <p className="mt-4 text-sm font-bold text-slate-500">
            Calcul de ta progression depuis le serveur…
          </p>
        </Card>
      )}

      {/* Global Score KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Taux de réussite global</span>
            <div className="rounded-xl bg-teal-100 p-2 text-teal-600 dark:bg-teal-950/50">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold">{avgScore}%</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            {completedQcm.length} sessions QCM analysées
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Série active</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-950/50">
              <Flame size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold">
            {stats?.streak_days ?? (totalActivities > 0 ? 1 : 0)} j
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            Consécutifs d'apprentissage
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Points à renforcer</span>
            <div className="rounded-xl bg-red-100 p-2 text-red-600 dark:bg-red-950/50">
              <AlertCircle size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold">{weakPoints.length}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            Thématiques sous les 60%
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Cas cliniques validés</span>
            <div className="rounded-xl bg-care-100 p-2 text-care dark:bg-care-950/50">
              <Stethoscope size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold">{completedCases.length}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            Sur {caseAttempts.length} cas engagé(s)
          </p>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-line pb-3 dark:border-white/10">
        <Button
          size="sm"
          variant={activeTab === "overview" ? "primary" : "secondary"}
          onClick={() => setActiveTab("overview")}
        >
          <BarChart3 size={14} className="mr-1.5" />
          Vue d'ensemble par matière
        </Button>
        <Button
          size="sm"
          variant={activeTab === "weak_points" ? "primary" : "secondary"}
          onClick={() => setActiveTab("weak_points")}
        >
          <Lightbulb size={14} className="mr-1.5" />
          Points faibles ({weakPoints.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === "history" ? "primary" : "secondary"}
          onClick={() => setActiveTab("history")}
        >
          <Calendar size={14} className="mr-1.5" />
          Historique détaillé
        </Button>
      </div>

      {/* Tab 1: Overview by Subject */}
      {activeTab === "overview" && (
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-line dark:border-white/10">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-mina" />
              <h3 className="text-sm font-extrabold">Matières & Répartition</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{subjects.length} matières</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((sub) => {
              const sessionsInSub = qcmSessions.filter((s) => s.subject?.id === sub.id);
              const completedInSub = sessionsInSub.filter((s) => s.completed_at);
              const subScore = completedInSub.length
                ? Math.round(
                    completedInSub.reduce((acc, s) => acc + (s.score ?? 0), 0) /
                      completedInSub.length,
                  )
                : 0;

              return (
                <div
                  key={sub.id}
                  className="rounded-xl border border-line bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold">{sub.name}</p>
                    <span className="text-xs font-bold text-mina">{subScore}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-full bg-mina transition-all duration-300"
                      style={{ width: `${Math.max(5, subScore)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-semibold text-slate-400">
                    {sessionsInSub.length} session(s) effectuée(s)
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab 2: Weak Points */}
      {activeTab === "weak_points" && (
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-line dark:border-white/10">
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" />
              <h3 className="text-sm font-extrabold">Axes d'amélioration prioritaires</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Détectés par l'algorithme Mina</span>
          </div>

          <div className="mt-4 space-y-3">
            {weakPoints.length === 0 ? (
              <EmptyState
                icon={<Sparkles size={24} />}
                title="Aucun point faible critique"
                description="Continue tes entraînements réguliers pour consolider tes scores dans toutes les matières."
              />
            ) : (
              weakPoints.map((wp, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line p-4 dark:border-white/5 bg-slate-50/50 dark:bg-white/5"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge tone="red">{wp.success_rate}% réussite</Badge>
                      <h4 className="text-xs font-extrabold">{wp.subject_name}</h4>
                    </div>
                    {wp.topic && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {wp.topic}
                      </p>
                    )}
                    {wp.recommendation && (
                      <p className="text-[11px] text-slate-400">{wp.recommendation}</p>
                    )}
                  </div>
                  <Button variant="secondary" size="sm">
                    Réviser ce thème
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 3: Detailed History */}
      {activeTab === "history" && (
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-line dark:border-white/10">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-500" />
              <h3 className="text-sm font-extrabold">Historique des sessions</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{totalActivities} session(s)</span>
          </div>

          <div className="mt-4 space-y-3">
            {totalActivities === 0 ? (
              <EmptyState
                icon={<Award size={24} />}
                title="Aucun historique d'entraînement"
                description="Effectue des sessions de QCM ou des cas cliniques pour voir ton historique s'enrichir automatiquement."
              />
            ) : (
              <>
                {qcmSessions.map((s) => (
                  <div
                    key={`qcm-${s.id}`}
                    className="flex items-center justify-between rounded-xl border border-line p-3.5 dark:border-white/5"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge tone="teal">QCM</Badge>
                        <p className="text-xs font-extrabold">
                          Session #{s.id}
                          {s.subject?.name ? ` · ${s.subject.name}` : ""}
                        </p>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400">
                        {s.created_at
                          ? new Date(s.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                    {s.completed_at ? (
                      <Badge tone={s.score && s.score >= 70 ? "teal" : "amber"}>
                        Score : {s.score ?? 0}%
                      </Badge>
                    ) : (
                      <Badge tone="slate">Incomplet</Badge>
                    )}
                  </div>
                ))}

                {caseAttempts.map((c) => (
                  <div
                    key={`case-${c.id}`}
                    className="flex items-center justify-between rounded-xl border border-line p-3.5 dark:border-white/5"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge tone="violet">Cas clinique</Badge>
                        <p className="text-xs font-extrabold">
                          {c.clinical_case?.title ?? `Cas #${c.id}`}
                        </p>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                            })
                          : ""}
                      </p>
                    </div>
                    {c.completed_at ? (
                      <Badge tone="teal">Terminé</Badge>
                    ) : (
                      <Badge tone="amber">Étape {c.current_step ?? 1}</Badge>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
