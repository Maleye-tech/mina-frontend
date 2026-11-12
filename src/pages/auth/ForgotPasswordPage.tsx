import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Primitives";
import { Field } from "../../components/auth/Field";
import { authService } from "../../services/authService";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [value, setValue] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await authService.requestPasswordReset(value);
    setSent(true);
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5 dark:bg-[#09111f]">
      <div className="w-full max-w-md rounded-[26px] border border-line bg-white p-8 shadow-card dark:border-white/8 dark:bg-panel">
        <Logo />
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-mina dark:bg-mina/10">
          <LockKeyhole />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold">Mot de passe oublié ?</h1>
        {sent ? (
          <div className="mt-5 rounded-xl bg-teal-50 p-4 text-sm text-teal-800 dark:bg-mina/10 dark:text-teal-200">
            Si un compte correspond à <strong>{value}</strong>, tu recevras les instructions de
            réinitialisation.
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Entre ton email ou ton numéro de téléphone. Nous t’enverrons un lien sécurisé.
            </p>
            <div className="mt-6">
              <Field label="Email ou téléphone" value={value} onChange={setValue} />
            </div>
            <Button className="mt-5 w-full">Envoyer le lien</Button>
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
