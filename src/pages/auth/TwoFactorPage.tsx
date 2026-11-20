import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Copy, KeyRound, ShieldCheck } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Primitives";
import { ApiError } from "../../lib/api";
import { roleMeta } from "../../data/roleMeta";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import type { TwoFactorSetup } from "../../types/api";

export function TwoFactorPage() {
  const navigate = useNavigate();
  const challengeToken = useAuthStore((s) => s.challengeToken);
  const challengeRequiresSetup = useAuthStore((s) => s.challengeRequiresSetup);
  const completeTwoFactor = useAuthStore((s) => s.completeTwoFactor);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [setupError, setSetupError] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!challengeToken) navigate("/login", { replace: true });
  }, [challengeToken, navigate]);

  useEffect(() => {
    if (!challengeToken || !challengeRequiresSetup || setup || setupError) return;
    let cancelled = false;
    authService
      .twoFactorSetup(challengeToken)
      .then((res) => {
        if (!cancelled) setSetup(res);
      })
      .catch((e) => {
        if (!cancelled) setSetupError(e instanceof ApiError ? e.message : (e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [challengeToken, challengeRequiresSetup, setup, setupError]);

  const submit = async () => {
    setError("");
    if (code.length !== 6) {
      setError("Le code comporte 6 chiffres.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await completeTwoFactor(code);
      navigate(roleMeta[user.role].home, { replace: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : (e as Error).message);
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const copySecret = async () => {
    if (!setup) return;
    try {
      await navigator.clipboard.writeText(setup.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // le secret reste visible à l'écran, la copie est un confort
    }
  };

  if (!challengeToken) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10 dark:bg-[#09111f]">
      <div className="w-full max-w-md rounded-[26px] border border-line bg-white p-8 shadow-card dark:border-white/8 dark:bg-panel">
        <Logo />
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-mina dark:bg-mina/10">
          <ShieldCheck />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold">
          {challengeRequiresSetup
            ? "Configure la double authentification"
            : "Double authentification"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {challengeRequiresSetup
            ? "Ajoute ce secret à ton application d’authentification, puis saisis le code généré."
            : "Saisis le code à 6 chiffres généré par ton application d’authentification."}
        </p>

        {challengeRequiresSetup && (
          <div className="mt-6 space-y-4">
            {setupError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
                {setupError}
              </div>
            )}
            {setup && (
              <>
                <div className="rounded-xl border border-dashed border-mina bg-teal-50 p-4 dark:bg-mina/10">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-mina">
                    Secret
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <code className="break-all font-mono text-sm font-extrabold tracking-wider text-ink dark:text-white">
                      {setup.secret}
                    </code>
                    <button
                      onClick={copySecret}
                      className="shrink-0 rounded-lg border border-mina/40 p-2 text-mina"
                      aria-label="Copier le secret"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                  {copied && <p className="mt-2 text-[10px] font-bold text-mina">Secret copié.</p>}
                </div>
                <p className="text-xs leading-5 text-slate-500">
                  Dans ton application (Google Authenticator, Authy…), choisis « Ajouter un compte »
                  puis « Saisir une clé », et entre ce secret.
                </p>
              </>
            )}
            {!setup && !setupError && (
              <p className="text-xs font-bold text-slate-400">Génération du secret…</p>
            )}
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-bold">
            Code à 6 chiffres
            <div className="relative mt-2">
              <KeyRound className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 font-mono text-lg font-extrabold tracking-[.4em] outline-none focus:border-mina focus:ring-3 focus:ring-mina/10 dark:border-white/10 dark:bg-[#0d1625]"
                placeholder="000000"
              />
            </div>
          </label>
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
              {error}
            </div>
          )}
          <Button
            onClick={submit}
            loading={submitting}
            disabled={submitting || (challengeRequiresSetup && !setup)}
            className="mt-5 w-full"
          >
            {challengeRequiresSetup ? "Activer et continuer" : "Vérifier"}
          </Button>
        </div>

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-1 text-xs font-bold text-mina"
        >
          <ArrowLeft size={15} />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
