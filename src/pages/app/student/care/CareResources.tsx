import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { Pagination } from "../../../../components/ui/Pagination";
import { Badge, Button, Card } from "../../../../components/ui/Primitives";
import { Markdown } from "../../../../lib/markdown";
import { errorMessage } from "../../../../lib/api";
import { wellbeingService } from "../../../../services/wellbeingService";
import { toast } from "../../../../store/toastStore";
import type { Paginated } from "../../../../types/api";
import type { WellbeingArticle, WellbeingCategory } from "../../../../types/wellbeing";
import { ConsentModal } from "./ConsentModal";

const CATEGORY_LABELS: Record<WellbeingCategory, string> = {
  stress: "Stress",
  burnout: "Burn-out",
  sleep: "Sommeil",
};

export function CareResources() {
  const [mode, setMode] = useState<"list" | "detail">("list");
  const [articles, setArticles] = useState<Paginated<WellbeingArticle> | null>(null);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [article, setArticle] = useState<WellbeingArticle | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await wellbeingService.listArticles({
        category: (category || undefined) as WellbeingCategory | undefined,
        per_page: 10,
        page,
      });
      setArticles(res);
    } catch (e) {
      setArticles(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const openArticle = async (slug: string) => {
    setDetailLoading(true);
    setDetailError("");
    setArticle(null);
    setMode("detail");
    try {
      const res = await wellbeingService.getArticle(slug);
      setArticle(res);
    } catch (e) {
      setDetailError(errorMessage(e));
      toast.error(errorMessage(e));
    } finally {
      setDetailLoading(false);
    }
  };

  const back = () => {
    setMode("list");
    setArticle(null);
  };

  const consentHint = (loadError || detailError).includes("consentement");
  const [consentOpen, setConsentOpen] = useState(false);
  useEffect(() => {
    if (consentHint) setConsentOpen(true);
  }, [consentHint]);
  const consentModal = (
    <ConsentModal
      open={consentOpen}
      onClose={() => setConsentOpen(false)}
      onGranted={() => {
        setConsentOpen(false);
        setLoadError("");
        setDetailError("");
        if (mode === "detail" && article) void openArticle(article.slug);
        else void load();
      }}
    />
  );
  const selectClass =
    "h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-care dark:border-white/10 dark:bg-panel";

  if (mode === "detail") {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={back}>
          <ArrowLeft size={15} />
          Toutes les fiches
        </Button>
        {detailLoading && (
          <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
            Chargement de la fiche…
          </p>
        )}
        {detailError && (
          <div className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
            {detailError}
            {consentHint && (
              <div className="mt-3">
                <Button variant="care" onClick={() => setConsentOpen(true)}>
                  Accorder le consentement
                </Button>
              </div>
            )}
          </div>
        )}
        {article && (
          <Card>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="violet">
                {CATEGORY_LABELS[article.category] ?? article.category_label}
              </Badge>
              <span className="text-[11px] font-bold text-slate-400">
                {new Date(article.updated_at || article.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-extrabold leading-7">{article.title}</h2>
            <div className="mt-4">
              <Markdown content={article.content} />
            </div>
          </Card>
        )}
        {consentModal}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Fiches de prévention pour prendre soin de toi au quotidien.
        </p>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">Toutes les catégories</option>
          <option value="stress">Stress</option>
          <option value="burnout">Burn-out</option>
          <option value="sleep">Sommeil</option>
        </select>
      </div>

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

      {loading && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement des fiches…
        </p>
      )}

      {!loading && !loadError && articles && articles.data.length === 0 && (
        <EmptyState
          icon={<BookOpen size={24} />}
          title="Aucune fiche disponible"
          description="Les fiches de prévention publiées apparaîtront ici."
        />
      )}

      {!loading && articles && articles.data.length > 0 && (
        <div className="space-y-3">
          {articles.data.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => void openArticle(a.slug)}
              className="flex w-full items-center justify-between gap-3 rounded-[22px] border border-line bg-white px-5 py-4 text-left transition hover:border-care/40 dark:border-white/8 dark:bg-panel"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="violet">{CATEGORY_LABELS[a.category] ?? a.category_label}</Badge>
                  <span className="text-[11px] font-bold text-slate-400">
                    {new Date(a.updated_at || a.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-extrabold">{a.title}</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-slate-400" />
            </button>
          ))}
          <Pagination
            page={articles.meta.current_page}
            lastPage={articles.meta.last_page}
            total={articles.meta.total}
            itemLabel="fiche"
            onPage={setPage}
          />
        </div>
      )}
      {consentModal}
    </div>
  );
}
