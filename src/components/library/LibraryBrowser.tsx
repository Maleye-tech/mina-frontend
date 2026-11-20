import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Headphones,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Star,
  Upload,
  X,
} from "lucide-react";
import { Badge, Button, Card } from "../ui/Primitives";
import { EmptyState } from "../ui/EmptyState";
import { ApiError } from "../../lib/api";
import { libraryService } from "../../services/libraryService";
import { useAuthStore } from "../../store/authStore";
import { toast } from "../../store/toastStore";
import type {
  CompressionStatus,
  ContentKind,
  FlatPaginated,
  Level,
  LibraryContent,
  LibraryContentDetail,
  Podcast,
  Subject,
} from "../../types/library";

type Tab = "contents" | "podcasts";

const PER_PAGE = 15;
const MAX_AUDIO_BYTES = 200 * 1024 * 1024;
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".aac", ".ogg"];

const TYPE_OPTIONS: { value: ContentKind | ""; label: string }[] = [
  { value: "", label: "Tous les types" },
  { value: "course", label: "Cours" },
  { value: "summary_sheet", label: "Fiche de synthèse" },
  { value: "recap", label: "Résumé" },
];

const CONTENT_KIND_OPTIONS: { value: ContentKind; label: string }[] = [
  { value: "course", label: "Cours" },
  { value: "summary_sheet", label: "Fiche de synthèse" },
  { value: "recap", label: "Résumé" },
];

const TYPE_TONES: Record<ContentKind, "teal" | "violet" | "amber"> = {
  course: "teal",
  summary_sheet: "violet",
  recap: "amber",
};

const COMPRESSION_TONES: Record<CompressionStatus, "teal" | "amber" | "violet" | "red" | "slate"> =
  {
    done: "teal",
    pending: "amber",
    processing: "violet",
    failed: "red",
    skipped: "slate",
  };

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 text-sm outline-none focus:border-mina dark:border-white/10 dark:bg-panel";
const textareaClass =
  "mt-2 w-full rounded-xl border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-mina dark:border-white/10 dark:bg-panel";
const selectClass =
  "h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-mina dark:border-white/10 dark:bg-panel";
const pagerButtonClass =
  "inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 disabled:opacity-40 dark:border-white/10 dark:bg-panel";

const BODY_CLASS =
  "text-sm leading-7 text-slate-700 dark:text-slate-300 [&_a]:font-bold [&_a]:text-mina [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-mina [&_blockquote]:pl-4 [&_h1]:my-3 [&_h1]:text-xl [&_h1]:font-extrabold [&_h2]:my-3 [&_h2]:text-lg [&_h2]:font-extrabold [&_h3]:my-2 [&_h3]:text-base [&_h3]:font-bold [&_img]:max-w-full [&_img]:rounded-xl [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-extrabold [&_table]:w-full [&_table]:text-xs [&_td]:border [&_td]:border-line [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-line [&_th]:bg-slate-50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:font-extrabold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 dark:[&_blockquote]:border-white/20 dark:[&_th]:bg-white/6 dark:[&_td]:border-white/10 dark:[&_th]:border-white/10";

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (Object.keys(e.fieldErrors).length) return Object.values(e.fieldErrors).join(" · ");
    return e.message;
  }
  return (e as Error).message;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${bytes} o`;
}

function isContent(item: LibraryContent | Podcast): item is LibraryContent {
  return "type" in item;
}

function Modal({
  title,
  action,
  onClose,
  children,
}: {
  title: string;
  action?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[22px] border border-line bg-white p-6 shadow-card dark:border-white/8 dark:bg-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <div className="flex shrink-0 items-center gap-1">
            {action}
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400" aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function StarButton({
  favorited,
  busy,
  onClick,
  className = "",
}: {
  favorited: boolean;
  busy?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={favorited}
      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`rounded-lg p-2 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-white/8 ${className}`}
    >
      <Star size={16} className={favorited ? "fill-amber-400 text-amber-400" : "text-slate-400"} />
    </button>
  );
}

function LibraryCard({
  item,
  subjectColor,
  favoriteBusy,
  onOpen,
  onEdit,
  onToggleFavorite,
}: {
  item: LibraryContent | Podcast;
  subjectColor: string;
  favoriteBusy: boolean;
  onOpen: () => void;
  onEdit?: () => void;
  onToggleFavorite: () => void;
}) {
  const content = isContent(item);
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {content ? (
            <Badge tone={TYPE_TONES[item.type]}>{item.type_label}</Badge>
          ) : (
            <>
              <Badge tone={COMPRESSION_TONES[item.compression_status]}>
                {item.compression_status_label}
              </Badge>
              <Badge tone="slate">{formatDuration(item.duration_seconds)}</Badge>
            </>
          )}
        </div>
        <StarButton
          favorited={item.favorited}
          busy={favoriteBusy}
          onClick={onToggleFavorite}
          className="-mr-2 -mt-1"
        />
      </div>
      <h3 className="mt-3 text-sm font-extrabold leading-5">{item.title}</h3>
      {item.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {item.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: subjectColor }} />
          {item.subject.name}
        </span>
        <span aria-hidden>·</span>
        <span>{item.level.name}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 dark:border-white/8">
        <span className="text-[10px] text-slate-400">{formatDate(item.created_at)}</span>
        <div className="flex items-center gap-1">
          {content && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Modifier ${item.title}`}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-mina dark:hover:bg-white/8"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-mina transition hover:bg-mina/8"
          >
            {content ? <BookOpen size={14} /> : <Headphones size={14} />}
            {content ? "Lire" : "Écouter"}
          </button>
        </div>
      </div>
    </Card>
  );
}

function UploadPodcastModal({
  subjects,
  levels,
  onClose,
  onDone,
}: {
  subjects: Subject[];
  levels: Level[];
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Sélectionne un fichier audio.");
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      setError("Le fichier dépasse la limite de 200 Mo.");
      return;
    }
    const lower = file.name.toLowerCase();
    if (!AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      setError("Format accepté : mp3, wav, m4a, aac ou ogg.");
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      data.append("audio", file);
      data.append("title", title.trim());
      data.append("subject_id", subjectId);
      data.append("level_id", levelId);
      if (description.trim()) data.append("description", description.trim());
      data.append("is_published", isPublished ? "1" : "0");
      const res = await libraryService.createPodcast(data);
      onDone(res.message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = Boolean(title.trim() && subjectId && levelId) && !saving;

  return (
    <Modal title="Ajouter un podcast" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs font-bold">
          Fichier audio *
          <input
            type="file"
            accept=".mp3,.wav,.m4a,.aac,.ogg,audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError("");
            }}
            className="mt-2 block w-full text-xs font-semibold file:mr-3 file:rounded-xl file:border-0 file:bg-mina/10 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-mina"
          />
          <span className="mt-1 block text-[10px] font-medium text-slate-400">
            mp3, wav, m4a, aac ou ogg — 200 Mo max.
          </span>
        </label>
        <label className="block text-xs font-bold">
          Titre *
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Révision — cardio"
            maxLength={255}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold">
            Matière *
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className={inputClass}
            >
              <option value="">Choisir…</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold">
            Niveau *
            <select
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
              className={inputClass}
            >
              <option value="">Choisir…</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-xs font-bold">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
            rows={3}
            className={textareaClass}
            placeholder="Facultatif — 1000 caractères max."
          />
        </label>
        <label className="flex items-center gap-3 text-xs font-bold">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="accent-mina"
          />
          Publier immédiatement
        </label>
        <p className="text-[11px] leading-4 text-slate-400">
          Sinon le podcast reste invisible des listes. La compression audio est mise en file
          d’attente après l’envoi.
        </p>
        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={saving} disabled={!canSubmit}>
            <Upload size={15} />
            Envoyer le podcast
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ContentFormModal({
  contentId,
  subjects,
  levels,
  onClose,
  onDone,
}: {
  contentId?: number;
  subjects: Subject[];
  levels: Level[];
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const editing = contentId !== undefined;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ContentKind>("course");
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [body, setBody] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contentId === undefined) return;
    let cancelled = false;
    (async () => {
      try {
        const c = await libraryService.getContent(contentId);
        if (cancelled) return;
        setTitle(c.title);
        setDescription(c.description ?? "");
        setType(c.type);
        setSubjectId(String(c.subject.id));
        setLevelId(String(c.level.id));
        setBody(c.body);
        setIsPublished(c.is_published);
      } catch (e) {
        if (!cancelled) setLoadError(errorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Le titre est requis.");
      return;
    }
    if (!subjectId || !levelId) {
      setError("La matière et le niveau sont requis.");
      return;
    }
    if (!body.trim()) {
      setError("Le contenu HTML est requis.");
      return;
    }
    setSaving(true);
    try {
      const input = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        subject_id: Number(subjectId),
        level_id: Number(levelId),
        body,
        is_published: isPublished,
      };
      const res =
        contentId === undefined
          ? await libraryService.createContent(input)
          : await libraryService.updateContent(contentId, input);
      onDone(res.message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    !loading &&
    !loadError &&
    Boolean(title.trim() && subjectId && levelId && body.trim()) &&
    !saving;

  return (
    <Modal title={editing ? "Modifier le contenu" : "Ajouter un contenu"} onClose={onClose}>
      {loading && (
        <p className="flex items-center justify-center gap-2 py-10 text-sm font-bold text-slate-400">
          <LoaderCircle size={18} className="animate-spin" />
          Chargement du contenu…
        </p>
      )}
      {loadError && (
        <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {loadError}
        </p>
      )}
      {!loading && !loadError && (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-xs font-bold">
            Titre *
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Cardiologie — cours 1"
              maxLength={255}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-bold">
              Type *
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContentKind)}
                className={inputClass}
              >
                {CONTENT_KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold">
              Matière *
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className={inputClass}
              >
                <option value="">Choisir…</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold">
              Niveau *
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                className={inputClass}
              >
                <option value="">Choisir…</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-xs font-bold">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
              rows={2}
              className={textareaClass}
              placeholder="Facultatif — 1000 caractères max."
            />
          </label>
          <label className="block text-xs font-bold">
            Contenu (HTML) *
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              spellCheck={false}
              className={`${textareaClass} font-mono text-xs leading-5`}
              placeholder={"<h2>Titre de la section</h2>\n<p>Texte du cours…</p>"}
            />
            <span className="mt-1 block text-[10px] font-medium text-slate-400">
              HTML riche accepté : &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;table&gt;…
              — rendu tel quel côté étudiant.
            </span>
          </label>
          <label className="flex items-center gap-3 text-xs font-bold">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-mina"
            />
            Publié (visible des étudiants)
          </label>
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={saving} disabled={!canSubmit}>
              {editing ? "Enregistrer" : "Créer le contenu"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function LibraryBrowser() {
  const role = useAuthStore((s) => s.user?.role);
  const canUpload = role === "super_admin";

  const [tab, setTab] = useState<Tab>("contents");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [type, setType] = useState<ContentKind | "">("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [contents, setContents] = useState<FlatPaginated<LibraryContent> | null>(null);
  const [podcasts, setPodcasts] = useState<FlatPaginated<Podcast> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [favBusy, setFavBusy] = useState<number | null>(null);

  const [detail, setDetail] = useState<{ tab: Tab; id: number } | null>(null);
  const [detailItem, setDetailItem] = useState<LibraryContentDetail | Podcast | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [contentForm, setContentForm] = useState<{ contentId?: number } | null>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [subs, lvls] = await Promise.all([
          libraryService.subjects(),
          libraryService.levels(),
        ]);
        if (cancelled) return;
        setSubjects(subs);
        setLevels(lvls);
      } catch (e) {
        if (!cancelled) toast.error(errorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    const seq = ++seqRef.current;
    setLoading(true);
    setLoadError("");
    try {
      const params = {
        search: search || undefined,
        subject_id: subjectId ? Number(subjectId) : undefined,
        level_id: levelId ? Number(levelId) : undefined,
        favorite: favoriteOnly ? true : undefined,
        per_page: PER_PAGE,
        page,
      };
      if (tab === "contents") {
        const res = await libraryService.listContents({ ...params, type: type || undefined });
        if (seq !== seqRef.current) return;
        setContents(res);
        setPodcasts(null);
      } else {
        const res = await libraryService.listPodcasts(params);
        if (seq !== seqRef.current) return;
        setPodcasts(res);
        setContents(null);
      }
    } catch (e) {
      if (seq !== seqRef.current) return;
      setContents(null);
      setPodcasts(null);
      setLoadError(errorMessage(e));
    } finally {
      if (seq === seqRef.current) setLoading(false);
    }
  }, [tab, search, subjectId, levelId, type, favoriteOnly, page, reload]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!detail) {
      setDetailItem(null);
      setDetailError("");
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError("");
    setDetailItem(null);
    (async () => {
      try {
        const item =
          detail.tab === "contents"
            ? await libraryService.getContent(detail.id)
            : await libraryService.getPodcast(detail.id);
        if (!cancelled) setDetailItem(item);
      } catch (e) {
        if (!cancelled) setDetailError(errorMessage(e));
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detail]);

  const toggleFavorite = useCallback(
    async (item: LibraryContent | Podcast) => {
      if (favBusy !== null) return;
      setFavBusy(item.id);
      try {
        const res = isContent(item)
          ? item.favorited
            ? await libraryService.unfavoriteContent(item.id)
            : await libraryService.favoriteContent(item.id)
          : item.favorited
            ? await libraryService.unfavoritePodcast(item.id)
            : await libraryService.favoritePodcast(item.id);
        toast.success(res.message);
        setContents((c) =>
          c
            ? {
                ...c,
                data: c.data.map((x) =>
                  x.id === item.id ? { ...x, favorited: res.favorited } : x,
                ),
              }
            : c,
        );
        setPodcasts((p) =>
          p
            ? {
                ...p,
                data: p.data.map((x) =>
                  x.id === item.id ? { ...x, favorited: res.favorited } : x,
                ),
              }
            : p,
        );
        setDetailItem((d) => (d && d.id === item.id ? { ...d, favorited: res.favorited } : d));
      } catch (e) {
        toast.error(errorMessage(e));
      } finally {
        setFavBusy(null);
      }
    },
    [favBusy],
  );

  const switchTab = (next: Tab) => {
    setTab(next);
    setPage(1);
    setDetail(null);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setSubjectId("");
    setLevelId("");
    setType("");
    setFavoriteOnly(false);
    setPage(1);
  };

  const filtersActive = Boolean(search || subjectId || levelId || type || favoriteOnly);
  const active = tab === "contents" ? contents : podcasts;
  const items: (LibraryContent | Podcast)[] = active ? active.data : [];
  const subjectColor = (id: number) => subjects.find((s) => s.id === id)?.color ?? "#94a3b8";

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-line bg-white p-1 dark:border-white/10 dark:bg-panel">
          {(["contents", "podcasts"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                tab === t
                  ? "bg-mina text-white"
                  : "text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {t === "contents" ? "Contenus" : "Podcasts"}
            </button>
          ))}
        </div>
        {canUpload && (
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setContentForm({})}>
              <Plus size={15} />
              Ajouter un contenu
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload size={15} />
              Ajouter un podcast
            </Button>
          </div>
        )}
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher un titre, une matière…"
            className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-xs outline-none focus:border-mina dark:border-white/10 dark:bg-panel"
          />
        </div>
        <select
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">Toutes les matières</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={levelId}
          onChange={(e) => {
            setLevelId(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">Tous les niveaux</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        {tab === "contents" && (
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as ContentKind | "");
              setPage(1);
            }}
            className={selectClass}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => {
            setFavoriteOnly((v) => !v);
            setPage(1);
          }}
          className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-xs font-bold transition ${
            favoriteOnly
              ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300"
              : "border-line bg-white text-slate-500 hover:border-amber-300 dark:border-white/10 dark:bg-panel dark:text-slate-400"
          }`}
        >
          <Star size={14} className={favoriteOnly ? "fill-amber-400 text-amber-400" : ""} />
          Favoris
        </button>
        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="h-11 rounded-xl px-3 text-xs font-bold text-slate-400 transition hover:text-mina"
          >
            Effacer
          </button>
        )}
      </div>

      {loadError && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          <span>{loadError}</span>
          <Button variant="secondary" onClick={() => void load()}>
            Réessayer
          </Button>
        </div>
      )}

      {loading && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement de la bibliothèque…
        </p>
      )}

      {!loading && !loadError && active && active.data.length === 0 && (
        <EmptyState
          icon={tab === "contents" ? <BookOpen size={24} /> : <Headphones size={24} />}
          title={
            filtersActive
              ? "Aucun résultat"
              : tab === "contents"
                ? "Aucun contenu publié"
                : "Aucun podcast publié"
          }
          description={
            filtersActive
              ? "Aucun élément ne correspond à ces filtres."
              : "Le catalogue se remplira dès que des éléments seront publiés."
          }
          action={
            page > 1 ? (
              <Button variant="secondary" onClick={() => setPage(1)}>
                Revenir à la page 1
              </Button>
            ) : undefined
          }
        />
      )}

      {!loading && !loadError && active && active.data.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <LibraryCard
                key={`${tab}-${item.id}`}
                item={item}
                subjectColor={subjectColor(item.subject.id)}
                favoriteBusy={favBusy === item.id}
                onOpen={() => setDetail({ tab, id: item.id })}
                onEdit={
                  canUpload && tab === "contents"
                    ? () => setContentForm({ contentId: item.id })
                    : undefined
                }
                onToggleFavorite={() => void toggleFavorite(item)}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500">
            <span>
              Page {active.current_page} sur {active.last_page} · {active.total} élément
              {active.total > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={pagerButtonClass}
              >
                <ChevronLeft size={14} />
                Précédent
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(active.last_page, p + 1))}
                disabled={page >= active.last_page}
                className={pagerButtonClass}
              >
                Suivant
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {detail && (
        <Modal
          title={detailItem ? detailItem.title : detailLoading ? "Chargement…" : "Détail"}
          action={
            detailItem ? (
              <div className="flex items-center gap-1">
                {canUpload && "body" in detailItem && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = detailItem.id;
                      setDetail(null);
                      setContentForm({ contentId: id });
                    }}
                    aria-label="Modifier ce contenu"
                    className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-white/8"
                  >
                    <Pencil size={16} className="text-slate-400" />
                  </button>
                )}
                <StarButton
                  favorited={detailItem.favorited}
                  busy={favBusy === detailItem.id}
                  onClick={() => void toggleFavorite(detailItem)}
                />
              </div>
            ) : undefined
          }
          onClose={() => setDetail(null)}
        >
          {detailLoading && (
            <p className="flex items-center justify-center gap-2 py-10 text-sm font-bold text-slate-400">
              <LoaderCircle size={18} className="animate-spin" />
              Chargement…
            </p>
          )}
          {detailError && (
            <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
              {detailError}
            </p>
          )}
          {!detailLoading && !detailError && detailItem && "body" in detailItem && (
            <article className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={TYPE_TONES[detailItem.type]}>{detailItem.type_label}</Badge>
                <Badge tone="slate">{detailItem.subject.name}</Badge>
                <Badge tone="slate">{detailItem.level.name}</Badge>
              </div>
              {detailItem.description && (
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {detailItem.description}
                </p>
              )}
              <div className={BODY_CLASS} dangerouslySetInnerHTML={{ __html: detailItem.body }} />
            </article>
          )}
          {!detailLoading && !detailError && detailItem && "audio_url" in detailItem && (
            <article className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={COMPRESSION_TONES[detailItem.compression_status]}>
                  {detailItem.compression_status_label}
                </Badge>
                <Badge tone="slate">{detailItem.subject.name}</Badge>
                <Badge tone="slate">{detailItem.level.name}</Badge>
                <Badge tone="slate">{formatDuration(detailItem.duration_seconds)}</Badge>
                <Badge tone="slate">{formatBytes(detailItem.size_bytes)}</Badge>
              </div>
              {detailItem.description && (
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {detailItem.description}
                </p>
              )}
              <audio controls src={detailItem.audio_url} className="w-full" />
            </article>
          )}
        </Modal>
      )}

      {uploadOpen && (
        <UploadPodcastModal
          subjects={subjects}
          levels={levels}
          onClose={() => setUploadOpen(false)}
          onDone={(message) => {
            setUploadOpen(false);
            toast.success(message);
            setTab("podcasts");
            setPage(1);
            setReload((r) => r + 1);
          }}
        />
      )}

      {contentForm && (
        <ContentFormModal
          contentId={contentForm.contentId}
          subjects={subjects}
          levels={levels}
          onClose={() => setContentForm(null)}
          onDone={(message) => {
            setContentForm(null);
            toast.success(message);
            setTab("contents");
            setPage(1);
            setReload((r) => r + 1);
          }}
        />
      )}
    </>
  );
}
