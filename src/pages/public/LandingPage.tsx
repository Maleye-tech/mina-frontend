import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  CloudOff,
  Download,
  FileQuestion,
  Headphones,
  HeartHandshake,
  LockKeyhole,
  MessageCircleHeart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  Target,
  WifiOff,
  Zap,
  MoonStar,
  Users,
  GraduationCap,
  BarChart3,
  CalendarHeart,
} from "lucide-react";
import { Footer } from "../../components/layout/Footer";
import { Badge, Button, Card, Progress } from "../../components/ui/Primitives";
import { faqs, testimonials } from "../../data/mocks";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <motion.div {...reveal} className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-mina">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
      {text && <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{text}</p>}
    </motion.div>
  );
}

function AppMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative mx-auto max-w-[570px]"
    >
      <div className="absolute -inset-8 rounded-full bg-mina/10 blur-3xl" />
      <div className="relative ml-auto w-[90%] rounded-[28px] border border-white/70 bg-white p-4 shadow-[0_35px_80px_rgba(11,37,69,.18)] dark:border-white/10 dark:bg-panel">
        <div className="flex items-center justify-between border-b border-line pb-3 dark:border-white/8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-mina" />
            <div>
              <div className="h-2 w-20 rounded bg-slate-200 dark:bg-white/15" />
              <div className="mt-1.5 h-1.5 w-12 rounded bg-slate-100 dark:bg-white/8" />
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-amber-100" />
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-4 pt-4">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((x) => (
              <div
                key={x}
                className={`h-8 rounded-lg ${x === 1 ? "bg-teal-50" : "bg-slate-50 dark:bg-white/5"}`}
              />
            ))}
          </div>
          <div>
            <div className="rounded-2xl bg-gradient-to-r from-mina to-[#15988e] p-5 text-white">
              <p className="text-xs opacity-80">Bonjour Aïssatou,</p>
              <p className="mt-1 font-extrabold">Prête pour ta session ?</p>
              <div className="mt-4 h-2 rounded-full bg-white/20">
                <div className="h-2 w-[68%] rounded-full bg-sun" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["12", "jours"],
                ["84%", "QCM"],
                ["6h", "semaine"],
              ].map((x) => (
                <div
                  key={x[1]}
                  className="rounded-xl border border-line p-3 text-center dark:border-white/8"
                >
                  <p className="font-extrabold">{x[0]}</p>
                  <p className="text-[8px] text-slate-400">{x[1]}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <div className="mb-2 flex justify-between text-[9px] font-bold">
                <span>Physiologie cardiaque</span>
                <span>72%</span>
              </div>
              <Progress value={72} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-10 left-0 w-[150px] rounded-[26px] border-[6px] border-ink bg-white p-3 shadow-2xl dark:bg-panel">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-slate-300" />
        <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-500/10">
          <HeartHandshake size={20} className="text-care" />
          <p className="mt-8 text-[10px] font-extrabold">Comment te sens-tu ?</p>
          <div className="mt-2 flex justify-between gap-1">
            <span className="h-3 w-3 rounded-full bg-red-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-teal-400" />
          </div>
        </div>
        <div className="mt-2 rounded-lg bg-mina px-2 py-2 text-center text-[8px] font-bold text-white">
          Commencer ma journée
        </div>
      </div>
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -right-3 -top-5 rounded-xl bg-white px-3 py-2 text-xs font-bold shadow-card dark:bg-panel"
      >
        <span className="mr-2 text-sun">●</span>12 jours de série
      </motion.div>
    </motion.div>
  );
}

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <main>
      <section className="pattern overflow-hidden px-5 pb-24 pt-16 md:pb-32 md:pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_.98fr] lg:px-3">
          <div>
            <Badge tone="amber">
              <Sparkles size={13} className="mr-1.5" />
              Pensé au Sénégal, pour l’Afrique
            </Badge>
            <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.08] tracking-[-.045em] md:text-6xl">
              Réussis tes études de santé. <span className="text-mina">Prends soin de toi.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Cours, QCM, coach d’études et soutien psychosocial : Mina t’accompagne chaque jour,
              même sans connexion.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button className="w-full sm:w-auto">
                  Commencer gratuitement <ArrowRight size={17} />
                </Button>
              </Link>
              <Link to="/mina-care">
                <Button variant="secondary" className="w-full sm:w-auto">
                  <HeartHandshake size={17} className="text-care" />
                  Découvrir Mina Care
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              {[
                [CloudOff, "Fonctionne hors-ligne"],
                [ShieldCheck, "100 % confidentiel"],
                [Smartphone, "Wave & Orange Money"],
              ].map(([Icon, t]) => (
                <span key={t as string} className="flex items-center gap-1.5">
                  {<Icon size={16} className="text-mina" />}
                  {t as string}
                </span>
              ))}
            </div>
          </div>
          <AppMockup />
        </div>
      </section>

      <section className="border-y border-line bg-white dark:border-white/8 dark:bg-panel">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-line px-5 md:grid-cols-4 md:divide-y-0 dark:divide-white/8">
          {[
            ["+60 %", "d’échec en 1re année"],
            ["5 000+", "QCM contextualisés"],
            ["100 %", "accessible hors-ligne"],
            ["3 jours", "d’essai gratuit"],
          ].map((x, i) => (
            <div key={x[0]} className="px-4 py-8 text-center">
              <p className={`text-2xl font-extrabold ${i === 0 ? "text-red-500" : "text-mina"}`}>
                {x[0]}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{x[1]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-24">
        <SectionTitle
          eyebrow="Le constat"
          title="Les études de santé ne devraient pas être un parcours solitaire"
          text="Nous levons les obstacles académiques, numériques et humains qui freinent trop d’étudiants."
        />
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            [
              BarChart3,
              "Échec élevé",
              "Des méthodes de travail peu adaptées au rythme universitaire.",
            ],
            [
              BookOpen,
              "Supports dispersés",
              "Polycopiés, drives et groupes WhatsApp difficiles à organiser.",
            ],
            [
              WifiOff,
              "Connexion instable",
              "Des ressources trop lourdes ou indisponibles hors-ligne.",
            ],
            [
              Brain,
              "Surcharge mentale",
              "Stress, épuisement et tabou qui empêchent de demander de l’aide.",
            ],
          ].map(([Icon, t, d], i) => (
            <motion.div {...reveal} transition={{ delay: i * 0.07 }} key={t as string}>
              <Card className="h-full">
                <div className="mb-5 inline-flex rounded-2xl bg-red-50 p-3 text-red-500 dark:bg-red-500/10">
                  {<Icon />}
                </div>
                <h3 className="font-extrabold">{t as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {d as string}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-ink px-5 py-24 text-white">
        <SectionTitle
          eyebrow="Une plateforme, deux espaces"
          title="Apprendre mieux. Aller mieux."
          text="Une approche intégrée qui prend soin de ta réussite et de ton équilibre."
        />
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          <div className="rounded-[28px] bg-gradient-to-br from-mina to-[#094f4b] p-8 md:p-10">
            <div className="mb-16 inline-flex rounded-2xl bg-white/12 p-3">
              <GraduationCap />
            </div>
            <Badge tone="amber">Mina Med Student</Badge>
            <h3 className="mt-4 text-3xl font-extrabold">Ton campus dans la poche</h3>
            <p className="mt-3 text-sm leading-6 text-teal-50">
              Révise avec des contenus fiables, entraîne-toi et avance selon tes points faibles.
            </p>
            <ul className="mt-6 grid gap-3 text-sm">
              {[
                "Cours & fiches de synthèse",
                "QCM expliqués et cas cliniques",
                "Coach IA et progression",
              ].map((x) => (
                <li key={x} className="flex gap-2">
                  <Check size={18} className="text-sun" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[28px] bg-gradient-to-br from-care to-[#51469c] p-8 md:p-10">
            <div className="mb-16 inline-flex rounded-2xl bg-white/12 p-3">
              <HeartHandshake />
            </div>
            <Badge tone="violet">Mina Care</Badge>
            <h3 className="mt-4 text-3xl font-extrabold">Une écoute, sans jugement</h3>
            <p className="mt-3 text-sm leading-6 text-violet-50">
              Parle anonymement, trouve des ressources et prends rendez-vous en toute
              confidentialité.
            </p>
            <ul className="mt-6 grid gap-3 text-sm">
              {[
                "Tchat sécurisé et anonyme",
                "Psychologues & ambassadeurs formés",
                "Auto-évaluations non médicales",
              ].map((x) => (
                <li key={x} className="flex gap-2">
                  <Check size={18} className="text-sun" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="px-5 py-24">
        <SectionTitle
          eyebrow="Mina Med Student"
          title="Tout ce qu’il te faut pour progresser"
          text="Des outils courts, contextualisés et conçus pour ton quotidien."
        />
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            [
              BookOpen,
              "Bibliothèque structurée",
              "Cours, fiches et résumés classés par niveau et matière.",
              "lg:col-span-2",
            ],
            [Headphones, "Podcasts audio", "Révise en mobilité avec des formats compressés.", ""],
            [FileQuestion, "QCM expliqués", "Comprends chaque bonne et mauvaise réponse.", ""],
            [
              Target,
              "Flashcards intelligentes",
              "La répétition espacée au rythme de ta mémoire.",
              "",
            ],
            [
              Stethoscope,
              "Cas cliniques locaux",
              "Paludisme, drépanocytose, tuberculose et plus.",
              "",
            ],
            [
              Sparkles,
              "Coach IA personnalisé",
              "Un planning qui s’adapte à tes lacunes.",
              "lg:col-span-2",
            ],
            [Download, "Mode hors-ligne", "Télécharge en Wi-Fi, étudie partout.", ""],
          ].map(([Icon, t, d, span], i) => (
            <motion.div {...reveal} key={t as string} className={span as string}>
              <Card
                className={`h-full overflow-hidden ${i === 0 ? "bg-gradient-to-br from-teal-50 to-white dark:from-teal-500/10 dark:to-panel" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-mina/10 p-3 text-mina">{<Icon />}</div>
                  <span className="text-xs font-bold text-slate-300">0{i + 1}</span>
                </div>
                <h3 className="mt-7 text-lg font-extrabold">{t as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {d as string}
                </p>
                {i === 0 && (
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    {["Anatomie", "Biochimie", "Physiologie"].map((x, j) => (
                      <div
                        key={x}
                        className="rounded-xl bg-white p-3 text-xs font-bold shadow-sm dark:bg-white/8"
                      >
                        <div
                          className={`mb-4 h-1.5 rounded-full ${j === 0 ? "bg-mina" : j === 1 ? "bg-sun" : "bg-blue-500"}`}
                        />
                        {x}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden bg-[#f2f0ff] px-5 py-24 dark:bg-care/8">
        <SectionTitle
          eyebrow="Mina Care"
          title="Tu peux parler. Nous sommes là."
          text="Un espace doux, confidentiel et accessible pour prévenir l’épuisement et rompre l’isolement."
        />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [
                MessageCircleHeart,
                "Écoute anonyme",
                "Choisis un pseudonyme et parle sans crainte.",
              ],
              [CalendarHeart, "Rendez-vous", "Trouve un professionnel et un créneau confidentiel."],
              [
                LockKeyhole,
                "Tchat sécurisé",
                "Architecture prête pour le chiffrement de bout en bout.",
              ],
              [MoonStar, "Ressources bien-être", "Stress, sommeil, burnout et concentration."],
              [Users, "Ambassadeurs formés", "Des pairs qui comprennent ton quotidien."],
              [CirclePlay, "Webinaires", "Des échanges pour briser le tabou."],
            ].map(([Icon, t, d]) => (
              <Card key={t as string} className="border-white/60">
                <div className="mb-4 inline-flex rounded-xl bg-care/10 p-2.5 text-care">
                  {<Icon size={20} />}
                </div>
                <h3 className="font-extrabold">{t as string}</h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">{d as string}</p>
              </Card>
            ))}
          </div>
          <div className="relative rounded-[30px] bg-care p-7 text-white md:p-10">
            <ShieldCheck size={36} />
            <h3 className="mt-8 text-3xl font-extrabold">Ta parole t’appartient.</h3>
            <p className="mt-3 leading-7 text-violet-100">
              Pseudonymisation par défaut, contrôle de tes données et orientation uniquement avec
              ton accord, sauf urgence vitale selon le protocole.
            </p>
            <div className="mt-8 rounded-2xl bg-white/12 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">
                Aujourd’hui, comment te sens-tu ?
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <span className="rounded-lg bg-white/10 py-2 text-center text-xs font-bold">
                  Difficile
                </span>
                <span className="rounded-lg bg-white/10 py-2 text-center text-xs font-bold">
                  Moyen
                </span>
                <span className="rounded-lg bg-white/20 py-2 text-center text-xs font-bold">
                  Bien
                </span>
              </div>
            </div>
            <Link to="/mina-care">
              <Button className="mt-6 bg-white text-care hover:bg-violet-50">
                Découvrir l’espace <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-24">
        <SectionTitle eyebrow="Simplement" title="Commence en quelques minutes" />
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
          {[
            ["01", "Inscris-toi", "Crée ton espace en toute simplicité."],
            ["02", "Choisis ton niveau", "Mina adapte les contenus à ton cursus."],
            ["03", "Étudie & évalue-toi", "Avance avec un plan clair et des QCM."],
            ["04", "Sois accompagné", "Accède à Mina Care quand tu en as besoin."],
          ].map((x, i) => (
            <div key={x[0]} className="relative">
              <span className="text-5xl font-extrabold text-mina/12">{x[0]}</span>
              <h3 className="mt-3 font-extrabold">{x[1]}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{x[2]}</p>
              {i < 3 && (
                <ChevronRight className="absolute -right-5 top-5 hidden text-mina/20 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-teal-950 px-5 py-20 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge tone="amber">
              <WifiOff size={13} className="mr-1" />
              Conçu pour la réalité du terrain
            </Badge>
            <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">
              Tes cours te suivent, même quand le réseau ne suit pas.
            </h2>
            <p className="mt-4 leading-7 text-teal-100">
              Mina est une PWA légère : contenus compressés, synchronisation différée et cache
              local. Idéal sur smartphone Android et réseaux 3G/4G.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {["Installable", "Faible consommation", "Sync automatique"].map((x) => (
                <span key={x} className="rounded-full bg-white/8 px-4 py-2 text-xs font-bold">
                  <CheckCircle2 className="mr-1.5 inline text-sun" size={14} />
                  {x}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-mina p-3">
                  <Download />
                </div>
                <div>
                  <p className="font-bold">Anatomie du thorax</p>
                  <p className="text-xs text-teal-200">42 Mo • Fiche + podcast</p>
                </div>
              </div>
              <Badge tone="teal">Disponible</Badge>
            </div>
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs">
                <span>Téléchargement</span>
                <span>100 %</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full w-full rounded-full bg-sun" />
              </div>
            </div>
            <p className="mt-4 text-xs text-teal-200">
              <CloudOff className="mr-1.5 inline" size={14} />
              Accessible sans connexion
            </p>
          </div>
        </div>
      </section>

      <section id="tarifs" className="px-5 py-24">
        <SectionTitle
          eyebrow="Des tarifs justes"
          title="Investis dans ta réussite, sans surprise"
          text="Commence gratuitement. Aucun moyen de paiement demandé pendant l’essai."
        />
        <div className="mx-auto grid max-w-5xl items-stretch gap-5 md:grid-cols-3">
          {[
            ["Essai gratuit", "0 FCFA", "3 jours", "Accès à toutes les fonctionnalités"],
            ["Mensuel", "3 000 FCFA", "par mois", "Flexible, annulable à tout moment"],
            ["Annuel", "15 000 FCFA", "par an", "Économise 21 000 FCFA par an"],
          ].map((x, i) => (
            <Card
              key={x[0]}
              className={`relative flex flex-col ${i === 2 ? "border-2 border-mina shadow-[0_20px_60px_rgba(15,118,110,.15)]" : ""}`}
            >
              {i === 2 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sun px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink">
                  Meilleure offre
                </span>
              )}
              <h3 className="text-lg font-extrabold">{x[0]}</h3>
              <p className="mt-6 text-3xl font-extrabold">{x[1]}</p>
              <p className="text-xs text-slate-400">{x[2]}</p>
              <p className="mt-5 min-h-10 text-sm text-slate-500">{x[3]}</p>
              <div className="my-6 h-px bg-line dark:bg-white/8" />
              {[
                "5 000+ QCM expliqués",
                "Tous les cours & podcasts",
                "Mina Care inclus",
                "Mode hors-ligne",
              ].map((f) => (
                <p key={f} className="mb-3 flex gap-2 text-xs font-semibold">
                  <Check size={15} className="text-mina" />
                  {f}
                </p>
              ))}
              <Link to="/register" className="mt-auto pt-5">
                <Button variant={i === 2 ? "primary" : "secondary"} className="w-full">
                  Choisir cette offre
                </Button>
              </Link>
            </Card>
          ))}
        </div>
        <div className="mx-auto mt-6 flex max-w-5xl flex-col items-center justify-between gap-4 rounded-2xl bg-violet-50 p-5 text-center sm:flex-row sm:text-left dark:bg-care/10">
          <p className="text-sm">
            <strong className="text-care">Mina Care peut être gratuit ou subventionné</strong>
            <br />
            <span className="text-slate-500">via nos partenaires : CROUS, universités et ONG.</span>
          </p>
          <Link to="/partenaires">
            <Button variant="care">En savoir plus</Button>
          </Link>
        </div>
        <p className="mt-7 text-center text-xs font-bold text-slate-400">
          Paiements sécurisés via Wave · Orange Money · Carte bancaire
        </p>
      </section>

      <section className="border-y border-line bg-white px-5 py-20 dark:border-white/8 dark:bg-panel">
        <SectionTitle eyebrow="Ensemble" title="Des partenaires engagés pour la réussite" />
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4">
          {["CROUS THIÈS", "UCAD · FMPO", "UGB SANTÉ", "UT THIÈS", "ONG SANTÉ+"].map((x) => (
            <div
              key={x}
              className="rounded-xl border border-line px-6 py-4 text-sm font-extrabold text-slate-400 dark:border-white/8"
            >
              {x}
            </div>
          ))}
        </div>
        <div className="mt-9 text-center">
          <Link to="/partenaires">
            <Button variant="secondary">
              Devenir partenaire <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-5 py-24">
        <SectionTitle eyebrow="Ils en parlent" title="Une plateforme qui comprend le terrain" />
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <div className="text-3xl font-extrabold text-sun">“</div>
              <p className="mt-3 min-h-24 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {t.quote}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mina/10 text-xs font-extrabold text-mina">
                  {t.initials}
                </div>
                <p className="text-xs font-bold">
                  {t.name}
                  <br />
                  <span className="font-normal text-slate-400">
                    Témoignage fictif à titre d’exemple
                  </span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-ink px-5 py-20 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <ShieldCheck size={42} className="text-sun" />
            <h2 className="mt-5 text-3xl font-extrabold">La confiance n’est pas une option.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Sécurité et confidentialité sont intégrées dès la conception.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["E2E", "Chiffrement de bout en bout"],
              ["CDP", "Conformité Sénégal"],
              ["RGPD", "Contrôle des données"],
            ].map((x) => (
              <div key={x[0]} className="rounded-2xl bg-white/6 p-5">
                <p className="text-xl font-extrabold text-sun">{x[0]}</p>
                <p className="mt-2 text-xs text-slate-300">{x[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-24">
        <SectionTitle eyebrow="Questions fréquentes" title="Tout ce que tu veux savoir" />
        <div className="mx-auto max-w-3xl divide-y divide-line rounded-[24px] border border-line bg-white px-6 shadow-card dark:divide-white/8 dark:border-white/8 dark:bg-panel">
          {faqs.map((f, i) => (
            <div key={f[0]}>
              <button
                onClick={() => setOpenFaq(i === openFaq ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-bold"
                aria-expanded={openFaq === i}
              >
                {f[0]}
                <ChevronDown
                  size={18}
                  className={`shrink-0 transition ${openFaq === i ? "rotate-180 text-mina" : ""}`}
                />
              </button>
              {openFaq === i && (
                <p className="pb-5 text-sm leading-6 text-slate-500 dark:text-slate-400">{f[1]}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24">
        <div className="pattern mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-mina px-6 py-14 text-center text-white md:px-14">
          <Zap className="mx-auto text-sun" />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold md:text-4xl">
            Ton prochain chapitre commence aujourd’hui.
          </h2>
          <p className="mt-4 text-sm text-teal-50">
            3 jours pour découvrir Mina, sans engagement et sans carte bancaire.
          </p>
          <Link to="/register">
            <Button className="mt-7 bg-white text-mina hover:bg-teal-50">
              Commencer mon essai gratuit <ArrowRight size={17} />
            </Button>
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
