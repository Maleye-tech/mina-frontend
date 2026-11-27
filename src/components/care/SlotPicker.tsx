import { CalendarDays, MessageCircle, Video } from "lucide-react";
import type { CareAvailabilitySlot } from "../../types/care";
import { EmptyState, formatCareDate, formatCareTime } from "./CarePrimitives";

export function SlotPicker({
  slots,
  selectedId,
  onSelect,
  disabled = false,
}: {
  slots: CareAvailabilitySlot[];
  selectedId: number | null;
  onSelect: (slot: CareAvailabilitySlot) => void;
  disabled?: boolean;
}) {
  const available = slots.filter(
    (slot) => !slot.is_booked && new Date(slot.starts_at).getTime() > Date.now(),
  );

  if (!available.length) {
    return (
      <EmptyState
        icon={<CalendarDays size={22} />}
        title="Aucun créneau disponible"
        description="Ce professionnel n’a pas encore ouvert de créneau. Reviens prochainement ou consulte un autre profil."
      />
    );
  }

  const groups = available.reduce<Record<string, CareAvailabilitySlot[]>>((result, slot) => {
    const day = formatCareDate(slot.starts_at);
    (result[day] ??= []).push(slot);
    return result;
  }, {});

  return (
    <div className="space-y-5" role="radiogroup" aria-label="Créneaux disponibles">
      {Object.entries(groups).map(([day, daySlots]) => (
        <fieldset key={day}>
          <legend className="mb-2 text-xs font-extrabold capitalize text-slate-600 dark:text-slate-300">
            {day}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {daySlots.map((slot) => {
              const selected = selectedId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  onClick={() => onSelect(slot)}
                  className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mina disabled:opacity-60 ${
                    selected
                      ? "border-mina bg-teal-50 ring-2 ring-mina/10 dark:bg-teal-400/10"
                      : "border-line bg-white hover:border-mina/40 dark:border-white/10 dark:bg-panel"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-extrabold text-ink dark:text-white">
                      {formatCareTime(slot.starts_at)} – {formatCareTime(slot.ends_at)}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      {slot.mode === "chat" ? <MessageCircle size={12} /> : <Video size={12} />}
                      {slot.mode === "chat" ? "Chat écrit" : "Visioconférence"}
                    </span>
                  </span>
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full border-4 ${selected ? "border-mina bg-white" : "border-slate-200 bg-transparent dark:border-white/15"}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
