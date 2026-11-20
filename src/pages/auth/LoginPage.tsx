import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Badge, Button } from "../../components/ui/Primitives";
import { AuthVisual } from "../../components/auth/AuthVisual";
import { roleMeta } from "../../data/roleMeta";
import { ApiError } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import type { User } from "../../types";

const loginSchema = z.object({
  email: z.string().min(3, "Saisis ton email."),
  password: z.string().min(6, "Le mot de passe contient au moins 6 caractères."),
});
type LoginForm = z.infer<typeof loginSchema>;

function PasswordInput({
  register,
  error,
}: {
  register: ReturnType<typeof useForm<LoginForm>>["register"];
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block text-sm font-bold">
      Mot de passe
      <div className="relative mt-2">
        <LockKeyhole className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input
          {...register("password")}
          type={show ? "text" : "password"}
          className="h-12 w-full rounded-xl border border-line bg-white px-11 outline-none focus:border-mina focus:ring-3 focus:ring-mina/10 dark:border-white/10 dark:bg-panel"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-3 rounded p-1 text-slate-400"
          aria-label="Afficher ou masquer le mot de passe"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const go = (user: User) => {
    const redirect = new URLSearchParams(location.search).get("redirect");
    navigate(redirect?.startsWith("/app") ? redirect : roleMeta[user.role].home);
  };
  const submit = async (data: LoginForm) => {
    setServerError("");
    try {
      const result = await login(data.email, data.password);
      if (result.type === "two_factor") {
        navigate("/two-factor");
        return;
      }
      go(result.user);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        const fields = Object.keys(e.fieldErrors);
        for (const field of fields) {
          if (field === "email" || field === "password")
            setError(field, { message: e.fieldErrors[field] });
        }
        if (!fields.includes("email") && !fields.includes("password")) setServerError(e.message);
        else if (fields.length > 1) setServerError(e.message);
      } else {
        setServerError((e as Error).message);
      }
    }
  };
  return (
    <div className="grid min-h-screen bg-canvas dark:bg-[#09111f] lg:grid-cols-2">
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <Logo />
          <div className="mt-10">
            <Badge>Bon retour parmi nous</Badge>
            <h1 className="mt-4 text-3xl font-extrabold">Connecte-toi à Mina</h1>
            <p className="mt-2 text-sm text-slate-500">Reprends là où tu t’es arrêté.</p>
          </div>
          <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5">
            <label className="block text-sm font-bold">
              Email
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 outline-none focus:border-mina focus:ring-3 focus:ring-mina/10 dark:border-white/10 dark:bg-panel"
                  placeholder="toi@universite.sn"
                />
              </div>
              {errors.email && (
                <span className="mt-1 block text-xs text-red-500">{errors.email.message}</span>
              )}
            </label>
            <PasswordInput register={register} error={errors.password?.message} />
            <div className="flex items-center justify-end text-xs">
              <Link to="/forgot-password" className="font-bold text-mina">
                Mot de passe oublié ?
              </Link>
            </div>
            {serverError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
                {serverError}
              </div>
            )}
            <Button loading={isSubmitting} className="w-full">
              Se connecter <ArrowRight size={17} />
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Pas encore de compte ?{" "}
            <Link to="/register" className="font-bold text-mina">
              Commencer gratuitement
            </Link>
          </p>
        </div>
      </div>
      <AuthVisual />
    </div>
  );
}
