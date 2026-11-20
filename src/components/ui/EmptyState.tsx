import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title = "Aucune donnée disponible",
  description = "Cette section sera alimentée par l’API Mina dès que son endpoint sera disponible.",
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-line bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-panel">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/6">
        {icon ?? <Inbox size={24} />}
      </div>
      <h2 className="mt-5 text-base font-extrabold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
