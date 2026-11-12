import type { ReactNode } from "react";
import { ArrowDownToLine, ArrowUpRight, Clock3, MoreHorizontal } from "lucide-react";
import { Badge, Card } from "../ui/Primitives";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-mina">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-mina/8 p-2.5 text-mina">{icon}</div>
        <Badge tone={delta.startsWith("+") ? "teal" : "slate"}>{delta}</Badge>
      </div>
      <p className="mt-5 text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-400">{label}</p>
    </Card>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-[22px] border border-line bg-white shadow-card dark:border-white/8 dark:bg-panel">
      <table className="w-full min-w-[650px] text-left text-xs">
        <thead>
          <tr className="border-b border-line bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:border-white/8 dark:bg-white/4">
            {headers.map((h) => (
              <th key={h} className="px-5 py-4 font-extrabold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-line last:border-0 hover:bg-slate-50/70 dark:border-white/8 dark:hover:bg-white/3"
            >
              {r.map((cell, j) => (
                <td key={j} className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ActivityItem({
  title,
  meta,
  status = "Planifié",
}: {
  title: string;
  meta: string;
  status?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line py-3 last:border-0 dark:border-white/8">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/6">
        <Clock3 size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">{title}</p>
        <p className="mt-1 text-[10px] text-slate-400">{meta}</p>
      </div>
      <Badge tone={status === "Urgent" ? "red" : status === "Terminé" ? "teal" : "slate"}>
        {status}
      </Badge>
    </div>
  );
}

export function DownloadButton({ label = "Exporter" }: { label?: string }) {
  return (
    <button
      onClick={() => alert(`${label} simulé avec succès.`)}
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-bold hover:border-mina dark:border-white/10 dark:bg-panel"
    >
      <ArrowDownToLine size={15} />
      {label}
    </button>
  );
}
