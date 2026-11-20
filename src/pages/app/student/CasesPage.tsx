import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  LoaderCircle,
  RotateCcw,
  Stethoscope,
  Target,
} from "lucide-react";
import { PageHeader } from "../../../components/dashboard/Common";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Pagination } from "../../../components/ui/Pagination";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { errorMessage } from "../../../lib/api";
import { clinicalCasesService } from "../../../services/clinicalCasesService";
import { libraryService } from "../../../services/libraryService";
import { toast } from "../../../store/toastStore";
import type { Paginated } from "../../../types/api";
import type {
  ClinicalCase,
  ClinicalCaseAttempt,
  ClinicalCaseStep,
  Difficulty,
} from "../../../types/assessment";
import type { Level, Subject } from "../../../types/library";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

const DIFFICULTY_TONES: Record<Difficulty, "teal" | "amber" | "red"> = {
  easy: "teal",
  medium: "amber",
  hard: "red",
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function StepCard({
  step,
  index,
  total,
  draft,
  busy,
  onDraftChange,
  onSubmit,
}: {
  step: ClinicalCaseStep;
  index: number;
  total: number;
  draft: string;
  busy: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const current = !step.answered;
  return (
    <Card className={current ? "!border-care/40" : undefined}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="slate">
            Étape {index + 1} / {total}
          </Badge>
          {step.answered ? (
            <Badge tone="teal">
              <CheckCircle2 size={12} className="mr-1" />
              Répondu
            </Badge>
          ) : (
            <Badge tone="amber">À compléter</Badge>
          )}
          {step.answered_at && (
            <span className="text-[11px] font-bold text-slate-400">
              {formatDate(step.answered_at)}
            </span>
          )}
        </div>
      </div>
      {step.prompt && (
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-care">{step.prompt}</p>
      )}
      {step.question && <p className="mt-2 text-sm font-extrabold leading-6">{step.question}</p>}
      {step.answered && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-white/5">
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">
              Ta réponse
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
              {step.answer}
            </p>
          </div>
          {step.expected_answer && (
            <div className="rounded-xl bg-care/8 p-3.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-care">
                Corrigé
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                {step.expected_answer}
              </p>
            </div>
          )}
        </div>
      )}
      {current && (
        <div className="mt-4">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            maxLength={5000}
            rows={5}
            placeholder="Rédige ta réponse étape par étape…"
            className="w-full rounded-xl border border-line bg-white p-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-care dark:border-white/10 dark:bg-panel"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold text-slate-400">{draft.length}/5000</span>
            <Button onClick={onSubmit} disabled={busy || draft.trim().length === 0}>
              {busy && <LoaderCircle size={15} className="animate-spin" />}
              Valider l’étape
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function CasesPage() {
  const [mode, setMode] = useState<"list" | "detail" | "playing" | "view">("list");
  const [cases, setCases] = useState<Paginated<ClinicalCase> | null>(null);
  const [attempts, setAttempts] = useState<Paginated<ClinicalCaseAttempt> | null>(null);
  const [page, setPage] = useState(1);
  const [attemptPage, setAttemptPage] = useState(1);
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [detail, setDetail] = useState<ClinicalCase | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [attempt, setAttempt] = useState<ClinicalCaseAttempt | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [subs, lvls] = await Promise.all([
          libraryService.subjects(),
          libraryService.levels(),
        ]);
        if (cancelled) return;
        setSubjects(subs);
        setLevels(lvls);
      } catch (e) {
        if (!cancelled) toast.error(errorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [list, history] = await Promise.all([
        clinicalCasesService.list({
          subject_id: subjectId ? Number(subjectId) : undefined,
          level_id: levelId ? Number(levelId) : undefined,
          difficulty: (difficulty || undefined) as Difficulty | undefined,
          per_page: 12,
          page,
        }),
        clinicalCasesService.listAttempts(10, attemptPage),
      ]);
      setCases(list);
      setAttempts(history);
    } catch (e) {
      setCases(null);
      setAttempts(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [subjectId, levelId, difficulty, page, attemptPage, reload]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCase = async (caseId: number) => {
    setDetailLoading(true);
    setDetailError("");
    setDetail(null);
    setMode("detail");
    try {
      const res = await clinicalCasesService.get(caseId);
      setDetail(res);
    } catch (e) {
      setDetailError(errorMessage(e));
    } finally {
      setDetailLoading(false);
    }
  };

  const startAttempt = async (caseId: number) => {
    setBusy(true);
    setActionError("");
    try {
      const res = await clinicalCasesService.createAttempt(caseId);
      setAttempt(res.attempt);
      setDraft("");
      setMode("playing");
      toast.success("Tentative démarrée.");
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const openAttempt = async (attemptId: number) => {
    setBusy(true);
    setActionError("");
    try {
      const res = await clinicalCasesService.getAttempt(attemptId);
      setAttempt(res.attempt);
      setDraft("");
      setMode(res.attempt.status === "in_progress" ? "playing" : "view");
    } catch (e) {
      setActionError(errorMessage(e));
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submitStep = async () => {
    if (!attempt) return;
    const steps = attempt.steps ?? [];
    const current = [...steps].reverse().find((s) => !s.answered);
    if (!current || draft.trim().length === 0) return;
    setBusy(true);
    setActionError("");
    try {
      const res = await clinicalCasesService.answer(attempt.id, {
        step_id: current.id,
        answer: draft.trim(),
      });
      setAttempt(res.attempt);
      setDraft("");
      toast.success("Réponse enregistrée.");
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const finishAttempt = async () => {
    if (!attempt) return;
    const steps = attempt.steps ?? [];
    const unanswered = steps.filter((s) => !s.answered).length;
    if (
      unanswered > 0 &&
      !window.confirm(
        `${unanswered} étape${unanswered > 1 ? "s restent" : " reste"} sans réponse. Terminer quand même ? Les corrigés seront révélés.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setActionError("");
    try {
      const res = await clinicalCasesService.finish(attempt.id);
      setAttempt(res.attempt);
      setMode("view");
      setReload((r) => r + 1);
      toast.success("Cas clinique terminé.");
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const backToList = () => {
    setMode("list");
    setDetail(null);
    setAttempt(null);
    setDraft("");
    setActionError("");
    setReload((r) => r + 1);
  };

  const steps = attempt?.steps ?? [];
  const answeredCount = steps.filter((s) => s.answered).length;
  const totalSteps = attempt?.total_steps ?? steps.length;
  const allAnswered = totalSteps > 0 && answeredCount >= totalSteps;

  const selectClass =
    "h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-mina dark:border-white/10 dark:bg-panel";

  return (
    <>
      <PageHeader
        eyebrow="Pratique clinique"
        title="Cas cliniques d’Afrique de l’Ouest"
        description="Raisonne sur des situations proches de ta future pratique."
        action={
          mode !== "list" ? (
            <Button variant="secondary" onClick={backToList}>
              <ChevronLeft size={15} />
              Tous les cas
            </Button>
          ) : undefined
        }
      />

      {actionError && (
        <div className="mb-5 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {actionError}
        </div>
      )}

      {mode === "list" && (
        <>
          <div className="mb-5 flex flex-wrap gap-3">
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">Toutes les matières</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={levelId}
              onChange={(e) => {
                setLevelId(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">Tous les niveaux</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">Toutes les difficultés</option>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </div>

          {loadError && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
              <span>{loadError}</span>
              <Button variant="secondary" onClick={() => void load()}>
                Réessayer
              </Button>
            </div>
          )}

          {loading && (
            <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
              Chargement des cas cliniques…
            </p>
          )}

          {!loading && !loadError && cases && cases.data.length === 0 && (
            <EmptyState
              icon={<Stethoscope size={24} />}
              title="Aucun cas clinique disponible"
              description="Les cas cliniques publiés apparaîtront ici dès leur publication."
            />
          )}

          {!loading && cases && cases.data.length > 0 && (
            <div className="space-y-3">
              {cases.data.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line bg-white px-5 py-4 dark:border-white/8 dark:bg-panel"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold">{c.title}</p>
                      <Badge tone={DIFFICULTY_TONES[c.difficulty]}>
                        {DIFFICULTY_LABELS[c.difficulty]}
                      </Badge>
                      <Badge tone="slate">{c.subject?.name}</Badge>
                      <Badge tone="slate">{c.level?.name}</Badge>
                      <Badge tone="teal">
                        {c.steps_count} étape{c.steps_count > 1 ? "s" : ""}
                      </Badge>
                      {c.duration_minutes != null && (
                        <Badge tone="violet">{c.duration_minutes} min</Badge>
                      )}
                    </div>
                    {c.presentation && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {c.presentation}
                      </p>
                    )}
                  </div>
                  <Button onClick={() => void openCase(c.id)}>Ouvrir</Button>
                </div>
              ))}
              <Pagination
                page={cases.meta.current_page}
                lastPage={cases.meta.last_page}
                total={cases.meta.total}
                itemLabel="cas"
                onPage={setPage}
              />
            </div>
          )}

          {!loading && attempts && attempts.data.length > 0 && (
            <div className="mt-10">
              <h2 className="text-sm font-extrabold">Mes tentatives</h2>
              <div className="mt-3 space-y-2">
                {attempts.data.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 dark:border-white/8 dark:bg-panel"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold">
                        {a.clinical_case?.title ?? "Cas clinique"}
                      </p>
                      {a.status === "in_progress" ? (
                        <Badge tone="amber">En cours</Badge>
                      ) : (
                        <Badge tone="teal">Terminé</Badge>
                      )}
                      <span className="text-[11px] font-bold text-slate-400">
                        {formatDate(a.created_at)}
                      </span>
                    </div>
                    <Button
                      variant={a.status === "in_progress" ? "secondary" : "ghost"}
                      disabled={busy}
                      onClick={() => void openAttempt(a.id)}
                    >
                      {a.status === "in_progress" ? "Reprendre" : "Voir"}
                    </Button>
                  </div>
                ))}
              </div>
              <Pagination
                page={attempts.meta.current_page}
                lastPage={attempts.meta.last_page}
                total={attempts.meta.total}
                itemLabel="tentative"
                onPage={setAttemptPage}
              />
            </div>
          )}
        </>
      )}

      {mode === "detail" && (
        <>
          {detailLoading && (
            <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
              Chargement du cas…
            </p>
          )}
          {detailError && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
              <span>{detailError}</span>
              <Button variant="secondary" onClick={backToList}>
                Retour
              </Button>
            </div>
          )}
          {detail && (
            <Card>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone={DIFFICULTY_TONES[detail.difficulty]}>
                  {DIFFICULTY_LABELS[detail.difficulty]}
                </Badge>
                <Badge tone="slate">{detail.subject?.name}</Badge>
                <Badge tone="slate">{detail.level?.name}</Badge>
                <Badge tone="teal">
                  {detail.steps_count} étape{detail.steps_count > 1 ? "s" : ""}
                </Badge>
                {detail.duration_minutes != null && (
                  <Badge tone="violet">{detail.duration_minutes} min</Badge>
                )}
              </div>
              <h2 className="mt-4 text-lg font-extrabold">{detail.title}</h2>
              {detail.presentation && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {detail.presentation}
                </p>
              )}
              {detail.learning_goals && (
                <div className="mt-5 rounded-xl bg-care/8 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-care">
                    <Target size={13} />
                    Objectifs d’apprentissage
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                    {detail.learning_goals}
                  </p>
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                <Button disabled={busy} onClick={() => void startAttempt(detail.id)}>
                  {busy && <LoaderCircle size={15} className="animate-spin" />}
                  Commencer la tentative
                </Button>
                <Button variant="secondary" onClick={backToList}>
                  <ArrowLeft size={15} />
                  Retour
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {(mode === "playing" || mode === "view") && attempt && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="slate">{attempt.clinical_case?.title ?? "Cas clinique"}</Badge>
              {attempt.status === "in_progress" ? (
                <Badge tone="amber">En cours</Badge>
              ) : (
                <Badge tone="teal">Terminé</Badge>
              )}
              <span className="text-xs font-bold text-slate-500">
                {answeredCount}/{totalSteps} étapes
              </span>
            </div>
            {attempt.status === "in_progress" && allAnswered && (
              <Button disabled={busy} onClick={() => void finishAttempt()}>
                {busy && <LoaderCircle size={15} className="animate-spin" />}
                Terminer le cas
              </Button>
            )}
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
            <div
              className="h-full rounded-full bg-care transition-all"
              style={{
                width: `${Math.round((answeredCount / Math.max(totalSteps, 1)) * 100)}%`,
              }}
            />
          </div>

          {attempt.status === "in_progress" && !allAnswered && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold text-slate-400">
                Les étapes suivantes se dévoilent au fil de ta progression.
              </p>
              <Button variant="ghost" disabled={busy} onClick={() => void finishAttempt()}>
                Terminer plus tôt
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {steps.map((step, i) => (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                total={totalSteps}
                draft={draft}
                busy={busy}
                onDraftChange={setDraft}
                onSubmit={() => void submitStep()}
              />
            ))}
          </div>

          {attempt.status === "completed" && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={backToList}>
                <RotateCcw size={15} />
                Retour aux cas
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
