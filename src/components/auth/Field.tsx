export function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-mina focus:ring-3 focus:ring-mina/10 dark:border-white/10 dark:bg-[#0d1625]"
      />
    </label>
  );
}
