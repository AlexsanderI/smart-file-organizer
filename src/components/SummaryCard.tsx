type SummaryCardProps = {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  activeClass: string;
  inactiveClass: string;
};

export default function SummaryCard({
  label,
  count,
  isActive,
  onClick,
  activeClass,
  inactiveClass,
}: SummaryCardProps) {
  const baseClass =
    "p-2 border rounded text-center transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
    >
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="text-lg font-medium">{count}</div>
    </button>
  );
}
