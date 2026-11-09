import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Logo } from "../../components/ui/Logo";
import { roleMeta } from "../../data/mocks";
import { useAuthStore } from "../../store/authStore";
import type { Role } from "../../types";
import { RegisterStepper } from "./register/RegisterStepper";
import { RoleStep } from "./register/RoleStep";
import { IdentityStep, type RegisterData } from "./register/IdentityStep";
import { SecurityStep } from "./register/SecurityStep";
import { SuccessStep } from "./register/SuccessStep";

const INITIAL_DATA: RegisterData = {
  name: "",
  email: "",
  institution: "UCAD",
  level: "L1",
  password: "",
};

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Exclude<Role, "super_admin">>("student");
  const [data, setData] = useState<RegisterData>(INITIAL_DATA);
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
              />
            )}
            {step === 4 && <SuccessStep name={data.name} role={role} />}
          </div>
        </div>
      </div>
    </div>
  );
}
