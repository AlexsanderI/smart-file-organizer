import React from "react";
import SummaryCard from "./SummaryCard";

type FileFilter = "all" | "selected" | "ready" | "conflicts" | "to-review";

type SidebarProps = {
  selectedFolder: string;
  summary: {
    total: number;
    ready: number;
    conflicts: number;
    skipped: number;
    toReview: number;
  };
  activeFilter: FileFilter;
  selectedCount: number;
  anySelected: boolean;
  canUndo: boolean;
  onFilterChange: (filter: FileFilter) => void;
  onChooseFolder: () => void;
  onRescan: () => void;
  onClearSelection: () => void;
  onOpenMoveModal: () => void;
  onOpenUndoModal: () => void;
};

export default function Sidebar({
  selectedFolder,
  summary,
  activeFilter,
  selectedCount,
  anySelected,
  canUndo,
  onFilterChange,
  onChooseFolder,
  onRescan,
  onClearSelection,
  onOpenMoveModal,
  onOpenUndoModal,
}: SidebarProps) {
  return (
    <aside className="h-full overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-semibold">Smart File Organizer</h1>
      </div>

      <div className="text-slate-400 text-xs mb-2">Selected folder</div>
      <div
        className="text-sm border border-slate-800 rounded px-2 py-1 bg-slate-950 break-words"
        title={selectedFolder || "No folder selected"}
      >
        {selectedFolder || "No folder selected"}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <SummaryCard
          label="Total"
          count={summary.total}
          isActive={activeFilter === "all"}
          onClick={() => onFilterChange("all")}
          activeClass="border-emerald-400/40 bg-slate-800"
          inactiveClass="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600"
        />
        <SummaryCard
          label="Selected"
          count={selectedCount}
          isActive={activeFilter === "selected"}
          onClick={() => onFilterChange("selected")}
          activeClass="border-emerald-400/40 bg-slate-800"
          inactiveClass="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600"
        />
        <SummaryCard
          label="Ready"
          count={summary.ready}
          isActive={activeFilter === "ready"}
          onClick={() => onFilterChange("ready")}
          activeClass="border-emerald-400/40 bg-slate-800"
          inactiveClass="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600"
        />
        <SummaryCard
          label="Conflicts"
          count={summary.conflicts}
          isActive={activeFilter === "conflicts"}
          onClick={() => onFilterChange("conflicts")}
          activeClass="border-amber-400/40 bg-slate-800"
          inactiveClass="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600"
        />
        <SummaryCard
          label="To Review"
          count={summary.toReview}
          isActive={activeFilter === "to-review"}
          onClick={() => onFilterChange("to-review")}
          activeClass="border-sky-400/40 bg-slate-800"
          inactiveClass="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600"
        />
      </div>

      <div className="space-y-2">
        <button
          onClick={onChooseFolder}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-800 text-sm"
        >
          Choose Folder
        </button>
        <button
          onClick={onRescan}
          className="w-full px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-sm"
        >
          Rescan Folder
        </button>
        <button
          onClick={onClearSelection}
          className="w-full px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-sm"
        >
          Clear Selection
        </button>
        <button
          onClick={onOpenMoveModal}
          disabled={!anySelected}
          className={`w-full px-3 py-2 border rounded text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
            anySelected
              ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-500"
              : "bg-slate-950 border-slate-700 text-slate-600"
          }`}
        >
          Move Selected Files
        </button>
        <button
          onClick={onOpenUndoModal}
          disabled={!canUndo}
          className={`w-full px-3 py-2 border rounded text-sm ${
            canUndo
              ? "bg-transparent border-slate-700 hover:bg-slate-800"
              : "bg-slate-950 border-slate-700 text-slate-600"
          }`}
        >
          Undo Latest Operation
        </button>
      </div>
    </aside>
  );
}
