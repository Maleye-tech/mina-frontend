import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileQuestion,
  GraduationCap,
  HeartHandshake,
  Home,
  Library,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  Users,
  Wifi,
  WifiOff,
  X,
  Activity,
  BriefcaseBusiness,
} from "lucide-react";
import { Logo } from "../ui/Logo";
import { Badge } from "../ui/Primitives";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import type { Role } from "../../types";

const icons = {
  home: Home,
  library: Library,
  qcm: FileQuestion,
  cards: ClipboardList,
  cases: BookOpen,
  coach: Sparkles,
  progress: Activity,
  care: HeartHandshake,
  plan: CreditCard,
  profile: UserRound,
  requests: MessageCircle,
  training: GraduationCap,
  resources: BookOpen,
  calendar: CalendarDays,
  impact: FileBarChart,
  availability: CalendarDays,
  consultations: Users,
  messages: MessageCircle,
  notes: ClipboardList,
  alerts: Bell,
  webinars: Brain,
  licenses: Users,
  reports: FileBarChart,
  convention: BriefcaseBusiness,
  users: Users,
  validations: ShieldCheck,
  content: BookOpen,
  payments: CreditCard,
  partners: BriefcaseBusiness,
  moderation: CircleHelp,
  logs: FileBarChart,
  settings: Settings,
};

const navByRole: Record<Role, { label: string; path: string; icon: keyof typeof icons }[]> = {
  student: [
    { label: "Accueil", path: "/app/student", icon: "home" },
    { label: "Bibliothèque", path: "/app/student/cours", icon: "library" },
    { label: "QCM", path: "/app/student/qcm", icon: "qcm" },
    { label: "Flashcards", path: "/app/student/flashcards", icon: "cards" },
    { label: "Cas cliniques", path: "/app/student/cas", icon: "cases" },
    { label: "Coach IA", path: "/app/student/coach", icon: "coach" },
    { label: "Ma progression", path: "/app/student/progression", icon: "progress" },
    { label: "Mina Care", path: "/app/student/care", icon: "care" },
    { label: "Abonnement", path: "/app/student/abonnement", icon: "plan" },
    { label: "Profil", path: "/app/student/profil", icon: "profile" },
  ],
  ambassador: [
    { label: "Vue d’ensemble", path: "/app/ambassador", icon: "home" },
    { label: "Demandes", path: "/app/ambassador/demandes", icon: "requests" },
    { label: "Conversations", path: "/app/ambassador/conversations", icon: "messages" },
    { label: "Formation", path: "/app/ambassador/formation", icon: "training" },
    { label: "Orientation", path: "/app/ambassador/orientation", icon: "resources" },
    { label: "Ateliers", path: "/app/ambassador/ateliers", icon: "calendar" },
    { label: "Mon impact", path: "/app/ambassador/impact", icon: "impact" },
  ],
  professional: [
    { label: "Agenda", path: "/app/professional", icon: "calendar" },
    { label: "Disponibilités", path: "/app/professional/disponibilites", icon: "availability" },
    { label: "Consultations", path: "/app/professional/consultations", icon: "consultations" },
    { label: "Messagerie", path: "/app/professional/messagerie", icon: "messages" },
    { label: "Notes privées", path: "/app/professional/notes", icon: "notes" },
    { label: "Alertes", path: "/app/professional/alertes", icon: "alerts" },
    { label: "Webinaires", path: "/app/professional/webinaires", icon: "webinars" },
  ],
  partner_admin: [
    { label: "Vue d’ensemble", path: "/app/partner", icon: "home" },
    { label: "Licences", path: "/app/partner/licences", icon: "licenses" },
    { label: "Bien-être agrégé", path: "/app/partner/bien-etre", icon: "care" },
    { label: "Événements", path: "/app/partner/evenements", icon: "calendar" },
    { label: "Rapports", path: "/app/partner/rapports", icon: "reports" },
    { label: "Convention", path: "/app/partner/convention", icon: "convention" },
  ],
  super_admin: [
    { label: "Vue globale", path: "/app/admin", icon: "home" },
    { label: "Utilisateurs", path: "/app/admin/utilisateurs", icon: "users" },
    { label: "Validations", path: "/app/admin/validations", icon: "validations" },
    { label: "Contenus", path: "/app/admin/contenus", icon: "content" },
    { label: "Paiements", path: "/app/admin/paiements", icon: "payments" },
    { label: "Partenaires", path: "/app/admin/partenaires", icon: "partners" },
    { label: "Modération", path: "/app/admin/moderation", icon: "moderation" },
    { label: "Journaux", path: "/app/admin/journaux", icon: "logs" },
    { label: "Paramètres", path: "/app/admin/parametres", icon: "settings" },
  ],
};

export function DashboardLayout() {
  const [mobile, setMobile] = useState(false);
  const [profile, setProfile] = useState(false);
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const { dark, toggle } = useThemeStore();
  const online = useOnlineStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const nav = navByRole[user.role];
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  const signout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-[#f5f7f5] text-ink dark:bg-[#09111f] dark:text-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] border-r border-line bg-white p-4 transition-transform dark:border-white/8 dark:bg-panel lg:translate-x-0 ${mobile ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-12 items-center justify-between px-2">
          <Logo />
          <button onClick={() => setMobile(false)} className="lg:hidden">
            <X />
          </button>
        </div>
        <nav className="mt-7 space-y-1 overflow-y-auto pb-24" aria-label="Navigation de l’espace">
          {nav.map((item) => {
            const Icon = icons[item.icon];
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobile(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition ${active ? "bg-mina text-white shadow-[0_8px_20px_rgba(15,118,110,.18)]" : "text-slate-500 hover:bg-slate-50 hover:text-ink dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"}`}
              >
                <Icon size={18} />
                {item.label}
                {item.label === "Mina Care" && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-care" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-ink p-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sun">
            Besoin d’aide ?
          </p>
          <p className="mt-1 text-[11px] leading-4 text-slate-300">
            Le centre d’assistance Mina est à ton écoute.
          </p>
        </div>
      </aside>
      {mobile && (
        <button
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={() => setMobile(false)}
          aria-label="Fermer le menu"
        />
      )}
      <div className="lg:pl-[260px]">
        <header className="glass sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-line px-4 dark:border-white/8 md:px-7">
          <button onClick={() => setMobile(true)} className="rounded-xl p-2 lg:hidden">
            <Menu />
          </button>
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              className="h-10 w-full rounded-xl bg-slate-100 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-mina/20 dark:bg-white/6"
              placeholder="Rechercher dans Mina…"
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold sm:flex ${online ? "bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300" : "bg-amber-50 text-amber-700"}`}
            >
              {online ? <Wifi size={13} /> : <WifiOff size={13} />}{" "}
              {online ? "En ligne" : "Hors-ligne"}
            </div>
            <button
              onClick={toggle}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/8"
              aria-label="Changer le thème"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/8"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfile(!profile)}
                className="ml-1 flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-white/8"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mina text-xs font-extrabold text-white">
                  {user.name
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <ChevronDown size={14} className="hidden sm:block" />
              </button>
              {profile && (
                <div className="absolute right-0 top-12 w-60 rounded-2xl border border-line bg-white p-3 shadow-card dark:border-white/8 dark:bg-panel">
                  <p className="px-2 text-sm font-bold">{user.name}</p>
                  <p className="px-2 text-[10px] text-slate-400">{user.email}</p>
                  <div className="my-3 h-px bg-line dark:bg-white/8" />
                  <button
                    onClick={signout}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {!online && (
          <div className="bg-amber-400 px-4 py-2 text-center text-xs font-bold text-ink">
            Mode hors-ligne : tes cours téléchargés restent disponibles.
          </div>
        )}
        <main className="mx-auto max-w-[1500px] p-4 pb-24 md:p-7 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-line bg-white px-2 pb-[env(safe-area-inset-bottom)] lg:hidden dark:border-white/8 dark:bg-panel">
        {nav.slice(0, 5).map((item) => {
          const Icon = icons[item.icon];
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-2 text-[9px] font-bold ${active ? "text-mina" : "text-slate-400"}`}
            >
              <Icon size={19} />
              <span className="max-w-16 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
