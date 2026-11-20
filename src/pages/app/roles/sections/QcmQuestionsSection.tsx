import { useCallback, useEffect, useState } from "react";
import { Eye, FileQuestion, RefreshCw, X } from "lucide-react";
import { Badge, Button } from "../../../../components/ui/Primitives";
import { DataTable, PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { Pagination } from "../../../../components/ui/Pagination";
import { errorMessage } from "../../../../lib/api";
import { libraryService } from "../../../../services/libraryService";
import { qcmService } from "../../../../services/qcmService";
import { toast } from "../../../../store/toastStore";
import type { Paginated } from "../../../../types/api";
import type { Difficulty, QcmQuestionDetail, QcmQuestionSummary } from "../../../../types/assessment";
import type { Level, Subject } from "../../../../types/library";

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

const TYPE_LABELS: Record<string, string> = {
  single: "Unique",
  multiple: "Multiple",
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

export function QcmQuestionsSection({ title, desc }: { title: string; desc: string }) {
  const [questions, setQuestions] = useState<Paginated<QcmQuestionSummary> | null>(null);
  const [page, setPage] = useState(1);
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [detail, setDetail] = useState<QcmQuestionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
      } catch {
        /* filtres optionnels : la liste reste utilisable sans eux */
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
      const res = await qcmService.listQuestions({
        subject_id: subjectId ? Number(subjectId) : undefined,
        level_id: levelId ? Number(levelId) : undefined,
        difficulty: difficulty || undefined,
        per_page: 15,
        page,
      });
      setQuestions(res);
    } catch (e) {
      setQuestions(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [subjectId, levelId, difficulty, page, reload]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = async (questionId: number) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await qcmService.getQuestion(questionId);
      setDetail(res.question);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setDetailLoading(false);
    }
  };

  const rows = (questions?.data ?? []).map((q) => [
    <p
      key={q.id}
      className="line-clamp-2 max-w-md font-extrabold text-ink dark:text-white"
      title={q.question}
    >
      {q.question}
    </p>,
    <span key={`${q.id}-subject`}>{q.subject.name}</span>,
    <span key={`${q.id}-level`}>{q.level.name}</span>,
    <Badge key={`${q.id}-diff`} tone={DIFFICULTY_TONES[q.difficulty]}>
      {DIFFICULTY_LABELS[q.difficulty]}
    </Badge>,
    <span key={`${q.id}-type`}>{TYPE_LABELS[q.question_type] ?? q.question_type}</span>,
    <span key={`${q.id}-date`} className="text-slate-400">
      {formatDate(q.created_at)}
    </span>,
    <button
      key={`${q.id}-open`}
      onClick={() => void openDetail(q.id)}
      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-mina dark:hover:bg-white/8"
      aria-label={`Voir la question ${q.id}`}
    >
      <Eye size={15} />
    </button>,
  ]);

  const selectClass =
    "h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-mina dark:border-white/10 dark:bg-panel";

  return (
    <>
      <PageHeader eyebrow="Administration Mina" title={title} description={desc} />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="block text-xs font-bold">
          Matière
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setLevelId(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setDifficulty(e.target.value as Difficulty | "");
              setPage(1);
            }}
            className={`${selectClass} mt-2 block w-36`}
          >
            <option value="">Toutes</option>
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </label>
        <Button variant="secondary" onClick={() => setReload((r) => r + 1)}>
          <RefreshCw size={14} />
          Actualiser
        </Button>
      </div>

      {loadError && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {loadError}
        </div>
      )}

      {loading && !questions && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement des questions…
        </p>
      )}

      {!loading && !loadError && questions && questions.data.length === 0 && (
        <EmptyState
          icon={<FileQuestion size={24} />}
          title="Aucune question"
          description="Aucune question ne correspond aux filtres sélectionnés."
        />
      )}

      {questions && questions.data.length > 0 && (
        <>
          <DataTable
            headers={["Énoncé", "Matière", "Niveau", "Difficulté", "Type", "Créée le", ""]}
            rows={rows}
          />
          <Pagination
            page={questions.meta.current_page}
            lastPage={questions.meta.last_page}
            total={questions.meta.total}
            itemLabel="question"
            onPage={setPage}
          />
        </>
      )}

      {(detail || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[22px] bg-white p-6 dark:bg-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading || !detail ? (
              <p className="py-8 text-center text-sm font-bold text-slate-400">Chargement…</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={DIFFICULTY_TONES[detail.difficulty]}>
                      {DIFFICULTY_LABELS[detail.difficulty]}
                    </Badge>
                    <Badge tone="teal">{detail.subject.name}</Badge>
                    <Badge tone="violet">{detail.level.name}</Badge>
                    <Badge tone="slate">
                      {TYPE_LABELS[detail.question_type] ?? detail.question_type}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setDetail(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-mina dark:hover:bg-white/8"
                    aria-label="Fermer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <h3 className="mt-4 text-sm font-extrabold leading-6">{detail.question}</h3>
                <p className="mt-1 text-[11px] font-bold text-slate-400">
                  Créée le {formatDate(detail.created_at)}
                </p>
                <div className="mt-4 space-y-2">
                  {[...detail.options]
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((opt, i) => (
                      <div
                        key={opt.id}
                        className="flex items-start gap-3 rounded-xl border border-line p-3.5 text-sm font-semibold dark:border-white/10"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-extrabold opacity-70">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                    ))}
                </div>
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  La correction et l’explication ne sont jamais exposées côté lecture.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
