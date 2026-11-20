import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, BadgeCheck, MailCheck, Save, Trash2 } from "lucide-react";
import { Button, Card } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";
import { ApiError } from "../../../lib/api";
import { authService } from "../../../services/authService";
import { useAuthStore } from "../../../store/authStore";
import { toast } from "../../../store/toastStore";

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (Object.keys(e.fieldErrors).length) return Object.values(e.fieldErrors).join(" · ");
    return e.message;
  }
  return (e as Error).message;
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)!;
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  const [pseudonym, setPseudonym] = useState(user.pseudonym ?? "");
  const [language, setLanguage] = useState(user.preferences?.language ?? "fr");
  const [notifications, setNotifications] = useState(
    user.preferences?.notificationsEnabled ?? true,
  );
  const [personalData, setPersonalData] = useState(user.consents?.personal_data?.granted ?? false);
  const [mentalHealth, setMentalHealth] = useState(
    user.consents?.mental_health_data?.granted ?? false,
  );
  const [savingSettings, setSavingSettings] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [resending, setResending] = useState(false);

  useEffect(() => {
    setPseudonym(user.pseudonym ?? "");
    setLanguage(user.preferences?.language ?? "fr");
    setNotifications(user.preferences?.notificationsEnabled ?? true);
    setPersonalData(user.consents?.personal_data?.granted ?? false);
    setMentalHealth(user.consents?.mental_health_data?.granted ?? false);
  }, [user]);

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await authService.updateSettings({
        pseudonym,
        preferredLanguage: language,
        notificationsEnabled: notifications,
        consents: { personal_data: personalData, mental_health_data: mentalHealth },
      });
      setUser(updated);
      toast.success("Vos préférences et consentements ont été enregistrés.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingSettings(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setChangingPassword(true);
    try {
      const message = await authService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
      );
      toast.success(message);
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setPasswordError(errorMessage(err));
    } finally {
      setChangingPassword(false);
    }
  };

  const deleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    setDeleteError("");
    setDeleting(true);
    try {
      const message = await authService.deleteAccount(deletePassword);
      toast.success(message);
      clearSession();
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const resendVerification = async () => {
    setResending(true);
    try {
      const message = await authService.resendVerification();
      toast.success(message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setResending(false);
    }
  };

  const initials = user.name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <PageHeader
        eyebrow="Paramètres"
        title="Mon profil"
        description="Personnalise ton expérience et tes préférences."
      />

      {user.emailVerified === false && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <MailCheck className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="text-sm font-extrabold">Adresse e-mail non vérifiée</p>
              <p className="mt-1 text-xs leading-5">
                Un lien de vérification a été envoyé à {user.email}. Vérifie ta boîte mail.
              </p>
            </div>
          </div>
          <Button variant="secondary" loading={resending} onClick={resendVerification}>
            Renvoyer le lien
          </Button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        <Card>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-mina text-xl font-extrabold text-white">
            {initials}
          </div>
          <h2 className="mt-4 text-center font-extrabold">{user.name}</h2>
          <p className="mt-1 text-center text-xs text-slate-400">{user.email}</p>
          <div className="mt-3 flex justify-center">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-mina/10 dark:text-teal-200">
              {user.roleLabel ?? user.role}
            </span>
          </div>
          {user.studentProfile && (
            <div className="mt-5 space-y-2 border-t border-line pt-5 text-xs dark:border-white/8">
              <p className="flex justify-between gap-3">
                <span className="text-slate-400">Niveau</span>
                <span className="font-bold">{user.studentProfile.educationLevel ?? "—"}</span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-slate-400">Filière</span>
                <span className="font-bold">{user.studentProfile.studyField ?? "—"}</span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-slate-400">Université</span>
                <span className="font-bold">{user.studentProfile.university ?? "—"}</span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-slate-400">Faculté</span>
                <span className="font-bold">{user.studentProfile.faculty ?? "—"}</span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-slate-400">Email vérifié</span>
                <span className="inline-flex items-center gap-1 font-bold">
                  {user.emailVerified ? (
                    <>
                      <BadgeCheck size={14} className="text-mina" /> Oui
                    </>
                  ) : (
                    "Non"
                  )}
                </span>
              </p>
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="font-extrabold">Préférences et consentements</h2>
            <form onSubmit={saveSettings} className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-bold">
                Pseudonyme
                <input
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder="MinaUser_01"
                  maxLength={50}
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 outline-none focus:border-mina dark:border-white/10"
                />
              </label>
              <label className="text-xs font-bold">
                Langue préférée
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 outline-none focus:border-mina dark:border-white/10 dark:bg-panel"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label className="flex items-center gap-3 text-xs font-bold sm:col-span-2">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="accent-mina"
                />
                Activer les notifications
              </label>
              <div className="sm:col-span-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Consentements
                </p>
                <label className="mt-3 flex items-start gap-3 text-xs leading-5">
                  <input
                    type="checkbox"
                    checked={personalData}
                    onChange={(e) => setPersonalData(e.target.checked)}
                    className="mt-0.5 accent-mina"
                  />
                  <span>
                    J’accepte le traitement de mes <strong>données personnelles</strong> pour
                    fournir le service Mina.
                  </span>
                </label>
                <label className="mt-3 flex items-start gap-3 text-xs leading-5">
                  <input
                    type="checkbox"
                    checked={mentalHealth}
                    onChange={(e) => setMentalHealth(e.target.checked)}
                    className="mt-0.5 accent-mina"
                  />
                  <span>
                    J’accepte le traitement de mes <strong>données de santé mentale</strong> liées à
                    Mina Care.
                  </span>
                </label>
              </div>
              <div className="sm:col-span-2">
                <Button loading={savingSettings} className="w-full sm:w-auto">
                  <Save size={15} />
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="font-extrabold">Changer mon mot de passe</h2>
            <form onSubmit={changePassword} className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="text-xs font-bold">
                Mot de passe actuel
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 outline-none focus:border-mina dark:border-white/10"
                />
              </label>
              <label className="text-xs font-bold">
                Nouveau mot de passe
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 outline-none focus:border-mina dark:border-white/10"
                />
              </label>
              <label className="text-xs font-bold">
                Confirmation
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 outline-none focus:border-mina dark:border-white/10"
                />
              </label>
              {passwordError && (
                <p className="text-xs font-bold text-red-500 sm:col-span-3">{passwordError}</p>
              )}
              <div className="sm:col-span-3">
                <Button variant="secondary" loading={changingPassword} disabled={!currentPassword}>
                  Modifier le mot de passe
                </Button>
                <p className="mt-2 text-[10px] text-slate-400">
                  Toutes les sessions seront déconnectées après le changement.
                </p>
              </div>
            </form>
          </Card>

          <Card className="border-red-200 dark:border-red-400/20">
            <h2 className="flex items-center gap-2 font-extrabold text-red-600">
              <Trash2 size={17} />
              Supprimer mon compte
            </h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Cette action est définitive : ton profil, tes préférences et tes données seront
              supprimés.
            </p>
            <form onSubmit={deleteAccount} className="mt-4 flex flex-wrap items-end gap-3">
              <label className="min-w-64 flex-1 text-xs font-bold">
                Mot de passe actuel
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  autoComplete="current-password"
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 outline-none focus:border-red-400 dark:border-white/10"
                />
              </label>
              <Button
                variant="secondary"
                loading={deleting}
                disabled={!deletePassword}
                className="border-red-300 text-red-600 hover:border-red-500"
              >
                <AlertTriangle size={15} />
                Supprimer définitivement
              </Button>
            </form>
            {deleteError && <p className="mt-3 text-xs font-bold text-red-500">{deleteError}</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
