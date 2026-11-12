import { Logo } from "../ui/Logo";
import { Badge } from "../ui/Primitives";

export function AuthVisual() {
  return (
    <div className="pattern relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <Logo light />
      <div className="relative z-10 max-w-md">
        <Badge tone="amber">Plus qu’une application</Badge>
        <h2 className="mt-6 text-4xl font-extrabold leading-tight">
          Chaque journée d’étude compte. Ton bien-être aussi.
        </h2>
        <p className="mt-5 leading-7 text-slate-300">
          Rejoins une communauté qui avance avec méthode, entraide et bienveillance.
        </p>
        <div className="mt-9 rounded-2xl border border-white/10 bg-white/6 p-5">
          <p className="text-sm leading-6">
            “Mina me donne un cadre clair pour réviser sans m’épuiser.”
          </p>
          <p className="mt-3 text-xs font-bold text-sun">Awa · Étudiante en médecine, Dakar</p>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Confidentiel · Accessible hors-ligne · Adapté au Sénégal
      </p>
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-mina/30 blur-3xl" />
    </div>
  );
}
