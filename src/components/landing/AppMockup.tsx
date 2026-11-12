import { motion } from "motion/react";
import { HeartHandshake } from "lucide-react";
import { Progress } from "../ui/Primitives";

export function AppMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative mx-auto max-w-[570px]"
    >
      <div className="absolute -inset-8 rounded-full bg-mina/10 blur-3xl" />
      <div className="relative ml-auto w-[90%] rounded-[28px] border border-white/70 bg-white p-4 shadow-[0_35px_80px_rgba(11,37,69,.18)] dark:border-white/10 dark:bg-panel">
        <div className="flex items-center justify-between border-b border-line pb-3 dark:border-white/8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-mina" />
            <div>
              <div className="h-2 w-20 rounded bg-slate-200 dark:bg-white/15" />
              <div className="mt-1.5 h-1.5 w-12 rounded bg-slate-100 dark:bg-white/8" />
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-amber-100" />
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-4 pt-4">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((x) => (
              <div
                key={x}
                className={`h-8 rounded-lg ${x === 1 ? "bg-teal-50" : "bg-slate-50 dark:bg-white/5"}`}
              />
            ))}
          </div>
          <div>
            <div className="rounded-2xl bg-gradient-to-r from-mina to-[#15988e] p-5 text-white">
              <p className="text-xs opacity-80">Bonjour Aïssatou,</p>
              <p className="mt-1 font-extrabold">Prête pour ta session ?</p>
              <div className="mt-4 h-2 rounded-full bg-white/20">
                <div className="h-2 w-[68%] rounded-full bg-sun" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["12", "jours"],
                ["84%", "QCM"],
                ["6h", "semaine"],
              ].map((x) => (
                <div
                  key={x[1]}
                  className="rounded-xl border border-line p-3 text-center dark:border-white/8"
                >
                  <p className="font-extrabold">{x[0]}</p>
                  <p className="text-[8px] text-slate-400">{x[1]}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <div className="mb-2 flex justify-between text-[9px] font-bold">
                <span>Physiologie cardiaque</span>
                <span>72%</span>
              </div>
              <Progress value={72} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-10 left-0 w-[150px] rounded-[26px] border-[6px] border-ink bg-white p-3 shadow-2xl dark:bg-panel">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-slate-300" />
        <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-500/10">
          <HeartHandshake size={20} className="text-care" />
          <p className="mt-8 text-[10px] font-extrabold">Comment te sens-tu ?</p>
          <div className="mt-2 flex justify-between gap-1">
            <span className="h-3 w-3 rounded-full bg-red-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-teal-400" />
          </div>
        </div>
        <div className="mt-2 rounded-lg bg-mina px-2 py-2 text-center text-[8px] font-bold text-white">
          Commencer ma journée
        </div>
      </div>
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -right-3 -top-5 rounded-xl bg-white px-3 py-2 text-xs font-bold shadow-card dark:bg-panel"
      >
        <span className="mr-2 text-sun">●</span>12 jours de série
      </motion.div>
    </motion.div>
  );
}
