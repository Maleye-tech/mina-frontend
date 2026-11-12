import { demoUsers, roleMeta } from "../../data/mocks";

export function DemoAccounts({ onSelect }: { onSelect: (email: string) => void }) {
  return (
    <div className="mt-8 border-t border-line pt-6 dark:border-white/8">
      <p className="mb-3 text-center text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">
        Comptes de démo — connexion immédiate
      </p>
      <div className="grid grid-cols-2 gap-2">
        {demoUsers.map((u) => (
          <button
            key={u.email}
            onClick={() => onSelect(u.email)}
            className="rounded-xl border border-line bg-white px-3 py-2.5 text-left text-[11px] font-bold transition hover:border-mina dark:border-white/10 dark:bg-panel"
          >
            <span className="block text-mina">{roleMeta[u.role].label}</span>
            <span className="text-slate-400">{u.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
