import { Badge, Button } from "../../../components/ui/Primitives";
import { Field } from "../../../components/auth/Field";
import { BackButton, type RegisterData } from "./IdentityStep";

export function SecurityStep({
  data,
  onChange,
  onFinish,
  onBack,
  error,
  loading,
}: {
  data: RegisterData;
  onChange: (data: RegisterData) => void;
  onFinish: () => void;
  onBack: () => void;
  error?: string;
  loading?: boolean;
}) {
  const mismatch =
    data.passwordConfirmation.length > 0 && data.password !== data.passwordConfirmation;
  const canSubmit =
    data.password.length >= 8 &&
    data.password === data.passwordConfirmation &&
    data.consentPersonalData &&
    !loading;
  return (
    <>
      <BackButton onClick={onBack} />
      <Badge>Étape 3 sur 4</Badge>
      <h1 className="mt-4 text-2xl font-extrabold">Sécurise ton compte</h1>
      <div className="mt-7 grid gap-5">
        <Field
          type="password"
          label="Mot de passe"
          value={data.password}
          onChange={(v) => onChange({ ...data, password: v })}
          placeholder="8 caractères minimum"
        />
        <Field
          type="password"
          label="Confirme le mot de passe"
          value={data.passwordConfirmation}
          onChange={(v) => onChange({ ...data, passwordConfirmation: v })}
          placeholder="Ressaisis ton mot de passe"
        />
      </div>
      {mismatch && (
        <p className="mt-2 text-xs font-bold text-red-500">
          Les deux mots de passe ne correspondent pas.
        </p>
      )}
      <div className="mt-5 space-y-3 text-xs text-slate-500">
        <label className="flex items-start gap-3">
          <input type="checkbox" defaultChecked className="mt-0.5 accent-mina" />
          J’accepte les CGU et la politique de confidentialité.
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={data.consentPersonalData}
            onChange={(e) => onChange({ ...data, consentPersonalData: e.target.checked })}
            className="mt-0.5 accent-mina"
          />
          Je consens au traitement de mes données pour fournir le service Mina.
        </label>
      </div>
      {error && (
        <div className="mt-5 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {error}
        </div>
      )}
      <Button onClick={onFinish} disabled={!canSubmit} loading={loading} className="mt-7 w-full">
        Créer mon compte
      </Button>
    </>
  );
}
