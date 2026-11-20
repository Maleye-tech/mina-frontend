import { Navigate, Outlet, useLocation } from "react-router";
import { LoaderCircle } from "lucide-react";
import { roleMeta } from "../data/roleMeta";
import { useAuthStore } from "../store/authStore";
import type { Role } from "../types";

const ONBOARDING_PATH = "/app/student/onboarding";
const STUDENT_EXCEPTIONS = [ONBOARDING_PATH, "/app/student/profil"];

export function HydratingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas dark:bg-[#09111f]">
      <LoaderCircle className="animate-spin text-mina" size={30} />
    </div>
  );
}

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const location = useLocation();
  if (!hydrated) return <HydratingScreen />;
  if (!user)
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  if (
    user.role === "student" &&
    !user.studentProfile?.onboardingCompleted &&
    !STUDENT_EXCEPTIONS.some((path) => location.pathname.startsWith(path))
  )
    return <Navigate to={ONBOARDING_PATH} replace />;
  return <Outlet />;
}

export function RoleGuard({ role }: { role: Role }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  if (user.role !== role) return <Navigate to={roleMeta[user.role].home} replace />;
  return <Outlet />;
}
