import type { Role } from "../types";

export const roleMeta: Record<Role, { label: string; home: string; color: string }> = {
  student: { label: "Étudiant", home: "/espace", color: "#0f766e" },
  ambassador: { label: "Ambassadeur", home: "/app/ambassador", color: "#d97706" },
  professional: { label: "Professionnel", home: "/pro", color: "#0f766e" },
  partner: { label: "Partenaire institutionnel", home: "/app/partner", color: "#0b2545" },
  partner_admin: { label: "Partenaire", home: "/app/partner", color: "#0b2545" },
  super_admin: { label: "Super admin", home: "/app/admin", color: "#be123c" },
  admin: { label: "Administrateur", home: "/app/admin", color: "#be123c" },
};
