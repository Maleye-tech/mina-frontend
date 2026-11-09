import { useMemo, useState } from "react";
import { useLocation } from "react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudDownload,
  CreditCard,
  Download,
  FileBarChart,
  FileQuestion,
  Flame,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Button, Card, Progress } from "../../components/ui/Primitives";
import {
  ActivityItem,
  DataTable,
  DownloadButton,
  PageHeader,
  StatCard,
} from "../../components/dashboard/Common";
import { chartData, courses } from "../../data/mocks";
import { useAuthStore } from "../../store/authStore";
import type { Role } from "../../types";

function ChartCard({
  title = "Évolution sur 6 mois",
  care = false,
}: {
  title?: string;
  care?: boolean;
}) {
  return (
    <Card className="min-h-[330px]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold">{title}</h2>
          <p className="mt-1 text-[10px] text-slate-400">Données mises à jour aujourd’hui</p>
        </div>
        <Badge tone="slate">6 mois</Badge>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={care ? "careGrad" : "scoreGrad"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={care ? "#7c6fdb" : "#0f766e"} stopOpacity={0.3} />
                <stop offset="100%" stopColor={care ? "#7c6fdb" : "#0f766e"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey={care ? "care" : "score"}
              stroke={care ? "#7c6fdb" : "#0f766e"}
              strokeWidth={3}
              fill={`url(#${care ? "careGrad" : "scoreGrad"})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function PendingBanner() {
  const user = useAuthStore((s) => s.user)!;
  if (user.status !== "pending") return null;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
      <Clock3 className="mt-0.5 shrink-0" size={18} />
      <div>
        <p className="text-sm font-extrabold">Compte en attente de validation</p>
        <p className="mt-1 text-xs leading-5">
          L’équipe Mina vérifie tes informations. Les fonctionnalités sensibles seront activées
          après validation.
        </p>
      </div>
    </div>
  );
}

function StudentHome() {
  const user = useAuthStore((s) => s.user)!;
  return (
    <>
      <PageHeader
        eyebrow="Tableau de bord"
        title={`Bonjour ${user.name.split(" ")[0]}, prête à avancer ?`}
        description="Ton programme est ajusté à tes objectifs et à ton rythme."
        action={
          <Badge tone="amber">
            <Flame size={14} className="mr-1.5" />
            12 jours de série
          </Badge>
        }
      />
      <div className="mb-6 rounded-[24px] bg-gradient-to-r from-mina to-[#15988e] p-6 text-white md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold text-teal-100">PROGRESSION GLOBALE · L1 MÉDECINE</p>
            <h2 className="mt-2 text-2xl font-extrabold">Tu as complété 68 % de ton programme</h2>
            <p className="mt-2 text-sm text-teal-50">
              Encore 2 sessions cette semaine pour atteindre ton objectif.
            </p>
          </div>
          <div className="min-w-52">
            <div className="mb-2 flex justify-between text-xs font-bold">
              <span>Progression</span>
              <span>68 %</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20">
              <div className="h-full w-[68%] rounded-full bg-sun" />
            </div>
            <p className="mt-3 text-[10px] text-teal-100">Essai gratuit : encore 2 jours</p>
          </div>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-mina">
                Coach Mina
              </p>
              <h2 className="mt-1 font-extrabold">Ton programme aujourd’hui</h2>
            </div>
            <div className="rounded-xl bg-mina/10 p-2.5 text-mina">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="mt-5">
            {[
              ["08:30", "Physiologie cardiaque", "25 min · Révision"],
              ["13:00", "QCM Biochimie", "15 questions"],
              ["19:30", "Flashcards Anatomie", "18 cartes à revoir"],
            ].map((x, i) => (
              <div
                key={x[0]}
                className="flex items-center gap-4 border-b border-line py-4 last:border-0 dark:border-white/8"
              >
                <span className="text-xs font-extrabold text-mina">{x[0]}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{x[1]}</p>
                  <p className="text-[10px] text-slate-400">{x[2]}</p>
                </div>
                <button
                  className={`rounded-lg p-2 ${i === 0 ? "bg-mina text-white" : "bg-slate-100 text-slate-400 dark:bg-white/8"}`}
                  aria-label={`Démarrer ${x[1]}`}
                >
                  <Play size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-white dark:from-care/10 dark:to-panel">
          <HeartHandshake className="text-care" />
          <h2 className="mt-5 text-lg font-extrabold">Une minute pour toi</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Comment est ton niveau d’énergie aujourd’hui ?
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["Faible", "Moyen", "Bon"].map((x, i) => (
              <button
                key={x}
                className={`rounded-xl border py-3 text-xs font-bold ${i === 2 ? "border-care bg-care text-white" : "border-violet-100 dark:border-white/10"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <button className="mt-5 flex items-center gap-1 text-xs font-bold text-care">
            Ouvrir Mina Care <ArrowRight size={14} />
          </button>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <StatCard
          label="QCM cette semaine"
          value="126"
          delta="+18 %"
          icon={<FileQuestion size={20} />}
        />
        <StatCard
          label="Taux de réussite"
          value="84 %"
          delta="+6 pts"
          icon={<Target size={20} />}
        />
        <StatCard label="Temps d’étude" value="6h 20" delta="+42 min" icon={<Clock3 size={20} />} />
      </div>
    </>
  );
}

function CoursesPage() {
  const [downloaded, setDownloaded] = useState<number[]>([3]);
  const [query, setQuery] = useState("");
  const shown = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subject.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="Apprentissage"
        title="Bibliothèque de cours"
        description="Des contenus validés, légers et accessibles hors-ligne."
        action={
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un cours"
              className="h-10 rounded-xl border border-line bg-white pl-9 pr-3 text-xs outline-none focus:border-mina dark:border-white/10 dark:bg-panel"
            />
          </div>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {["Tous les niveaux", "L1", "L2", "L3", "Anatomie", "Physiologie"].map((x, i) => (
          <button
            key={x}
            className={`rounded-full px-4 py-2 text-xs font-bold ${i === 0 ? "bg-ink text-white dark:bg-white dark:text-ink" : "border border-line bg-white text-slate-500 dark:border-white/10 dark:bg-panel"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((c) => (
          <Card key={c.id} className="group">
            <div
              className={`h-28 rounded-2xl p-4 ${c.color === "teal" ? "bg-teal-50" : c.color === "amber" ? "bg-amber-50" : c.color === "blue" ? "bg-blue-50" : c.color === "violet" ? "bg-violet-50" : c.color === "rose" ? "bg-rose-50" : "bg-cyan-50"} dark:bg-white/5`}
            >
              <div className="flex items-start justify-between">
                <Badge tone="slate">{c.level}</Badge>
                <BookOpen className="text-slate-400 transition group-hover:scale-110" size={28} />
              </div>
            </div>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-wider text-mina">
              {c.subject}
            </p>
            <h2 className="mt-1 font-extrabold">{c.title}</h2>
            <p className="mt-2 text-xs text-slate-400">
              {c.type} · {c.duration}
            </p>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-[10px] font-bold text-slate-400">
                <span>Progression</span>
                <span>{c.progress}%</span>
              </div>
              <Progress value={c.progress} />
            </div>
            <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
              <Button className="px-3">
                Continuer <ArrowRight size={14} />
              </Button>
              <button
                onClick={() =>
                  setDownloaded((d) =>
                    d.includes(c.id) ? d.filter((x) => x !== c.id) : [...d, c.id],
                  )
                }
                className={`rounded-xl border px-3 ${downloaded.includes(c.id) ? "border-mina bg-teal-50 text-mina dark:bg-mina/10" : "border-line text-slate-400 dark:border-white/10"}`}
                aria-label="Télécharger pour hors-ligne"
              >
                {downloaded.includes(c.id) ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <CloudDownload size={18} />
                )}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function QcmPage() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  if (step === 0)
    return (
      <>
        <PageHeader
          eyebrow="Auto-évaluation"
          title="Entraîne-toi avec les QCM"
          description="Chaque réponse est corrigée et expliquée pour transformer tes erreurs en progrès."
        />
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard
            label="Questions disponibles"
            value="5 240"
            delta="+120"
            icon={<FileQuestion size={20} />}
          />
          <StatCard label="Ta moyenne" value="84 %" delta="+6 pts" icon={<Target size={20} />} />
          <StatCard
            label="Série en cours"
            value="12 jours"
            delta="Record : 18"
            icon={<Flame size={20} />}
          />
        </div>
        <Card className="mt-5">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_.8fr]">
            <div>
              <Badge>Session recommandée</Badge>
              <h2 className="mt-4 text-xl font-extrabold">Physiologie cardiovasculaire</h2>
              <p className="mt-2 text-sm text-slate-500">
                15 questions · 20 minutes · Difficulté intermédiaire
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Correction détaillée", "Chronomètre", "+150 XP"].map((x) => (
                  <Badge key={x} tone="slate">
                    {x}
                  </Badge>
                ))}
              </div>
              <Button onClick={() => setStep(1)} className="mt-7">
                Commencer la série <Play size={15} />
              </Button>
            </div>
            <div className="rounded-2xl bg-teal-50 p-7 text-center dark:bg-mina/10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-8 border-white text-2xl font-extrabold text-mina shadow-sm dark:border-white/10">
                84%
              </div>
              <p className="mt-4 text-xs font-bold text-mina">Ton score sur cette matière</p>
            </div>
          </div>
        </Card>
      </>
    );
  return (
    <>
      <PageHeader
        eyebrow="Question 1 sur 15"
        title="Physiologie cardiovasculaire"
        description="Temps restant : 18 min 42 s"
      />
      <Card className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-between">
          <Badge>Question à choix unique</Badge>
          <Badge tone="amber">+10 XP</Badge>
        </div>
        <h2 className="text-lg font-extrabold leading-7">
          Quel mécanisme est principalement responsable de l’augmentation du débit cardiaque pendant
          l’effort ?
        </h2>
        <div className="mt-6 space-y-3">
          {[
            "La diminution du retour veineux",
            "L’augmentation de la fréquence cardiaque et du volume d’éjection",
            "La vasoconstriction des muscles actifs",
            "La diminution de la contractilité myocardique",
          ].map((x, i) => (
            <button
              key={x}
              onClick={() => setAnswer(i)}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition ${answer === i ? (i === 1 ? "border-mina bg-teal-50 text-teal-900 dark:bg-mina/10 dark:text-teal-200" : "border-red-300 bg-red-50 text-red-800 dark:bg-red-500/10") : "border-line dark:border-white/10"}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {x}
            </button>
          ))}
        </div>
        {answer !== null && (
          <div
            className={`mt-5 rounded-xl p-4 text-sm ${answer === 1 ? "bg-teal-50 text-teal-900 dark:bg-mina/10 dark:text-teal-200" : "bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"}`}
          >
            <p className="font-extrabold">
              {answer === 1 ? "Bonne réponse !" : "Pas tout à fait."}
            </p>
            <p className="mt-1 text-xs leading-5">
              À l’effort, l’activation sympathique augmente simultanément la fréquence cardiaque et
              la contractilité, donc le volume d’éjection systolique.
            </p>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button
            disabled={answer === null}
            onClick={() => {
              setAnswer(null);
              setStep(step + 1);
            }}
          >
            Question suivante <ChevronRight size={16} />
          </Button>
        </div>
      </Card>
    </>
  );
}

function FlashcardsPage() {
  const cards = [
    [
      "Définis la précharge cardiaque.",
      "La tension du myocarde en fin de diastole, liée au volume télédiastolique.",
    ],
    [
      "Quel est le rôle du nœud sinusal ?",
      "Il génère spontanément l’influx électrique et impose le rythme cardiaque.",
    ],
    ["Quelle valve sépare l’oreillette et le ventricule gauches ?", "La valve mitrale."],
  ];
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="Répétition espacée"
        title="Flashcards à réviser"
        description="Mina reprogramme les cartes selon ta mémorisation."
        action={<Badge tone="amber">18 cartes aujourd’hui</Badge>}
      />
      <div className="mx-auto max-w-2xl">
        <div className="mb-3 flex justify-between text-xs font-bold text-slate-400">
          <span>
            Carte {i + 1} sur {cards.length}
          </span>
          <span>Physiologie</span>
        </div>
        <Progress value={((i + 1) / cards.length) * 100} />
        <button
          onClick={() => setFlip(!flip)}
          className={`mt-6 flex min-h-[300px] w-full flex-col items-center justify-center rounded-[28px] border p-8 text-center shadow-card transition ${flip ? "border-mina bg-mina text-white" : "border-line bg-white dark:border-white/8 dark:bg-panel"}`}
        >
          <Brain size={34} className={flip ? "text-sun" : "text-mina"} />
          <p className="mt-8 text-xl font-extrabold leading-8">
            {flip ? cards[i][1] : cards[i][0]}
          </p>
          <p className={`mt-7 text-xs font-semibold ${flip ? "text-teal-100" : "text-slate-400"}`}>
            {flip ? "Évalue ta maîtrise ci-dessous" : "Touche la carte pour voir la réponse"}
          </p>
        </button>
        {flip && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ["Difficile", "bg-red-500"],
              ["Moyen", "bg-sun"],
              ["Facile", "bg-mina"],
            ].map(([x, c]) => (
              <button
                key={x}
                onClick={() => {
                  setI((i + 1) % cards.length);
                  setFlip(false);
                }}
                className={`rounded-xl py-3 text-xs font-extrabold text-white ${c}`}
              >
                {x}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function CasesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pratique clinique"
        title="Cas cliniques d’Afrique de l’Ouest"
        description="Raisonne sur des situations proches de ta future pratique."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[
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
        ].map((c, i) => (
          <Card key={c[0]}>
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-mina/10 p-2.5 text-mina">
                <Stethoscope size={20} />
              </div>
              <Badge tone={i < 2 ? "amber" : "slate"}>
                {i < 2 ? "Recommandé" : "Intermédiaire"}
              </Badge>
            </div>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-wider text-mina">
              {c[1]}
            </p>
            <h2 className="mt-1 font-extrabold">{c[0]}</h2>
            <p className="mt-3 min-h-14 text-xs leading-5 text-slate-500">{c[2]}</p>
            <Button variant="secondary" className="mt-5 w-full">
              Étudier le cas <ArrowRight size={14} />
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}

function CoachPage() {
  const [messages, setMessages] = useState([
    {
      from: "mina",
      text: "Bonjour Aïssatou. Tu as progressé en physiologie, mais la biochimie reste à renforcer. Souhaites-tu un planning adapté pour cette semaine ?",
    },
  ]);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { from: "me", text: input },
      {
        from: "mina",
        text: "Je te propose 25 minutes de cycle de Krebs demain matin, puis 10 QCM ciblés. J’ai ajouté cette session à ton planning.",
      },
    ]);
    setInput("");
  };
  return (
    <>
      <PageHeader
        eyebrow="Coach IA"
        title="Ton copilote d’études"
        description="Des recommandations simulées à partir de ta progression et de tes objectifs."
      />
      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="flex min-h-[570px] flex-col p-0 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-line p-5 dark:border-white/8">
            <div className="rounded-xl bg-mina p-2.5 text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-extrabold">Coach Mina</p>
              <p className="text-[10px] text-mina">Disponible · Réponses simulées</p>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-6 ${m.from === "me" ? "ml-auto bg-mina text-white" : "bg-slate-100 dark:bg-white/6"}`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-line p-4 dark:border-white/8">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="h-11 flex-1 rounded-xl bg-slate-100 px-4 text-xs outline-none focus:ring-2 focus:ring-mina/20 dark:bg-white/6"
              placeholder="Pose une question à ton coach…"
            />
            <Button onClick={send} className="px-4" aria-label="Envoyer">
              <Send size={17} />
            </Button>
          </div>
        </Card>
        <div className="space-y-5">
          <Card>
            <h2 className="font-extrabold">Planning recommandé</h2>
            <div className="mt-4">
              <ActivityItem title="Cycle de Krebs" meta="Demain · 08:00 · 25 min" />
              <ActivityItem title="QCM ciblés" meta="Demain · 18:30 · 15 min" />
              <ActivityItem title="Révision anatomie" meta="Jeudi · 13:00 · 30 min" />
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10">
            <Target className="text-amber-600" />
            <h2 className="mt-4 font-extrabold">Point d’attention</h2>
            <p className="mt-2 text-xs leading-5 text-amber-800 dark:text-amber-200">
              Tes résultats sur le métabolisme glucidique sont 12 points sous ta moyenne.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

function ProgressPage() {
  const subjects = [
    { name: "Anatomie", v: 88 },
    { name: "Physiologie", v: 82 },
    { name: "Biochimie", v: 61 },
    { name: "Histologie", v: 74 },
    { name: "Biophysique", v: 69 },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Analyse"
        title="Ma progression"
        description="Identifie tes forces et concentre tes efforts là où ils comptent."
        action={<DownloadButton label="Mon bilan PDF" />}
      />
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Progression globale"
          value="68 %"
          delta="+8 pts"
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Questions répondues"
          value="1 248"
          delta="+126"
          icon={<FileQuestion size={20} />}
        />
        <StatCard label="Heures d’étude" value="48h" delta="+6h" icon={<Clock3 size={20} />} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <ChartCard />
        <Card>
          <h2 className="font-extrabold">Réussite par matière</h2>
          <div className="mt-6 space-y-5">
            {subjects.map((s) => (
              <div key={s.name}>
                <div className="mb-2 flex justify-between text-xs font-bold">
                  <span>{s.name}</span>
                  <span className={s.v < 65 ? "text-amber-600" : "text-mina"}>{s.v}%</span>
                </div>
                <Progress value={s.v} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function CarePage() {
  const [tab, setTab] = useState("Accueil");
  const [anonymous, setAnonymous] = useState(true);
  const [booked, setBooked] = useState(false);
  const [test, setTest] = useState<number | null>(null);
  const tabs = [
    "Accueil",
    "Prendre RDV",
    "Tchat sécurisé",
    "Ressources",
    "Auto-évaluation",
    "Événements",
  ];
  return (
    <div className="-m-4 min-h-[calc(100vh-72px)] bg-[#f5f3ff] p-4 dark:bg-care/5 md:-m-7 md:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-care">
            Mina Care
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">Ton espace bien-être</h1>
        </div>
        <button className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg">
          <AlertTriangle className="mr-1.5 inline" size={15} />
          SOS · Aide immédiate
        </button>
      </div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${tab === t ? "bg-care text-white" : "border border-violet-100 bg-white dark:border-white/10 dark:bg-panel"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Accueil" && (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[26px] bg-gradient-to-br from-care to-[#5549a5] p-7 text-white md:p-10">
            <HeartHandshake size={34} />
            <h2 className="mt-14 text-3xl font-extrabold">Ici, tu peux être toi-même.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100">
              Parle, respire, trouve des ressources ou demande de l’aide. Tu gardes toujours le
              contrôle de ton identité.
            </p>
            <label className="mt-7 flex max-w-md items-center justify-between rounded-2xl bg-white/12 p-4 text-sm font-bold">
              <span>
                <LockKeyhole className="mr-2 inline" size={17} />
                Rester anonyme · Pseudo : Baobab calme 27
              </span>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={() => setAnonymous(!anonymous)}
                className="accent-sun"
              />
            </label>
          </div>
          <Card>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-care">
              Check-in rapide
            </p>
            <h2 className="mt-2 font-extrabold">Comment te sens-tu ?</h2>
            <div className="mt-5 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className="rounded-xl border border-violet-100 py-3 text-sm font-extrabold text-care hover:bg-care hover:text-white dark:border-white/10"
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-400">
              1 = très difficile · 5 = très bien
            </p>
            <div className="mt-5 border-t border-line pt-5 dark:border-white/8">
              <button
                onClick={() => setTab("Tchat sécurisé")}
                className="flex w-full items-center justify-between text-sm font-bold"
              >
                Parler à un ambassadeur <ArrowRight size={16} className="text-care" />
              </button>
            </div>
          </Card>
        </div>
      )}
      {tab === "Prendre RDV" && (
        <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <Card>
            <h2 className="font-extrabold">Choisis un professionnel</h2>
            {[
              ["DF", "Dr Fatou Diop", "Psychologue clinicienne"],
              ["MS", "M. Mamadou Sarr", "Conseiller d’écoute"],
              ["AK", "Dr Awa Kane", "Psychiatre"],
            ].map((p, i) => (
              <button
                key={p[1]}
                className={`mt-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left ${i === 0 ? "border-care bg-violet-50 dark:bg-care/10" : "border-line dark:border-white/10"}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-care text-xs font-bold text-white">
                  {p[0]}
                </span>
                <span>
                  <strong className="block text-xs">{p[1]}</strong>
                  <span className="text-[10px] text-slate-400">{p[2]}</span>
                </span>
              </button>
            ))}
          </Card>
          <Card>
            <h2 className="font-extrabold">Créneaux disponibles</h2>
            <div className="mt-5 grid grid-cols-5 gap-2">
              {["Lun 16", "Mar 17", "Mer 18", "Jeu 19", "Ven 20"].map((d, i) => (
                <button
                  key={d}
                  className={`rounded-xl py-3 text-xs font-bold ${i === 2 ? "bg-care text-white" : "bg-violet-50 text-care dark:bg-care/10"}`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {["09:00", "10:30", "14:00", "15:30", "17:00", "18:30"].map((h, i) => (
                <button
                  key={h}
                  className={`rounded-xl border py-3 text-xs font-bold ${i === 2 ? "border-care text-care" : "border-line dark:border-white/10"}`}
                >
                  {h}
                </button>
              ))}
            </div>
            <Button variant="care" onClick={() => setBooked(true)} className="mt-7 w-full">
              {booked ? (
                <>
                  <Check size={16} />
                  Rendez-vous confirmé
                </>
              ) : (
                "Confirmer ce créneau"
              )}
            </Button>
            <p className="mt-3 text-center text-[10px] text-slate-400">
              La confirmation reste confidentielle et n’indique pas le motif.
            </p>
          </Card>
        </div>
      )}
      {tab === "Tchat sécurisé" && (
        <Card className="mx-auto max-w-3xl p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-4 dark:border-white/8">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-care p-2.5 text-white">
                <MessageCircle size={17} />
              </div>
              <div>
                <p className="text-xs font-extrabold">Ambassadeur Mina</p>
                <p className="text-[10px] text-green-600">Disponible maintenant</p>
              </div>
            </div>
            <Badge tone="violet">
              <LockKeyhole size={12} className="mr-1" />
              Chiffré de bout en bout
            </Badge>
          </div>
          <div className="min-h-[360px] bg-violet-50/40 p-5 dark:bg-care/5">
            <div className="max-w-[80%] rounded-2xl bg-white p-4 text-sm leading-6 shadow-sm dark:bg-panel">
              Bonjour, je suis là pour t’écouter, sans jugement. Tu peux prendre ton temps.
            </div>
            <div className="mt-4 ml-auto max-w-[80%] rounded-2xl bg-care p-4 text-sm text-white">
              Merci. Je me sens dépassé par les examens qui approchent.
            </div>
          </div>
          <div className="flex gap-2 p-4">
            <input
              className="h-11 flex-1 rounded-xl bg-slate-100 px-4 text-xs dark:bg-white/6"
              placeholder="Écris ton message…"
            />
            <Button variant="care" className="px-4">
              <Send size={16} />
            </Button>
          </div>
        </Card>
      )}
      {tab === "Ressources" && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Stress avant les examens", "Guide · 8 min"],
            ["Prévenir le burnout", "Fiche · 6 min"],
            ["Retrouver un sommeil régulier", "Audio · 12 min"],
            ["Respiration guidée", "Audio · 5 min"],
            ["Demander de l’aide", "Guide · 7 min"],
            ["Soutenir un proche", "Fiche · 9 min"],
          ].map((r, i) => (
            <Card key={r[0]}>
              <div className="flex h-28 items-center justify-center rounded-2xl bg-violet-50 text-care dark:bg-care/10">
                {i % 2 ? <BookOpen /> : <Brain />}
              </div>
              <h2 className="mt-5 font-extrabold">{r[0]}</h2>
              <p className="mt-1 text-xs text-slate-400">{r[1]}</p>
              <Button variant="secondary" className="mt-5 w-full">
                Consulter
              </Button>
            </Card>
          ))}
        </div>
      )}
      {tab === "Auto-évaluation" && (
        <Card className="mx-auto max-w-2xl">
          <Badge tone="violet">Bien-être · 5 questions</Badge>
          <h2 className="mt-5 text-xl font-extrabold">
            Ces 7 derniers jours, à quel point t’es-tu senti sous pression ?
          </h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-4">
            {["Pas du tout", "Un peu", "Souvent", "Presque toujours"].map((x, i) => (
              <button
                key={x}
                onClick={() => setTest(i)}
                className={`rounded-xl border p-4 text-xs font-bold ${test === i ? "border-care bg-care text-white" : "border-line dark:border-white/10"}`}
              >
                {x}
              </button>
            ))}
          </div>
          {test !== null && (
            <div className="mt-6 rounded-xl bg-violet-50 p-4 text-xs leading-5 text-violet-900 dark:bg-care/10 dark:text-violet-200">
              <strong>Merci pour ta réponse.</strong> Continue le test pour obtenir des pistes
              personnalisées et non médicales.
            </div>
          )}
          <p className="mt-6 text-[10px] leading-4 text-slate-400">
            <AlertTriangle className="mr-1 inline" size={12} />
            Ceci n’est pas un diagnostic et ne remplace pas l’avis d’un professionnel de santé.
          </p>
        </Card>
      )}
      {tab === "Événements" && (
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Briser le tabou du burnout", "22 juin · 18:00", "Webinaire"],
            ["Gérer la pression des examens", "28 juin · 17:30", "Atelier en ligne"],
            ["Sommeil et mémoire", "3 juillet · 19:00", "Replay disponible"],
          ].map((e, i) => (
            <Card key={e[0]}>
              <Badge tone="violet">{e[2]}</Badge>
              <Calendar className="mt-8 text-care" />
              <h2 className="mt-5 font-extrabold">{e[0]}</h2>
              <p className="mt-2 text-xs text-slate-400">{e[1]}</p>
              <Button variant="care" className="mt-6 w-full">
                {i === 2 ? "Voir le replay" : "S’inscrire"}
              </Button>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-6 rounded-xl border border-red-200 bg-white p-4 text-xs leading-5 text-red-700 dark:border-red-400/20 dark:bg-panel dark:text-red-300">
        <AlertTriangle className="mr-2 inline" size={15} />
        <strong>En cas de détresse immédiate,</strong> contacte les urgences ou une personne de
        confiance. Les numéros nationaux seront configurés avec les partenaires.
      </div>
    </div>
  );
}

function SubscriptionPage() {
  const [pay, setPay] = useState("Wave");
  const [done, setDone] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="Abonnement"
        title="Mon offre Mina"
        description="Gère ton accès et tes moyens de paiement en toute simplicité."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <Card className="border-2 border-mina">
          <div className="flex justify-between">
            <Badge>Plan actuel</Badge>
            <Badge tone="amber">Essai · 2 jours restants</Badge>
          </div>
          <h2 className="mt-6 text-2xl font-extrabold">Mina Annuel</h2>
          <p className="mt-2 text-sm text-slate-500">
            Accès complet à Mina Med Student et Mina Care.
          </p>
          <p className="mt-7 text-3xl font-extrabold">
            15 000 FCFA <span className="text-xs font-normal text-slate-400">/ an</span>
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["5 000+ QCM", "Tous les cours", "Mode hors-ligne", "Mina Care inclus"].map((x) => (
              <p key={x} className="text-xs font-bold">
                <Check className="mr-2 inline text-mina" size={15} />
                {x}
              </p>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-extrabold">Choisis ton paiement</h2>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["Wave", "Orange Money", "Carte"].map((x) => (
              <button
                key={x}
                onClick={() => setPay(x)}
                className={`rounded-xl border p-3 text-xs font-bold ${pay === x ? "border-mina bg-teal-50 text-mina dark:bg-mina/10" : "border-line dark:border-white/10"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <Button onClick={() => setDone(true)} className="mt-6 w-full">
            {done ? (
              <>
                <Check size={16} />
                Paiement simulé réussi
              </>
            ) : (
              `Payer avec ${pay}`
            )}
          </Button>
          <p className="mt-3 text-center text-[10px] text-slate-400">
            <ShieldCheck className="mr-1 inline" size={12} />
            Paiement sécurisé · Aucune donnée bancaire stockée
          </p>
        </Card>
      </div>
    </>
  );
}

function ProfilePage() {
  const user = useAuthStore((s) => s.user)!;
  return (
    <>
      <PageHeader
        eyebrow="Paramètres"
        title="Mon profil"
        description="Personnalise ton expérience et tes préférences."
      />
      <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        <Card>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-mina text-xl font-extrabold text-white">
            {user.name
              .split(" ")
              .map((x) => x[0])
              .join("")}
          </div>
          <h2 className="mt-4 text-center font-extrabold">{user.name}</h2>
          <p className="mt-1 text-center text-xs text-slate-400">L1 Médecine · UCAD</p>
          <Button variant="secondary" className="mt-6 w-full">
            Modifier la photo
          </Button>
        </Card>
        <Card>
          <h2 className="font-extrabold">Informations personnelles</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[
              ["Nom complet", user.name],
              ["Email", user.email],
              ["Université", "UCAD"],
              ["Niveau", "L1 Médecine"],
            ].map((x) => (
              <label key={x[0]} className="text-xs font-bold">
                {x[0]}
                <input
                  defaultValue={x[1]}
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 outline-none focus:border-mina dark:border-white/10"
                />
              </label>
            ))}
          </div>
          <Button className="mt-6">Enregistrer les modifications</Button>
        </Card>
      </div>
    </>
  );
}

function StudentSection({ slug }: { slug: string }) {
  if (!slug) return <StudentHome />;
  if (slug === "cours") return <CoursesPage />;
  if (slug === "qcm") return <QcmPage />;
  if (slug === "flashcards") return <FlashcardsPage />;
  if (slug === "cas") return <CasesPage />;
  if (slug === "coach") return <CoachPage />;
  if (slug === "progression") return <ProgressPage />;
  if (slug === "care") return <CarePage />;
  if (slug === "abonnement") return <SubscriptionPage />;
  return <ProfilePage />;
}

const roleTitles: Record<Exclude<Role, "student">, Record<string, [string, string]>> = {
  ambassador: {
    "": ["Vue d’ensemble", "Accompagne avec écoute, méthode et juste distance."],
    demandes: ["Demandes d’écoute", "Priorise et accueille les demandes anonymes."],
    conversations: ["Conversations actives", "Poursuis les échanges sécurisés avec les étudiants."],
    formation: [
      "Parcours de formation",
      "Développe tes compétences en premiers secours en santé mentale.",
    ],
    orientation: [
      "Ressources d’orientation",
      "Identifie le bon relais professionnel pour chaque situation.",
    ],
    ateliers: ["Ateliers", "Organise les temps de prévention sur ton campus."],
    impact: ["Mon impact", "Visualise ton engagement sans exposer de données sensibles."],
  },
  professional: {
    "": ["Agenda des consultations", "Organise tes rendez-vous et tes suivis confidentiels."],
    disponibilites: ["Mes disponibilités", "Définis les créneaux proposés aux étudiants."],
    consultations: [
      "Demandes de consultation",
      "Traite les demandes pseudonymisées selon leur priorité.",
    ],
    messagerie: ["Messagerie sécurisée", "Échange dans un cadre strictement confidentiel."],
    notes: [
      "Notes de séance privées",
      "Conserve des repères chiffrés et accessibles uniquement par toi.",
    ],
    alertes: ["Alertes & escalades", "Évalue les situations orientées par les ambassadeurs."],
    webinaires: ["Mes webinaires", "Partage des ressources de prévention à grande échelle."],
  },
  partner_admin: {
    "": [
      "Pilotage partenaire",
      "Mesure l’engagement sans jamais suivre un étudiant individuellement.",
    ],
    licences: ["Licences & accès", "Attribue les accès subventionnés à ta communauté."],
    "bien-etre": [
      "Bien-être agrégé",
      "Comprends les tendances collectives, sans données individuelles.",
    ],
    evenements: ["Événements", "Anime la prévention et la réussite sur le campus."],
    rapports: ["Rapports institutionnels", "Exporte les résultats agrégés de ton programme."],
    convention: ["Suivi de convention", "Retrouve les jalons et documents de ton partenariat."],
  },
  super_admin: {
    "": ["Vue globale Mina", "Pilote la croissance, la qualité et la sécurité de la plateforme."],
    utilisateurs: ["Gestion des utilisateurs", "Recherche, filtre et administre les comptes."],
    validations: [
      "Validations en attente",
      "Vérifie les professionnels, ambassadeurs et partenaires.",
    ],
    contenus: ["Gestion des contenus", "Administre cours, QCM, flashcards et cas cliniques."],
    paiements: ["Abonnements & paiements", "Suis les revenus et les transactions simulées."],
    partenaires: ["Partenaires & conventions", "Déploie Mina auprès des institutions."],
    moderation: ["Modération", "Traite les signalements avec une traçabilité stricte."],
    journaux: ["Journaux d’activité", "Surveille les opérations sensibles de la plateforme."],
    parametres: ["Paramètres plateforme", "Configure les règles et services globaux."],
  },
};

function RoleOverview({ role }: { role: Exclude<Role, "student"> }) {
  const stats =
    role === "ambassador"
      ? [
          ["Demandes reçues", "18", "+4"],
          ["Conversations actives", "7", "+2"],
          ["Heures d’écoute", "24h", "+3h"],
          ["Étudiants orientés", "9", "+1"],
        ]
      : role === "professional"
        ? [
            ["RDV aujourd’hui", "6", "+2"],
            ["Demandes en attente", "12", "-3"],
            ["Consultations ce mois", "48", "+12 %"],
            ["Taux de présence", "92 %", "+4 pts"],
          ]
        : role === "partner_admin"
          ? [
              ["Étudiants inscrits", "1 842", "+126"],
              ["Actifs ce mois", "1 316", "71 %"],
              ["Réussite QCM", "76 %", "+8 pts"],
              ["Licences utilisées", "82 %", "+5 pts"],
            ]
          : [
              ["Utilisateurs actifs", "12 482", "+18 %"],
              ["MRR", "18,4M FCFA", "+12 %"],
              ["Conversion essai", "31 %", "+4 pts"],
              ["Rétention M3", "78 %", "+6 pts"],
            ];
  return (
    <>
      <PendingBanner />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard
            key={s[0]}
            label={s[0]}
            value={s[1]}
            delta={s[2]}
            icon={
              i === 0 ? (
                <Users size={20} />
              ) : i === 1 ? (
                <MessageCircle size={20} />
              ) : i === 2 ? (
                <Activity size={20} />
              ) : (
                <TrendingUp size={20} />
              )
            }
          />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <ChartCard
          title={
            role === "partner_admin"
              ? "Engagement étudiant"
              : role === "super_admin"
                ? "Croissance des utilisateurs"
                : "Activité des 6 derniers mois"
          }
          care={role === "professional" || role === "ambassador"}
        />
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold">Activité récente</h2>
            <MoreHorizontal size={18} className="text-slate-400" />
          </div>
          <div className="mt-4">
            <ActivityItem
              title={
                role === "ambassador" ? "Nouvelle demande anonyme" : "Nouvelle inscription validée"
              }
              meta="Il y a 12 minutes"
              status="Urgent"
            />
            <ActivityItem
              title={
                role === "professional" ? "RDV confirmé · Baobab 42" : "Rapport mensuel disponible"
              }
              meta="Il y a 48 minutes"
            />
            <ActivityItem
              title="Atelier gestion du stress"
              meta="Demain · 16:00"
              status="Planifié"
            />
            <ActivityItem title="Suivi terminé" meta="Hier · 18:30" status="Terminé" />
          </div>
        </Card>
      </div>
    </>
  );
}

function GenericRoleSection({ role, slug }: { role: Exclude<Role, "student">; slug: string }) {
  const [title, desc] = roleTitles[role][slug] || roleTitles[role][""];
  const isOverview = !slug;
  if (isOverview)
    return (
      <>
        <PageHeader
          eyebrow={
            role === "super_admin"
              ? "Administration Mina"
              : role === "partner_admin"
                ? "CROUS Thiès"
                : "Espace professionnel"
          }
          title={title}
          description={desc}
          action={<DownloadButton label="Exporter le rapport" />}
        />
        <RoleOverview role={role} />
      </>
    );
  if (slug === "utilisateurs")
    return (
      <>
        <PageHeader
          eyebrow="Administration"
          title={title}
          description={desc}
          action={
            <Button>
              <Plus size={15} />
              Ajouter un utilisateur
            </Button>
          }
        />
        <DataTable
          headers={["Utilisateur", "Rôle", "Institution", "Statut", "Inscription", "Action"]}
          rows={[
            "Aïssatou Ndiaye|Étudiante|UCAD|Actif|12 juin",
            "Moussa Fall|Ambassadeur|UGB|En attente|11 juin",
            "Dr Fatou Diop|Professionnelle|Cabinet Teranga|Actif|10 juin",
            "Cheikh Mbaye|Partenaire|CROUS Thiès|En attente|9 juin",
            "Awa Kane|Étudiante|UT Thiès|Suspendu|8 juin",
          ].map((x) => {
            const p = x.split("|");
            return [
              ...p.slice(0, 3),
              <Badge tone={p[3] === "Actif" ? "teal" : p[3] === "Suspendu" ? "red" : "amber"}>
                {p[3]}
              </Badge>,
              p[4],
              <button className="text-mina">
                <MoreHorizontal size={17} />
              </button>,
            ];
          })}
        />
      </>
    );
  if (
    slug === "validations" ||
    slug === "consultations" ||
    slug === "demandes" ||
    slug === "alertes"
  )
    return (
      <>
        <PageHeader eyebrow="File prioritaire" title={title} description={desc} />
        <div className="grid gap-4">
          {[
            [
              "Baobab calme 27",
              "Stress intense avant les examens",
              "Priorité élevée",
              "Il y a 8 min",
            ],
            ["Kër 54", "Demande de rendez-vous confidentiel", "Priorité normale", "Il y a 24 min"],
            ["Sunu 18", "Besoin de parler à un pair", "Priorité normale", "Il y a 1 h"],
          ].map((x, i) => (
            <Card key={x[0]} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${i === 0 ? "bg-red-50 text-red-600" : "bg-violet-50 text-care"}`}
              >
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold">{x[0]}</h2>
                  <Badge tone={i === 0 ? "red" : "slate"}>{x[2]}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {x[1]} · {x[3]}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Voir</Button>
                <Button>
                  {slug === "validations"
                    ? "Valider"
                    : slug === "alertes"
                      ? "Prendre en charge"
                      : "Répondre"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  if (slug === "contenus")
    return (
      <>
        <PageHeader
          eyebrow="Bibliothèque Mina"
          title={title}
          description={desc}
          action={
            <Button>
              <Plus size={15} />
              Nouveau contenu
            </Button>
          }
        />
        <div className="grid gap-5 md:grid-cols-4">
          {[
            ["Cours", "842", "24 brouillons"],
            ["QCM", "5 240", "128 à valider"],
            ["Flashcards", "3 810", "96 nouvelles"],
            ["Cas cliniques", "126", "12 brouillons"],
          ].map((x, i) => (
            <Card key={x[0]}>
              <div className="rounded-xl bg-mina/10 p-2.5 text-mina w-fit">
                {i === 1 ? <FileQuestion /> : <BookOpen />}
              </div>
              <p className="mt-5 text-2xl font-extrabold">{x[1]}</p>
              <p className="text-xs font-bold">{x[0]}</p>
              <p className="mt-3 text-[10px] text-slate-400">{x[2]}</p>
              <Button variant="secondary" className="mt-5 w-full">
                Gérer
              </Button>
            </Card>
          ))}
        </div>
      </>
    );
  if (slug === "licences")
    return (
      <>
        <PageHeader
          eyebrow="Accès subventionnés"
          title={title}
          description={desc}
          action={
            <div className="flex gap-2">
              <DownloadButton label="Importer CSV" />
              <Button>
                <Plus size={15} />
                Inviter
              </Button>
            </div>
          }
        />
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard
            label="Licences totales"
            value="2 000"
            delta="Convention 2025"
            icon={<WalletCards size={20} />}
          />
          <StatCard
            label="Licences attribuées"
            value="1 642"
            delta="82 %"
            icon={<UserCheck size={20} />}
          />
          <StatCard label="Codes disponibles" value="358" delta="18 %" icon={<Zap size={20} />} />
        </div>
        <Card className="mt-5">
          <h2 className="font-extrabold">Code d’accès institutionnel</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 rounded-xl border border-dashed border-mina bg-teal-50 p-4 text-center font-mono text-xl font-extrabold tracking-[.2em] text-mina dark:bg-mina/10">
              CROUS-TH-2025
            </div>
            <Button>Copier le code</Button>
          </div>
        </Card>
      </>
    );
  if (slug === "bien-etre")
    return (
      <>
        <PageHeader
          eyebrow="Données anonymes"
          title={title}
          description={desc}
          action={
            <Badge tone="violet">
              <LockKeyhole size={12} className="mr-1" />
              Seuil minimum : 20 réponses
            </Badge>
          }
        />
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard
            label="Indice de bien-être"
            value="7,2 / 10"
            delta="+0,4"
            icon={<HeartHandshake size={20} />}
          />
          <StatCard label="Participation" value="684" delta="52 %" icon={<Users size={20} />} />
          <StatCard
            label="Orientation Care"
            value="18 %"
            delta="-2 pts"
            icon={<Stethoscope size={20} />}
          />
        </div>
        <div className="mt-5">
          <ChartCard care title="Évolution de l’indice collectif" />
        </div>
      </>
    );
  if (slug === "formation")
    return (
      <>
        <PageHeader eyebrow="Certification" title={title} description={desc} />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Écoute active", "100", "Terminé"],
            ["Repérer la détresse", "72", "En cours"],
            ["Orienter sans diagnostiquer", "25", "À poursuivre"],
          ].map((x, i) => (
            <Card key={x[0]}>
              <Badge tone={i === 0 ? "teal" : i === 1 ? "amber" : "slate"}>Module {i + 1}</Badge>
              <h2 className="mt-5 font-extrabold">{x[0]}</h2>
              <p className="mt-2 text-xs text-slate-400">
                Cours, mises en situation et quiz de validation.
              </p>
              <div className="mt-6">
                <Progress value={+x[1]} />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-bold">
                <span>{x[2]}</span>
                <span>{x[1]} %</span>
              </div>
              <Button variant={i === 0 ? "secondary" : "primary"} className="mt-5 w-full">
                {i === 0 ? "Revoir" : "Continuer"}
              </Button>
            </Card>
          ))}
        </div>
      </>
    );
  return (
    <>
      <PageHeader
        eyebrow="Gestion"
        title={title}
        description={desc}
        action={
          <Button>
            <Plus size={15} />
            Nouvelle action
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <Card>
          <h2 className="font-extrabold">Vue opérationnelle</h2>
          <DataTable
            headers={["Élément", "Responsable", "Date", "Statut"]}
            rows={[
              [title, "Équipe Mina", "18 juin", <Badge>Actif</Badge>],
              ["Session de suivi", "Fatou Diop", "20 juin", <Badge tone="amber">Planifié</Badge>],
              ["Rapport mensuel", "Cheikh Mbaye", "30 juin", <Badge tone="slate">Brouillon</Badge>],
            ]}
          />
        </Card>
        <Card>
          <h2 className="font-extrabold">Prochaines étapes</h2>
          <div className="mt-4">
            <ActivityItem title="Vérifier les informations" meta="Aujourd’hui" />
            <ActivityItem title="Confirmer avec l’équipe" meta="Demain" />
            <ActivityItem title="Publier la mise à jour" meta="Vendredi" />
          </div>
        </Card>
      </div>
    </>
  );
}

export function DashboardPage({ role }: { role: Role }) {
  const location = useLocation();
  const base = role === "partner_admin" ? "partner" : role === "super_admin" ? "admin" : role;
  const slug = location.pathname.split(`/app/${base}/`)[1] || "";
  if (role === "student") return <StudentSection slug={slug} />;
  return <GenericRoleSection role={role} slug={slug} />;
}
