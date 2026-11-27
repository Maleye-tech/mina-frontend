import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Bell, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { ApiError, errorMessage } from "@/lib/api";
import { careService } from "@/services/careService";
import type { CareUrgentAlert } from "@/types/care";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import {
  CareLoading,
  CarePageHeader,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  formatCareDate,
  formatCareTime,
} from "@/components/care/CarePrimitives";

export function ProfessionalAlertsPage() {
  const [openAlerts, setOpenAlerts] = useState<CareUrgentAlert[]>([]);
  const [handledAlerts, setHandledAlerts] = useState<CareUrgentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [success, setSuccess] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<CareUrgentAlert | null>(null);
  const [handling, setHandling] = useState(false);

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError("");
    setForbidden(false);
    try {
      const [open, handled] = await Promise.all([
        careService.getProfessionalAlerts({ status: "open", per_page: 50 }),
        careService.getProfessionalAlerts({ status: "handled", per_page: 50 }),
      ]);
      setOpenAlerts(open);
      setHandledAlerts(handled);
    } catch (reason) {
      setError(errorMessage(reason));
      setForbidden(reason instanceof ApiError && reason.status === 403);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  const handleAlert = async () => {
    if (!selectedAlert || handling) return;
    setHandling(true);
    setError("");
    setSuccess("");
    try {
      await careService.handleAlert(selectedAlert.id);
      setSelectedAlert(null);
      setSuccess("L’alerte a été marquée comme prise en charge.");
      await load();
    } catch (reason) {
      setError(errorMessage(reason));
      setSelectedAlert(null);
    } finally {
      setHandling(false);
    }
  };

  const renderAlert = (alert: CareUrgentAlert) => (
    <Card key={alert.id}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-ink dark:text-white">
              {alert.student?.pseudonym ?? "Étudiant anonyme"}
            </h3>
            <Badge tone={alert.status === "open" ? "red" : "teal"}>
              {alert.status === "open" ? "Ouverte" : "Prise en charge"}
            </Badge>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} className="text-mina" />
              {alert.created_at ? formatCareDate(alert.created_at) : "Date inconnue"}
              {alert.created_at ? ` · ${formatCareTime(alert.created_at)}` : ""}
            </span>
            {alert.appointment_id && (
              <Link
                to={`/pro/rendez-vous/${alert.appointment_id}`}
                className="inline-flex items-center gap-1 text-mina hover:underline"
              >
                Voir le rendez-vous <ArrowRight size={13} />
              </Link>
            )}
          </p>
        </div>
        {alert.status === "open" && (
          <Button
            size="sm"
            onClick={() => {
              setSelectedAlert(alert);
              setSuccess("");
            }}
            disabled={handling}
            className="shrink-0"
          >
            <CheckCircle2 size={15} /> Prendre en charge
          </Button>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
          {alert.message || "Aucun message additionnel n’a été transmis."}
        </p>
      </div>

      {alert.status === "handled" && (
        <div className="mt-4 border-t border-line pt-4 text-xs text-slate-500 dark:border-white/8 dark:text-slate-400">
          {alert.handled_at && (
            <p>
              Traitée le {formatCareDate(alert.handled_at)} à {formatCareTime(alert.handled_at)}
              {alert.handled_by ? ` par ${alert.handled_by}` : ""}.
            </p>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Espace professionnel"
        title="Alertes"
        description="Consulte les alertes ouvertes et garde une trace des alertes déjà prises en charge."
        actions={
          <Badge tone={openAlerts.length ? "red" : "teal"}>
            {openAlerts.length} ouverte{openAlerts.length > 1 ? "s" : ""}
          </Badge>
        }
      />

      {loading ? (
        <CareLoading label="Chargement des alertes…" />
      ) : (
        <>
          {error && <ErrorBanner message={error} onRetry={() => void load(true)} />}
          {forbidden && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300"
                    size={22}
                  />
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Ton profil doit être vérifié et ta charte acceptée pour consulter les alertes.
                  </p>
                </div>
                <Link to="/pro/onboarding" className="shrink-0">
                  <Button variant="secondary">Voir mon profil</Button>
                </Link>
              </div>
            </Card>
          )}
          {success && (
            <p
              role="status"
              className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-bold text-teal-900 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-100"
            >
              {success}
            </p>
          )}

          <section className="space-y-4" aria-labelledby="open-alerts-title">
            <div className="flex items-center gap-2">
              <Bell className="text-red-600" size={19} />
              <h2
                id="open-alerts-title"
                className="text-lg font-extrabold text-ink dark:text-white"
              >
                Alertes ouvertes
              </h2>
              <Badge tone={openAlerts.length ? "red" : "slate"}>{openAlerts.length}</Badge>
            </div>
            {openAlerts.length ? (
              <div className="grid gap-3 xl:grid-cols-2">{openAlerts.map(renderAlert)}</div>
            ) : (
              <EmptyState
                icon={<CheckCircle2 size={22} />}
                title="Aucune alerte ouverte"
                description="Les nouvelles alertes nécessitant ton attention apparaîtront ici."
              />
            )}
          </section>

          <section className="space-y-4" aria-labelledby="handled-alerts-title">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-mina" size={19} />
              <h2
                id="handled-alerts-title"
                className="text-lg font-extrabold text-ink dark:text-white"
              >
                Alertes prises en charge
              </h2>
              <Badge tone="slate">{handledAlerts.length}</Badge>
            </div>
            {handledAlerts.length ? (
              <div className="grid gap-3 xl:grid-cols-2">{handledAlerts.map(renderAlert)}</div>
            ) : (
              <EmptyState
                icon={<ShieldCheck size={22} />}
                title="Aucune alerte traitée"
                description="Les alertes que tu confirmes prendre en charge seront conservées dans cette section."
              />
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={selectedAlert !== null}
        title="Prendre cette alerte en charge ?"
        description="Confirme que tu as pris connaissance de l’alerte. Elle sera déplacée dans les alertes prises en charge."
        confirmLabel="Confirmer la prise en charge"
        loading={handling}
        onConfirm={() => void handleAlert()}
        onClose={() => {
          if (!handling) setSelectedAlert(null);
        }}
      />
    </div>
  );
}
