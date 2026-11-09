import { useLocation } from "react-router";
import type { Role } from "../../types";
import { StudentSection } from "./student/StudentSection";
import { GenericRoleSection } from "./roles/GenericRoleSection";

export function DashboardPage({ role }: { role: Role }) {
  const location = useLocation();
  const base = role === "partner_admin" ? "partner" : role === "super_admin" ? "admin" : role;
  const slug = location.pathname.split(`/app/${base}/`)[1] || "";
  if (role === "student") return <StudentSection slug={slug} />;
  return <GenericRoleSection role={role} slug={slug} />;
}
