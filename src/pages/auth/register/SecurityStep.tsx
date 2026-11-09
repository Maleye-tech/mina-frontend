import { Badge, Button } from "../../../components/ui/Primitives";
import { Field } from "../../../components/auth/Field";
import { BackButton, type RegisterData } from "./IdentityStep";

export function SecurityStep({
  data,
  onChange,
  onFinish,
  onBack,
}: {
  data: RegisterData;
  onChange: (data: RegisterData) => void;
  onFinish: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <BackButton onClick={onBack} />
      <Badge>Étape 3 sur 4</Badge>
      <h1 className="mt-4 text-2xl font-extrabold">Sécurise ton compte</h1>
      <div className="mt-7">
        <Field
          type="password"
          label="Mot de passe"
          value={data.password}
          onChange={(v) => onChange({ ...data, password: v })}
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
      <Button onClick={onFinish} disabled={data.password.length < 6} className="mt-7 w-full">
        Créer mon compte
      </Button>
    </>
  );
}
