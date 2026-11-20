import type { Role } from "../types";

export const roleMeta: Record<Role, { label: string; home: string; color: string }> = {
  student: { label: "Étudiant", home: "/app/student", color: "#0f766e" },
  ambassador: { label: "Ambassadeur", home: "/app/ambassador", color: "#d97706" },
  professional: { label: "Professionnel", home: "/app/professional", color: "#7c6fdb" },
  partner_admin: { label: "Partenaire", home: "/app/partner", color: "#0b2545" },
  super_admin: { label: "Super admin", home: "/app/admin", color: "#be123c" },
};
