import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Calendar, LoaderCircle, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { Badge, Button } from "../../../../components/ui/Primitives";
import { DataTable, PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { errorMessage } from "../../../../lib/api";
import { appointmentsService } from "../../../../services/appointmentsService";
import { toast } from "../../../../store/toastStore";
import type { Availability } from "../../../../types/appointment";

const WEEKDAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

function weekdayLabel(weekday: number): string {
  return WEEKDAYS[weekday] ?? `Jour ${weekday}`;
}

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 text-sm outline-none focus:border-mina dark:border-white/10 dark:bg-panel";

const labelClass =
  "text-[10px] font-extrabold uppercase tracking-wider text-slate-400";

function validate(start: string, end: string): string | null {
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
    return "Les heures doivent être au format HH:mm.";
  }
  if (end <= start) return "L’heure de fin doit être après l’heure de début.";
  return null;
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
  | { mode: "create" }
  | { mode: "edit"; availability: Availability }
  | { mode: "delete"; availability: Availability }
  | null;

export function DisponibilitesSection({ title, desc }: { title: string; desc: string }) {
  const [items, setItems] = useState<Availability[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [weekday, setWeekday] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setItems(await appointmentsService.listAvailability());
    } catch (e) {
      setItems(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setWeekday(1);
    setStartTime("09:00");
    setEndTime("17:00");
    setIsActive(true);
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (availability: Availability) => {
    setWeekday(availability.weekday);
    setStartTime(availability.start_time);
    setEndTime(availability.end_time);
    setIsActive(availability.is_active);
    setFormError("");
    setModal({ mode: "edit", availability });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const error = validate(startTime, endTime);
    if (error) {
      setFormError(error);
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (modal?.mode === "create") {
        const res = await appointmentsService.createAvailability({
          weekday,
          start_time: startTime,
          end_time: endTime,
          is_active: isActive,
        });
        toast.success(res.message);
      } else if (modal?.mode === "edit") {
        const res = await appointmentsService.updateAvailability(modal.availability.id, {
          start_time: startTime,
          end_time: endTime,
          is_active: isActive,
        });
        toast.success(res.message);
      }
      setModal(null);
      await load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (modal?.mode !== "delete") return;
    setSaving(true);
    try {
      const res = await appointmentsService.deleteAvailability(modal.availability.id);
      toast.success(res.message);
      setModal(null);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const rows = (items ?? []).map((a) => [
    <div key={a.id}>
      <p className="font-extrabold text-ink dark:text-white">{WEEKDAYS[a.weekday] ?? `Jour ${a.weekday}`}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">Jour {a.weekday}</p>
    </div>,
    <span key={`${a.id}-time`} className="text-sm font-bold">
      {a.start_time} – {a.end_time}
    </span>,
    <Badge key={`${a.id}-status`} tone={a.is_active ? "teal" : "slate"}>
      {a.is_active ? "Active" : "Inactive"}
    </Badge>,
    <div key={`${a.id}-actions`} className="flex justify-end gap-1.5">
      <button
        onClick={() => openEdit(a)}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-mina dark:hover:bg-white/8"
        aria-label="Modifier la disponibilité"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={() => setModal({ mode: "delete", availability: a })}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        aria-label="Supprimer la disponibilité"
      >
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <>
      <PageHeader eyebrow="Espace professionnel" title={title} description={desc} />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500">
          {items ? `${items.length} créneau${items.length > 1 ? "x" : ""} hebdomadaire${items.length > 1 ? "x" : ""}` : ""}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : "mr-1.5"} />
            Actualiser
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus size={15} />
            Ajouter
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {loadError}
        </div>
      )}

      {loading && !items && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement des disponibilités…
        </p>
      )}

      {!loading && !loadError && items && items.length === 0 && (
        <EmptyState
          icon={<Calendar size={24} />}
          title="Aucune disponibilité"
          description="Définis tes créneaux hebdomadaires pour que les étudiants puissent réserver."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus size={15} />
              Ajouter un créneau
            </Button>
          }
        />
      )}

      {items && items.length > 0 && (
        <DataTable headers={["Jour", "Horaires", "Statut", ""]} rows={rows} />
      )}

      {modal?.mode === "create" && (
        <Modal title="Ajouter une disponibilité" onClose={() => setModal(null)}>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="avail-weekday" className={labelClass}>Jour</label>
              <select
                id="avail-weekday"
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className={inputClass}
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>{day}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="avail-start" className={labelClass}>Début</label>
                <input
                  id="avail-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="avail-end" className={labelClass}>Fin</label>
                <input
                  id="avail-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-mina"
              />
              Créneau actif
            </label>
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
                {saving ? "Enregistrement…" : "Créer"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.mode === "edit" && (
        <Modal title="Modifier la disponibilité" onClose={() => setModal(null)}>
          <form onSubmit={submit} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-500 dark:bg-white/5">
              {WEEKDAYS[modal.availability.weekday] ?? `Jour ${modal.availability.weekday}`} — le jour
              ne peut pas être modifié.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="avail-edit-start" className={labelClass}>Début</label>
                <input
                  id="avail-edit-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="avail-edit-end" className={labelClass}>Fin</label>
                <input
                  id="avail-edit-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-mina"
              />
              Créneau actif
            </label>
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
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.mode === "delete" && (
        <Modal title="Supprimer la disponibilité" onClose={() => setModal(null)}>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Supprimer le créneau du{" "}
            <strong>{weekdayLabel(modal.availability.weekday)}</strong> de{" "}
            {modal.availability.start_time} à {modal.availability.end_time} ?
          </p>
          {formError && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
              {formError}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>
              Annuler
            </Button>
            <Button type="button" loading={saving} onClick={() => void confirmDelete()}>
              {saving ? "Suppression…" : "Supprimer"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
