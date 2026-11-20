import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  lastPage,
  total,
  itemLabel,
  onPage,
}: {
  page: number;
  lastPage: number;
  total: number;
  itemLabel: string;
  onPage: (page: number) => void;
}) {
  if (lastPage <= 1 && total === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500">
      <span>
        Page {page} sur {Math.max(lastPage, 1)} · {total} {itemLabel}
        {total > 1 ? "s" : ""}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 disabled:opacity-40 dark:border-white/10 dark:bg-panel"
        >
          <ChevronLeft size={14} />
          Précédent
        </button>
        <button
          type="button"
          onClick={() => onPage(Math.min(lastPage, page + 1))}
          disabled={page >= lastPage}
          className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 disabled:opacity-40 dark:border-white/10 dark:bg-panel"
        >
          Suivant
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
