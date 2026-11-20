import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore, type ToastKind } from "../../store/toastStore";

const styles: Record<ToastKind, string> = {
  success:
    "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-100",
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100",
  info: "border-line bg-white text-ink dark:border-white/10 dark:bg-panel dark:text-slate-100",
};

function KindIcon({ kind }: { kind: ToastKind }) {
  if (kind === "success")
    return <CheckCircle2 size={18} className="shrink-0 text-teal-600 dark:text-teal-400" />;
  if (kind === "error")
    return <AlertCircle size={18} className="shrink-0 text-red-600 dark:text-red-400" />;
  return <Info size={18} className="shrink-0 text-mina" />;
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  if (!toasts.length) return null;
  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-bold shadow-card ${styles[t.kind]}`}
          role="status"
        >
          <KindIcon kind={t.kind} />
          <p className="flex-1 leading-5">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="rounded p-0.5 opacity-60 hover:opacity-100"
            aria-label="Fermer"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
