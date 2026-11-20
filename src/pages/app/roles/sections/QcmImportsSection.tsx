import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Eye, LoaderCircle, RefreshCw, Upload, X } from "lucide-react";
import { Badge, Button } from "../../../../components/ui/Primitives";
import { DataTable, PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { errorMessage } from "../../../../lib/api";
import { qcmService } from "../../../../services/qcmService";
import { toast } from "../../../../store/toastStore";
import type { Paginated } from "../../../../types/api";
import type { QcmImport, QcmImportStatus } from "../../../../types/assessment";

const STATUS_LABELS: Record<QcmImportStatus, string> = {
  pending: "En attente",
  processing: "En traitement",
  completed: "Terminé",
  failed: "Échoué",
};

const STATUS_TONES: Record<QcmImportStatus, "slate" | "amber" | "teal" | "red"> = {
  pending: "slate",
  processing: "amber",
  completed: "teal",
  failed: "red",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export function QcmImportsSection({ title, desc }: { title: string; desc: string }) {
  const [imports, setImports] = useState<Paginated<QcmImport> | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [detail, setDetail] = useState<QcmImport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await qcmService.listImports({
        status: (status || undefined) as QcmImportStatus | undefined,
        per_page: 15,
        page,
      });
      setImports(res);
    } catch (e) {
      setImports(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [status, page, reload]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!imports) return;
    const active = imports.data.some((i) => i.status === "pending" || i.status === "processing");
    if (!active) return;
    const timer = setTimeout(() => setReload((r) => r + 1), 4000);
    return () => clearTimeout(timer);
  }, [imports]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Sélectionne un fichier CSV, TXT ou XLSX (2 Mo max).");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("dry_run", dryRun ? "1" : "0");
      const res = await qcmService.createImport(form);
      toast.success(res.message);
      setFile(null);
      setDryRun(true);
      const input = document.getElementById("qcm-import-file") as HTMLInputElement | null;
      if (input) input.value = "";
      setReload((r) => r + 1);
    } catch (err) {
      setUploadError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const openDetail = async (importId: number) => {
    setDetailLoading(true);
    try {
      const res = await qcmService.getImport(importId);
      setDetail(res);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setDetailLoading(false);
    }
  };

  const activeCount = imports?.data.filter(
    (i) => i.status === "pending" || i.status === "processing",
  ).length;

  const rows = (imports?.data ?? []).map((imp) => [
    <div key={imp.id}>
      <p className="font-extrabold text-ink dark:text-white">{imp.filename}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">
        {imp.user?.name ?? "—"}
        {imp.dry_run && " · simulation"}
      </p>
    </div>,
    <Badge key={`${imp.id}-status`} tone={STATUS_TONES[imp.status]}>
      {STATUS_LABELS[imp.status]}
    </Badge>,
    <div key={`${imp.id}-counts`} className="flex flex-wrap gap-1.5">
      <Badge tone="slate">{imp.total_rows} lignes</Badge>
      <Badge tone="teal">{imp.imported_count} importées</Badge>
      {imp.duplicate_count > 0 && <Badge tone="amber">{imp.duplicate_count} doublons</Badge>}
      {imp.failed_count > 0 && <Badge tone="red">{imp.failed_count} échecs</Badge>}
    </div>,
    formatDate(imp.finished_at ?? imp.created_at),
    <button
      key={`${imp.id}-open`}
      onClick={() => void openDetail(imp.id)}
      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-mina dark:hover:bg-white/8"
      aria-label={`Voir l’import ${imp.filename}`}
    >
      <Eye size={15} />
    </button>,
  ]);

  return (
    <>
      <PageHeader eyebrow="Administration Mina" title={title} description={desc} />

      <div className="mb-6 rounded-[22px] border border-line bg-white p-5 shadow-card dark:border-white/8 dark:bg-panel">
        <h2 className="text-sm font-extrabold">Importer un fichier de questions</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Formats acceptés : CSV, TXT ou XLSX, 2 Mo maximum. La simulation analyse le fichier sans
          rien importer.
        </p>
        <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <label
              htmlFor="qcm-import-file"
              className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400"
            >
              Fichier
            </label>
            <input
              id="qcm-import-file"
              type="file"
              accept=".csv,.txt,.xlsx"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setUploadError("");
              }}
              className="mt-2 block w-full text-xs font-semibold text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-mina/8 file:px-4 file:py-2.5 file:text-xs file:font-extrabold file:text-mina"
            />
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="h-4 w-4 accent-mina"
            />
            Simulation (dry run)
          </label>
          <Button type="submit" disabled={uploading}>
            {uploading ? <LoaderCircle size={15} className="animate-spin" /> : <Upload size={15} />}
            Lancer l’import
          </Button>
        </form>
        {uploadError && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
            {uploadError}
          </p>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-mina dark:border-white/10 dark:bg-panel"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="processing">En traitement</option>
          <option value="completed">Terminé</option>
          <option value="failed">Échoué</option>
        </select>
        {activeCount ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <RefreshCw size={13} className="animate-spin" />
            {activeCount} import(s) en cours — actualisation auto
          </span>
        ) : null}
      </div>

      {loadError && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {loadError}
        </div>
      )}

      {loading && !imports && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement des imports…
        </p>
      )}

      {!loading && !loadError && imports && imports.data.length === 0 && (
        <EmptyState
          icon={<Upload size={24} />}
          title="Aucun import"
          description="Les imports de questions QCM apparaîtront ici avec leur détail."
        />
      )}

      {imports && imports.data.length > 0 && (
        <>
          <DataTable headers={["Fichier", "Statut", "Résultats", "Date", ""]} rows={rows} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500">
            <span>
              Page {imports.meta.current_page} sur {imports.meta.last_page} · {imports.meta.total}{" "}
              import{imports.meta.total > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="secondary"
                disabled={page >= imports.meta.last_page}
                onClick={() => setPage((p) => Math.min(imports.meta.last_page, p + 1))}
              >
                Suivant
              </Button>
            </div>
          </div>
        </>
      )}

      {(detail || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[22px] bg-white p-6 dark:bg-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading || !detail ? (
              <p className="py-8 text-center text-sm font-bold text-slate-400">Chargement…</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold">{detail.filename}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone={STATUS_TONES[detail.status]}>
                        {STATUS_LABELS[detail.status]}
                      </Badge>
                      {detail.dry_run && <Badge tone="violet">Simulation</Badge>}
                    </div>
                  </div>
                  <button
                    onClick={() => setDetail(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8"
                    aria-label="Fermer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="font-bold text-slate-400">Lignes totales</p>
                    <p className="mt-1 text-lg font-extrabold">{detail.total_rows}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="font-bold text-slate-400">Importées</p>
                    <p className="mt-1 text-lg font-extrabold text-teal-600">
                      {detail.imported_count}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="font-bold text-slate-400">Doublons</p>
                    <p className="mt-1 text-lg font-extrabold text-amber-600">
                      {detail.duplicate_count}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="font-bold text-slate-400">Échecs</p>
                    <p className="mt-1 text-lg font-extrabold text-red-600">
                      {detail.failed_count}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] font-bold text-slate-400">
                  Démarré le {formatDate(detail.started_at ?? detail.created_at)}
                  {detail.finished_at && ` · Terminé le ${formatDate(detail.finished_at)}`}
                </p>
                {detail.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-extrabold">Erreurs</h4>
                    <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                      {detail.errors.map((err, i) =>
                        typeof err === "string" ? (
                          <div
                            key={i}
                            className="rounded-xl bg-red-50 p-3 text-[11px] text-red-700 dark:bg-red-500/10 dark:text-red-300"
                          >
                            {err}
                          </div>
                        ) : (
                          <div
                            key={i}
                            className="rounded-xl bg-red-50 p-3 text-[11px] text-red-700 dark:bg-red-500/10 dark:text-red-300"
                          >
                            <p className="font-extrabold">Ligne {err.row}</p>
                            <ul className="mt-1 list-disc pl-4">
                              {err.errors.map((msg, j) => (
                                <li key={j}>{msg}</li>
                              ))}
                            </ul>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
