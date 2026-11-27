import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Edit3, MessageCircle, Plus, ShieldCheck, Trash2, Video } from "lucide-react";
import { Link } from "react-router";
import { ApiError, errorMessage } from "@/lib/api";
import { careService } from "@/services/careService";
import type { CareAvailabilityInput, CareAvailabilitySlot, CareSlotMode } from "@/types/care";
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

function toLocalDateTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function ProfessionalAvailabilityPage() {
  const [slots, setSlots] = useState<CareAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [mode, setMode] = useState<CareSlotMode>("visio");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareAvailabilitySlot | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError("");
    setForbidden(false);
    try {
      setSlots(await careService.getProfessionalAvailability());
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

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setStartsAt("");
    setEndsAt("");
    setMode("visio");
    setFormError("");
    setFormOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
    setSuccess("");
  };

  const openEditForm = (slot: CareAvailabilitySlot) => {
    if (slot.is_booked || new Date(slot.starts_at).getTime() <= Date.now()) return;
    setEditingId(slot.id);
    setStartsAt(toLocalDateTime(slot.starts_at));
    setEndsAt(toLocalDateTime(slot.ends_at));
    setMode(slot.mode);
    setFormError("");
    setSuccess("");
    setFormOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    if (
      !startsAt ||
      !endsAt ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      setFormError("Renseigne une date et une heure valides pour le début et la fin.");
      return;
    }
    if (startDate.getTime() <= Date.now()) {
      setFormError("Le créneau doit commencer dans le futur.");
      return;
    }
    if (endDate.getTime() <= startDate.getTime()) {
      setFormError("L’heure de fin doit être postérieure à l’heure de début.");
      return;
    }
    if (endDate.getTime() <= Date.now()) {
      setFormError("Le créneau ne peut pas se terminer dans le passé.");
      return;
    }

    const input: CareAvailabilityInput = {
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      mode,
    };

    setSaving(true);
    setFormError("");
    setError("");
    setSuccess("");
    try {
      if (editingId === null) {
        await careService.createAvailability(input);
        setSuccess("Le créneau a été ajouté.");
      } else {
        await careService.updateAvailability(editingId, input);
        setSuccess("Le créneau a été mis à jour.");
      }
      resetForm();
      await refresh();
    } catch (reason) {
      setFormError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError("");
    setSuccess("");
    try {
      await careService.deleteAvailability(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess("Le créneau a été supprimé.");
      if (editingId === deleteTarget.id) resetForm();
      await refresh();
    } catch (reason) {
      setError(errorMessage(reason));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Espace professionnel"
        title="Disponibilités"
        description="Ouvre des créneaux de visioconférence ou de chat écrit pour les étudiants."
        actions={
          <Button onClick={openCreateForm}>
            <Plus size={17} /> Ajouter un créneau
          </Button>
        }
      />

      {loading ? (
        <CareLoading label="Chargement de tes disponibilités…" />
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
                    Ton profil doit être vérifié et ta charte acceptée avant de gérer des
                    disponibilités.
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
          {refreshing && <CareLoading label="Actualisation des créneaux…" />}

          {formOpen && (
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-ink dark:text-white">
                    {editingId === null ? "Nouveau créneau" : "Modifier le créneau"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Les horaires sont enregistrés dans ton fuseau horaire puis convertis en heure
                    ISO.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-white/8"
                >
                  Fermer
                </button>
              </div>

              <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-ink dark:text-white">Début</span>
                    <input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(event) => setStartsAt(event.target.value)}
                      min={toLocalDateTime(new Date().toISOString())}
                      required
                      className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-ink dark:text-white">Fin</span>
                    <input
                      type="datetime-local"
                      value={endsAt}
                      onChange={(event) => setEndsAt(event.target.value)}
                      min={startsAt || undefined}
                      required
                      className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5"
                    />
                  </label>
                </div>

                <label className="block sm:max-w-xs">
                  <span className="text-sm font-bold text-ink dark:text-white">
                    Mode de consultation
                  </span>
                  <select
                    value={mode}
                    onChange={(event) => setMode(event.target.value as CareSlotMode)}
                    className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5"
                  >
                    <option value="visio">Visioconférence</option>
                    <option value="chat">Chat écrit</option>
                  </select>
                </label>

                {formError && <ErrorBanner message={formError} />}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="ghost" onClick={resetForm} disabled={saving}>
                    Annuler
                  </Button>
                  <Button type="submit" loading={saving}>
                    {editingId === null ? "Ajouter le créneau" : "Enregistrer les modifications"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <section className="space-y-4" aria-labelledby="availability-list-title">
            <div className="flex items-center justify-between gap-3">
              <h2
                id="availability-list-title"
                className="text-lg font-extrabold text-ink dark:text-white"
              >
                Tes créneaux
              </h2>
              <Badge tone="slate">
                {slots.length} créneau{slots.length > 1 ? "x" : ""}
              </Badge>
            </div>

            {slots.length ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {slots.map((slot) => {
                  const isPast = new Date(slot.starts_at).getTime() <= Date.now();
                  return (
                    <Card key={slot.id} className="flex flex-col justify-between gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-extrabold capitalize text-ink dark:text-white">
                            {formatCareDate(slot.starts_at)}
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                            {formatCareTime(slot.starts_at)} – {formatCareTime(slot.ends_at)}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Badge tone={slot.mode === "chat" ? "violet" : "teal"}>
                            {slot.mode === "chat" ? (
                              <MessageCircle size={13} />
                            ) : (
                              <Video size={13} />
                            )}
                            {slot.mode === "chat" ? "Chat" : "Visio"}
                          </Badge>
                          {slot.is_booked && <Badge tone="amber">Réservé</Badge>}
                          {!slot.is_booked && isPast && <Badge tone="slate">Passé</Badge>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 border-t border-line pt-4 dark:border-white/8">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditForm(slot)}
                          disabled={slot.is_booked || isPast || saving || deleting}
                          title={
                            slot.is_booked
                              ? "Un créneau réservé ne peut pas être modifié."
                              : isPast
                                ? "Un créneau passé ne peut pas être modifié."
                                : undefined
                          }
                        >
                          <Edit3 size={15} /> Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(slot)}
                          disabled={slot.is_booked || deleting}
                          title={
                            slot.is_booked
                              ? "Un créneau réservé ne peut pas être supprimé."
                              : undefined
                          }
                          className="!text-red-600"
                        >
                          <Trash2 size={15} /> Supprimer
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarDays size={22} />}
                title="Aucun créneau enregistré"
                description="Ajoute ton premier créneau pour permettre aux étudiants de réserver un accompagnement."
                action={
                  <Button onClick={openCreateForm}>
                    <Plus size={16} /> Ajouter un créneau
                  </Button>
                }
              />
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer ce créneau ?"
        description="Le créneau ne sera plus proposé aux étudiants. Cette action est définitive."
        confirmLabel="Supprimer le créneau"
        danger
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
