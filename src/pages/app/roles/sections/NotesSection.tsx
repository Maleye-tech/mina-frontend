import { useCallback, useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, NotebookPen, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { Button } from "../../../../components/ui/Primitives";
import { DataTable, PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { errorMessage } from "../../../../lib/api";
import { appointmentsService } from "../../../../services/appointmentsService";
import { toast } from "../../../../store/toastStore";
import type { PrivateNote } from "../../../../types/appointment";

const inputClass =
  "mt-2 w-full rounded-xl border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-mina dark:border-white/10 dark:bg-panel";

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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[22px] border border-line bg-white p-6 shadow-card dark:border-white/8 dark:bg-panel"
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
  | { mode: "edit"; note: PrivateNote }
  | { mode: "delete"; note: PrivateNote }
  | null;

export function NotesSection({ title, desc }: { title: string; desc: string }) {
  const [notes, setNotes] = useState<PrivateNote[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [body, setBody] = useState("");
  const [appointmentId, setAppointmentId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setNotes(await appointmentsService.listPrivateNotes({ per_page: 50 }));
    } catch (e) {
      setNotes(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setBody("");
    setAppointmentId("");
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (note: PrivateNote) => {
    setBody(note.body);
    setFormError("");
    setModal({ mode: "edit", note });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      setFormError("La note ne peut pas être vide.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (modal?.mode === "create") {
        const res = await appointmentsService.createPrivateNote({
          body: body.trim(),
          appointment_id: appointmentId ? Number(appointmentId) : null,
          conversation_id: null,
        });
        toast.success(res.message);
      } else if (modal?.mode === "edit") {
        const res = await appointmentsService.updatePrivateNote(modal.note.id, body.trim());
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
      const res = await appointmentsService.deletePrivateNote(modal.note.id);
      toast.success(res.message);
      setModal(null);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const rows = (notes ?? []).map((n) => [
    <p key={n.id} className="max-w-xl text-sm leading-5 text-ink dark:text-white">
      {n.body}
    </p>,
    <div key={`${n.id}-meta`} className="text-[11px] font-bold text-slate-400">
      {n.appointment_id ? `Rendez-vous #${n.appointment_id}` : "Note libre"}
      <br />
      {formatDate(n.updated_at)}
    </div>,
    <div key={`${n.id}-actions`} className="flex justify-end gap-1.5">
      <button
        onClick={() => openEdit(n)}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-mina dark:hover:bg-white/8"
        aria-label="Modifier la note"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={() => setModal({ mode: "delete", note: n })}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        aria-label="Supprimer la note"
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
          {notes ? `${notes.length} note${notes.length > 1 ? "s" : ""}` : ""}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : "mr-1.5"} />
            Actualiser
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus size={15} />
            Nouvelle note
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {loadError}
        </div>
      )}

      {loading && !notes && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement des notes…
        </p>
      )}

      {!loading && !loadError && notes && notes.length === 0 && (
        <EmptyState
          icon={<NotebookPen size={24} />}
          title="Aucune note privée"
          description="Conserve tes repères de séance : ces notes restent strictement visibles par toi."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus size={15} />
              Créer une note
            </Button>
          }
        />
      )}

      {notes && notes.length > 0 && <DataTable headers={["Note", "Référence", ""]} rows={rows} />}

      {(modal?.mode === "create" || modal?.mode === "edit") && (
        <Modal
          title={modal.mode === "create" ? "Nouvelle note privée" : "Modifier la note"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="note-body" className={labelClass}>Note</label>
              <textarea
                id="note-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Observations, repères de séance…"
                className={inputClass}
                required
              />
            </div>
            {modal.mode === "create" && (
              <div>
                <label htmlFor="note-appointment" className={labelClass}>
                  Rendez-vous lié (optionnel)
                </label>
                <input
                  id="note-appointment"
                  type="number"
                  min={1}
                  value={appointmentId}
                  onChange={(e) => setAppointmentId(e.target.value)}
                  placeholder="ex. 42"
                  className={inputClass}
                />
              </div>
            )}
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
                {saving ? "Enregistrement…" : modal.mode === "create" ? "Créer" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.mode === "delete" && (
        <Modal title="Supprimer la note" onClose={() => setModal(null)}>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Cette action est définitive. Supprimer cette note privée ?
          </p>
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
