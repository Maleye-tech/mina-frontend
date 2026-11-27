import { Link } from "react-router";
import { CalendarDays, ChevronRight, UserRound } from "lucide-react";
import { Card } from "../../../../components/ui/Primitives";

const actionClass =
  "mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-care px-4 text-xs font-extrabold text-white transition hover:bg-care-dark";

/**
 * Point d’entrée de l’ancien onglet « Prendre RDV ».
 * La réservation et le suivi sont gérés par les nouveaux parcours Mina Care.
 */
export function CareBooking() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-extrabold">Mes consultations & Rendez-vous</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Consultations d'écoute et de soutien psychologique confidentielles.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="rounded-xl bg-care/10 p-2.5 text-care">
            <UserRound size={20} />
          </div>
          <h3 className="mt-4 text-sm font-extrabold">Prendre rendez-vous</h3>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Choisis un professionnel et un créneau disponible dans le nouvel espace d’accompagnement.
          </p>
          <Link to="/espace/accompagnement" className={actionClass}>
            Choisir un professionnel
            <ChevronRight size={14} />
          </Link>
        </Card>

        <Card className="p-6">
          <div className="rounded-xl bg-care/10 p-2.5 text-care">
            <CalendarDays size={20} />
          </div>
          <h3 className="mt-4 text-sm font-extrabold">Suivre mes rendez-vous</h3>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Retrouve tes demandes, tes consultations confirmées et les liens de visio.
          </p>
          <Link to="/espace/rendez-vous" className={actionClass}>
            Voir mes rendez-vous
            <ChevronRight size={14} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
