import { HeartPulse, Mail, Phone, Share2 } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "../ui/Logo";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="border-b border-white/10 bg-white/5 px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-start gap-3 text-sm text-slate-300">
          <HeartPulse className="mt-0.5 shrink-0 text-sun" size={18} />
          <p>
            <strong className="text-white">Besoin d’aide immédiate ?</strong> En cas de détresse,
            contacte les urgences ou une personne de confiance. Numéros nationaux à configurer avec
            nos partenaires.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
            Le compagnon d’études et de bien-être pensé avec et pour les étudiants en santé
            d’Afrique francophone.
          </p>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-sun">
            Un projet Volkeno
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-bold">Plateforme</h4>
          {[
            ["Fonctionnalités", "/#fonctionnalites"],
            ["Mina Care", "/mina-care"],
            ["Tarifs", "/tarifs"],
            ["Partenaires", "/partenaires"],
          ].map((x) => (
            <Link
              key={x[0]}
              to={x[1]}
              className="mb-3 block text-sm text-slate-300 hover:text-white"
            >
              {x[0]}
            </Link>
          ))}
        </div>
        <div>
          <h4 className="mb-4 font-bold">Ressources</h4>
          {["Centre d’aide", "Confidentialité", "Mentions légales", "CGU"].map((x) => (
            <Link
              key={x}
              to="/contact"
              className="mb-3 block text-sm text-slate-300 hover:text-white"
            >
              {x}
            </Link>
          ))}
        </div>
        <div>
          <h4 className="mb-4 font-bold">Nous contacter</h4>
          <a
            href="mailto:bonjour@mina.sn"
            className="mb-3 flex items-center gap-2 text-sm text-slate-300"
          >
            <Mail size={15} />
            bonjour@mina.sn
          </a>
          <p className="mb-5 flex items-center gap-2 text-sm text-slate-300">
            <Phone size={15} />
            Dakar, Sénégal
          </p>
          <div className="flex gap-2">
            <a href="#" aria-label="Réseau professionnel" className="rounded-lg bg-white/8 p-2">
              <Share2 size={17} />
            </a>
            <a href="#" aria-label="Réseau social" className="rounded-lg bg-white/8 p-2">
              <Share2 size={17} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-slate-400">
        © 2025 Mina. Tous droits réservés. Conçu à Dakar pour l’Afrique.
      </div>
    </footer>
  );
}
