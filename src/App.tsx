import React, { useMemo, useState } from "react";
import { mockScan } from "./mock/mockScan";
import StatusBadge from "./components/StatusBadge";
import SummaryCard from "./components/SummaryCard";
import TopControls from "./components/TopControls";
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

  const getStatusAccent = (status: string) => {
    switch (status) {
      case "Ready":
        return "border-l-4 border-emerald-400/60 bg-slate-900/70";
      case "Conflict":
        return "border-l-4 border-amber-400/60 bg-slate-900/70";
      case "Failed":
        return "border-l-4 border-rose-400/60 bg-slate-900/70";
      case "To Review":
        return "border-l-4 border-sky-400/60 bg-slate-900/70";
      case "Skipped":
        return "border-l-4 border-slate-500/60 bg-slate-900/70";
      case "Moved":
        return "border-l-4 border-cyan-400/60 bg-slate-900/70";
      case "Undone":
        return "border-l-4 border-violet-400/60 bg-slate-900/70";
      default:
        return "border-l-4 border-slate-700/60 bg-slate-900/70";
    }
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
              <div className="min-h-0 border-b border-slate-800 bg-slate-950/80 p-3">
                <div className="text-slate-400 text-sm">
                  {expandDetailsMode === "none"
                    ? "Click View on a row or use bulk controls to expand details."
                    : expandDetailsMode === "selected"
                      ? `Showing details for ${selectedCount} selected file(s). Click Hide Selected Details or Hide Details to collapse.`
                      : expandDetailsMode === "conflicts"
                        ? `Showing details for ${conflictCount} conflict file(s). Click Hide Conflict Details or Hide Details to collapse.`
                        : "Individual row details are expanded. Click View/Hide per row or Hide Details."}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="border-b border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-300">
                  Showing: {filterLabel}
                </div>
                <table className="w-full table-fixed">
                  <thead className="bg-slate-900 border-b border-slate-800 sticky top-0">
                    <tr className="text-left text-slate-400 text-sm">
                      <th className="w-[48px] px-3 py-2"> </th>
                      <th className="min-w-[220px] px-3 py-2">Name</th>
                      <th className="w-[120px] px-3 py-2">Ext</th>
                      <th className="w-[100px] px-3 py-2">Size</th>
                      <th className="w-[260px] px-3 py-2">Destination</th>
                      <th className="w-[130px] px-3 py-2">Status</th>
                      <th className="w-[94px] px-3 py-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleFiles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-16 text-center text-slate-400"
                        >
                          No files match this filter. Click Total to show all
                          files.
                        </td>
                      </tr>
                    ) : (
                      visibleFiles.map((f) => (
                        <React.Fragment key={f.id}>
                          <tr className="border-b border-slate-800 hover:bg-slate-800">
                            <td className="w-[48px] px-3 py-2">
                              <input
                                type="checkbox"
                                checked={!!selectedIds[f.id]}
                                onChange={() => toggleSelect(f.id)}
                              />
                            </td>
                            <td
                              className="min-w-[260px] px-3 py-2 text-sm whitespace-nowrap truncate"
                              title={f.name}
                            >
                              <span className="truncate">{f.name}</span>
                            </td>
                            <td
                              className="w-[120px] px-3 py-2 text-sm whitespace-nowrap truncate"
                              title={f.extension}
                            >
                              {f.extension}
                            </td>
                            <td
                              className="w-[100px] px-3 py-2 text-sm whitespace-nowrap truncate"
                              title={bytesToKB(f.size)}
                            >
                              {bytesToKB(f.size)}
                            </td>
                            <td className="w-[260px] px-3 py-2 text-sm whitespace-normal">
                              <div
                                className="truncate font-medium"
                                title={f.target}
                              >
                                {f.target}
                              </div>
                              {f.target !== f.category && (
                                <div className="mt-1 text-xs text-slate-500">
                                  {f.category} → {f.target}
                                </div>
                              )}
                            </td>
                            <td
                              className="w-[130px] px-3 py-2 text-sm whitespace-nowrap truncate"
                              title={f.status}
                            >
                              <StatusBadge status={f.status} />
                            </td>
                            <td className="w-[94px] px-3 py-2">
                              <button
                                onClick={() => toggleExpanded(f.id)}
                                className={`inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 text-xs font-medium transition ${
                                  expandedIds[f.id]
                                    ? "bg-slate-800 text-slate-100"
                                    : "bg-slate-950 text-slate-200 hover:bg-slate-800"
                                }`}
                              >
                                {expandedIds[f.id] ? "Hide ▴" : "View ▾"}
                              </button>
                            </td>
                          </tr>
                          {expandedIds[f.id] && (
                            <tr
                              key={`${f.id}-details`}
                              className="border-b border-slate-800"
                            >
                              <td colSpan={7} className="px-3 py-2">
                                <div
                                  className={`rounded-2xl p-4 ${getStatusAccent(f.status)} text-slate-200`}
                                >
                                  <div className="grid gap-3 lg:grid-cols-2">
                                    <div className="space-y-2 text-xs leading-5 text-slate-300">
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          File name:
                                        </span>{" "}
                                        {f.name}
                                      </div>
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Extension:
                                        </span>{" "}
                                        {f.extension}
                                      </div>
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Status:
                                        </span>{" "}
                                        {f.status}
                                      </div>
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Category:
                                        </span>{" "}
                                        {f.category}
                                      </div>
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Target:
                                        </span>{" "}
                                        {f.target}
                                      </div>
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Source path:
                                        </span>
                                        <div className="break-words text-slate-300">
                                          {f.path}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-2 text-xs leading-5 text-slate-300">
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Target path:
                                        </span>
                                        <div className="break-words text-slate-300">
                                          {(f as any).targetPath ?? "n/a"}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Classification source:
                                        </span>{" "}
                                        {f.classificationSource ?? "extension"}
                                      </div>
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Confidence:
                                        </span>{" "}
                                        {f.confidence ?? "n/a"}
                                      </div>
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Reason:
                                        </span>{" "}
                                        {f.reason ?? "n/a"}
                                      </div>
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Manual override:
                                        </span>{" "}
                                        {f.manualCategory ?? "none"}
                                      </div>
                                      <div>
                                        <span className="font-medium text-slate-100">
                                          Error message:
                                        </span>{" "}
                                        {f.status === "Failed"
                                          ? "There was a problem moving this file."
                                          : "None"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
