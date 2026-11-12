const STATS = [
  ["+60 %", "d’échec en 1re année", true],
  ["5 000+", "QCM contextualisés", false],
  ["100 %", "accessible hors-ligne", false],
  ["3 jours", "d’essai gratuit", false],
] as const;

export function StatsStrip() {
  return (
    <section className="border-y border-line bg-white dark:border-white/8 dark:bg-panel">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-line px-5 md:grid-cols-4 md:divide-y-0 dark:divide-white/8">
        {STATS.map(([value, label, alert]) => (
          <div key={value} className="px-4 py-8 text-center">
            <p className={`text-2xl font-extrabold ${alert ? "text-red-500" : "text-mina"}`}>
              {value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
