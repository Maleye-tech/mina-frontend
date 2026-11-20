import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Primitives";
import { Field } from "../../components/auth/Field";
import { ApiError } from "../../lib/api";
import { authService } from "../../services/authService";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const tokenFromUrl = params.get("token") ?? "";
  const emailFromUrl = params.get("email") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const canSubmit =
    token.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmation &&
    !loading;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.resetPassword({
        token: token.trim(),
        email: email.trim(),
        password,
        passwordConfirmation: confirmation,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5 dark:bg-[#09111f]">
      <div className="w-full max-w-md rounded-[26px] border border-line bg-white p-8 shadow-card dark:border-white/8 dark:bg-panel">
        <Logo />
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-mina dark:bg-mina/10">
          <LockKeyhole />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold">Nouveau mot de passe</h1>
        {done ? (
          <div className="mt-5 rounded-xl bg-teal-50 p-4 text-sm text-teal-800 dark:bg-mina/10 dark:text-teal-200">
            Ton mot de passe a été réinitialisé avec succès. Tu peux te reconnecter.
            <Link to="/login" className="mt-3 block font-bold text-mina">
              Aller à la connexion →
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <p className="text-sm leading-6 text-slate-500">
              Ouvre le lien reçu par mail, puis choisis un nouveau mot de passe.
            </p>
            <Field label="Jeton de réinitialisation" value={token} onChange={setToken} />
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field
              label="Nouveau mot de passe"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="8 caractères minimum"
            />
            <Field
              label="Confirme le mot de passe"
              type="password"
              value={confirmation}
              onChange={setConfirmation}
            />
            {password !== confirmation && confirmation.length > 0 && (
              <p className="text-xs font-bold text-red-500">
                Les deux mots de passe ne correspondent pas.
              </p>
            )}
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
                {error}
              </div>
            )}
            <Button loading={loading} disabled={!canSubmit} className="w-full">
              Réinitialiser le mot de passe
            </Button>
          </form>
        )}
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
