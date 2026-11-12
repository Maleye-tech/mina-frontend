import { DashboardPage } from "./DashboardPage";

export function StudentDashboard() {
  return <DashboardPage role="student" />;
}
export function AmbassadorDashboard() {
  return <DashboardPage role="ambassador" />;
}
export function ProfessionalDashboard() {
  return <DashboardPage role="professional" />;
}
export function PartnerDashboard() {
  return <DashboardPage role="partner_admin" />;
}
export function AdminDashboard() {
  return <DashboardPage role="super_admin" />;
}
