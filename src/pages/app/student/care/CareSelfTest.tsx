import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ClipboardList, History, LoaderCircle, Sparkles, X } from "lucide-react";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { Badge, Button, Card } from "../../../../components/ui/Primitives";
import { errorMessage } from "../../../../lib/api";
import { wellbeingService } from "../../../../services/wellbeingService";
import { toast } from "../../../../store/toastStore";
import type {
  WellbeingResult,
  WellbeingTest,
  WellbeingTestDetail,
} from "../../../../types/wellbeing";
import { ConsentModal } from "./ConsentModal";

const TYPE_TONES: Record<string, "teal" | "violet" | "amber"> = {
  anxiety: "violet",
  stress: "amber",
  wellbeing: "teal",
};

const LEVEL_LABELS: Record<string, string> = {
  low: "Faible",
  moderate: "Modéré",
  high: "Élevé",
  unknown: "Indéterminé",
};

function levelLabel(level: string | null | undefined): string {
  if (!level) return "";
  return LEVEL_LABELS[level] ?? level;
}

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

function ResultView({ result, onBack }: { result: WellbeingResult; onBack: () => void }) {
  const percentage = Math.max(0, Math.min(100, result.percentage ?? 0));
  return (
    <div className="space-y-4">
      <Card className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-care/10 text-care">
          <Sparkles size={24} />
        </div>
        <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[.2em] text-care">
          {result.test?.title ?? "Test d’auto-évaluation"}
        </p>
        <p className="mt-3 text-4xl font-extrabold text-care">{percentage}%</p>
        <p className="mt-1 text-xs font-bold text-slate-500">
          {result.score} / {result.max_score} points
        </p>
        {result.level && (
          <div className="mt-4 inline-flex">
            <Badge tone="violet">{levelLabel(result.level)}</Badge>
          </div>
        )}
        {result.feedback && (
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600 dark:text-slate-300">
            {result.feedback}
          </p>
        )}
        {result.disclaimer && (
          <p className="mx-auto mt-4 max-w-lg rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500 dark:bg-white/5 dark:text-slate-400">
            {result.disclaimer}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft size={15} />
            Retour
          </Button>
        </div>
      </Card>

      {result.answers.length > 0 && (
        <Card>
          <h3 className="text-sm font-extrabold">Récapitulatif de tes réponses</h3>
          <div className="mt-3 space-y-3">
            {result.answers.map((a, i) => (
              <div
                key={`${a.question_id}-${i}`}
                className="rounded-xl border border-line p-3.5 dark:border-white/8"
              >
                <p className="text-xs font-bold text-slate-400">Question {i + 1}</p>
                <p className="mt-1 text-sm font-semibold leading-6">{a.question_text}</p>
                <p className="mt-1.5 text-xs font-bold text-care">→ {a.option_label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export function CareSelfTest() {
  const [mode, setMode] = useState<"list" | "taking" | "result">("list");
  const [tests, setTests] = useState<WellbeingTest[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [history, setHistory] = useState<WellbeingResult[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const [test, setTest] = useState<WellbeingTestDetail | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const [result, setResult] = useState<WellbeingResult | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await wellbeingService.listTests({ per_page: 50 });
      setTests(res.data);
    } catch (e) {
      setTests(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await wellbeingService.listResults({ per_page: 20 });
      setHistory(res.data);
    } catch (e) {
      setHistory(null);
      setHistoryError(errorMessage(e));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const toggleHistory = () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next && history === null && !historyLoading) void loadHistory();
  };

  const startTest = async (testId: number) => {
    setActionError("");
    setAnswers({});
    setResult(null);
    try {
      const res = await wellbeingService.getTest(testId);
      if (!res.questions || res.questions.length === 0) {
        toast.error("Ce test ne contient aucune question.");
        return;
      }
      setTest(res);
      setMode("taking");
    } catch (e) {
      setActionError(errorMessage(e));
      toast.error(errorMessage(e));
    }
  };

  const submitTest = async () => {
    if (!test) return;
    const payload = test.questions.map((q) => ({
      question_id: q.id,
      option_key: answers[q.id],
    }));
    setBusy(true);
    setActionError("");
    try {
      const res = await wellbeingService.submitResults(test.id, payload);
      setResult(res.result);
      setMode("result");
      setHistory(null);
      toast.success(res.message);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const openResult = async (resultId: number) => {
    setActionError("");
    try {
      const res = await wellbeingService.getResult(resultId);
      setResult(res);
      setMode("result");
      setShowHistory(false);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const backToList = () => {
    setMode("list");
    setTest(null);
    setResult(null);
    setAnswers({});
    setActionError("");
    setHistory(null);
  };

  const consentHint = (loadError + actionError + historyError).includes("consentement");

  useEffect(() => {
    if (consentHint) setConsentOpen(true);
  }, [consentHint]);

  const consentModal = (
    <ConsentModal
      open={consentOpen}
      onClose={() => setConsentOpen(false)}
      onGranted={() => {
        setConsentOpen(false);
        setActionError("");
        setHistoryError("");
        void load();
        if (showHistory && historyError) void loadHistory();
      }}
    />
  );
  const answeredCount = test ? test.questions.filter((q) => answers[q.id]).length : 0;
  const allAnswered = !!test && answeredCount === test.questions.length;

  if (mode === "taking" && test) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone={TYPE_TONES[test.type] ?? "teal"}>{test.type_label}</Badge>
            <h2 className="mt-2 text-lg font-extrabold">{test.title}</h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {answeredCount}/{test.questions.length} répondues
          </span>
        </div>

        {actionError && (
          <div className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
            {actionError}
          </div>
        )}

        <div className="space-y-3">
          {test.questions.map((q, index) => (
            <Card key={q.id} className={answers[q.id] ? undefined : "!border-care/40"}>
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-care">
                Question {index + 1} / {test.questions.length}
              </p>
              <p className="mt-2 text-sm font-extrabold leading-6">{q.question_text}</p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm font-semibold transition ${
                        selected
                          ? "border-care bg-care/8 text-care"
                          : "border-line hover:border-care/40 dark:border-white/10"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-extrabold ${
                          selected ? "border-care bg-care text-white" : "border-slate-300"
                        }`}
                      >
                        {opt.key.toUpperCase()}
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={backToList}>
            <X size={15} />
            Abandonner
          </Button>
          <Button disabled={!allAnswered || busy} onClick={() => void submitTest()}>
            {busy && <LoaderCircle size={15} className="animate-spin" />}
            {allAnswered
              ? "Voir mon résultat"
              : `Reste ${test.questions.length - answeredCount} question(s)`}
          </Button>
        </div>

        {test.disclaimer && (
          <p className="rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500 dark:bg-white/5 dark:text-slate-400">
            {test.disclaimer}
          </p>
        )}
        {consentModal}
      </div>
    );
  }

  if (mode === "result" && result) {
    return (
      <>
        <ResultView result={result} onBack={backToList} />
        {consentModal}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Des questionnaires courts pour observer ton état d’esprit — sans diagnostic médical.
        </p>
        <Button variant="secondary" onClick={toggleHistory}>
          <History size={15} />
          Mes résultats
        </Button>
      </div>

      {actionError && (
        <div className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {actionError}
        </div>
      )}

      {showHistory && (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-extrabold">Historique de mes résultats</h3>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="text-slate-400 transition hover:text-slate-600"
              aria-label="Fermer l’historique"
            >
              <X size={16} />
            </button>
          </div>
          {historyLoading && (
            <p className="mt-3 rounded-xl border border-dashed border-line p-6 text-center text-xs font-bold text-slate-400 dark:border-white/10">
              Chargement…
            </p>
          )}
          {historyError && (
            <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
              <p>{historyError}</p>
              {consentHint && (
                <div className="mt-2">
                  <Button variant="care" onClick={() => setConsentOpen(true)}>
                    Accorder le consentement
                  </Button>
                </div>
              )}
            </div>
          )}
          {!historyLoading && !historyError && history && history.length === 0 && (
            <p className="mt-3 text-xs font-bold text-slate-400">
              Tu n’as encore passé aucun test.
            </p>
          )}
          {!historyLoading && history && history.length > 0 && (
            <div className="mt-3 space-y-2">
              {history.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-3 dark:border-white/8"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-extrabold">
                      {r.test?.title ?? "Test d’auto-évaluation"}
                    </p>
                    <Badge tone="violet">{r.percentage ?? r.score}%</Badge>
                    <span className="text-[11px] font-bold text-slate-400">
                      {formatDate(r.created_at)}
                    </span>
                  </div>
                  <Button variant="ghost" onClick={() => void openResult(r.id)}>
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {loading && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement des tests…
        </p>
      )}

      {loadError && (
        <div className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          <p>{loadError}</p>
          {consentHint && (
            <div className="mt-3">
              <Button variant="care" onClick={() => setConsentOpen(true)}>
                Accorder le consentement
              </Button>
            </div>
          )}
          {!consentHint && (
            <Button variant="secondary" className="mt-3" onClick={() => void load()}>
              Réessayer
            </Button>
          )}
        </div>
      )}

      {!loading && !loadError && tests && tests.length === 0 && (
        <EmptyState
          icon={<ClipboardList size={24} />}
          title="Aucun test disponible"
          description="Les questionnaires d’auto-évaluation publiés apparaîtront ici."
        />
      )}

      {!loading && tests && tests.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {tests.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone={TYPE_TONES[t.type] ?? "teal"}>{t.type_label}</Badge>
                <Badge tone="slate">
                  {t.questions_count} question{t.questions_count > 1 ? "s" : ""}
                </Badge>
              </div>
              <h3 className="mt-3 text-sm font-extrabold">{t.title}</h3>
              {t.description && (
                <p className="mt-1.5 flex-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {t.description}
                </p>
              )}
              <div className="mt-4">
                <Button variant="care" onClick={() => void startTest(t.id)}>
                  Démarrer le test
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {consentModal}
    </div>
  );
}
