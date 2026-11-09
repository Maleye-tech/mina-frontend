import { ArrowRight, Stethoscope } from "lucide-react";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";

const CLINICAL_CASES: [string, string, string][] = [
  [
    "Paludisme grave",
    "Infectiologie",
    "Un enfant de 6 ans présente une fièvre élevée et des troubles de conscience.",
  ],
  [
    "Crise drépanocytaire",
    "Hématologie",
    "Une patiente de 19 ans consulte pour douleurs osseuses intenses.",
  ],
  [
    "Tuberculose pulmonaire",
    "Pneumologie",
    "Toux chronique, sueurs nocturnes et amaigrissement depuis 5 semaines.",
  ],
  [
    "Pré-éclampsie",
    "Gynécologie",
    "Hypertension et céphalées au troisième trimestre de grossesse.",
  ],
  [
    "Déshydratation aiguë",
    "Pédiatrie",
    "Nourrisson avec diarrhée aqueuse et signes de déshydratation.",
  ],
  [
    "Hypertension artérielle",
    "Cardiologie",
    "Découverte fortuite d’une pression artérielle à 170/100 mmHg.",
  ],
];

function CaseCard({ item, index }: { item: (typeof CLINICAL_CASES)[number]; index: number }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-mina/10 p-2.5 text-mina">
          <Stethoscope size={20} />
        </div>
        <Badge tone={index < 2 ? "amber" : "slate"}>
          {index < 2 ? "Recommandé" : "Intermédiaire"}
        </Badge>
      </div>
      <p className="mt-5 text-[10px] font-extrabold uppercase tracking-wider text-mina">
        {item[1]}
      </p>
      <h2 className="mt-1 font-extrabold">{item[0]}</h2>
      <p className="mt-3 min-h-14 text-xs leading-5 text-slate-500">{item[2]}</p>
      <Button variant="secondary" className="mt-5 w-full">
        Étudier le cas <ArrowRight size={14} />
      </Button>
    </Card>
  );
}

export function CasesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pratique clinique"
        title="Cas cliniques d’Afrique de l’Ouest"
        description="Raisonne sur des situations proches de ta future pratique."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {CLINICAL_CASES.map((c, i) => (
          <CaseCard key={c[0]} item={c} index={i} />
        ))}
      </div>
    </>
  );
}
