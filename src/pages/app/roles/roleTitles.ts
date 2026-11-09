import type { Role } from "../../../types";

export const roleTitles: Record<Exclude<Role, "student">, Record<string, [string, string]>> = {
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
