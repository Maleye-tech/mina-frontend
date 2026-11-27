import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge, Button } from "../../../../components/ui/Primitives";
import { DataTable, PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { errorMessage } from "../../../../lib/api";
import { appointmentsService } from "../../../../services/appointmentsService";
import { toast } from "../../../../store/toastStore";
import type { Alert, AlertStatus } from "../../../../types/appointment";

const STATUS_LABELS: Record<AlertStatus, string> = {
  open: "Ouverte",
  acknowledged: "Acquittée",
  resolved: "Résolue",
};

const STATUS_TONES: Record<AlertStatus, "red" | "amber" | "teal"> = {
  open: "red",
  acknowledged: "amber",
  resolved: "teal",
};

const SEVERITY_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  critical: "Critique",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
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

export function AlertesSection({ title, desc }: { title: string; desc: string }) {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [status, setStatus] = useState<AlertStatus | "">("open");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const list = await appointmentsService.listAlerts({
        status: status || undefined,
        per_page: 50,
      });
      setAlerts(list);
    } catch (e) {
      setAlerts(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (alert: Alert, next: AlertStatus) => {
    setSavingId(alert.id);
    try {
      const res = await appointmentsService.updateAlert(alert.id, next);
      toast.success(res.message);
      await load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSavingId(null);
    }
  };

  const rows = (alerts ?? []).map((a) => [
    <div key={a.id}>
      <p className="font-extrabold text-ink dark:text-white">{a.title}</p>
      <p className="mt-0.5 max-w-md text-[11px] leading-4 text-slate-500">{a.message}</p>
    </div>,
    <Badge key={`${a.id}-severity`} tone={a.severity === "high" || a.severity === "critical" ? "red" : a.severity === "medium" ? "amber" : "slate"}>
      {SEVERITY_LABELS[a.severity] ?? a.severity}
    </Badge>,
    <Badge key={`${a.id}-status`} tone={STATUS_TONES[a.status]}>
      {STATUS_LABELS[a.status]}
    </Badge>,
    <div key={`${a.id}-subject`} className="text-[11px] font-bold text-slate-400">
      {a.subject ? `${a.subject.type} #${a.subject.id}` : "—"}
      <br />
      {formatDate(a.created_at)}
    </div>,
    <div key={`${a.id}-actions`} className="flex justify-end gap-2">
      {a.status === "open" && (
        <>
          <Button
            size="sm"
            variant="secondary"
            disabled={savingId === a.id}
            onClick={() => void updateStatus(a, "acknowledged")}
          >
            <CheckCircle2 size={14} />
            Acquitter
          </Button>
          <Button
            size="sm"
            disabled={savingId === a.id}
            onClick={() => void updateStatus(a, "resolved")}
          >
            Résoudre
          </Button>
        </>
      )}
      {a.status === "acknowledged" && (
        <Button
          size="sm"
          disabled={savingId === a.id}
          onClick={() => void updateStatus(a, "resolved")}
        >
          Résoudre
        </Button>
      )}
    </div>,
  ]);

  return (
    <>
      <PageHeader eyebrow="Espace professionnel" title={title} description={desc} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AlertStatus | "")}
          className="h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-mina dark:border-white/10 dark:bg-panel"
        >
          <option value="">Tous les statuts</option>
          <option value="open">Ouvertes</option>
          <option value="acknowledged">Acquittées</option>
          <option value="resolved">Résolues</option>
        </select>
        <Button variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : "mr-1.5"} />
          Actualiser
        </Button>
      </div>

      {loadError && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {loadError}
        </div>
      )}

      {loading && !alerts && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement des alertes…
        </p>
      )}

      {!loading && !loadError && alerts && alerts.length === 0 && (
        <EmptyState
          icon={<ShieldCheck size={24} />}
          title="Aucune alerte"
          description="Les signaux de détresse et escalades orientées vers toi apparaîtront ici."
        />
      )}

      {alerts && alerts.length > 0 && (
        <DataTable headers={["Alerte", "Sévérité", "Statut", "Contexte", ""]} rows={rows} />
      )}

      {alerts && alerts.some((a) => a.status === "open") && (
        <p className="mt-4 flex items-center gap-2 text-[11px] font-bold text-amber-600">
          <AlertTriangle size={13} />
          Des alertes nécessitent ton attention.
        </p>
      )}
    </>
  );
}
