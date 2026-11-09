import { Check } from "lucide-react";

export function RegisterStepper({ step }: { step: number }) {
  return (
    <div className="mb-10 flex items-center justify-between">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="flex flex-1 items-center last:flex-none">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${n <= step ? "bg-mina text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10"}`}
          >
            {n < step ? <Check size={16} /> : n}
          </div>
          {n < 4 && (
            <div
              className={`h-1 w-full ${n < step ? "bg-mina" : "bg-slate-200 dark:bg-white/10"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
