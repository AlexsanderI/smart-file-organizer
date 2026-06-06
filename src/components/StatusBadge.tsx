import type { FileStatus } from "../shared/types";

type StatusBadgeProps = {
  status: FileStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";

  const className = (() => {
    switch (status) {
      case "Ready":
        return `${base} bg-emerald-500/20 text-emerald-400`;
      case "Conflict":
        return `${base} bg-amber-500/20 text-amber-400`;
      case "Failed":
        return `${base} bg-rose-500/20 text-rose-400`;
      case "To Review":
        return `${base} bg-sky-500/20 text-sky-400`;
      case "Skipped":
        return `${base} bg-slate-500/20 text-slate-400`;
      case "Moved":
        return `${base} bg-cyan-500/20 text-cyan-400`;
      case "Undone":
        return `${base} bg-blue-500/20 text-blue-400`;
      default:
        return `${base} bg-slate-700/20 text-slate-400`;
    }
  })();

  return <span className={className}>{status}</span>;
}
