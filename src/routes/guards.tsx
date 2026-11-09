import { Navigate, Outlet, useLocation } from "react-router";
import { roleMeta } from "../data/mocks";
import { useAuthStore } from "../store/authStore";
import type { Role } from "../types";

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user)
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return <Outlet />;
}

export function RoleGuard({ role }: { role: Role }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  if (user.role !== role) return <Navigate to={roleMeta[user.role].home} replace />;
  return <Outlet />;
}
