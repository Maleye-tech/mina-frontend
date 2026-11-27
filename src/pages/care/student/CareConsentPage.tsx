import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  EyeOff,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Siren,
  UserRound,
  WifiOff,
} from "lucide-react";
import { Link } from "react-router";
import {
  CareLoading,
  CarePageHeader,
  ConfidentialityNotice,
  EmptyState,
  ErrorBanner,
} from "../../../components/care/CarePrimitives";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { ApiError, errorMessage } from "../../../lib/api";
import { authService } from "../../../services/authService";
import { useAuthStore } from "../../../store/authStore";
import type { UserConsent } from "../../../types";

const recordedDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatRecordedDate(value: string | null): string {
  if (!value) return "Non enregistrée";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Non enregistrée" : recordedDateFormatter.format(date);
}

function consentLabel(consent: UserConsent | undefined): {
  label: string;
  tone: "teal" | "amber" | "slate";
} {
  if (!consent?.granted) return { label: "Consentement non accordé", tone: "slate" };
  if (consent.currentVersion && consent.version !== consent.currentVersion) {
    return { label: "Accordé, version à renouveler", tone: "amber" };
  }
  return { label: "Consentement accordé et à jour", tone: "teal" };
}

export function CareConsentPage() {
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const refreshMe = useAuthStore((state) => state.refreshMe);
  const [pseudonym, setPseudonym] = useState("");
  const [mentalHealthConsent, setMentalHealthConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pseudonymError, setPseudonymError] = useState("");
  const [notice, setNotice] = useState("");
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    setPseudonym(user?.pseudonym ?? "");
    setMentalHealthConsent(user?.consents?.mental_health_data?.granted ?? false);
  }, [user]);

  const retrySession = async () => {
    setSessionError("");
    try {
      await refreshMe();
    } catch (reason) {
      setSessionError(errorMessage(reason));
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || saving) return;

    const nextPseudonym = pseudonym.trim();
    setError("");
    setPseudonymError("");
    setNotice("");

    if (
      nextPseudonym &&
      (nextPseudonym.length < 3 ||
        nextPseudonym.length > 30 ||
        !/^[\p{L}\p{N}_.-]+$/u.test(nextPseudonym))
    ) {
      setPseudonymError(
        "Utilise 3 à 30 caractères : lettres, chiffres, point, tiret ou trait bas.",
      );
      return;
    }

    setSaving(true);
    try {
      const updated = await authService.updateSettings({
        ...(nextPseudonym ? { pseudonym: nextPseudonym } : {}),
        consents: { mental_health_data: mentalHealthConsent },
      });
      setUser(updated);
      setNotice(
        nextPseudonym
          ? "Ton pseudonyme et ton choix de consentement ont été enregistrés."
          : "Ton choix de consentement a été enregistré.",
      );
    } catch (reason) {
      if (reason instanceof ApiError && reason.fieldErrors.pseudonym) {
        setPseudonymError(reason.fieldErrors.pseudonym);
      } else {
        setError(errorMessage(reason));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <CarePageHeader
          eyebrow="Confidentialité"
          title="Consentement et anonymat"
          description="Comprendre l’utilisation de tes données et choisir ton pseudonyme."
        />
        <CareLoading label="Chargement de tes préférences…" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <CarePageHeader
          eyebrow="Confidentialité"
          title="Consentement et anonymat"
          description="Comprendre l’utilisation de tes données et choisir ton pseudonyme."
        />
        {sessionError && <ErrorBanner message={sessionError} onRetry={() => void retrySession()} />}
        <EmptyState
          icon={<ShieldCheck size={22} />}
          title="Connexion requise"
          description="Connecte-toi pour consulter et modifier ton pseudonyme et ton consentement."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" variant="secondary" onClick={() => void retrySession()}>
                Réessayer
              </Button>
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center rounded-xl bg-mina px-5 text-sm font-bold text-white"
              >
                Se connecter
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const consent = user.consents?.mental_health_data;
  const currentConsent = consentLabel(consent);

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Confidentialité"
        title="Consentement et anonymat"
        description="Comprends ce qui est partagé, avec qui et comment protéger ton anonymat avant de demander de l’aide."
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-5">
          <Card>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink dark:text-white">
              <EyeOff size={20} className="text-mina" /> Un échange sous pseudonyme
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Le professionnel voit ton pseudonyme et les informations nécessaires à
              l’accompagnement : rendez-vous, motif, messages et éventuelle alerte urgente. Cette
              page ne lui transmet ni ton nom civil ni ton adresse e-mail.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Choisis un pseudonyme qui ne révèle pas ton identité. L’anonymat est relatif : Mina
              relie ce pseudonyme à ton compte. Évite aussi les détails identifiants dans tes
              messages.
            </p>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink dark:text-white">
              <LockKeyhole size={20} className="text-mina" /> Protection des échanges
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Les messages et notes privées sont chiffrés au repos. Ils ne sont pas chiffrés de bout
              en bout : les professionnels habilités et les personnes chargées de l’exploitation du
              service peuvent y accéder dans le cadre de leurs fonctions.
            </p>
            <div className="mt-4">
              <ConfidentialityNotice />
            </div>
            <p className="mt-3 flex gap-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              <WifiOff size={18} className="mt-1 shrink-0 text-mina" />
              Une connexion est nécessaire pour consulter les échanges. Leur contenu n’est pas
              conservé dans le stockage hors-ligne de cet appareil.
            </p>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink dark:text-white">
              <MessageCircle size={20} className="text-mina" /> Données utilisées
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
              <li>Ton pseudonyme, tes rendez-vous et ton motif de consultation.</li>
              <li>Les messages échangés avec le professionnel après confirmation.</li>
              <li>Les alertes urgentes que tu choisis de transmettre.</li>
              <li>
                Les notes privées restent réservées au professionnel ; leur présence n’en révèle pas
                le contenu.
              </li>
            </ul>
            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Ces informations servent à organiser et assurer l’accompagnement. Elles ne sont pas
              utilisées pour te contacter à des fins publicitaires.
            </p>
          </Card>

          <Card className="border-red-200 bg-red-50/60 dark:border-red-400/20 dark:bg-red-500/5">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink dark:text-white">
              <Siren size={20} className="text-red-600 dark:text-red-300" /> Visibilité des alertes
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Une alerte urgente est visible par les professionnels actifs et vérifiés. Elle
              comprend ton pseudonyme, ton message facultatif et le rendez-vous associé lorsque tu
              en indiques un.
            </p>
            <p className="mt-3 text-sm font-bold leading-6 text-red-800 dark:text-red-200">
              Une alerte ne garantit pas une réponse immédiate et ne remplace pas les services
              d’urgence. En cas de danger immédiat, contacte directement un service d’urgence local.
            </p>
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24">
          <Card>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink dark:text-white">
              <UserRound size={20} className="text-mina" /> Ma situation actuelle
            </h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs font-bold text-slate-400">Pseudonyme actuel</dt>
                <dd className="mt-1 break-words text-sm font-extrabold text-ink dark:text-white">
                  {user.pseudonym || "Non défini"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-400">Consentement santé mentale</dt>
                <dd className="mt-2">
                  <Badge tone={currentConsent.tone}>{currentConsent.label}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-400">Version du consentement</dt>
                <dd className="mt-1 text-sm font-bold text-ink dark:text-white">
                  {consent?.version ?? "Aucune"}
                  {consent?.currentVersion ? ` · version actuelle ${consent.currentVersion}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-400">Dernier enregistrement</dt>
                <dd className="mt-1 text-sm font-bold text-ink dark:text-white">
                  {formatRecordedDate(consent?.recordedAt ?? null)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-lg font-extrabold text-ink dark:text-white">Modifier mes choix</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Ton consentement est volontaire. Tu peux le retirer à tout moment ; certaines
              fonctionnalités d’accompagnement pourront alors être limitées.
            </p>

            <form onSubmit={submit} noValidate className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="care-pseudonym"
                  className="text-sm font-extrabold text-ink dark:text-white"
                >
                  Pseudonyme <span className="font-normal text-slate-400">(facultatif)</span>
                </label>
                <input
                  id="care-pseudonym"
                  type="text"
                  value={pseudonym}
                  onChange={(event) => {
                    setPseudonym(event.target.value);
                    setPseudonymError("");
                    setError("");
                    setNotice("");
                  }}
                  maxLength={30}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={pseudonymError ? true : undefined}
                  aria-describedby="care-pseudonym-help"
                  placeholder="Ex. Libellule_Calme"
                  className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <p id="care-pseudonym-help" className="mt-1 text-[11px] leading-5 text-slate-400">
                  3 à 30 caractères : lettres, chiffres, point, tiret ou trait bas. Laisse le champ
                  vide pour conserver le pseudonyme actuel.
                </p>
                {pseudonymError && (
                  <p
                    role="alert"
                    className="mt-2 text-xs font-bold leading-5 text-red-700 dark:text-red-300"
                  >
                    {pseudonymError}
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 dark:border-white/10">
                <input
                  type="checkbox"
                  checked={mentalHealthConsent}
                  onChange={(event) => {
                    setMentalHealthConsent(event.target.checked);
                    setError("");
                    setNotice("");
                  }}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[#0f766e]"
                />
                <span>
                  <span className="block text-sm font-extrabold text-ink dark:text-white">
                    J’accepte l’utilisation de mes données de santé mentale
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    pour être accompagné par un professionnel vérifié, organiser mes rendez-vous et
                    utiliser la messagerie sécurisée.
                  </span>
                </span>
              </label>

              {error && <ErrorBanner message={error} />}
              {notice && (
                <div
                  role="status"
                  className="flex gap-2 rounded-xl bg-teal-50 p-3 text-sm font-bold leading-6 text-teal-900 dark:bg-teal-400/10 dark:text-teal-100"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <p>{notice}</p>
                </div>
              )}

              <Button type="submit" loading={saving} className="w-full">
                Enregistrer mes choix
              </Button>
            </form>
          </Card>

          <p className="px-1 text-xs leading-5 text-slate-400">
            <ShieldCheck size={15} className="mr-1 inline text-mina" />
            Ne communique jamais ton mot de passe ou une pièce d’identité à un professionnel.
          </p>
        </div>
      </div>
    </div>
  );
}
