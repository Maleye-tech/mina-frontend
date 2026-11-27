import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  Video,
} from "lucide-react";
import { Button } from "../ui/Primitives";
import type { CareAppointment, CareAppointmentStatus } from "../../types/care";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatCareDate(value: string | null): string {
  if (!value) return "Date à confirmer";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date à confirmer" : dateFormatter.format(date);
}

export function formatCareTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : timeFormatter.format(date);
}

const statusTone: Record<CareAppointmentStatus, "teal" | "amber" | "violet" | "slate" | "red"> = {
  requested: "amber",
  pending: "amber",
  proposed: "violet",
  confirmed: "teal",
  declined: "red",
  cancelled: "slate",
  completed: "violet",
};

export function StatusBadge({ status }: { status: CareAppointmentStatus }) {
  const labels: Record<CareAppointmentStatus, string> = {
    requested: "Demande envoyée",
    pending: "En attente",
    proposed: "Nouveau créneau proposé",
    confirmed: "Confirmé",
    declined: "Décliné",
    cancelled: "Annulé",
    completed: "Terminé",
  };
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${
        statusTone[status] === "teal"
          ? "bg-teal-50 text-teal-800 dark:bg-teal-400/10 dark:text-teal-300"
          : statusTone[status] === "amber"
            ? "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300"
            : statusTone[status] === "violet"
              ? "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"
              : statusTone[status] === "red"
                ? "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300"
                : "bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-300"
      }`}
    >
      {labels[status]}
    </span>
  );
}

export function CarePageHeader({
  eyebrow = "Mina Care",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-mina">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink dark:text-white sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200"
    >
      <AlertCircle className="shrink-0" size={18} />
      <p className="flex-1 leading-5">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-line bg-white/60 px-5 py-10 text-center dark:border-white/10 dark:bg-white/[.02]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-mina dark:bg-teal-400/10">
        {icon ?? <CalendarDays size={22} />}
      </div>
      <h2 className="mt-4 text-base font-extrabold text-ink dark:text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function CareLoading({ label = "Chargement…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-12 text-sm font-bold text-slate-500">
      <LoaderCircle className="animate-spin text-mina" size={20} />
      {label}
    </div>
  );
}

export function AppointmentCard({
  appointment,
  perspective,
  href,
  action,
}: {
  appointment: CareAppointment;
  perspective: "student" | "professional";
  href: string;
  action?: ReactNode;
}) {
  const title =
    perspective === "professional"
      ? appointment.student?.pseudonym ?? "Étudiant anonyme"
      : appointment.professional.display_name;
  const subtitle = appointment.professional.specialty_label;

  return (
    <article className="rounded-[22px] border border-line bg-white p-5 shadow-card dark:border-white/8 dark:bg-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-extrabold text-ink dark:text-white">{title}</h2>
          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <CalendarDays size={16} className="text-mina" />
          <span className="capitalize">{formatCareDate(appointment.scheduled_at)}</span>
        </p>
        <p className="flex items-center gap-2">
          <Clock3 size={16} className="text-mina" />
          {formatCareTime(appointment.scheduled_at)} · {appointment.duration_minutes} min
        </p>
        <p className="flex items-center gap-2">
          {appointment.consultation_type === "chat" ? (
            <MessageCircle size={16} className="text-mina" />
          ) : (
            <Video size={16} className="text-mina" />
          )}
          {appointment.consultation_type === "chat" ? "Chat écrit" : "Visioconférence"}
        </p>
      </div>
      {appointment.reason && (
        <p className="mt-4 line-clamp-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-white/5 dark:text-slate-300">
          {appointment.reason}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 dark:border-white/8">
        <p className="text-[11px] font-bold text-slate-400">
          {appointment.can_chat ? "Messagerie sécurisée disponible" : "Messagerie après confirmation"}
        </p>
        <div className="flex flex-wrap gap-2">
          {action}
          <Link
            to={href}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold text-mina hover:bg-teal-50 dark:hover:bg-teal-400/10"
          >
            Voir le détail <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-4 sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-confirm-title"
        aria-describedby="care-confirm-description"
        className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl dark:bg-panel"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-mina dark:bg-teal-400/10">
          {danger ? <AlertCircle size={21} /> : <CheckCircle2 size={21} />}
        </div>
        <h2 id="care-confirm-title" className="mt-4 text-lg font-extrabold text-ink dark:text-white">
          {title}
        </h2>
        <p id="care-confirm-description" className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            disabled={loading}
            onClick={onClose}
            className="min-h-11 rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/8"
          >
            Annuler
          </button>
          <Button
            loading={loading}
            onClick={onConfirm}
            className={danger ? "!bg-red-600 hover:!bg-red-700" : ""}
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}

export function ConfidentialityNotice() {
  return (
    <div className="flex gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-xs leading-5 text-teal-900 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-100">
      <LockKeyhole className="mt-0.5 shrink-0" size={17} />
      <p>
        Les échanges et notes privées sont chiffrés au repos. Ils ne sont jamais conservés dans le
        stockage hors-ligne de cet appareil.
      </p>
    </div>
  );
}
