import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { AlertTriangle, GraduationCap } from "lucide-react";
import { PageHeader } from "../../../components/dashboard/Common";
import { Button } from "../../../components/ui/Primitives";
import { ApiError } from "../../../lib/api";
import { authService } from "../../../services/authService";
import { useAuthStore } from "../../../store/authStore";
import { toast } from "../../../store/toastStore";
import type { OnboardingData, OnboardingQuestion } from "../../../types/api";

type Values = Record<string, string>;

function QuestionField({
  question,
  value,
  onChange,
  children,
}: {
  question: OnboardingQuestion;
  value: string;
  onChange: (v: string) => void;
  children?: ReactNode;
}) {
  return (
    <label className="block text-sm font-bold">
      {question.label}
      {question.is_required && <span className="ml-1 text-red-500">*</span>}
      <div className="mt-2">
        {children ?? (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-mina focus:ring-3 focus:ring-mina/10 dark:border-white/10 dark:bg-panel"
          />
        )}
      </div>
    </label>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [values, setValues] = useState<Values>({});
  const [error, setError] = useState("");
  const [needsConsent, setNeedsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const completed = user?.studentProfile?.onboardingCompleted;

  useEffect(() => {
    if (completed) {
      navigate("/app/student", { replace: true });
      return;
    }
    let cancelled = false;
    authService
      .getOnboarding()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        const profile = res.student_profile;
        setValues({
          education_level: profile?.education_level ?? "",
          study_field: profile?.study_field ?? "",
          university_id: profile?.university_id ? String(profile.university_id) : "",
          faculty_id: profile?.faculty_id ? String(profile.faculty_id) : "",
        });
      })
      .catch((e) => {
        if (!cancelled)
          setLoadError(e instanceof ApiError ? e : new ApiError(0, (e as Error).message));
      });
    return () => {
      cancelled = true;
    };
  }, [completed, navigate]);

  const questions = useMemo(
    () => [...(data?.questions ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [data],
  );
  const universities = data?.universities ?? [];
  const selectedUniversityId = Number(values.university_id || 0);
  const faculties = useMemo(
    () => universities.find((u) => u.id === selectedUniversityId)?.faculties ?? [],
    [universities, selectedUniversityId],
  );

  const setValue = (key: string, v: string) => {
    setValues((prev) => {
      const next = { ...prev, [key]: v };
      if (key === "university_id") next.faculty_id = "";
      return next;
    });
  };

  const submit = async () => {
    setError("");
    const missing = questions.find((q) => q.is_required && !values[q.key]?.trim());
    if (missing) {
      setError(`Le champ « ${missing.label} » est requis.`);
      return;
    }
    const body: Record<string, unknown> = {};
    for (const question of questions) {
      const raw = values[question.key];
      if (raw === undefined || raw === "") continue;
      body[question.key] =
        question.key === "university_id" || question.key === "faculty_id" ? Number(raw) : raw;
    }
    if (!body.university_id) delete body.faculty_id;
    setSubmitting(true);
    try {
      const updated = await authService.submitOnboarding(body);
      setUser(updated);
      toast.success("Profil étudiant enregistré.");
      navigate("/app/student", { replace: true });
    } catch (e) {
      const apiError = e instanceof ApiError ? e : new ApiError(0, (e as Error).message);
      setNeedsConsent(apiError.status === 403);
      if (Object.keys(apiError.fieldErrors).length)
        setError(Object.values(apiError.fieldErrors).join(" · "));
      else setError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <>
        <PageHeader
          eyebrow="Première connexion"
          title="Complète ton profil étudiant"
          description="Quelques informations suffisent pour personnaliser ton expérience."
        />
        <div className="rounded-[22px] border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
          <p className="font-extrabold">{loadError.message}</p>
          <Link to="/app/student/profil" className="mt-3 inline-block font-bold text-mina">
            Gérer mes consentements dans mon profil →
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Première connexion"
        title="Complète ton profil étudiant"
        description="Quelques informations suffisent pour personnaliser ton expérience."
      />
      {!data && !loadError && (
        <p className="text-sm font-bold text-slate-400">Chargement du questionnaire…</p>
      )}
      {data && (
        <div className="max-w-2xl rounded-[22px] border border-line bg-white p-6 shadow-card dark:border-white/8 dark:bg-panel md:p-8">
          <div className="grid gap-5">
            {questions.map((question) => {
              if (question.key === "university_id") {
                return (
                  <QuestionField
                    key={question.key}
                    question={question}
                    value={values.university_id ?? ""}
                    onChange={(v) => setValue("university_id", v)}
                  >
                    <select
                      value={values.university_id ?? ""}
                      onChange={(e) => setValue("university_id", e.target.value)}
                      className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-mina focus:ring-3 focus:ring-mina/10 dark:border-white/10 dark:bg-panel"
                    >
                      <option value="">Choisir une université…</option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.city}
                        </option>
                      ))}
                    </select>
                  </QuestionField>
                );
              }
              if (question.key === "faculty_id") {
                return (
                  <QuestionField
                    key={question.key}
                    question={question}
                    value={values.faculty_id ?? ""}
                    onChange={(v) => setValue("faculty_id", v)}
                  >
                    <select
                      value={values.faculty_id ?? ""}
                      onChange={(e) => setValue("faculty_id", e.target.value)}
                      disabled={!selectedUniversityId || faculties.length === 0}
                      className="h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-mina focus:ring-3 focus:ring-mina/10 disabled:opacity-60 dark:border-white/10 dark:bg-panel"
                    >
                      <option value="">
                        {selectedUniversityId
                          ? faculties.length
                            ? "Choisir une faculté…"
                            : "Aucune faculté renseignée"
                          : "Choisis d’abord une université"}
                      </option>
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </QuestionField>
                );
              }
              return (
                <QuestionField
                  key={question.key}
                  question={question}
                  value={values[question.key] ?? ""}
                  onChange={(v) => setValue(question.key, v)}
                />
              );
            })}
          </div>
          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-xs font-bold leading-5 text-red-600 dark:bg-red-500/10">
              <AlertTriangle className="mr-1.5 inline" size={14} />
              {error}
              {needsConsent && (
                <>
                  {" "}
                  <Link to="/app/student/profil" className="underline text-mina">
                    Gérer mes consentements dans mon profil →
                  </Link>
                </>
              )}
            </div>
          )}
          <Button onClick={submit} loading={submitting} className="mt-6 w-full">
            <GraduationCap size={16} />
            Enregistrer mon profil
          </Button>
        </div>
      )}
    </>
  );
}
