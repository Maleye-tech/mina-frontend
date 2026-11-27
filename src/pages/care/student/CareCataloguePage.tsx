import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Languages,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { Link } from "react-router";
import {
  CareLoading,
  CarePageHeader,
  EmptyState,
  ErrorBanner,
} from "../../../components/care/CarePrimitives";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { errorMessage } from "../../../lib/api";
import { careService } from "../../../services/careService";
import type { CareProfessional, CareSpecialty } from "../../../types/care";

const specialtyLabels: Record<CareSpecialty, string> = {
  psychologue: "Psychologue",
  psychiatre: "Psychiatre",
  conseiller: "Conseiller",
};

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
}

export function CareCataloguePage() {
  const [professionals, setProfessionals] = useState<CareProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState<CareSpecialty | "all">("all");
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const result = await careService.getProfessionals();
      if (currentRequest !== requestId.current) return;
      setProfessionals(result.filter((professional) => professional.is_verified));
    } catch (reason) {
      if (currentRequest !== requestId.current) return;
      setError(errorMessage(reason));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      requestId.current += 1;
    };
  }, [load]);

  const specialties = useMemo(
    () =>
      Array.from(new Set(professionals.map((professional) => professional.specialty))).sort(
        (first, second) => specialtyLabels[first].localeCompare(specialtyLabels[second], "fr"),
      ),
    [professionals],
  );

  const filteredProfessionals = useMemo(() => {
    const query = normalizeSearch(search.trim());
    return professionals.filter((professional) => {
      if (specialty !== "all" && professional.specialty !== specialty) return false;
      if (!query) return true;
      return normalizeSearch(
        [
          professional.display_name,
          professional.specialty_label,
          professional.languages.join(" "),
          professional.bio ?? "",
        ].join(" "),
      ).includes(query);
    });
  }, [professionals, search, specialty]);

  const resetFilters = () => {
    setSearch("");
    setSpecialty("all");
  };

  return (
    <div className="space-y-6">
      <CarePageHeader
        eyebrow="Accompagnement"
        title="Trouver un professionnel"
        description="Découvre des professionnels vérifiés et choisis un créneau adapté à ton besoin."
        actions={
          <Link
            to="/espace/rendez-vous"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold text-mina hover:border-mina/40 dark:border-white/10 dark:bg-white/8"
          >
            <CalendarDays size={17} /> Mes rendez-vous
          </Link>
        }
      />

      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[1fr_240px]">
          <div>
            <label
              htmlFor="care-professional-search"
              className="text-xs font-extrabold text-ink dark:text-white"
            >
              Rechercher un professionnel
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
                aria-hidden="true"
              />
              <input
                id="care-professional-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom, spécialité, langue ou présentation"
                className="min-h-12 w-full rounded-xl border border-line bg-white py-3 pl-10 pr-3 text-sm text-ink outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="care-specialty-filter"
              className="text-xs font-extrabold text-ink dark:text-white"
            >
              Spécialité
            </label>
            <select
              id="care-specialty-filter"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value as CareSpecialty | "all")}
              className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-3 text-sm font-bold text-ink outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="all">Toutes les spécialités</option>
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {specialtyLabels[item]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 dark:border-white/8">
          <p role="status" aria-live="polite" className="text-xs font-bold text-slate-500">
            {loading
              ? "Actualisation des professionnels…"
              : `${filteredProfessionals.length} professionnel${filteredProfessionals.length > 1 ? "s" : ""} affiché${filteredProfessionals.length > 1 ? "s" : ""}`}
          </p>
          {(search || specialty !== "all") && (
            <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
              <X size={15} /> Effacer les filtres
            </Button>
          )}
        </div>
      </Card>

      {error && <ErrorBanner message={error} onRetry={() => void load()} />}

      {loading && professionals.length === 0 ? (
        <CareLoading label="Chargement des professionnels vérifiés…" />
      ) : filteredProfessionals.length === 0 && !error ? (
        <EmptyState
          icon={<UsersRound size={22} />}
          title={professionals.length === 0 ? "Aucun professionnel disponible" : "Aucun résultat"}
          description={
            professionals.length === 0
              ? "Aucun professionnel vérifié n’est disponible pour le moment. Reviens prochainement."
              : "Essaie une autre recherche ou une autre spécialité."
          }
          action={
            professionals.length > 0 ? (
              <Button type="button" variant="secondary" onClick={resetFilters}>
                Effacer les filtres
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={() => void load()}>
                Réessayer
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProfessionals.map((professional) => (
            <Card key={professional.id} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-ink dark:text-white">
                      {professional.display_name}
                    </h2>
                    <BadgeCheck
                      size={19}
                      className="shrink-0 text-mina"
                      aria-label="Professionnel vérifié"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="teal">{professional.specialty_label}</Badge>
                    <Badge tone="slate">Vérifié</Badge>
                  </div>
                </div>
              </div>
              <p className="mt-4 flex items-start gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                <Languages size={17} className="mt-0.5 shrink-0 text-mina" aria-hidden="true" />
                {professional.languages.length > 0
                  ? professional.languages.join(", ")
                  : "Langues non précisées"}
              </p>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {professional.bio || "Ce professionnel n’a pas encore ajouté de présentation."}
              </p>
              <div className="mt-5 border-t border-line pt-4 dark:border-white/8">
                <Link
                  to={`/espace/accompagnement/${professional.id}`}
                  aria-label={`Voir le profil et les disponibilités de ${professional.display_name}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-extrabold text-mina hover:bg-teal-50 dark:hover:bg-teal-400/10"
                >
                  Voir les disponibilités <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
