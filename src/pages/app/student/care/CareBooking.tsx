import { useState } from "react";
import { Check } from "lucide-react";
import { Button, Card } from "../../../../components/ui/Primitives";

const PROFESSIONALS: [string, string, string][] = [
  ["DF", "Dr Fatou Diop", "Psychologue clinicienne"],
  ["MS", "M. Mamadou Sarr", "Conseiller d’écoute"],
  ["AK", "Dr Awa Kane", "Psychiatre"],
];
const DAYS = ["Lun 16", "Mar 17", "Mer 18", "Jeu 19", "Ven 20"];
const SLOTS = ["09:00", "10:30", "14:00", "15:30", "17:00", "18:30"];

export function CareBooking() {
  const [booked, setBooked] = useState(false);
  return (
    <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
      <Card>
        <h2 className="font-extrabold">Choisis un professionnel</h2>
        {PROFESSIONALS.map((p, i) => (
          <button
            key={p[1]}
            className={`mt-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left ${i === 0 ? "border-care bg-violet-50 dark:bg-care/10" : "border-line dark:border-white/10"}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-care text-xs font-bold text-white">
              {p[0]}
            </span>
            <span>
              <strong className="block text-xs">{p[1]}</strong>
              <span className="text-[10px] text-slate-400">{p[2]}</span>
            </span>
          </button>
        ))}
      </Card>
      <Card>
        <h2 className="font-extrabold">Créneaux disponibles</h2>
        <div className="mt-5 grid grid-cols-5 gap-2">
          {DAYS.map((d, i) => (
            <button
              key={d}
              className={`rounded-xl py-3 text-xs font-bold ${i === 2 ? "bg-care text-white" : "bg-violet-50 text-care dark:bg-care/10"}`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {SLOTS.map((h, i) => (
            <button
              key={h}
              className={`rounded-xl border py-3 text-xs font-bold ${i === 2 ? "border-care text-care" : "border-line dark:border-white/10"}`}
            >
              {h}
            </button>
          ))}
        </div>
        <Button variant="care" onClick={() => setBooked(true)} className="mt-7 w-full">
          {booked ? (
            <>
              <Check size={16} />
              Rendez-vous confirmé
            </>
          ) : (
            "Confirmer ce créneau"
          )}
        </Button>
        <p className="mt-3 text-center text-[10px] text-slate-400">
          La confirmation reste confidentielle et n’indique pas le motif.
        </p>
      </Card>
    </div>
  );
}
