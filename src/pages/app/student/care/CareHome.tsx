import { useState } from "react";
import { ArrowRight, HeartHandshake, LockKeyhole } from "lucide-react";
import { Card } from "../../../../components/ui/Primitives";

function CheckInCard({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <Card>
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-care">Check-in rapide</p>
      <h2 className="mt-2 font-extrabold">Comment te sens-tu ?</h2>
      <div className="mt-5 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className="rounded-xl border border-violet-100 py-3 text-sm font-extrabold text-care hover:bg-care hover:text-white dark:border-white/10"
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[10px] text-slate-400">
        1 = très difficile · 5 = très bien
      </p>
      <div className="mt-5 border-t border-line pt-5 dark:border-white/8">
        <button
          onClick={onOpenChat}
          className="flex w-full items-center justify-between text-sm font-bold"
        >
          Parler à un ambassadeur <ArrowRight size={16} className="text-care" />
        </button>
      </div>
    </Card>
  );
}

export function CareHome({ onOpenChat }: { onOpenChat: () => void }) {
  const [anonymous, setAnonymous] = useState(true);
  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-[26px] bg-gradient-to-br from-care to-[#5549a5] p-7 text-white md:p-10">
        <HeartHandshake size={34} />
        <h2 className="mt-14 text-3xl font-extrabold">Ici, tu peux être toi-même.</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100">
          Parle, respire, trouve des ressources ou demande de l’aide. Tu gardes toujours le
          contrôle de ton identité.
        </p>
        <label className="mt-7 flex max-w-md items-center justify-between rounded-2xl bg-white/12 p-4 text-sm font-bold">
          <span>
            <LockKeyhole className="mr-2 inline" size={17} />
            Rester anonyme · Pseudo : Baobab calme 27
          </span>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
            className="accent-sun"
          />
        </label>
      </div>
      <CheckInCard onOpenChat={onOpenChat} />
    </div>
  );
}
