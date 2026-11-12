import { CheckCircle2, CloudOff, Download, WifiOff } from "lucide-react";
import { Badge } from "../../../components/ui/Primitives";
import { SectionTitle } from "../../../components/landing/SectionTitle";

const FEATURES = ["Installable", "Faible consommation", "Sync automatique"];

export function OfflineSection() {
  return (
    <section className="bg-teal-950 px-5 py-20 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <Badge tone="amber">
            <WifiOff size={13} className="mr-1" />
            Conçu pour la réalité du terrain
          </Badge>
          <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">
            Tes cours te suivent, même quand le réseau ne suit pas.
          </h2>
          <p className="mt-4 leading-7 text-teal-100">
            Mina est une PWA légère : contenus compressés, synchronisation différée et cache local.
            Idéal sur smartphone Android et réseaux 3G/4G.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {FEATURES.map((x) => (
              <span key={x} className="rounded-full bg-white/8 px-4 py-2 text-xs font-bold">
                <CheckCircle2 className="mr-1.5 inline text-sun" size={14} />
                {x}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-mina p-3">
                <Download />
              </div>
              <div>
                <p className="font-bold">Anatomie du thorax</p>
                <p className="text-xs text-teal-200">42 Mo • Fiche + podcast</p>
              </div>
            </div>
            <Badge tone="teal">Disponible</Badge>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs">
              <span>Téléchargement</span>
              <span>100 %</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-full w-full rounded-full bg-sun" />
            </div>
          </div>
          <p className="mt-4 text-xs text-teal-200">
            <CloudOff className="mr-1.5 inline" size={14} />
            Accessible sans connexion
          </p>
        </div>
      </div>
    </section>
  );
}
