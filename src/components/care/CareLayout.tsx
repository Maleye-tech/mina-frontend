import { useState } from "react";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  ShieldCheck,
  Siren,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { Logo } from "../ui/Logo";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { UrgentHelpModal } from "./UrgentHelpModal";

type CareNavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const professionalNav: CareNavItem[] = [
  { to: "/pro", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/pro/disponibilites", label: "Disponibilités", icon: CalendarDays },
  { to: "/pro/demandes", label: "Demandes", icon: MessageCircle },
  { to: "/pro/alertes", label: "Alertes", icon: Bell },
  { to: "/pro/onboarding", label: "Mon profil", icon: UserRound },
];

const studentNav: CareNavItem[] = [
  { to: "/espace/accompagnement", label: "Accompagnement", icon: HeartHandshake },
  { to: "/espace/rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { to: "/espace/consentement", label: "Consentement", icon: ShieldCheck },
];

export function CareLayout() {
  const user = useAuthStore((state) => state.user)!;
  const logout = useAuthStore((state) => state.logout);
  const { dark, toggle } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [urgentOpen, setUrgentOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isProfessional = user.role === "professional";
  const nav = isProfessional ? professionalNav : studentNav;

  const signOut = () => {
    void logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f7f5] text-ink dark:bg-[#09111f] dark:text-slate-100">
      <a
        href="#care-content"
        className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-xl bg-mina px-4 py-2 text-sm font-bold text-white focus:translate-y-0"
      >
        Aller au contenu
      </a>
      {menuOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-line bg-white p-4 transition-transform dark:border-white/8 dark:bg-panel lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-12 items-center justify-between px-2">
          <Logo />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl p-2 text-slate-400 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-7 rounded-2xl bg-teal-50 p-4 dark:bg-teal-400/10">
          <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-mina">
            {isProfessional ? "Espace professionnel" : "Espace étudiant"}
          </p>
          <p className="mt-1 text-sm font-extrabold text-ink dark:text-white">
            {isProfessional ? "Accompagner avec confiance" : "Prendre soin de soi"}
          </p>
        </div>
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto" aria-label="Navigation Mina Care">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-extrabold transition ${
                    isActive || (item.to !== "/pro" && location.pathname.startsWith(`${item.to}/`))
                      ? "bg-mina text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-ink dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={18} /> {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-line pt-4 dark:border-white/8">
          <p className="truncate px-2 text-xs font-extrabold text-ink dark:text-white">
            {user.name}
          </p>
          <p className="truncate px-2 text-[10px] text-slate-400">{user.email}</p>
          <button
            type="button"
            onClick={signOut}
            className="mt-3 flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-xs font-extrabold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut size={15} /> Se déconnecter
          </button>
        </div>
      </aside>

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur dark:border-white/8 dark:bg-panel/95 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-xl p-2 text-slate-500 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu size={21} />
          </button>
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <p className="hidden text-xs font-extrabold text-slate-500 sm:block">
            {isProfessional ? "Mina Care · Professionnels" : "Mina Care · Étudiants"}
          </p>
          <div className="ml-auto flex items-center gap-1">
            {!isProfessional && (
              <button
                type="button"
                onClick={() => setUrgentOpen(true)}
                aria-label="Ouvrir l’aide urgente"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-red-50 px-3 text-xs font-extrabold text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-200"
              >
                <Siren size={16} /> <span className="hidden sm:inline">Aide urgente</span>
              </button>
            )}
            <button
              type="button"
              onClick={toggle}
              className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8"
              aria-label={dark ? "Activer le thème clair" : "Activer le thème sombre"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <main id="care-content" className="mx-auto max-w-6xl p-4 pb-28 sm:p-6 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white px-2 pb-[env(safe-area-inset-bottom)] dark:border-white/8 dark:bg-panel lg:hidden"
        aria-label="Navigation mobile Mina Care"
      >
        {nav.slice(0, 3).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 text-[9px] font-extrabold ${isActive ? "text-mina" : "text-slate-400"}`
              }
            >
              <Icon size={19} /> <span className="max-w-20 truncate">{item.label}</span>
            </NavLink>
          );
        })}
        {isProfessional ? (
          <NavLink
            to="/pro/onboarding"
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 text-[9px] font-extrabold ${isActive ? "text-mina" : "text-slate-400"}`
            }
          >
            <ClipboardList size={19} /> Profil
          </NavLink>
        ) : (
          <button
            type="button"
            onClick={() => setUrgentOpen(true)}
            className="flex min-h-14 flex-col items-center justify-center gap-1 text-[9px] font-extrabold text-red-600"
          >
            <Siren size={19} /> Urgence
          </button>
        )}
      </nav>
      <UrgentHelpModal open={urgentOpen} onClose={() => setUrgentOpen(false)} />
    </div>
  );
}
