type ExpandDetailsMode = "none" | "manual" | "selected" | "conflicts";

type TopControlsProps = {
  selectedCount: number;
  conflictCount: number;
  expandDetailsMode: ExpandDetailsMode;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectOnlyReady: () => void;
  onDeselectConflicts: () => void;
  onToggleSelectedDetails: () => void;
  onToggleConflictDetails: () => void;
  onHideAllDetails: () => void;
};

export default function TopControls({
  selectedCount,
  conflictCount,
  expandDetailsMode,
  onSelectAll,
  onClearSelection,
  onSelectOnlyReady,
  onDeselectConflicts,
  onToggleSelectedDetails,
  onToggleConflictDetails,
  onHideAllDetails,
}: TopControlsProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        <button
          onClick={onSelectAll}
          className="px-3 py-1 bg-slate-800 border border-slate-700 rounded hover:bg-slate-800 text-xs"
        >
          Select All
        </button>
        <button
          onClick={onClearSelection}
          className="px-3 py-1 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-xs"
        >
          Deselect All
        </button>
        <button
          onClick={onSelectOnlyReady}
          className="px-3 py-1 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-xs"
        >
          Select Only Ready
        </button>
        <button
          onClick={onDeselectConflicts}
          className="px-3 py-1 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-xs"
        >
          Deselect Conflicts
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        <button
          onClick={onToggleSelectedDetails}
          disabled={selectedCount === 0}
          className={`px-3 py-1 border rounded text-xs transition ${
            selectedCount === 0
              ? "bg-slate-950 border-slate-700 text-slate-600"
              : expandDetailsMode === "selected"
                ? "bg-slate-800 border-slate-700"
                : "bg-transparent border-slate-700 hover:bg-slate-800"
          }`}
        >
          {expandDetailsMode === "selected"
            ? `Hide Selected Details (${selectedCount})`
            : `Show Selected Details (${selectedCount})`}
        </button>
        <button
          onClick={onToggleConflictDetails}
          disabled={conflictCount === 0}
          className={`px-3 py-1 border rounded text-xs transition ${
            conflictCount === 0
              ? "bg-slate-950 border-slate-700 text-slate-600"
              : expandDetailsMode === "conflicts"
                ? "bg-slate-800 border-slate-700"
                : "bg-transparent border-slate-700 hover:bg-slate-800"
          }`}
        >
          {expandDetailsMode === "conflicts"
            ? `Hide Conflict Details (${conflictCount})`
            : `Show Conflict Details (${conflictCount})`}
        </button>
        <button
          onClick={onHideAllDetails}
          disabled={expandDetailsMode === "none"}
          className={`px-3 py-1 border rounded text-xs ${
            expandDetailsMode === "none"
              ? "bg-slate-950 border-slate-700 text-slate-600"
              : "bg-transparent border-slate-700 hover:bg-slate-800"
          }`}
        >
          Hide Details
        </button>
      </div>
    </div>
  );
}
