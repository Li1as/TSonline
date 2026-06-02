interface StatusBadgeProps {
  label: string;
  tone?: "neutral" | "accent" | "success" | "danger";
}

const toneClasses = {
  neutral: "bg-zinc-100 text-zinc-700",
  accent: "bg-indigo-50 text-indigo-700",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-rose-50 text-rose-700",
};

export function StatusBadge({
  label,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
