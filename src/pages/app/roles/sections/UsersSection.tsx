import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Badge, Button } from "../../../../components/ui/Primitives";
import { DataTable, PageHeader } from "../../../../components/dashboard/Common";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { ApiError } from "../../../../lib/api";
import {
  frontRoleToApiRole,
  usersService,
  type EditableRole,
  type ManagedRole,
} from "../../../../services/usersService";
import { useAuthStore } from "../../../../store/authStore";
import { toast } from "../../../../store/toastStore";
import type { User } from "../../../../types";
import type { PaginationMeta } from "../../../../types/api";

const ROLE_OPTIONS: { value: EditableRole; label: string }[] = [
  { value: "student", label: "Étudiant" },
  { value: "ambassador", label: "Ambassadeur" },
  { value: "professional", label: "Professionnel" },
  { value: "admin", label: "Admin" },
];

const CREATE_ROLE_OPTIONS: { value: ManagedRole; label: string }[] = [
  { value: "ambassador", label: "Ambassadeur" },
  { value: "professional", label: "Professionnel" },
];

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 text-sm outline-none focus:border-mina dark:border-white/10 dark:bg-panel";

function formatDate(value?: string) {
  if (!value) return "—";
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

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (Object.keys(e.fieldErrors).length) return Object.values(e.fieldErrors).join(" · ");
    return e.message;
  }
  return (e as Error).message;
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[22px] border border-line bg-white p-6 shadow-card dark:border-white/8 dark:bg-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; user: User }
  | { mode: "delete"; user: User }
  | null;

export function UsersSection({ title, desc }: { title: string; desc: string }) {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<User[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState<ModalState>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await usersService.list({
        search,
        role: roleFilter || undefined,
        is_active: activeFilter === "" ? undefined : activeFilter === "true",
        per_page: 15,
        page,
      });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (e) {
      setUsers(null);
      setMeta(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, activeFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const exportCsv = () => {
    if (!users?.length) return;
    const headers = [
      "id",
      "name",
      "email",
      "role",
      "role_label",
      "status",
      "email_verified",
      "created_at",
    ];
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(";"),
      ...users.map((u) =>
        [u.id, u.name, u.email, u.role, u.roleLabel, u.status, u.emailVerified, u.createdAt]
          .map(escape)
          .join(";"),
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "utilisateurs-mina.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const tableRows = (users ?? []).map((u) => [
    <div key={u.id}>
      <p className="font-extrabold text-ink dark:text-white">{u.name}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">{u.email}</p>
    </div>,
    u.roleLabel ?? u.role,
    <div key={`${u.id}-badges`} className="flex flex-wrap gap-1.5">
      <Badge tone={u.isActive === false ? "red" : "teal"}>
        {u.isActive === false ? "Désactivé" : "Actif"}
      </Badge>
      {u.emailVerified === false && <Badge tone="amber">Email non vérifié</Badge>}
    </div>,
    formatDate(u.createdAt),
    <div key={`${u.id}-actions`} className="flex gap-1">
      <button
        onClick={() => setModal({ mode: "edit", user: u })}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-mina dark:hover:bg-white/8"
        aria-label={`Modifier ${u.name}`}
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={() => setModal({ mode: "delete", user: u })}
        disabled={u.id === currentUser?.id}
        title={u.id === currentUser?.id ? "Impossible de supprimer son propre compte" : undefined}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-500/10"
        aria-label={`Supprimer ${u.name}`}
      >
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title={title}
        description={desc}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportCsv} disabled={!users?.length}>
              <Download size={15} />
              Export CSV
            </Button>
            <Button onClick={() => setModal({ mode: "create" })}>
              <Plus size={15} />
              Ajouter un utilisateur
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher par nom ou email…"
            className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-xs outline-none focus:border-mina dark:border-white/10 dark:bg-panel"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-mina dark:border-white/10 dark:bg-panel"
        >
          <option value="">Tous les rôles</option>
          <option value="student">Étudiant</option>
          <option value="ambassador">Ambassadeur</option>
          <option value="professional">Professionnel</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-mina dark:border-white/10 dark:bg-panel"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Désactivés</option>
        </select>
      </div>

      {loadError && (
        <div className="mb-5 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {loadError}
        </div>
      )}

      {loading && (
        <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
          Chargement des utilisateurs…
        </p>
      )}

      {!loading && users && users.length === 0 && (
        <EmptyState
          icon={<UserRound size={24} />}
          title="Aucun utilisateur trouvé"
          description={
            search || roleFilter || activeFilter
              ? "Aucun compte ne correspond à ces filtres."
              : "Crée ton premier compte depuis le bouton « Ajouter un utilisateur »."
          }
        />
      )}

      {!loading && users && users.length > 0 && (
        <>
          <DataTable
            headers={["Utilisateur", "Rôle", "Statut", "Inscription", "Actions"]}
            rows={tableRows}
          />
          {meta && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500">
              <span>
                Page {meta.current_page} sur {meta.last_page} · {meta.total} compte
                {meta.total > 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 disabled:opacity-40 dark:border-white/10 dark:bg-panel"
                >
                  <ChevronLeft size={14} />
                  Précédent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page >= meta.last_page}
                  className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 disabled:opacity-40 dark:border-white/10 dark:bg-panel"
                >
                  Suivant
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {modal?.mode === "create" && (
        <CreateUserModal
          onClose={() => setModal(null)}
          onDone={async (message) => {
            setModal(null);
            toast.success(message);
            await load();
          }}
        />
      )}
      {modal?.mode === "edit" && (
        <EditUserModal
          user={modal.user}
          isSelf={modal.user.id === currentUser?.id}
          onClose={() => setModal(null)}
          onDone={async (message) => {
            setModal(null);
            toast.success(message);
            await load();
          }}
        />
      )}
      {modal?.mode === "delete" && (
        <DeleteUserModal
          user={modal.user}
          onClose={() => setModal(null)}
          onDone={async (message) => {
            setModal(null);
            toast.success(message);
            if (users?.length === 1 && page > 1) setPage(page - 1);
            else await load();
          }}
        />
      )}
    </>
  );
}

function CreateUserModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (message: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ManagedRole>("ambassador");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await usersService.create({ name: name.trim(), email: email.trim(), role });
      await onDone(res.message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal title="Ajouter un utilisateur" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs font-bold">
          Nom complet
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Mina Pro"
          />
        </label>
        <label className="block text-xs font-bold">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="pro@mail.com"
          />
        </label>
        <label className="block text-xs font-bold">
          Rôle
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as ManagedRole)}
            className={inputClass}
          >
            {CREATE_ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-[11px] leading-4 text-slate-400">
          Les liens de définition du mot de passe et de vérification seront envoyés par email.
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
          <Button loading={saving} disabled={!name.trim() || !email.trim()}>
            Créer le compte
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({
  user,
  isSelf,
  onClose,
  onDone,
}: {
  user: User;
  isSelf: boolean;
  onClose: () => void;
  onDone: (message: string) => Promise<void>;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<EditableRole>(frontRoleToApiRole(user.role));
  const [isActive, setIsActive] = useState(user.isActive !== false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await usersService.update(user.id!, {
        name: name.trim(),
        email: email.trim(),
        ...(isSelf ? {} : { role, is_active: isActive }),
      });
      await onDone(res.message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal title={`Modifier ${user.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs font-bold">
          Nom complet
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-xs font-bold">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-xs font-bold">
          Rôle
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as EditableRole)}
            disabled={isSelf}
            className={inputClass}
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {isSelf && (
            <span className="mt-1 block text-[10px] text-slate-400">
              Impossible de modifier son propre rôle.
            </span>
          )}
        </label>
        <label
          className={`flex items-center gap-3 text-xs font-bold ${isSelf ? "opacity-50" : ""}`}
        >
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isSelf}
            className="accent-mina"
          />
          Compte actif
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
          <Button loading={saving} disabled={!name.trim() || !email.trim()}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteUserModal({
  user,
  onClose,
  onDone,
}: {
  user: User;
  onClose: () => void;
  onDone: (message: string) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const submit = async () => {
    setError("");
    setDeleting(true);
    try {
      const message = await usersService.remove(user.id!);
      await onDone(message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Modal title="Supprimer le compte" onClose={onClose}>
      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
        Supprimer le compte de <strong>{user.name}</strong> ({user.email}) ? Cette action est
        définitive.
      </p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <button
          onClick={submit}
          disabled={deleting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
        >
          {deleting && <LoaderCircle size={16} className="animate-spin" />}
          Supprimer
        </button>
      </div>
    </Modal>
  );
}
