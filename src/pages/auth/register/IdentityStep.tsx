import { ArrowLeft, Building2, ShieldCheck } from "lucide-react";
import { Badge, Button } from "../../../components/ui/Primitives";
import { Field } from "../../../components/auth/Field";
import type { PartnerInstitution, University } from "../../../types/api";
import type { MinaRoleKey } from "./RoleStep";

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  consentPersonalData: boolean;
  role: MinaRoleKey;
  pseudonym?: string;

  // Student / Ambassador
  university_id?: number | null;
  faculty_id?: number | null;
  study_field?: string;
  education_level?: string;

  // Partner
  partner_institution_id?: number | null;
  partner_position?: string;
};

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-5 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-ink transition"
    >
      <ArrowLeft size={15} />
      Retour
    </button>
  );
}

const STUDY_FIELDS = [
  "Médecine",
  "Pharmacie",
  "Odontologie",
  "Sciences infirmières & obstétricales",
  "Biologie médicale",
  "Santé publique",
  "Autre filière santé",
];

const EDUCATION_LEVELS = [
  "1ère année (DFGSM 1 / PASS / LAS)",
  "2e année (DFGSM 2)",
  "3e année (DFGSM 3)",
  "4e année (DFASM 1 - Externat)",
  "5e année (DFASM 2)",
  "6e année (DFASM 3)",
  "Internat / Thèse",
  "Master / Doctorat",
  "Autre niveau",
];

export function IdentityStep({
  role,
  data,
  onChange,
  onNext,
  onBack,
  universities = [],
  partnerInstitutions = [],
}: {
  role: MinaRoleKey;
  data: RegisterData;
  onChange: (data: RegisterData) => void;
  onNext: () => void;
  onBack: () => void;
  universities?: University[];
  partnerInstitutions?: PartnerInstitution[];
}) {
  const selectedUni = universities.find((u) => u.id === data.university_id);
  const faculties = selectedUni?.faculties ?? [];

  return (
    <>
      <BackButton onClick={onBack} />
      <Badge>Étape 2 sur 4</Badge>
      <h1 className="mt-4 text-2xl font-extrabold">Faisons connaissance</h1>
      <p className="mt-1 text-xs text-slate-500">
        Ces informations permettent d'adapter les services et ressources à votre profil.
      </p>

      <div className="mt-6 space-y-4">
        {/* Basic fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nom complet *"
            value={data.name}
            onChange={(v) => onChange({ ...data, name: v })}
            placeholder="Aïssatou Ndiaye"
          />
          <Field
            label="Adresse e-mail *"
            value={data.email}
            onChange={(v) => onChange({ ...data, email: v })}
            placeholder="toi@universite.sn"
          />
        </div>

        <Field
          label="Pseudonyme (recommandé pour les échanges anonymes)"
          value={data.pseudonym || ""}
          onChange={(v) => onChange({ ...data, pseudonym: v })}
          placeholder="Ex: Aïssa22"
        />

        {/* Student / Ambassador specific fields */}
        {/* {(role === "student" || role === "ambassador") && (
          <div className="rounded-2xl border border-line p-4 space-y-3.5 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-bold text-mina">
              <GraduationCap size={16} />
              <span>Cursus universitaire (optionnel lors de l’inscription)</span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Université / Établissement
                </label>
                <select
                  value={data.university_id || ""}
                  onChange={(e) => {
                    const uid = e.target.value ? Number(e.target.value) : null;
                    onChange({ ...data, university_id: uid, faculty_id: null });
                  }}
                  className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-2.5 text-xs font-semibold focus:border-mina focus:outline-none dark:border-white/10 dark:bg-canvas"
                >
                  <option value="">Sélectionne ton université</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.city ? `(${u.city})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Faculté / UFR
                </label>
                <select
                  value={data.faculty_id || ""}
                  onChange={(e) => {
                    const fid = e.target.value ? Number(e.target.value) : null;
                    onChange({ ...data, faculty_id: fid });
                  }}
                  disabled={!faculties.length}
                  className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-2.5 text-xs font-semibold focus:border-mina focus:outline-none dark:border-white/10 dark:bg-canvas disabled:opacity-50"
                >
                  <option value="">
                    {faculties.length ? "Sélectionne ta faculté" : "Choisis d'abord une université"}
                  </option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Filière d’études
                </label>
                <select
                  value={data.study_field || ""}
                  onChange={(e) => onChange({ ...data, study_field: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-2.5 text-xs font-semibold focus:border-mina focus:outline-none dark:border-white/10 dark:bg-canvas"
                >
                  <option value="">Sélectionne ta filière</option>
                  {STUDY_FIELDS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Niveau d’études
                </label>
                <select
                  value={data.education_level || ""}
                  onChange={(e) => onChange({ ...data, education_level: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-2.5 text-xs font-semibold focus:border-mina focus:outline-none dark:border-white/10 dark:bg-canvas"
                >
                  <option value="">Sélectionne ton niveau</option>
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )} */}

        {/* Partner specific fields */}
        {role === "partner" && (
          <div className="rounded-2xl border border-line p-4 space-y-3.5 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-bold text-mina">
              <Building2 size={16} />
              <span>Institution partenaire</span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Institution rattachée
                </label>
                <select
                  value={data.partner_institution_id || ""}
                  onChange={(e) => {
                    const pid = e.target.value ? Number(e.target.value) : null;
                    onChange({ ...data, partner_institution_id: pid });
                  }}
                  className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-2.5 text-xs font-semibold focus:border-mina focus:outline-none dark:border-white/10 dark:bg-canvas"
                >
                  <option value="">Sélectionnez votre institution</option>
                  {partnerInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} {inst.type ? `(${inst.type})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Poste / Rôle au sein de l'institution
                </label>
                <input
                  type="text"
                  placeholder="Ex: Directeur des œuvres sociales"
                  value={data.partner_position || ""}
                  onChange={(e) => onChange({ ...data, partner_position: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-2.5 text-xs font-semibold focus:border-mina focus:outline-none dark:border-white/10 dark:bg-canvas"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {role !== "student" && (
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <ShieldCheck className="mr-2 inline" size={16} />
          Les comptes {role === "ambassador" ? "ambassadeur" : "partenaire"} font l'objet d'une vérification par l'équipe Mina pour garantir la sécurité et la confidentialité des échanges.
        </div>
      )}

      <Button onClick={onNext} disabled={!data.name || !data.email} className="mt-7 w-full">
        Continuer
      </Button>
    </>
  );
}
