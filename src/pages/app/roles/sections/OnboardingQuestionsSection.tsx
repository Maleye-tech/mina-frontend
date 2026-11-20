import { useCallback, useEffect, useState } from "react";
import { Save, Settings2 } from "lucide-react";
import { Button, Card } from "../../../../components/ui/Primitives";
import { PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { ApiError } from "../../../../lib/api";
import { authService } from "../../../../services/authService";
import { toast } from "../../../../store/toastStore";
import type { OnboardingQuestion } from "../../../../types/api";

type Draft = {
  label: string;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 text-sm outline-none focus:border-mina dark:border-white/10 dark:bg-panel";

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (Object.keys(e.fieldErrors).length) return Object.values(e.fieldErrors).join(" · ");
    return e.message;
  }
  return (e as Error).message;
}

export function OnboardingQuestionsSection({ title, desc }: { title: string; desc: string }) {
  const [questions, setQuestions] = useState<OnboardingQuestion[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await authService.getQuestions();
      const sorted = [...res.questions].sort((a, b) => a.sort_order - b.sort_order);
      setQuestions(sorted);
      setDrafts(
        Object.fromEntries(
          sorted.map((q) => [
            q.key,
            {
              label: q.label,
              is_required: q.is_required,
              is_active: q.is_active ?? true,
              sort_order: q.sort_order,
            },
          ]),
        ),
      );
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateDraft = (key: string, patch: Partial<Draft>) => {
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const save = async (key: string) => {
    const draft = drafts[key];
    if (!draft) return;
    setSavingKey(key);
    setErrors((prev) => ({ ...prev, [key]: "" }));
    try {
      const updated = await authService.updateQuestion(key, draft);
      setQuestions((prev) =>
        prev
          ? [...prev]
              .map((q) => (q.key === key ? { ...q, ...updated } : q))
              .sort((a, b) => a.sort_order - b.sort_order)
          : prev,
      );
      toast.success(`Question « ${draft.label} » mise à jour.`);
    } catch (e) {
      setErrors((prev) => ({ ...prev, [key]: errorMessage(e) }));
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Administration" title={title} description={desc} />
      {loading && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement des questions…
        </p>
      )}
      {loadError && (
        <div className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {loadError}
        </div>
      )}
      {!loading && questions && questions.length === 0 && (
        <EmptyState
          icon={<Settings2 size={24} />}
          title="Aucune question configurée"
          description="Les questions d’onboarding seront chargées depuis l’API Mina dès que son endpoint sera disponible."
        />
      )}
      {!loading && questions && questions.length > 0 && (
        <div className="grid gap-4">
          {questions.map((question) => {
            const draft = drafts[question.key];
            if (!draft) return null;
            return (
              <Card key={question.key}>
                <div className="grid gap-4 md:grid-cols-[1.4fr_.5fr_.5fr_auto] md:items-end">
                  <label className="block text-xs font-bold">
                    Libellé
                    <input
                      value={draft.label}
                      onChange={(e) => updateDraft(question.key, { label: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-xs font-bold">
                    Ordre
                    <input
                      type="number"
                      min={1}
                      value={draft.sort_order}
                      onChange={(e) =>
                        updateDraft(question.key, { sort_order: Number(e.target.value) || 1 })
                      }
                      className={inputClass}
                    />
                  </label>
                  <div className="space-y-2 pb-1 text-xs font-bold">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={draft.is_required}
                        onChange={(e) =>
                          updateDraft(question.key, { is_required: e.target.checked })
                        }
                        className="accent-mina"
                      />
                      Requis
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={draft.is_active}
                        onChange={(e) => updateDraft(question.key, { is_active: e.target.checked })}
                        className="accent-mina"
                      />
                      Actif
                    </label>
                  </div>
                  <Button
                    loading={savingKey === question.key}
                    onClick={() => void save(question.key)}
                  >
                    <Save size={15} />
                    Enregistrer
                  </Button>
                </div>
                <p className="mt-3 text-[10px] text-slate-400">
                  Clé API : <code className="font-mono">{question.key}</code> · Type :{" "}
                  <code className="font-mono">{question.input_type}</code>
                </p>
                {errors[question.key] && (
                  <p className="mt-2 text-xs font-bold text-red-500">{errors[question.key]}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
