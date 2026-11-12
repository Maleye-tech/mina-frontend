import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { CareHome } from "./CareHome";
import { CareBooking } from "./CareBooking";
import { CareChat } from "./CareChat";
import { CareResources } from "./CareResources";
import { CareSelfTest } from "./CareSelfTest";
import { CareEvents } from "./CareEvents";

const TABS = ["Accueil", "Prendre RDV", "Tchat sécurisé", "Ressources", "Auto-évaluation", "Événements"];

function CareHeader() {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-care">Mina Care</p>
        <h1 className="mt-1 text-2xl font-extrabold">Ton espace bien-être</h1>
      </div>
      <button className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg">
        <AlertTriangle className="mr-1.5 inline" size={15} />
        SOS · Aide immédiate
      </button>
    </div>
  );
}

function CareTabs({
  tab,
  onSelect,
}: {
  tab: string;
  onSelect: (tab: string) => void;
}) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      {TABS.map((t) => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${tab === t ? "bg-care text-white" : "border border-violet-100 bg-white dark:border-white/10 dark:bg-panel"}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function CarePage() {
  const [tab, setTab] = useState("Accueil");
  return (
    <div className="-m-4 min-h-[calc(100vh-72px)] bg-[#f5f3ff] p-4 dark:bg-care/5 md:-m-7 md:p-7">
      <CareHeader />
      <CareTabs tab={tab} onSelect={setTab} />
      {tab === "Accueil" && <CareHome onOpenChat={() => setTab("Tchat sécurisé")} />}
      {tab === "Prendre RDV" && <CareBooking />}
      {tab === "Tchat sécurisé" && <CareChat />}
      {tab === "Ressources" && <CareResources />}
      {tab === "Auto-évaluation" && <CareSelfTest />}
      {tab === "Événements" && <CareEvents />}
      <div className="mt-6 rounded-xl border border-red-200 bg-white p-4 text-xs leading-5 text-red-700 dark:border-red-400/20 dark:bg-panel dark:text-red-300">
        <AlertTriangle className="mr-2 inline" size={15} />
        <strong>En cas de détresse immédiate,</strong> contacte les urgences ou une personne de
        confiance. Les numéros nationaux seront configurés avec les partenaires.
      </div>
    </div>
  );
}
