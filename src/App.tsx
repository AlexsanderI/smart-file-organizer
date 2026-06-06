import React, { useMemo, useState } from "react";
import { mockScan } from "./mock/mockScan";
import SummaryCard from "./components/SummaryCard";
import TopControls from "./components/TopControls";
import PreviewTable from "./components/PreviewTable";
import ConfirmMoveModal from "./components/ConfirmMoveModal";
import ConfirmUndoModal from "./components/ConfirmUndoModal";
import type { ScannedFile } from "./shared/types";

type FileFilter = "all" | "selected" | "ready" | "conflicts" | "to-review";

function bytesToKB(n: number) {
  return `${Math.round(n / 1024)} KB`;
}

const defaultFolder = "C:/Users/you/Downloads (mock)";
const alternateFolder = "C:/Users/you/Documents (mock)";

export default function App() {
  const [selectedFolder, setSelectedFolder] = useState<string>(defaultFolder);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<ScannedFile[]>(
    mockScan.files.map((file: any) => ({ ...file })),
  );
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [lastOperation, setLastOperation] = useState<ScannedFile[] | null>(
    null,
  );
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [expandDetailsMode, setExpandDetailsMode] = useState<
    "none" | "manual" | "selected" | "conflicts"
  >("none");
  const [activeFilter, setActiveFilter] = useState<FileFilter>("all");

  const toggleExpanded = (id: string) => {
    setExpandedIds((s) => ({ ...s, [id]: !s[id] }));
    setExpandDetailsMode("manual");
  };

  const toggleSelectedDetails = () => {
    if (expandDetailsMode === "selected") {
      setExpandedIds({});
      setExpandDetailsMode("none");
    } else {
      const expanded: Record<string, boolean> = {};
      files
        .filter((f) => selectedIds[f.id])
        .forEach((f) => {
          expanded[f.id] = true;
        });
      setExpandedIds(expanded);
      setExpandDetailsMode("selected");
    }
  };

  const toggleConflictDetails = () => {
    if (expandDetailsMode === "conflicts") {
      setExpandedIds({});
      setExpandDetailsMode("none");
    } else {
      const expanded: Record<string, boolean> = {};
      files
        .filter((f) => f.status === "Conflict" || f.status === "Failed")
        .forEach((f) => {
          expanded[f.id] = true;
        });
      setExpandedIds(expanded);
      setExpandDetailsMode("conflicts");
    }
  };

  const hideAllDetails = () => {
    setExpandedIds({});
    setExpandDetailsMode("none");
  };

  const summary = useMemo(
    () => ({
      total: files.length,
      ready: files.filter((f) => f.status === "Ready").length,
      conflicts: files.filter((f) => f.status === "Conflict").length,
      skipped: files.filter((f) => f.status === "Skipped").length,
      toReview: files.filter((f) => f.status === "To Review").length,
    }),
    [files],
  );

  const toggleSelect = (id: string) =>
    setSelectedIds((s) => ({ ...s, [id]: !s[id] }));
  const selectAll = () => {
    const all: Record<string, boolean> = {};
    visibleFiles.forEach((f) => (all[f.id] = true));
    setSelectedIds(all);
  };
  const deselectAll = () => setSelectedIds({});
  const selectOnlyReady = () => {
    const sel: Record<string, boolean> = {};
    visibleFiles
      .filter((f) => f.status === "Ready")
      .forEach((f) => (sel[f.id] = true));
    setSelectedIds(sel);
  };
  const deselectConflicts = () => {
    const sel = { ...selectedIds };
    files
      .filter((f) => f.status === "Conflict" || f.status === "Failed")
      .forEach((f) => delete sel[f.id]);
    setSelectedIds(sel);
  };
  const clearSelection = () => setSelectedIds({});
  const chooseFolder = () =>
    setSelectedFolder((c) =>
      c === defaultFolder ? alternateFolder : defaultFolder,
    );

  const resetMock = () => {
    setFiles(mockScan.files.map((file: ScannedFile) => ({ ...file })));
    setSelectedIds({});
    setShowMoveModal(false);
    setShowUndoModal(false);
    setLastOperation(null);
    setExpandedIds({});
    setExpandDetailsMode("none");
    setSelectedFolder(defaultFolder);
  };

  const moveSelected = () => {
    const toMove = files.filter(
      (f) => selectedIds[f.id] && f.status === "Ready",
    );
    if (toMove.length === 0) {
      setShowMoveModal(false);
      return;
    }
    setFiles((prev) => {
      const prevMap = new Map(prev.map((p) => [p.id, p]));
      toMove.forEach((t) => {
        const p = prevMap.get(t.id);
        if (p) p.status = "Moved";
      });
      setLastOperation(toMove.map((t) => ({ ...t })));
      return Array.from(prevMap.values());
    });
    setSelectedIds({});
    setShowMoveModal(false);
  };

  const undoLatest = () => {
    if (!lastOperation) return setShowUndoModal(false);
    setFiles((prev) => {
      const prevMap = new Map(prev.map((p) => [p.id, p]));
      lastOperation.forEach((op) => {
        const p = prevMap.get(op.id);
        if (p && p.status === "Moved") p.status = "Undone";
      });
      prevMap.forEach((v) => {
        if (v.status === "Undone") v.status = "Ready";
      });
      return Array.from(prevMap.values());
    });
    setLastOperation(null);
    setShowUndoModal(false);
  };

  const anySelected = Object.values(selectedIds).some(Boolean);
  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const conflictCount = files.filter(
    (f) => f.status === "Conflict" || f.status === "Failed",
  ).length;
  const canUndo = files.some((f) => f.status === "Moved");

  const visibleFiles = useMemo(() => {
    switch (activeFilter) {
      case "selected":
        return files.filter((f) => selectedIds[f.id]);
      case "ready":
        return files.filter((f) => f.status === "Ready");
      case "conflicts":
        return files.filter(
          (f) => f.status === "Conflict" || f.status === "Failed",
        );
      case "to-review":
        return files.filter((f) => f.status === "To Review");
      default:
        return files;
    }
  }, [activeFilter, files, selectedIds]);

  const filterLabel = useMemo(() => {
    switch (activeFilter) {
      case "selected":
        return `Selected files — ${visibleFiles.length}`;
      case "ready":
        return `Ready files — ${visibleFiles.length}`;
      case "conflicts":
        return `Conflicts — ${visibleFiles.length}`;
      case "to-review":
        return `To Review — ${visibleFiles.length}`;
      default:
        return `All files — ${visibleFiles.length}`;
    }
  }, [activeFilter, visibleFiles.length]);

  const openMoveModal = () => setShowMoveModal(true);
  const openUndoModal = () => setShowUndoModal(true);

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="grid h-full grid-cols-[280px_1fr] gap-4 p-4">
        <aside className="h-full overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col gap-3">
          <div>
            <h1 className="text-lg font-semibold">Smart File Organizer</h1>
          </div>

          <div className="text-slate-400 text-xs mb-2">Selected folder</div>
          <div
            className="text-sm border border-slate-800 rounded px-2 py-1 bg-slate-950 break-words"
            title={selectedFolder}
          >
            {selectedFolder}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <SummaryCard
              label="Total"
              count={summary.total}
              isActive={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
              activeClass="border-emerald-400/40 bg-slate-800"
              inactiveClass="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600"
            />
            <SummaryCard
              label="Selected"
              count={selectedCount}
              isActive={activeFilter === "selected"}
              onClick={() => setActiveFilter("selected")}
              activeClass="border-emerald-400/40 bg-slate-800"
              inactiveClass="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600"
            />
            <SummaryCard
              label="Ready"
              count={summary.ready}
              isActive={activeFilter === "ready"}
              onClick={() => setActiveFilter("ready")}
              activeClass="border-emerald-400/40 bg-slate-800"
              inactiveClass="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600"
            />
            <SummaryCard
              label="Conflicts"
              count={summary.conflicts}
              isActive={activeFilter === "conflicts"}
              onClick={() => setActiveFilter("conflicts")}
              activeClass="border-amber-400/40 bg-slate-800"
              inactiveClass="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600"
            />
            <SummaryCard
              label="To Review"
              count={summary.toReview}
              isActive={activeFilter === "to-review"}
              onClick={() => setActiveFilter("to-review")}
              activeClass="border-sky-400/40 bg-slate-800"
              inactiveClass="border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={chooseFolder}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-800 text-sm"
            >
              Choose Folder
            </button>
            <button
              onClick={resetMock}
              className="w-full px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-sm"
            >
              Rescan / Reset Mock Data
            </button>
            <button
              onClick={clearSelection}
              className="w-full px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-sm"
            >
              Clear Selection
            </button>
            <button
              onClick={openMoveModal}
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
              onClick={openUndoModal}
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

        <main className="flex h-full min-h-0 flex-col">
          <header className="shrink-0">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-semibold">Preview</h2>
                  <div className="text-slate-400 text-sm">
                    Preview detected files (mock data)
                  </div>
                </div>
              </div>

              <TopControls
                selectedCount={selectedCount}
                conflictCount={conflictCount}
                expandDetailsMode={expandDetailsMode}
                onSelectAll={selectAll}
                onClearSelection={clearSelection}
                onSelectOnlyReady={selectOnlyReady}
                onDeselectConflicts={deselectConflicts}
                onToggleSelectedDetails={toggleSelectedDetails}
                onToggleConflictDetails={toggleConflictDetails}
                onHideAllDetails={hideAllDetails}
              />
            </div>
          </header>

          <section className="min-h-0 flex-1 overflow-hidden">
            <div className="min-h-0 flex h-full flex-col overflow-hidden border border-slate-800 rounded-xl">
              <PreviewTable
                visibleFiles={visibleFiles}
                selectedIds={selectedIds}
                expandedFileIds={expandedIds}
                expandDetailsMode={expandDetailsMode}
                selectedCount={selectedCount}
                conflictCount={conflictCount}
                filterLabel={filterLabel}
                onToggleSelect={toggleSelect}
                onToggleExpanded={toggleExpanded}
              />
            </div>
          </section>
        </main>
      </div>

      {/* Move Confirmation Modal */}
      {showMoveModal && (
        <ConfirmMoveModal
          onCancel={() => setShowMoveModal(false)}
          onConfirm={moveSelected}
        />
      )}

      {/* Undo Confirmation Modal */}
      {showUndoModal && (
        <ConfirmUndoModal
          onCancel={() => setShowUndoModal(false)}
          onConfirm={undoLatest}
        />
      )}
    </div>
  );
}
