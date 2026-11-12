import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Logo } from "../ui/Logo";
import { Button } from "../ui/Primitives";
import { useThemeStore } from "../../store/themeStore";

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useThemeStore();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  const links = [
    ["Fonctionnalités", "/#fonctionnalites"],
    ["Mina Care", "/mina-care"],
    ["Tarifs", "/tarifs"],
    ["Partenaires", "/partenaires"],
    ["FAQ", "/#faq"],
  ];
  return (
    <div className="min-h-screen bg-canvas text-ink dark:bg-[#09111f] dark:text-slate-100">
      <header className="glass sticky top-0 z-50 border-b border-line/70 dark:border-white/8">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm font-semibold text-slate-600 transition hover:text-mina dark:text-slate-300"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <button
              onClick={toggle}
              className="rounded-xl p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/8"
              aria-label="Changer le thème"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link to="/register">
              <Button>Essai gratuit 3 jours</Button>
            </Link>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-xl p-2 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="border-t border-line px-5 py-4 lg:hidden dark:border-white/8">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="block border-b border-line py-3 font-semibold dark:border-white/8"
              >
                {label}
              </a>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button className="w-full">Essai gratuit</Button>
              </Link>
            </div>
          </div>
        )}
      </header>
      <Outlet />
    </div>
  );
}
