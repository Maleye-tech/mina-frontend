import {
  ArrowRight,
  Clock3,
  FileQuestion,
  Flame,
  HeartHandshake,
  Play,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge, Card } from "../../../components/ui/Primitives";
import { PageHeader, StatCard } from "../../../components/dashboard/Common";
import { useAuthStore } from "../../../store/authStore";

export function StudentHome() {
  const user = useAuthStore((s) => s.user)!;
  return (
    <>
      <PageHeader
        eyebrow="Tableau de bord"
        title={`Bonjour ${user.name.split(" ")[0]}, prête à avancer ?`}
        description="Ton programme est ajusté à tes objectifs et à ton rythme."
        action={
          <Badge tone="amber">
            <Flame size={14} className="mr-1.5" />
            12 jours de série
          </Badge>
        }
      />
      <div className="mb-6 rounded-[24px] bg-gradient-to-r from-mina to-[#15988e] p-6 text-white md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold text-teal-100">PROGRESSION GLOBALE · L1 MÉDECINE</p>
            <h2 className="mt-2 text-2xl font-extrabold">Tu as complété 68 % de ton programme</h2>
            <p className="mt-2 text-sm text-teal-50">
              Encore 2 sessions cette semaine pour atteindre ton objectif.
            </p>
          </div>
          <div className="min-w-52">
            <div className="mb-2 flex justify-between text-xs font-bold">
              <span>Progression</span>
              <span>68 %</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20">
              <div className="h-full w-[68%] rounded-full bg-sun" />
            </div>
            <p className="mt-3 text-[10px] text-teal-100">Essai gratuit : encore 2 jours</p>
          </div>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-mina">
                Coach Mina
              </p>
              <h2 className="mt-1 font-extrabold">Ton programme aujourd’hui</h2>
            </div>
            <div className="rounded-xl bg-mina/10 p-2.5 text-mina">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="mt-5">
            {[
              ["08:30", "Physiologie cardiaque", "25 min · Révision"],
              ["13:00", "QCM Biochimie", "15 questions"],
              ["19:30", "Flashcards Anatomie", "18 cartes à revoir"],
            ].map((x, i) => (
              <div
                key={x[0]}
                className="flex items-center gap-4 border-b border-line py-4 last:border-0 dark:border-white/8"
              >
                <span className="text-xs font-extrabold text-mina">{x[0]}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{x[1]}</p>
                  <p className="text-[10px] text-slate-400">{x[2]}</p>
                </div>
                <button
                  className={`rounded-lg p-2 ${i === 0 ? "bg-mina text-white" : "bg-slate-100 text-slate-400 dark:bg-white/8"}`}
                  aria-label={`Démarrer ${x[1]}`}
                >
                  <Play size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-white dark:from-care/10 dark:to-panel">
          <HeartHandshake className="text-care" />
          <h2 className="mt-5 text-lg font-extrabold">Une minute pour toi</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Comment est ton niveau d’énergie aujourd’hui ?
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["Faible", "Moyen", "Bon"].map((x, i) => (
              <button
                key={x}
                className={`rounded-xl border py-3 text-xs font-bold ${i === 2 ? "border-care bg-care text-white" : "border-violet-100 dark:border-white/10"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <button className="mt-5 flex items-center gap-1 text-xs font-bold text-care">
            Ouvrir Mina Care <ArrowRight size={14} />
          </button>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <StatCard
          label="QCM cette semaine"
          value="126"
          delta="+18 %"
          icon={<FileQuestion size={20} />}
        />
        <StatCard
          label="Taux de réussite"
          value="84 %"
          delta="+6 pts"
          icon={<Target size={20} />}
        />
        <StatCard label="Temps d’étude" value="6h 20" delta="+42 min" icon={<Clock3 size={20} />} />
      </div>
    </>
  );
}
