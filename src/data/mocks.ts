import type { Role, User } from "../types";

export const roleMeta: Record<Role, { label: string; home: string; color: string }> = {
  student: { label: "Étudiant", home: "/app/student", color: "#0f766e" },
  ambassador: { label: "Ambassadeur", home: "/app/ambassador", color: "#d97706" },
  professional: { label: "Professionnel", home: "/app/professional", color: "#7c6fdb" },
  partner_admin: { label: "Partenaire", home: "/app/partner", color: "#0b2545" },
  super_admin: { label: "Super admin", home: "/app/admin", color: "#be123c" },
};

export const demoUsers: (User & { password: string })[] = [
  {
    name: "Aïssatou Ndiaye",
    email: "etudiant@mina.sn",
    password: "demo123",
    role: "student",
    university: "UCAD",
    status: "active",
  },
  {
    name: "Moussa Fall",
    email: "ambassadeur@mina.sn",
    password: "demo123",
    role: "ambassador",
    university: "UGB",
    status: "pending",
  },
  {
    name: "Dr Fatou Diop",
    email: "psy@mina.sn",
    password: "demo123",
    role: "professional",
    status: "pending",
  },
  {
    name: "Cheikh Mbaye",
    email: "partenaire@mina.sn",
    password: "demo123",
    role: "partner_admin",
    university: "CROUS Thiès",
    status: "pending",
  },
  {
    name: "Marième Sow",
    email: "admin@mina.sn",
    password: "demo123",
    role: "super_admin",
    status: "active",
  },
];

export const courses = [
  {
    id: 1,
    title: "Anatomie du thorax",
    subject: "Anatomie",
    level: "L1",
    progress: 72,
    duration: "42 min",
    type: "Fiche + audio",
    color: "teal",
  },
  {
    id: 2,
    title: "Cycle de Krebs",
    subject: "Biochimie",
    level: "L1",
    progress: 38,
    duration: "28 min",
    type: "Résumé",
    color: "amber",
  },
  {
    id: 3,
    title: "Physiologie cardiaque",
    subject: "Physiologie",
    level: "L2",
    progress: 84,
    duration: "55 min",
    type: "Fiche + QCM",
    color: "blue",
  },
  {
    id: 4,
    title: "Sémiologie respiratoire",
    subject: "Sémiologie",
    level: "L3",
    progress: 15,
    duration: "36 min",
    type: "Podcast",
    color: "violet",
  },
  {
    id: 5,
    title: "Pharmacologie générale",
    subject: "Pharmacologie",
    level: "L2",
    progress: 0,
    duration: "48 min",
    type: "Fiche + audio",
    color: "rose",
  },
  {
    id: 6,
    title: "Histologie des épithéliums",
    subject: "Histologie",
    level: "L1",
    progress: 56,
    duration: "31 min",
    type: "Atlas",
    color: "cyan",
  },
];

export const faqs = [
  [
    "Mina fonctionne-t-il sans Internet ?",
    "Oui. Télécharge tes cours, fiches et flashcards en Wi-Fi puis étudie partout. Tes progrès se synchronisent au retour de la connexion.",
  ],
  [
    "À qui s’adresse Mina ?",
    "Aux étudiants en médecine, pharmacie, odontologie et filières de santé, de la première année à l’internat.",
  ],
  [
    "Mina Care est-il vraiment confidentiel ?",
    "Oui. La pseudonymisation est activée par défaut et les échanges sont conçus pour accueillir un chiffrement de bout en bout.",
  ],
  [
    "Combien coûte l’abonnement ?",
    "3 000 FCFA par mois ou 15 000 FCFA par an, après 3 jours d’essai gratuit sans engagement.",
  ],
  [
    "Comment payer ?",
    "Par Wave, Orange Money ou carte bancaire. La simulation de paiement te permet de tester le parcours.",
  ],
  [
    "Les contenus sont-ils adaptés au Sénégal ?",
    "Oui. Les matières, cas cliniques et recommandations sont contextualisés pour l’Afrique de l’Ouest.",
  ],
  [
    "Qui sont les ambassadeurs ?",
    "Des étudiants pairs formés à l’écoute, à la prévention et à l’orientation vers un professionnel.",
  ],
  [
    "Puis-je annuler mon abonnement ?",
    "Oui, à tout moment depuis ton espace Abonnement. Ton accès reste actif jusqu’à la fin de la période payée.",
  ],
  [
    "Les universités peuvent-elles financer des accès ?",
    "Oui. Les établissements, CROUS et ONG peuvent attribuer des licences subventionnées par code ou import CSV.",
  ],
  [
    "Mina remplace-t-il un médecin ?",
    "Non. Mina Care informe, écoute et oriente, mais ne remplace jamais un diagnostic ou une prise en charge médicale.",
  ],
];

export const testimonials = [
  {
    quote: "Les QCM expliqués m’aident enfin à comprendre mes erreurs, même dans le car.",
    name: "Aminata, L2 Médecine · UCAD",
    initials: "AN",
  },
  {
    quote:
      "La possibilité de parler anonymement enlève une vraie barrière pour demander de l’aide.",
    name: "Ibrahima, ambassadeur · UGB",
    initials: "IF",
  },
  {
    quote: "Une approche sérieuse, contextualisée et respectueuse de la confidentialité.",
    name: "Dr N. Sarr, psychologue",
    initials: "NS",
  },
];

export const chartData = [
  { name: "Jan", score: 54, care: 62 },
  { name: "Fév", score: 61, care: 67 },
  { name: "Mar", score: 58, care: 72 },
  { name: "Avr", score: 72, care: 75 },
  { name: "Mai", score: 76, care: 81 },
  { name: "Juin", score: 84, care: 83 },
];
