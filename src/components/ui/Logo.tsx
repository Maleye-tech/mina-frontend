import { Link } from "react-router";

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Mina, accueil">
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect width="40" height="40" rx="13" fill="#0F766E" />
        <path d="M20 9v22M9 20h22" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M13.2 17.4c0-2.1 2.7-3 4-1.3l2.8 3.7 2.8-3.7c1.3-1.7 4-.8 4 1.3 0 5.1-6.8 9.2-6.8 9.2s-6.8-4.1-6.8-9.2Z"
          fill="#F5A524"
        />
      </svg>
      {!compact && (
        <span
          className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-ink dark:text-white"}`}
        >
          mina<span className="text-mina">.</span>
        </span>
      )}
    </Link>
  );
}
