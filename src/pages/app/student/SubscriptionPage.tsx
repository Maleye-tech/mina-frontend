import { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";

const PAYMENTS = ["Wave", "Orange Money", "Carte"];
const FEATURES = ["5 000+ QCM", "Tous les cours", "Mode hors-ligne", "Mina Care inclus"];

function CurrentPlanCard() {
  return (
    <Card className="border-2 border-mina">
      <div className="flex justify-between">
        <Badge>Plan actuel</Badge>
        <Badge tone="amber">Essai · 2 jours restants</Badge>
      </div>
      <h2 className="mt-6 text-2xl font-extrabold">Mina Annuel</h2>
      <p className="mt-2 text-sm text-slate-500">Accès complet à Mina Med Student et Mina Care.</p>
      <p className="mt-7 text-3xl font-extrabold">
        15 000 FCFA <span className="text-xs font-normal text-slate-400">/ an</span>
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {FEATURES.map((x) => (
          <p key={x} className="text-xs font-bold">
            <Check className="mr-2 inline text-mina" size={15} />
            {x}
          </p>
        ))}
      </div>
    </Card>
  );
}

function PaymentCard({ done, onPay }: { done: boolean; onPay: () => void }) {
  const [pay, setPay] = useState("Wave");
  return (
    <Card>
      <h2 className="font-extrabold">Choisis ton paiement</h2>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {PAYMENTS.map((x) => (
          <button
            key={x}
            onClick={() => setPay(x)}
            className={`rounded-xl border p-3 text-xs font-bold ${pay === x ? "border-mina bg-teal-50 text-mina dark:bg-mina/10" : "border-line dark:border-white/10"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <Button onClick={onPay} className="mt-6 w-full">
        {done ? (
          <>
            <Check size={16} />
            Paiement simulé réussi
          </>
        ) : (
          `Payer avec ${pay}`
        )}
      </Button>
      <p className="mt-3 text-center text-[10px] text-slate-400">
        <ShieldCheck className="mr-1 inline" size={12} />
        Paiement sécurisé · Aucune donnée bancaire stockée
      </p>
    </Card>
  );
}

export function SubscriptionPage() {
  const [done, setDone] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="Abonnement"
        title="Mon offre Mina"
        description="Gère ton accès et tes moyens de paiement en toute simplicité."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <CurrentPlanCard />
        <PaymentCard done={done} onPay={() => setDone(true)} />
      </div>
    </>
  );
}
