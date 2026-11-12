import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  loading,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "care";
  loading?: boolean;
}) {
  const styles = {
    primary: "bg-mina text-white hover:bg-mina-dark shadow-[0_8px_22px_rgba(15,118,110,.2)]",
    secondary:
      "bg-white text-ink border border-line hover:border-mina/40 dark:bg-white/8 dark:text-white dark:border-white/10",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/8",
    care: "bg-care text-white hover:bg-care-dark shadow-[0_8px_22px_rgba(124,111,219,.2)]",
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mina disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "teal",
}: {
  children: ReactNode;
  tone?: "teal" | "amber" | "violet" | "slate" | "red";
}) {
  const c = {
    teal: "bg-teal-50 text-teal-800 dark:bg-teal-400/10 dark:text-teal-300",
    amber: "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
    slate: "bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-300",
    red: "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${c}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[22px] border border-line bg-white p-5 shadow-card dark:border-white/8 dark:bg-panel ${className}`}
    >
      {children}
    </div>
  );
}

export function Progress({ value, care = false }: { value: number; care?: boolean }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
      <div
        className={`h-full rounded-full ${care ? "bg-care" : "bg-mina"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
