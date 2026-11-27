import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, RefreshCw, Stethoscope, X, XCircle } from "lucide-react";
import { Badge, Button } from "../../../../components/ui/Primitives";
import { DataTable, PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { errorMessage } from "../../../../lib/api";
import { appointmentsService } from "../../../../services/appointmentsService";
import { toast } from "../../../../store/toastStore";
import type { ConsultationRequest, ConsultationRequestStatus } from "../../../../types/appointment";

const STATUS_LABELS: Record<ConsultationRequestStatus, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  declined: "Déclinée",
};

const STATUS_TONES: Record<ConsultationRequestStatus, "amber" | "teal" | "slate"> = {
  pending: "amber",
  accepted: "teal",
  declined: "slate",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 text-sm outline-none focus:border-mina dark:border-white/10 dark:bg-panel";

const labelClass = "text-[10px] font-extrabold uppercase tracking-wider text-slate-400";

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

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[22px] border border-line bg-white p-6 shadow-card dark:border-white/8 dark:bg-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

type ModalState =
  | { mode: "accept"; request: ConsultationRequest }
  | { mode: "decline"; request: ConsultationRequest }
  | null;

export function ConsultationsSection({ title, desc }: { title: string; desc: string }) {
  const [requests, setRequests] = useState<ConsultationRequest[] | null>(null);
  const [status, setStatus] = useState<ConsultationRequestStatus | "">("pending");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const list = await appointmentsService.listConsultationRequests({
        status: status || undefined,
        per_page: 50,
      });
      setRequests(list);
    } catch (e) {
      setRequests(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const openAccept = (request: ConsultationRequest) => {
    setDate(new Date().toISOString().slice(0, 10));
    setStartTime("09:00");
    setReason("");
    setFormError("");
    setModal({ mode: "accept", request });
  };

  const openDecline = (request: ConsultationRequest) => {
    setReason("");
    setFormError("");
    setModal({ mode: "decline", request });
  };

  const submitAccept = async (e: FormEvent) => {
    e.preventDefault();
    if (modal?.mode !== "accept") return;
    if (!date) {
      setFormError("Choisis une date de consultation.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await appointmentsService.acceptConsultationRequest(modal.request.id, {
        date,
        start_time: startTime,
        reason: reason || undefined,
      });
      toast.success(res.message);
      setModal(null);
      await load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const submitDecline = async (e: FormEvent) => {
    e.preventDefault();
    if (modal?.mode !== "decline") return;
    setSaving(true);
    setFormError("");
    try {
      const res = await appointmentsService.declineConsultationRequest(
        modal.request.id,
        reason || undefined
      );
      toast.success(res.message);
      setModal(null);
      await load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const rows = (requests ?? []).map((r) => [
    <div key={r.id}>
      <p className="font-extrabold text-ink dark:text-white">{r.topic ?? "Sans objet"}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">Étudiant #{r.student_id}</p>
    </div>,
    <Badge key={`${r.id}-priority`} tone={r.priority === "high" || r.priority === "urgent" ? "red" : r.priority === "medium" ? "amber" : "slate"}>
      {PRIORITY_LABELS[r.priority] ?? r.priority}
    </Badge>,
    <Badge key={`${r.id}-status`} tone={STATUS_TONES[r.status]}>
      {STATUS_LABELS[r.status]}
    </Badge>,
    <div key={`${r.id}-date`} className="text-xs font-bold text-slate-500">
      <p>Demandée le {formatDate(r.requested_at)}</p>
      {r.scheduled_for && <p className="text-teal-600">Prévue le {formatDate(r.scheduled_for)}</p>}
      {r.reason && <p className="mt-0.5 text-slate-400">{r.reason}</p>}
    </div>,
    <div key={`${r.id}-actions`} className="flex justify-end gap-2">
      {r.status === "pending" && (
        <>
          <Button size="sm" onClick={() => openAccept(r)}>
            <CheckCircle2 size={14} />
            Accepter
          </Button>
          <Button size="sm" variant="secondary" onClick={() => openDecline(r)}>
            <XCircle size={14} />
            Décliner
          </Button>
        </>
      )}
    </div>,
  ]);

  return (
    <>
      <PageHeader eyebrow="Espace professionnel" title={title} description={desc} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ConsultationRequestStatus | "")}
          className="h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-mina dark:border-white/10 dark:bg-panel"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="accepted">Acceptées</option>
          <option value="declined">Déclinées</option>
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

      {loading && !requests && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement des demandes…
        </p>
      )}

      {!loading && !loadError && requests && requests.length === 0 && (
        <EmptyState
          icon={<Stethoscope size={24} />}
          title="Aucune demande"
          description="Les demandes de consultation des étudiants apparaîtront ici."
        />
      )}

      {requests && requests.length > 0 && (
        <DataTable
          headers={["Demande", "Priorité", "Statut", "Dates", ""]}
          rows={rows}
        />
      )}

      {modal?.mode === "accept" && (
        <Modal title="Accepter la demande" onClose={() => setModal(null)}>
          <form onSubmit={submitAccept} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-500 dark:bg-white/5">
              {modal.request.topic ?? "Sans objet"} — étudiant #{modal.request.student_id}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="consult-date" className={labelClass}>Date</label>
                <input
                  id="consult-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="consult-time" className={labelClass}>Heure</label>
                <input
                  id="consult-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="consult-reason" className={labelClass}>Motif (optionnel)</label>
              <input
                id="consult-reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Créneau proposé…"
                className={inputClass}
              />
            </div>
            {formError && (
              <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
                {formError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setModal(null)}>
                Annuler
              </Button>
              <Button type="submit" loading={saving}>
                {saving ? "Traitement…" : "Accepter"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.mode === "decline" && (
        <Modal title="Décliner la demande" onClose={() => setModal(null)}>
          <form onSubmit={submitDecline} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-500 dark:bg-white/5">
              {modal.request.topic ?? "Sans objet"} — étudiant #{modal.request.student_id}
            </div>
            <div>
              <label htmlFor="decline-reason" className={labelClass}>Motif (optionnel)</label>
              <input
                id="decline-reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Aucun créneau disponible…"
                className={inputClass}
              />
            </div>
            {formError && (
              <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
                {formError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setModal(null)}>
                Annuler
              </Button>
              <Button type="submit" loading={saving} variant="care">
                {saving ? "Traitement…" : "Décliner"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
