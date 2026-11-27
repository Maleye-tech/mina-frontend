import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Logo } from "../../components/ui/Logo";
import { roleMeta } from "../../data/roleMeta";
import { ApiError } from "../../lib/api";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import type { User } from "../../types";
import type {
  AvailableRole,
  PartnerInstitution,
  University,
} from "../../types/api";
import { IdentityStep, type RegisterData } from "./register/IdentityStep";
import { RegisterStepper } from "./register/RegisterStepper";
import { RoleStep, type MinaRoleKey } from "./register/RoleStep";
import { SecurityStep } from "./register/SecurityStep";
import { SuccessStep } from "./register/SuccessStep";

const INITIAL_DATA: RegisterData = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  consentPersonalData: true,
  role: "student",
};

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<MinaRoleKey>("student");
  const [data, setData] = useState<RegisterData>(INITIAL_DATA);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<User | null>(null);

  // Dynamic initialization from GET /api/auth/onboarding
  const [availableRoles, setAvailableRoles] = useState<AvailableRole[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [partnerInstitutions, setPartnerInstitutions] = useState<PartnerInstitution[]>([]);

  const register = useAuthStore((s) => s.register);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    void authService
      .getOnboarding()
      .then((res) => {
        if (!isMounted) return;
        if (res.available_roles?.length) setAvailableRoles(res.available_roles);
        if (res.universities?.length) setUniversities(res.universities);
        if (res.partner_institutions?.length) setPartnerInstitutions(res.partner_institutions);
      })
      .catch(() => {
        // Fallbacks will be used if network or endpoint is unavailable
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoleSelect = (selectedRole: MinaRoleKey) => {
    setRole(selectedRole);
    setData((prev) => ({ ...prev, role: selectedRole }));
  };

  const next = () => setStep((s) => Math.min(4, s + 1));

  const finish = async () => {
    setError("");
    setSubmitting(true);
    try {
      let user = await register({
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
        role: role,
        pseudonym: data.pseudonym || undefined,
        university_id: data.university_id ?? undefined,
        faculty_id: data.faculty_id ?? undefined,
        study_field: data.study_field || undefined,
        education_level: data.education_level || undefined,
        partner_institution_id: data.partner_institution_id ?? undefined,
        partner_position: data.partner_position || undefined,
      });

      if (data.consentPersonalData) {
        try {
          user = await authService.updateSettings({ consents: { personal_data: true } });
          setUser(user);
        } catch {
          // Consentement réitéré à l'onboarding si nécessaire
        }
      }

      setCreated(user);
      setStep(4);

      const targetPath = roleMeta[user.role]?.home ?? "/app/student";
      setTimeout(() => navigate(targetPath), 1600);
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
            {step === 1 && (
              <RoleStep
                role={role}
                onSelect={handleRoleSelect}
                onNext={next}
                availableRoles={availableRoles}
              />
            )}
            {step === 2 && (
              <IdentityStep
                role={role}
                data={data}
                onChange={setData}
                onNext={next}
                onBack={() => setStep(1)}
                universities={universities}
                partnerInstitutions={partnerInstitutions}
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
