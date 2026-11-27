import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "../../../../store/toastStore";
import { PageHeader } from "../../../../components/dashboard/Common";
import { Badge, Button, Card } from "../../../../components/ui/Primitives";
import { errorMessage } from "../../../../lib/api";
import { partnerService } from "../../../../services/partnerService";
import type {
  AccessCodeItem,
  PartnerDashboardData,
} from "../../../../types/partner";

export function LicencesSection({ title, desc }: { title: string; desc: string }) {
  const [dashboard, setDashboard] = useState<PartnerDashboardData | null>(null);
  const [codes, setCodes] = useState<AccessCodeItem[]>([]);
  const [totalCodes, setTotalCodes] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "used">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal generation
  const [showModal, setShowModal] = useState(false);
  const [count, setCount] = useState<number>(20);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [generating, setGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [dashRes, codesRes] = await Promise.allSettled([
        partnerService.getDashboard(),
        partnerService.getAccessCodes({
          status: statusFilter,
          per_page: 50,
        }),
      ]);

      if (dashRes.status === "fulfilled") {
        setDashboard(dashRes.value);
      }
      if (codesRes.status === "fulfilled") {
        setCodes(codesRes.value.data || []);
        setTotalCodes(codesRes.value.meta?.total ?? codesRes.value.data?.length ?? 0);
      }
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadData();
  };

  const handleCopy = (code: string) => {
    void navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code ${code} copié dans le presse-papier !`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyAllGenerated = () => {
    if (!generatedList.length) return;
    void navigator.clipboard.writeText(generatedList.join("\n"));
    toast.success(`${generatedList.length} codes copiés dans le presse-papier !`);
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (count < 1 || count > 100) {
      toast.error("Le nombre de codes doit être compris entre 1 et 100.");
      return;
    }
    setGenerating(true);
    try {
      const res = await partnerService.generateAccessCodes({
        count,
        duration_days: durationDays,
      });
      toast.success(res.message);
      setGeneratedList(res.codes);
      await loadData();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const filteredCodes = codes.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.user?.name.toLowerCase().includes(q) ||
      c.user?.email.toLowerCase().includes(q)
    );
  });

  const institution = dashboard?.institution;
  const stats = dashboard?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Espace Partenaire Institutionnel"
        title={title}
        description={desc}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setGeneratedList([]);
                setShowModal(true);
              }}
            >
              <Plus size={14} className="mr-1.5" />
              Générer des codes en lot
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Institution</span>
            <Building2 size={18} className="text-mina" />
          </div>
          <p className="mt-3 text-lg font-black truncate">
            {institution?.name || "Non rattachée"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {institution?.type || "Partenaire"} · Subvention : {institution?.subsidy_rate ?? 100}%
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Étudiants bénéficiaires</span>
            <Users size={18} className="text-teal-600" />
          </div>
          <p className="mt-3 text-2xl font-black">
            {stats?.active_students ?? institution?.current_beneficiaries ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">Actuellement actifs sur Mina</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Quotas restants</span>
            <ShieldCheck size={18} className="text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-black">
            {institution?.remaining_beneficiaries !== null &&
            institution?.remaining_beneficiaries !== undefined
              ? institution.remaining_beneficiaries
              : "Illimité"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {institution?.max_beneficiaries
              ? `Sur ${institution.max_beneficiaries} places allouées`
              : "Aucune limite stricte"}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Codes disponibles</span>
            <KeyRound size={18} className="text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-black">
            {stats?.available_access_codes ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {stats?.total_access_codes ?? 0} codes générés au total
          </p>
        </Card>
      </div>

      {/* Access Codes Table */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-line dark:border-white/10">
          <div>
            <h3 className="text-sm font-extrabold">Tableau des codes d’accès étudiants</h3>
            <p className="text-xs text-slate-500">
              {totalCodes} code(s) répertorié(s) pour ton institution
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Rechercher code, étudiant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 rounded-lg border border-line bg-canvas pl-8 pr-3 text-xs font-semibold focus:border-mina focus:outline-none dark:border-white/10 dark:bg-canvas"
              />
            </div>
            <div className="flex rounded-lg border border-line p-0.5 dark:border-white/10">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  statusFilter === "all" ? "bg-mina text-white" : "text-slate-500 hover:text-ink"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setStatusFilter("available")}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  statusFilter === "available" ? "bg-mina text-white" : "text-slate-500 hover:text-ink"
                }`}
              >
                Disponibles
              </button>
              <button
                onClick={() => setStatusFilter("used")}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  statusFilter === "used" ? "bg-mina text-white" : "text-slate-500 hover:text-ink"
                }`}
              >
                Utilisés
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderCircle className="animate-spin text-mina" size={24} />
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400">
            Aucun code d’accès trouvé pour ces filtres.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[11px] font-extrabold uppercase text-slate-400 dark:border-white/5">
                  <th className="py-3 pr-4">Code d'accès</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Étudiant bénéficiaire</th>
                  <th className="py-3 px-4">Durée</th>
                  <th className="py-3 px-4">Expiration</th>
                  <th className="py-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/5">
                {filteredCodes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-mono font-extrabold text-mina">
                      {item.code}
                    </td>
                    <td className="py-3 px-4">
                      {item.is_used ? (
                        <Badge tone="teal">
                          <CheckCircle2 size={11} className="mr-1" />
                          Utilisé
                        </Badge>
                      ) : (
                        <Badge tone="slate">Disponible</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.user ? (
                        <div>
                          <p className="font-bold">{item.user.name}</p>
                          <p className="text-[11px] text-slate-400">{item.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">En attente d'attribution</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {item.duration_days} jours
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {item.expires_at
                        ? new Date(item.expires_at).toLocaleDateString("fr-FR")
                        : "Sans expiration"}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopy(item.code)}
                        className="!h-7 !px-2 text-[11px]"
                      >
                        {copiedCode === item.code ? (
                          <Check size={12} className="text-mina mr-1" />
                        ) : (
                          <Copy size={12} className="mr-1" />
                        )}
                        Copier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Batch Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-extrabold">Génération de codes d’accès en lot</h3>
            <p className="mt-1 text-xs text-slate-500">
              Génère des codes subventionnés par ton institution à distribuer à tes étudiants.
            </p>

            {generatedList.length > 0 ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-mina/30 bg-mina/5 p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-mina/20">
                    <span className="text-xs font-bold text-mina">
                      {generatedList.length} codes générés avec succès
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyAllGenerated}
                      className="!h-7 text-xs"
                    >
                      <Copy size={12} className="mr-1" />
                      Tout copier
                    </Button>
                  </div>
                  <div className="mt-3 max-h-48 overflow-y-auto font-mono text-xs space-y-1">
                    {generatedList.map((c, i) => (
                      <div key={i} className="flex justify-between items-center py-0.5">
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(c)}
                          className="text-[11px] text-slate-400 hover:text-mina"
                        >
                          copier
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setShowModal(false);
                    setGeneratedList([]);
                  }}
                >
                  Fermer
                </Button>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-bold">Nombre de codes à générer</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-2.5 text-xs font-semibold focus:border-mina focus:outline-none dark:border-white/10 dark:bg-canvas"
                    required
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Entre 1 et 100 codes par lot.</p>
                </div>

                <div>
                  <label className="text-xs font-bold">Durée de l’accès par code</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-2.5 text-xs font-semibold focus:border-mina focus:outline-none dark:border-white/10 dark:bg-canvas"
                  >
                    <option value={30}>30 jours (1 mois)</option>
                    <option value={60}>60 jours (2 mois)</option>
                    <option value={90}>90 jours (1 trimestre)</option>
                    <option value={180}>180 jours (1 semestre)</option>
                    <option value={365}>365 jours (1 an)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-line dark:border-white/10">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={generating}
                  >
                    Annuler
                  </Button>
                  <Button variant="primary" type="submit" disabled={generating}>
                    {generating ? (
                      <LoaderCircle size={14} className="animate-spin mr-1.5" />
                    ) : (
                      <Plus size={14} className="mr-1.5" />
                    )}
                    Générer les {count} codes
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
