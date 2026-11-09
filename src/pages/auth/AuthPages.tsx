import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  HeartHandshake,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Badge, Button } from "../../components/ui/Primitives";
import { demoUsers, roleMeta } from "../../data/mocks";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import type { Role } from "../../types";

const loginSchema = z.object({
  email: z.string().min(3, "Saisis ton email ou téléphone."),
  password: z.string().min(6, "Le mot de passe contient au moins 6 caractères."),
});
type LoginForm = z.infer<typeof loginSchema>;

function AuthVisual() {
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

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickLogin } = useAuthStore();
  const [show, setShow] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "etudiant@mina.sn", password: "demo123" },
  });
  const go = (user: { role: Role }) => {
    const redirect = new URLSearchParams(location.search).get("redirect");
    navigate(redirect?.startsWith("/app") ? redirect : roleMeta[user.role].home);
  };
  const submit = async (data: LoginForm) => {
    try {
      setServerError("");
      go(await login(data.email, data.password));
    } catch (e) {
      setServerError((e as Error).message);
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
              Email ou téléphone
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  {...register("email")}
                  className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 outline-none focus:border-mina focus:ring-3 focus:ring-mina/10 dark:border-white/10 dark:bg-panel"
                  placeholder="toi@universite.sn"
                />
              </div>
              {errors.email && (
                <span className="mt-1 block text-xs text-red-500">{errors.email.message}</span>
              )}
            </label>
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
              {errors.password && (
                <span className="mt-1 block text-xs text-red-500">{errors.password.message}</span>
              )}
            </label>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-mina" />
                Se souvenir de moi
              </label>
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
          <div className="mt-8 border-t border-line pt-6 dark:border-white/8">
            <p className="mb-3 text-center text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">
              Comptes de démo — connexion immédiate
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  onClick={() => go(quickLogin(u.email))}
                  className="rounded-xl border border-line bg-white px-3 py-2.5 text-left text-[11px] font-bold transition hover:border-mina dark:border-white/10 dark:bg-panel"
                >
                  <span className="block text-mina">{roleMeta[u.role].label}</span>
                  <span className="text-slate-400">{u.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AuthVisual />
    </div>
  );
}

const profileOptions: {
  role: Exclude<Role, "super_admin">;
  icon: typeof GraduationCap;
  title: string;
  desc: string;
}[] = [
  {
    role: "student",
    icon: GraduationCap,
    title: "Étudiant",
    desc: "Médecine, pharmacie, odontologie ou filière santé",
  },
  {
    role: "ambassador",
    icon: HeartHandshake,
    title: "Ambassadeur",
    desc: "Étudiant relais formé à l’écoute",
  },
  {
    role: "professional",
    icon: Stethoscope,
    title: "Professionnel",
    desc: "Psychologue, psychiatre ou conseiller",
  },
  {
    role: "partner_admin",
    icon: Building2,
    title: "Partenaire",
    desc: "Université, CROUS, ONG ou institution",
  },
];

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Exclude<Role, "super_admin">>("student");
  const [data, setData] = useState({
    name: "",
    email: "",
    institution: "UCAD",
    level: "L1",
    password: "",
  });
  const registerUser = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const next = () => setStep(Math.min(4, step + 1));
  const finish = () => {
    const user = {
      name: data.name || "Nouveau membre",
      email: data.email,
      role,
      university: data.institution,
      status: role === "student" ? ("active" as const) : ("pending" as const),
    };
    registerUser(user);
    setStep(4);
    setTimeout(() => navigate(roleMeta[role].home), 1200);
  };
  return (
    <div className="min-h-screen bg-canvas px-5 py-8 dark:bg-[#09111f]">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/login" className="text-sm font-bold text-mina">
            Déjà inscrit ?
          </Link>
        </div>
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="mb-10 flex items-center justify-between">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-1 items-center last:flex-none">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${n <= step ? "bg-mina text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10"}`}
                >
                  {n < step ? <Check size={16} /> : n}
                </div>
                {n < 4 && (
                  <div
                    className={`h-1 w-full ${n < step ? "bg-mina" : "bg-slate-200 dark:bg-white/10"}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="rounded-[26px] border border-line bg-white p-6 shadow-card md:p-9 dark:border-white/8 dark:bg-panel">
            {step === 1 && (
              <>
                <Badge>Étape 1 sur 4</Badge>
                <h1 className="mt-4 text-2xl font-extrabold">Quel profil te correspond ?</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Nous personnaliserons ton expérience dès le départ.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {profileOptions.map((o) => (
                    <button
                      key={o.role}
                      onClick={() => setRole(o.role)}
                      className={`rounded-2xl border p-5 text-left transition ${role === o.role ? "border-mina bg-teal-50 ring-2 ring-mina/10 dark:bg-mina/10" : "border-line hover:border-mina/40 dark:border-white/10"}`}
                    >
                      <o.icon className={role === o.role ? "text-mina" : "text-slate-400"} />
                      <p className="mt-4 font-extrabold">{o.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{o.desc}</p>
                    </button>
                  ))}
                </div>
                <Button onClick={next} className="mt-7 w-full">
                  Continuer <ArrowRight size={16} />
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="mb-5 flex items-center gap-1 text-xs font-bold text-slate-500"
                >
                  <ArrowLeft size={15} />
                  Retour
                </button>
                <Badge>Étape 2 sur 4</Badge>
                <h1 className="mt-4 text-2xl font-extrabold">Faisons connaissance</h1>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Nom complet"
                    value={data.name}
                    onChange={(v) => setData({ ...data, name: v })}
                    placeholder="Aïssatou Ndiaye"
                  />
                  <Field
                    label="Email"
                    value={data.email}
                    onChange={(v) => setData({ ...data, email: v })}
                    placeholder="toi@universite.sn"
                  />
                  <Field
                    label={
                      role === "professional"
                        ? "Spécialité"
                        : role === "partner_admin"
                          ? "Institution"
                          : "Université"
                    }
                    value={data.institution}
                    onChange={(v) => setData({ ...data, institution: v })}
                  />
                  <Field
                    label={
                      role === "professional"
                        ? "Numéro d’ordre"
                        : role === "student"
                          ? "Niveau"
                          : "Fonction"
                    }
                    value={data.level}
                    onChange={(v) => setData({ ...data, level: v })}
                  />
                </div>
                {role !== "student" && (
                  <div className="mt-5 rounded-xl bg-amber-50 p-4 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                    <ShieldCheck className="mr-2 inline" size={16} />
                    Ce profil sera vérifié par l’équipe Mina avant activation complète.
                  </div>
                )}
                <Button onClick={next} disabled={!data.name || !data.email} className="mt-7 w-full">
                  Continuer
                </Button>
              </>
            )}
            {step === 3 && (
              <>
                <button
                  onClick={() => setStep(2)}
                  className="mb-5 flex items-center gap-1 text-xs font-bold text-slate-500"
                >
                  <ArrowLeft size={15} />
                  Retour
                </button>
                <Badge>Étape 3 sur 4</Badge>
                <h1 className="mt-4 text-2xl font-extrabold">Sécurise ton compte</h1>
                <div className="mt-7">
                  <Field
                    type="password"
                    label="Mot de passe"
                    value={data.password}
                    onChange={(v) => setData({ ...data, password: v })}
                    placeholder="8 caractères minimum"
                  />
                </div>
                <div className="mt-5 space-y-3 text-xs text-slate-500">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" defaultChecked className="mt-0.5 accent-mina" />
                    J’accepte les CGU et la politique de confidentialité.
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" defaultChecked className="mt-0.5 accent-mina" />
                    Je consens au traitement de mes données pour fournir le service Mina.
                  </label>
                </div>
                <Button
                  onClick={finish}
                  disabled={data.password.length < 6}
                  className="mt-7 w-full"
                >
                  Créer mon compte
                </Button>
              </>
            )}
            {step === 4 && (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-mina dark:bg-mina/10">
                  <Check size={30} />
                </div>
                <h1 className="mt-6 text-2xl font-extrabold">
                  Bienvenue dans Mina, {data.name.split(" ")[0]} !
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                  {role === "student"
                    ? "Ton espace est prêt. Nous préparons ton tableau de bord."
                    : "Ta demande a bien été reçue. Ton compte est en attente de validation."}
                </p>
                <p className="mt-6 text-xs font-bold text-mina">Redirection en cours…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-mina focus:ring-3 focus:ring-mina/10 dark:border-white/10 dark:bg-[#0d1625]"
      />
    </label>
  );
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [value, setValue] = useState("");
  const submit = async (e: React.FormEvent) => {
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
