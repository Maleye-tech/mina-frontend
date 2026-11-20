import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  LoaderCircle,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { PageHeader } from "../../../components/dashboard/Common";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Pagination } from "../../../components/ui/Pagination";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { errorMessage } from "../../../lib/api";
import { libraryService } from "../../../services/libraryService";
import { qcmService } from "../../../services/qcmService";
import { toast } from "../../../store/toastStore";
import type { Paginated } from "../../../types/api";
import type { Difficulty, QcmAttempt, QcmAttemptQuestion } from "../../../types/assessment";
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

function formatTime(seconds: number | null): string {
  const total = Math.max(0, Math.round(seconds ?? 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** État joueur : les questions sont toujours chargées (start/show/finish). */
type ActiveAttempt = QcmAttempt & { questions: QcmAttemptQuestion[] };

function QuestionCard({
  item,
  index,
  total,
  selected,
  interactive,
  busy,
  onSelect,
  onSubmit,
}: {
  item: QcmAttemptQuestion;
  index: number;
  total: number;
  selected: number[];
  interactive: boolean;
  busy: boolean;
  onSelect: (optionId: number) => void;
  onSubmit: () => void;
}) {
  const q = item.question;
  const multiple = q.question_type === "multiple";
  const options = [...q.options].sort((a, b) => a.sort_order - b.sort_order);
  const canAnswer = interactive && !item.answered;
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="slate">
            Question {index + 1} / {total}
          </Badge>
          <Badge tone={DIFFICULTY_TONES[q.difficulty]}>{DIFFICULTY_LABELS[q.difficulty]}</Badge>
          <Badge tone="teal">{q.subject.name}</Badge>
          <Badge tone="violet">{q.level.name}</Badge>
        </div>
        {item.answered &&
          (item.is_correct ? (
            <Badge tone="teal">
              <CheckCircle2 size={12} className="mr-1" />
              Bonne réponse
            </Badge>
          ) : (
            <Badge tone="red">
              <XCircle size={12} className="mr-1" />
              Incorrect
            </Badge>
          ))}
      </div>
      <h2 className="mt-4 text-base font-extrabold leading-7">{q.question}</h2>
      <p className="mt-1 text-[11px] font-bold text-slate-400">
        {multiple ? "Plusieurs réponses possibles" : "Une seule réponse"}
      </p>
      <div className="mt-4 space-y-2">
        {options.map((opt, i) => {
          const isCorrect = item.answered && (item.correct_option_ids ?? []).includes(opt.id);
          const isWrongSelected =
            item.answered && (item.selected_option_ids ?? []).includes(opt.id) && !isCorrect;
          const localSelected = !item.answered && selected.includes(opt.id);
          const base =
            "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm font-semibold transition";
          const tone = isCorrect
            ? "border-teal-300 bg-teal-50 dark:border-teal-400/40 dark:bg-teal-400/10"
            : isWrongSelected
              ? "border-red-300 bg-red-50 dark:border-red-400/40 dark:bg-red-400/10"
              : localSelected
                ? "border-mina bg-mina/6"
                : "border-line hover:border-mina/40 dark:border-white/10";
          const inner = (
            <>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-extrabold opacity-70">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt.label}</span>
              {isCorrect && <CheckCircle2 size={16} className="shrink-0 text-teal-600" />}
              {isWrongSelected && <XCircle size={16} className="shrink-0 text-red-600" />}
            </>
          );
          if (canAnswer) {
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt.id)}
                className={`${base} ${tone} cursor-pointer`}
              >
                {inner}
              </button>
            );
          }
          return (
            <div key={opt.id} className={`${base} ${tone}`}>
              {inner}
            </div>
          );
        })}
      </div>
      {item.answered && item.explanation && (
        <div className="mt-4 rounded-xl border border-mina/20 bg-mina/5 p-4 text-xs leading-6 text-slate-600 dark:border-white/10 dark:bg-white/4 dark:text-slate-300">
          <strong className="font-extrabold text-mina">Explication — </strong>
          {item.explanation}
        </div>
      )}
      {canAnswer && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold text-slate-400">
            {selected.length === 0
              ? "Sélectionne une réponse."
              : multiple
                ? `${selected.length} réponse(s) sélectionnée(s)`
                : "Réponse sélectionnée"}
          </span>
          <Button onClick={onSubmit} loading={busy} disabled={selected.length === 0}>
            Valider la réponse
          </Button>
        </div>
      )}
    </Card>
  );
}

export function QcmPage() {
  const [mode, setMode] = useState<"menu" | "playing" | "finished">("menu");
  const [attempt, setAttempt] = useState<ActiveAttempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [answerBusy, setAnswerBusy] = useState(false);
  const [finishBusy, setFinishBusy] = useState(false);
  const [playLoading, setPlayLoading] = useState(false);
  const [playError, setPlayError] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [questionCount, setQuestionCount] = useState("10");
  const [startBusy, setStartBusy] = useState(false);
  const [startError, setStartError] = useState("");

  const [history, setHistory] = useState<Paginated<QcmAttempt> | null>(null);
  const [histPage, setHistPage] = useState(1);
  const [histReload, setHistReload] = useState(0);
  const [histLoading, setHistLoading] = useState(true);
  const [histError, setHistError] = useState("");

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

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    setHistError("");
    try {
      const res = await qcmService.listSessions(15, histPage);
      setHistory(res);
    } catch (e) {
      setHistory(null);
      setHistError(errorMessage(e));
    } finally {
      setHistLoading(false);
    }
  }, [histPage, histReload]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const startSession = async (e: FormEvent) => {
    e.preventDefault();
    setStartError("");
    setStartBusy(true);
    try {
      const res = await qcmService.createSession({
        subject_id: subjectId ? Number(subjectId) : undefined,
        level_id: levelId ? Number(levelId) : undefined,
        difficulty: difficulty || undefined,
        question_count: Math.min(50, Math.max(1, parseInt(questionCount, 10) || 10)),
      });
      setAttempt({ ...res.attempt, questions: res.attempt.questions ?? [] });
      setCurrentIndex(0);
      setSelected([]);
      setPlayError("");
      setMode("playing");
      setHistPage(1);
      setHistReload((r) => r + 1);
      toast.success(res.message);
    } catch (err) {
      setStartError(errorMessage(err));
    } finally {
      setStartBusy(false);
    }
  };

  const openAttempt = async (attemptId: number) => {
    setPlayLoading(true);
    setPlayError("");
    setMode("playing");
    setAttempt(null);
    try {
      const res = await qcmService.getSession(attemptId);
      const loaded = { ...res.attempt, questions: res.attempt.questions ?? [] };
      setAttempt(loaded);
      const idx = loaded.questions.findIndex((q) => !q.answered);
      setCurrentIndex(idx >= 0 ? idx : 0);
      setSelected([]);
      if (loaded.status === "completed") setMode("finished");
    } catch (e) {
      setPlayError(errorMessage(e));
      setMode("menu");
    } finally {
      setPlayLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!attempt || selected.length === 0) return;
    const item = attempt.questions[currentIndex];
    setAnswerBusy(true);
    setPlayError("");
    try {
      const res = await qcmService.answer(attempt.id, {
        question_id: item.question.id,
        option_ids: selected,
      });
      const a = res.answer;
      setAttempt({
        ...attempt,
        questions: attempt.questions.map((q, i) =>
          i === currentIndex
            ? {
                ...q,
                answered: true,
                selected_option_ids: a.selected_option_ids,
                is_correct: a.is_correct,
                correct_option_ids: a.correct_option_ids,
                explanation: a.explanation,
              }
            : q,
        ),
      });
      setSelected([]);
    } catch (e) {
      setPlayError(errorMessage(e));
    } finally {
      setAnswerBusy(false);
    }
  };

  const finishSession = async () => {
    if (!attempt) return;
    setFinishBusy(true);
    setPlayError("");
    try {
      const res = await qcmService.finish(attempt.id);
      setAttempt({ ...res.attempt, questions: res.attempt.questions ?? attempt.questions });
      setMode("finished");
      setHistPage(1);
      setHistReload((r) => r + 1);
      toast.success(res.message);
    } catch (e) {
      setPlayError(errorMessage(e));
    } finally {
      setFinishBusy(false);
    }
  };

  const selectOption = (optionId: number) => {
    if (!attempt) return;
    const item = attempt.questions[currentIndex];
    const multiple = item.question.question_type === "multiple";
    setSelected((prev) => {
      if (multiple) {
        return prev.includes(optionId) ? prev.filter((x) => x !== optionId) : [...prev, optionId];
      }
      return [optionId];
    });
  };

  const answeredCount = attempt ? attempt.questions.filter((q) => q.answered).length : 0;
  const current = attempt?.questions[currentIndex];
  const selectClass =
    "h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-mina dark:border-white/10 dark:bg-panel";

  return (
    <>
      <PageHeader
        eyebrow="Auto-évaluation"
        title="Entraîne-toi avec les QCM"
        description="Chaque réponse est corrigée et expliquée pour transformer tes erreurs en progrès."
      />

      {mode === "playing" && (
        <>
          {playLoading && (
            <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
              Chargement de la session…
            </p>
          )}
          {!playLoading && playError && !attempt && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
              <span>{playError}</span>
              <Button variant="secondary" onClick={() => setMode("menu")}>
                Retour au menu
              </Button>
            </div>
          )}
          {!playLoading && attempt && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setMode("menu")}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:text-mina"
                >
                  <ChevronLeft size={14} />
                  Quitter la session
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">
                    {answeredCount}/{attempt.total_questions} répondues
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => void finishSession()}
                    loading={finishBusy}
                    disabled={answeredCount === 0}
                  >
                    Terminer la session
                  </Button>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
                <div
                  className="h-full rounded-full bg-mina transition-all"
                  style={{
                    width: `${Math.round((answeredCount / Math.max(attempt.total_questions, 1)) * 100)}%`,
                  }}
                />
              </div>
              {playError && (
                <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
                  {playError}
                </p>
              )}
              {current && (
                <QuestionCard
                  item={current}
                  index={currentIndex}
                  total={attempt.questions.length}
                  selected={selected}
                  interactive
                  busy={answerBusy}
                  onSelect={selectOption}
                  onSubmit={() => void submitAnswer()}
                />
              )}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold disabled:opacity-40 dark:border-white/10 dark:bg-panel"
                >
                  <ChevronLeft size={14} />
                  Précédente
                </button>
                <span className="text-xs font-bold text-slate-400">
                  {currentIndex + 1} / {attempt.questions.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(attempt.questions.length - 1, i + 1))
                  }
                  disabled={currentIndex >= attempt.questions.length - 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold disabled:opacity-40 dark:border-white/10 dark:bg-panel"
                >
                  Suivante
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {mode === "finished" && attempt && (
        <div className="space-y-5">
          <Card className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-mina">
              Session terminée
            </p>
            <p className="mt-3 text-5xl font-extrabold">{attempt.score ?? 0}%</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {attempt.correct_count} bonne{attempt.correct_count > 1 ? "s" : ""} réponse
              {attempt.correct_count > 1 ? "s" : ""} sur {attempt.total_questions} ·{" "}
              {formatTime(attempt.time_spent_seconds)}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button
                onClick={() => {
                  setMode("menu");
                  setAttempt(null);
                  setStartError("");
                }}
              >
                <RotateCcw size={15} />
                Nouveau QCM
              </Button>
            </div>
          </Card>
          <h2 className="text-sm font-extrabold">Correction détaillée</h2>
          <div className="space-y-4">
            {attempt.questions.map((item, i) => (
              <QuestionCard
                key={item.question.id}
                item={item}
                index={i}
                total={attempt.questions.length}
                selected={[]}
                interactive={false}
                busy={false}
                onSelect={() => undefined}
                onSubmit={() => undefined}
              />
            ))}
          </div>
        </div>
      )}

      {mode === "menu" && (
        <>
          <Card>
            <h2 className="text-base font-extrabold">Nouvelle session</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Filtre par matière, niveau et difficulté — ou lance un QCM complet sans filtre.
            </p>
            <form onSubmit={startSession} className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block text-xs font-bold">
                Matière
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className={`${selectClass} mt-2 block w-44`}
                >
                  <option value="">Toutes</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold">
                Niveau
                <select
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value)}
                  className={`${selectClass} mt-2 block w-40`}
                >
                  <option value="">Tous</option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold">
                Difficulté
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}
                  className={`${selectClass} mt-2 block w-36`}
                >
                  <option value="">Toutes</option>
                  <option value="easy">Facile</option>
                  <option value="medium">Moyen</option>
                  <option value="hard">Difficile</option>
                </select>
              </label>
              <label className="block text-xs font-bold">
                Questions
                <input
                  type="text"
                  inputMode="numeric"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  className={`${selectClass} mt-2 block w-24`}
                />
              </label>
              <Button type="submit" loading={startBusy}>
                <Play size={15} />
                Démarrer le QCM
              </Button>
            </form>
            <p className="mt-3 text-[11px] text-slate-400">De 1 à 50 questions par session.</p>
            {startError && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
                {startError}
              </p>
            )}
          </Card>

          <h2 className="mb-3 mt-6 text-sm font-extrabold">Historique des sessions</h2>
          {histError && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
              <span>{histError}</span>
              <Button variant="secondary" onClick={() => void loadHistory()}>
                Réessayer
              </Button>
            </div>
          )}
          {histLoading && (
            <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
              <LoaderCircle size={16} className="mr-2 inline animate-spin" />
              Chargement de l’historique…
            </p>
          )}
          {!histLoading && !histError && history && history.data.length === 0 && (
            <EmptyState
              icon={<FileQuestion size={24} />}
              title="Aucune session pour l’instant"
              description="Lance ton premier QCM pour commencer à suivre tes progrès."
            />
          )}
          {!histLoading && history && history.data.length > 0 && (
            <div className="space-y-2">
              {history.data.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line bg-white px-5 py-4 dark:border-white/8 dark:bg-panel"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold">
                      Session #{a.id} · {a.subject?.name ?? "Toutes matières"} ·{" "}
                      {a.level?.name ?? "Tous niveaux"}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatDate(a.created_at)} · {a.total_questions} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.status === "completed" ? (
                      <>
                        <Badge tone={(a.score ?? 0) >= 50 ? "teal" : "red"}>{a.score ?? 0}%</Badge>
                        <span className="text-xs font-bold text-slate-500">
                          {a.correct_count}/{a.total_questions}
                        </span>
                      </>
                    ) : (
                      <Badge tone="amber">En cours</Badge>
                    )}
                    <Button
                      variant={a.status === "in_progress" ? "secondary" : "ghost"}
                      onClick={() => void openAttempt(a.id)}
                    >
                      {a.status === "in_progress" ? "Reprendre" : "Voir"}
                    </Button>
                  </div>
                </div>
              ))}
              <Pagination
                page={history.meta.current_page}
                lastPage={history.meta.last_page}
                total={history.meta.total}
                itemLabel="session"
                onPage={setHistPage}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
