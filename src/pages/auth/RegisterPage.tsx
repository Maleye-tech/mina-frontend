import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Logo } from "../../components/ui/Logo";
import { roleMeta } from "../../data/roleMeta";
import { ApiError } from "../../lib/api";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import type { Role, User } from "../../types";
import { RegisterStepper } from "./register/RegisterStepper";
import { RoleStep } from "./register/RoleStep";
import { IdentityStep, type RegisterData } from "./register/IdentityStep";
import { SecurityStep } from "./register/SecurityStep";
import { SuccessStep } from "./register/SuccessStep";

const INITIAL_DATA: RegisterData = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  consentPersonalData: true,
};

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Exclude<Role, "super_admin">>("student");
  const [data, setData] = useState<RegisterData>(INITIAL_DATA);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<User | null>(null);
  const register = useAuthStore((s) => s.register);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const next = () => setStep(Math.min(4, step + 1));
  const finish = async () => {
    setError("");
    setSubmitting(true);
    try {
      let user = await register({
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
      });
      if (data.consentPersonalData) {
        try {
          user = await authService.updateSettings({ consents: { personal_data: true } });
          setUser(user);
        } catch {
          // le consentement sera rappelé à l'onboarding s'il n'a pas pu être enregistré
        }
      }
      setCreated(user);
      setStep(4);
      setTimeout(() => navigate(roleMeta[user.role].home), 1600);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        const messages = Object.entries(e.fieldErrors)
          .map(([field, message]) => `${field} : ${message}`)
          .join(" · ");
        setError(messages || e.message);
      } else {
        setError((e as Error).message);
      }
      setStep(3);
    } finally {
      setSubmitting(false);
    }
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
          <RegisterStepper step={step} />
          <div className="rounded-[26px] border border-line bg-white p-6 shadow-card md:p-9 dark:border-white/8 dark:bg-panel">
            {step === 1 && <RoleStep role={role} onSelect={setRole} onNext={next} />}
            {step === 2 && (
              <IdentityStep
                role={role}
                data={data}
                onChange={setData}
                onNext={next}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <SecurityStep
                data={data}
                onChange={setData}
                onFinish={finish}
                onBack={() => setStep(2)}
                error={error}
                loading={submitting}
              />
            )}
            {step === 4 && <SuccessStep name={data.name} role={created?.role ?? role} />}
          </div>
        </div>
      </div>
    </div>
  );
}
