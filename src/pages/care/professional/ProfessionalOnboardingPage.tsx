import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Clock3, Save, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { ApiError, errorMessage } from "@/lib/api";
import { careService } from "@/services/careService";
import type { CareProfessional, CareProfessionalProfileInput, CareSpecialty } from "@/types/care";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import { CareLoading, CarePageHeader, ErrorBanner } from "@/components/care/CarePrimitives";

const specialties: { value: CareSpecialty; label: string }[] = [
  { value: "psychologue", label: "Psychologue clinicien" },
  { value: "psychiatre", label: "Psychiatre" },
  { value: "conseiller", label: "Conseiller en santé mentale" },
];

type FormErrors = Partial<{
  display_name: string;
  specialty: string;
  languages: string;
  bio: string;
  charter: string;
}>;

export function ProfessionalOnboardingPage() {
  const [profile, setProfile] = useState<CareProfessional | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [specialty, setSpecialty] = useState<CareSpecialty>("psychologue");
  const [languagesText, setLanguagesText] = useState("");
  const [bio, setBio] = useState("");
  const [charterAccepted, setCharterAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const nextProfile = await careService.getProfessionalProfile();
      setProfile(nextProfile);
      setDisplayName(nextProfile.display_name);
      setSpecialty(nextProfile.specialty);
      setLanguagesText(nextProfile.languages.join(", "));
      setBio(nextProfile.bio ?? "");
      setCharterAccepted(nextProfile.has_accepted_charter);
    } catch (reason) {
      setLoadError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || saving) return;

    const languages = languagesText
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean);
    const nextErrors: FormErrors = {};

    if (!displayName.trim()) {
      nextErrors.display_name = "Le nom d’affichage est obligatoire.";
    } else if (displayName.trim().length > 255) {
      nextErrors.display_name = "Le nom d’affichage ne doit pas dépasser 255 caractères.";
    }
    if (!specialties.some((item) => item.value === specialty)) {
      nextErrors.specialty = "Sélectionne une spécialité valide.";
    }
    if (!languages.length) {
      nextErrors.languages = "Renseigne au moins une langue de consultation.";
    } else if (languages.some((language) => language.length > 50)) {
      nextErrors.languages = "Chaque langue ne doit pas dépasser 50 caractères.";
    }
    if (bio.length > 2000) {
      nextErrors.bio = "La présentation ne doit pas dépasser 2 000 caractères.";
    }
    if (!profile.has_accepted_charter && !charterAccepted) {
      nextErrors.charter = "Tu dois accepter la charte avant d’enregistrer ton profil.";
    }

    setErrors(nextErrors);
    setSubmitError("");
    setSuccess("");
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      let currentProfile = profile;
      if (!currentProfile.has_accepted_charter) {
        currentProfile = await careService.acceptProfessionalCharter();
      }

      const input: CareProfessionalProfileInput = {
        display_name: displayName.trim(),
        specialty,
        languages,
        bio: bio.trim() || null,
      };
      const updatedProfile = await careService.updateProfessionalProfile(input);
      setProfile(updatedProfile);
      setDisplayName(updatedProfile.display_name);
      setSpecialty(updatedProfile.specialty);
      setLanguagesText(updatedProfile.languages.join(", "));
      setBio(updatedProfile.bio ?? "");
      setCharterAccepted(updatedProfile.has_accepted_charter);
      setSuccess(
        updatedProfile.is_verified
          ? "Ton profil a été mis à jour."
          : "Ton profil est enregistré. L’équipe administrative doit maintenant le valider.",
      );
    } catch (reason) {
      const fields = reason instanceof ApiError ? reason.fieldErrors : {};
      setErrors({
        display_name: fields.display_name,
        specialty: fields.specialty,
        languages: fields.languages ?? fields["languages.0"],
        bio: fields.bio,
        charter: fields.accept,
      });
      setSubmitError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Espace professionnel"
        title="Mon profil professionnel"
        description="Présente ton accompagnement, accepte la charte et suis la validation de ton profil."
        actions={
          <Link
            to="/pro"
            className="inline-flex min-h-11 items-center rounded-xl border border-line bg-white px-4 text-sm font-bold text-ink hover:border-mina/40 dark:border-white/10 dark:bg-white/8 dark:text-white"
          >
            Tableau de bord
          </Link>
        }
      />

      {loading ? (
        <CareLoading label="Chargement de ton profil…" />
      ) : loadError ? (
        <ErrorBanner message={loadError} onRetry={() => void loadProfile()} />
      ) : profile ? (
        <>
          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              {profile.is_verified ? (
                <CheckCircle2 className="mt-0.5 shrink-0 text-mina" size={22} />
              ) : (
                <Clock3 className="mt-0.5 shrink-0 text-amber-600" size={22} />
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-extrabold text-ink dark:text-white">
                    {profile.is_verified
                      ? "Profil vérifié"
                      : "Validation administrative en attente"}
                  </h2>
                  <Badge tone={profile.is_verified ? "teal" : "amber"}>
                    {profile.is_verified ? "Vérifié" : "En attente"}
                  </Badge>
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {profile.is_verified
                    ? "Ton profil a été validé par l’équipe administrative."
                    : "Ton profil ne peut pas être auto-vérifié. L’équipe administrative doit examiner ta demande avant l’ouverture des disponibilités et des rendez-vous."}
                </p>
              </div>
            </div>
          </Card>

          {submitError && <ErrorBanner message={submitError} />}
          {success && (
            <p
              role="status"
              className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-bold text-teal-900 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-100"
            >
              {success}
            </p>
          )}

          <form onSubmit={submit} className="space-y-5" noValidate>
            <Card>
              <h2 className="text-lg font-extrabold text-ink dark:text-white">
                Informations publiques
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Ces informations sont visibles par les étudiants dans le catalogue.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-ink dark:text-white">
                    Nom d’affichage
                  </span>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    maxLength={255}
                    autoComplete="organization"
                    aria-invalid={Boolean(errors.display_name)}
                    aria-describedby={errors.display_name ? "display-name-error" : undefined}
                    className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5"
                  />
                  {errors.display_name && (
                    <span
                      id="display-name-error"
                      className="mt-1 block text-xs font-bold text-red-600"
                    >
                      {errors.display_name}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-ink dark:text-white">Spécialité</span>
                  <select
                    value={specialty}
                    onChange={(event) => setSpecialty(event.target.value as CareSpecialty)}
                    aria-invalid={Boolean(errors.specialty)}
                    aria-describedby={errors.specialty ? "specialty-error" : undefined}
                    className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5"
                  >
                    {specialties.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {errors.specialty && (
                    <span
                      id="specialty-error"
                      className="mt-1 block text-xs font-bold text-red-600"
                    >
                      {errors.specialty}
                    </span>
                  )}
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-bold text-ink dark:text-white">
                  Langues de consultation
                </span>
                <input
                  value={languagesText}
                  onChange={(event) => setLanguagesText(event.target.value)}
                  placeholder="Français, Anglais"
                  aria-invalid={Boolean(errors.languages)}
                  aria-describedby={
                    errors.languages ? "languages-help languages-error" : "languages-help"
                  }
                  className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5"
                />
                <span
                  id="languages-help"
                  className="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                >
                  Sépare les langues par des virgules.
                </span>
                {errors.languages && (
                  <span id="languages-error" className="mt-1 block text-xs font-bold text-red-600">
                    {errors.languages}
                  </span>
                )}
              </label>

              <label className="mt-5 block">
                <span className="flex items-center justify-between gap-3 text-sm font-bold text-ink dark:text-white">
                  Présentation
                  <span className="text-xs font-normal text-slate-400">{bio.length} / 2 000</span>
                </span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={2000}
                  rows={5}
                  aria-invalid={Boolean(errors.bio)}
                  aria-describedby={errors.bio ? "bio-error" : undefined}
                  placeholder="Décris ton approche, ton expérience et le cadre de tes accompagnements."
                  className="mt-2 w-full resize-y rounded-xl border border-line bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5"
                />
                {errors.bio && (
                  <span id="bio-error" className="mt-1 block text-xs font-bold text-red-600">
                    {errors.bio}
                  </span>
                )}
              </label>
            </Card>

            <Card>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-mina" size={22} />
                <div>
                  <h2 className="text-lg font-extrabold text-ink dark:text-white">
                    Charte de confidentialité et de déontologie
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    En acceptant cette charte, tu t’engages à préserver l’anonymat des étudiants, à
                    protéger les échanges et les notes, à respecter les limites de ton rôle et à ne
                    jamais utiliser les informations de santé à des fins personnelles.
                  </p>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 dark:border-white/10">
                <input
                  type="checkbox"
                  checked={charterAccepted}
                  disabled={profile.has_accepted_charter || saving}
                  onChange={(event) => setCharterAccepted(event.target.checked)}
                  aria-invalid={Boolean(errors.charter)}
                  aria-describedby={errors.charter ? "charter-error" : undefined}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#0f766e]"
                />
                <span>
                  <span className="block text-sm font-bold text-ink dark:text-white">
                    J’accepte la charte de confidentialité et de déontologie.
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {profile.has_accepted_charter
                      ? `Charte acceptée le ${profile.charter_accepted_at ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(profile.charter_accepted_at)) : "précédemment"}.`
                      : "Cette acceptation est obligatoire avant la validation administrative."}
                  </span>
                </span>
              </label>
              {errors.charter && (
                <p id="charter-error" className="mt-2 text-xs font-bold text-red-600">
                  {errors.charter}
                </p>
              )}
            </Card>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Link
                to="/pro"
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/8"
              >
                Annuler
              </Link>
              <Button type="submit" loading={saving} className="sm:min-w-56">
                <Save size={17} />
                {profile.has_accepted_charter
                  ? "Enregistrer les modifications"
                  : "Accepter la charte et enregistrer"}
              </Button>
            </div>
          </form>
        </>
      ) : null}
    </div>
  );
}
