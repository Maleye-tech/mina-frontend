import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Gift,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";
import { subscriptionService } from "../../../services/subscriptionService";
import { errorMessage } from "../../../lib/api";
import { toast } from "../../../store/toastStore";
import type { PaymentRecord, SubscriptionPlan, UserSubscription } from "../../../types/subscription";

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Mina Essentiel",
    price: 0,
    price_monthly: 0,
    tagline: "Accès de base aux cours et aux tests de bien-être",
    features: [
      "Consultation des cours de la bibliothèque",
      "5 sessions de QCM par semaine",
      "Tests d'évaluation bien-être SOS",
      "Mode hors-ligne basique",
    ],
    is_popular: false,
  },
  {
    id: "student_premium",
    name: "Mina Réussite Santé",
    price: 4900,
    price_monthly: 4900,
    tagline: "L'outil complet pour valider son année avec mention",
    features: [
      "Banque complète de QCM et annales illimitées",
      "Cas cliniques interactifs avec corrigés détaillés",
      "Répétition espacée des Flashcards Anki",
      "Coach IA disponible 24/7 sans limite",
      "Synchronisation hors-ligne totale PWA",
    ],
    is_popular: true,
  },
  {
    id: "crous_partner",
    name: "Pass Partenaire CROUS",
    price: 0,
    price_monthly: 0,
    tagline: "Licence prise en charge par ton université ou le CROUS",
    features: [
      "Tous les avantages Mina Réussite inclus",
      "Priorité sur les rendez-vous professionnels Care",
      "Ateliers de tutorat et de méthodologie en direct",
      "Accompagnement psychologique dédié",
    ],
    is_popular: false,
  },
];

export function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(FALLBACK_PLANS);
  const [trialDays, setTrialDays] = useState<number>(3);
  const [canStartTrial, setCanStartTrial] = useState<boolean>(true);
  const [hasActiveAccess, setHasActiveAccess] = useState<boolean>(false);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Redeem code modal
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [plansRes, curStatusRes, paysRes] = await Promise.allSettled([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentStatus(),
        subscriptionService.listPayments(),
      ]);

      if (plansRes.status === "fulfilled") {
        const p = plansRes.value;
        if (p.plans && p.plans.length > 0) {
          setPlans(p.plans);
        }
        if (p.trial_days !== undefined) {
          setTrialDays(p.trial_days);
        }
      }

      if (curStatusRes.status === "fulfilled") {
        setCurrentSub(curStatusRes.value.subscription);
        setCanStartTrial(curStatusRes.value.can_start_trial);
        setHasActiveAccess(curStatusRes.value.has_active_access);
      }

      if (paysRes.status === "fulfilled") {
        setPayments(paysRes.value);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleStartTrial = async () => {
    setActionBusy("trial");
    try {
      const res = await subscriptionService.startTrial();
      toast.success(res.message || "Essai gratuit activé !");
      await loadData();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionBusy(null);
    }
  };

  const handleCheckout = async (plan: SubscriptionPlan) => {
    setActionBusy(plan.id);
    try {
      const res = await subscriptionService.checkout({
        plan_id: plan.id,
        return_url: window.location.href,
      });

      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        toast.success(res.message || "Formule sélectionnée avec succès !");
        await loadData();
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionBusy(null);
    }
  };

  const handleCancelSubscription = async () => {
    const reason = prompt("Précise la raison de l'annulation (optionnel) :") || undefined;
    setActionBusy("cancel");
    try {
      const res = await subscriptionService.cancel(reason);
      toast.success(res.message || "Abonnement résilié.");
      await loadData();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionBusy(null);
    }
  };

  const handleRedeemCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setRedeeming(true);
    try {
      const res = await subscriptionService.redeemCode(promoCode.trim());
      toast.success(res.message || "Code activé avec succès !");
      setShowRedeemModal(false);
      setPromoCode("");
      await loadData();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRedeeming(false);
    }
  };

  const isSubscribed = Boolean(
    hasActiveAccess ||
      (currentSub && (currentSub.status === "active" || currentSub.status === "trialing" || currentSub.is_valid))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Abonnement & Facturation"
        title="Mon offre Mina"
        description="Gère ton accès premium, active un code promo/CROUS ou consulte l’historique de tes paiements."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowRedeemModal(true)}
            >
              <Ticket size={14} className="mr-1.5" />
              Activer un code
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void loadData()}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        }
      />

      {error && (
        <Card className="!border-red-200 bg-red-50/50 p-4 dark:!border-red-500/20 dark:bg-red-500/10">
          <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {/* Active Subscription Banner */}
      <Card className="border-mina/30 bg-gradient-to-r from-mina/10 via-teal-50/30 to-transparent p-6 dark:from-mina/20 dark:via-panel dark:to-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-mina" />
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                Statut actuel :{" "}
                {currentSub
                  ? `${currentSub.plan_name || currentSub.plan?.name || "Abonnement"} (${currentSub.status === "trialing" || currentSub.is_trial ? "Essai" : "Actif"})`
                  : "Mina Étudiant (Offre découverte)"}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {currentSub?.current_period_end || currentSub?.ends_at
                ? `Valable jusqu’au ${new Date(
                    (currentSub.current_period_end || currentSub.ends_at)!,
                  ).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}`
                : currentSub?.trial_ends_at
                ? `Fin de l'essai le ${new Date(currentSub.trial_ends_at).toLocaleDateString("fr-FR")}`
                : "Accès gratuit aux fonctionnalités essentielles."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSubscribed ? (
              <Badge tone="teal">
                <CheckCircle2 size={12} className="mr-1" />
                {currentSub?.status === "trialing" || currentSub?.is_trial ? "Période d'essai" : "Actif"}
              </Badge>
            ) : (
              <Badge tone="slate">Formule gratuite</Badge>
            )}

            {!isSubscribed && canStartTrial && trialDays > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => void handleStartTrial()}
                disabled={actionBusy === "trial"}
              >
                {actionBusy === "trial" ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <>
                    <Gift size={14} className="mr-1.5" />
                    Essai gratuit {trialDays} jours
                  </>
                )}
              </Button>
            )}

            {isSubscribed && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void handleCancelSubscription()}
                disabled={actionBusy === "cancel"}
              >
                {actionBusy === "cancel" ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  "Résilier"
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Plans Comparison */}
      <div>
        <h3 className="text-sm font-extrabold pb-3 border-b border-line dark:border-white/10">
          Formules d’accès disponibles
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const activePlanName = (currentSub?.plan_name || currentSub?.plan?.name || "").toLowerCase();
            const thisPlanName = (plan.name || "").toLowerCase();
            const isCurrent = Boolean(
              (activePlanName && thisPlanName && (activePlanName.includes(thisPlanName) || thisPlanName.includes(activePlanName))) ||
              (!currentSub && (plan.id === "free" || plan.price === 0))
            );

            const priceDisplay =
              plan.price && plan.price > 0
                ? `${plan.price.toLocaleString("fr-FR")} FCFA / mois`
                : plan.price_monthly && plan.price_monthly > 0
                ? `${plan.price_monthly.toLocaleString("fr-FR")} FCFA / mois`
                : "Gratuit";

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between p-6 transition ${
                  plan.is_popular ? "border-mina ring-2 ring-mina/20" : ""
                }`}
              >
                {plan.is_popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-mina px-3 py-0.5 text-[10px] font-extrabold tracking-wide uppercase text-white">
                    Recommandé
                  </span>
                )}
                <div>
                  <h4 className="text-base font-extrabold">{plan.name}</h4>
                  <p className="mt-1 text-xs text-slate-400">{plan.tagline}</p>
                  <div className="mt-4">
                    <span className="text-xl font-extrabold tracking-tight">
                      {priceDisplay}
                    </span>
                  </div>
                  {plan.features && (
                    <ul className="mt-6 space-y-2.5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check size={14} className="text-mina mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-line dark:border-white/10">
                  <Button
                    variant={plan.is_popular ? "primary" : "secondary"}
                    className="w-full"
                    disabled={isCurrent || actionBusy === plan.id}
                    onClick={() => void handleCheckout(plan)}
                  >
                    {actionBusy === plan.id ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : isCurrent ? (
                      "Formule actuelle"
                    ) : (
                      "Choisir cette formule"
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-line dark:border-white/10">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-mina" />
            <h3 className="text-sm font-extrabold">Historique des transactions</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {payments.length} transaction(s)
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {payments.length === 0 ? (
            <p className="py-6 text-center text-xs font-bold text-slate-400">
              Aucun paiement enregistré pour ce compte.
            </p>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-line p-3.5 dark:border-white/5"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold">
                    {p.invoice_number ? `Facture #${p.invoice_number}` : `Paiement #${p.id}`}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {new Date(p.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold">
                    {p.amount} {p.currency}
                  </span>
                  <Badge tone={p.status === "completed" ? "teal" : "amber"}>
                    {p.status === "completed" ? "Payé" : p.status}
                  </Badge>
                  {p.receipt_url && (
                    <a
                      href={p.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-1.5 text-slate-400 hover:text-mina"
                      title="Télécharger le reçu"
                    >
                      <Download size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Redeem Code Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <Card className="relative w-full max-w-sm p-6">
            <button
              onClick={() => setShowRedeemModal(false)}
              className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Ticket size={18} className="text-mina" />
              Activer un code d'accès
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Saisis ton code fourni par ton université, le CROUS ou un partenaire.
            </p>

            <form onSubmit={handleRedeemCodeSubmit} className="mt-4 space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Ex : CROUS-THIES-2026"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="h-11 w-full rounded-xl border border-line bg-transparent px-3 text-center text-xs font-extrabold tracking-widest uppercase outline-none focus:border-mina dark:border-white/10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRedeemModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={redeeming || !promoCode.trim()}
                >
                  {redeeming ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    "Activer"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
