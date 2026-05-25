import React, { useMemo, useState } from "react";
import { mockScan } from "@/mock/mockScan";
import { ScannedFile } from "@/shared/types";

function bytesToKB(n: number) {
  return `${Math.round(n / 1024)} KB`;
}

const defaultFolder = "C:/Users/you/Downloads (mock)";
const alternateFolder = "C:/Users/you/Documents (mock)";

export default function App() {
  const [selectedFolder, setSelectedFolder] = useState<string>(defaultFolder);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<ScannedFile[]>(
    mockScan.files.map((file) => ({ ...file })),
  );
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [lastOperation, setLastOperation] = useState<ScannedFile[] | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

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
    files.forEach((f) => (all[f.id] = true));
    setSelectedIds(all);
  };
  const deselectAll = () => setSelectedIds({});
  const selectOnlyReady = () => {
    const sel: Record<string, boolean> = {};
    files
      .filter((f) => f.status === "Ready")
      .forEach((f) => (sel[f.id] = true));
    setSelectedIds(sel);
  };
  const deselectConflicts = () => {
    const sel = { ...selectedIds };
    files
      .filter((f) => f.status === "Conflict")
      .forEach((f) => delete sel[f.id]);
    setSelectedIds(sel);
  };
  const clearSelection = () => setSelectedIds({});
  const chooseFolder = () =>
    setSelectedFolder((c) =>
      c === defaultFolder ? alternateFolder : defaultFolder,
    );

  const resetMock = () => {
    setFiles(mockScan.files.map((file) => ({ ...file })));
    setSelectedIds({});
    setShowMoveModal(false);
    setShowUndoModal(false);
    setLastOperation(null);
    setDetailsOpen(false);
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
  const selectedFiles = files.filter((f) => selectedIds[f.id]);
  const canUndo = files.some((f) => f.status === "Moved");
  const openMoveModal = () => setShowMoveModal(true);
  const openUndoModal = () => setShowUndoModal(true);

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="grid h-full grid-cols-[280px_1fr] gap-4 p-4">
        <aside className="h-full overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col gap-3">
          <div>
            <h1 className="text-lg font-semibold">Smart File Organizer</h1>
            <p className="text-slate-400 text-xs">Phase 1 — mock preview</p>
          </div>

          <div className="text-slate-400 text-xs">Selected folder</div>
          <div className="text-sm border border-slate-800 rounded px-2 py-2 bg-slate-950 truncate">
            {selectedFolder}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2 border border-slate-800 rounded bg-slate-900 text-center">
              <div className="text-slate-400 text-xs">Total</div>
              <div className="text-lg font-medium">{summary.total}</div>
            </div>
            <div className="p-2 border border-slate-800 rounded bg-slate-900 text-center">
              <div className="text-slate-400 text-xs">Selected</div>
              <div className="text-lg font-medium">{selectedCount}</div>
            </div>
            <div className="p-2 border border-slate-800 rounded bg-slate-900 text-center">
              <div className="text-slate-400 text-xs">Ready</div>
              <div className="text-lg font-medium">{summary.ready}</div>
            </div>
            <div className="p-2 border border-slate-800 rounded bg-slate-900 text-center">
              <div className="text-slate-400 text-xs">Conflicts</div>
              <div className="text-lg font-medium">{summary.conflicts}</div>
            </div>
            <div className="p-2 border border-slate-800 rounded bg-slate-900 text-center col-span-2">
              <div className="text-slate-400 text-xs">To Review</div>
              <div className="text-lg font-medium">{summary.toReview}</div>
            </div>
          </div>

          <div className="mt-2 space-y-1">
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
              onClick={() => setDetailsOpen(true)}
              className="w-full px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-sm"
            >
              Show Details
            </button>
            <button
              onClick={openMoveModal}
              disabled={!anySelected}
              className={`w-full px-3 py-2 border rounded text-sm ${anySelected ? "bg-slate-800 border-slate-700 hover:bg-slate-800" : "bg-slate-950 border-slate-700 text-slate-600 cursor-not-allowed"}`}
            >
              Move Selected Files
            </button>
            <button
              onClick={openUndoModal}
              disabled={!canUndo}
              className={`w-full px-3 py-2 border rounded text-sm ${canUndo ? "bg-transparent border-slate-700 hover:bg-slate-800" : "bg-slate-950 border-slate-700 text-slate-600 cursor-not-allowed"}`}
            >
              Undo Latest Operation
            </button>
          </div>
        </aside>

        <main className="flex h-full min-h-0 flex-col">
          <header className="shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-semibold">Preview</h2>
                <div className="text-slate-400 text-sm">
                  Preview detected files (mock data)
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-800 text-sm"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-sm"
                >
                  Deselect All
                </button>
                <button
                  onClick={selectOnlyReady}
                  className="px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-sm"
                >
                  Select Only Ready
                </button>
                <button
                  onClick={deselectConflicts}
                  className="px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-sm"
                >
                  Deselect Conflicts
                </button>
              </div>
            </div>
          </header>

          <section
            className="grid min-h-0 flex-1 gap-4"
            style={{ gridTemplateColumns: detailsOpen ? "1fr 380px" : "1fr" }}
          >
            <div className="min-h-0 overflow-hidden border border-slate-800 rounded-xl">
              <div className="min-h-0 overflow-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-slate-900 border-b border-slate-800 sticky top-0">
                    <tr className="text-left text-slate-400 text-sm">
                      <th className="w-[48px] px-3 py-2"> </th>
                      <th className="min-w-[220px] px-3 py-2">Name</th>
                      <th className="w-[120px] px-3 py-2">Ext</th>
                      <th className="w-[100px] px-3 py-2">Size</th>
                      <th className="w-[160px] px-3 py-2">Category</th>
                      <th className="w-[180px] px-3 py-2">Target</th>
                      <th className="w-[130px] px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((f) => (
                      <tr
                        key={f.id}
                        className="border-b border-slate-800 hover:bg-slate-800"
                      >
                        <td className="w-[48px] px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!selectedIds[f.id]}
                            onChange={() => toggleSelect(f.id)}
                          />
                        </td>
                        <td
                          className="min-w-[220px] px-3 py-2 text-sm whitespace-nowrap truncate"
                          title={f.name}
                        >
                          {f.name}
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
                        <td
                          className="w-[160px] px-3 py-2 text-sm whitespace-nowrap truncate"
                          title={f.category}
                        >
                          {f.category}
                        </td>
                        <td
                          className="w-[180px] px-3 py-2 text-sm whitespace-nowrap truncate"
                          title={f.target}
                        >
                          {f.target}
                        </td>
                        <td
                          className="w-[130px] px-3 py-2 text-sm whitespace-nowrap truncate"
                          title={f.status}
                        >
                          {f.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {detailsOpen && (
              <aside className="min-h-0 overflow-hidden border border-slate-800 rounded-xl bg-slate-900 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Details</h3>
                  <button
                    onClick={() => setDetailsOpen(false)}
                    className="px-2 py-1 bg-transparent border border-slate-700 rounded hover:bg-slate-800 text-sm"
                  >
                    Close
                  </button>
                </div>
                <div className="text-slate-400 text-sm mb-2">
                  Showing {selectedFiles.length} selected file(s)
                </div>
                <div className="space-y-2 overflow-auto max-h-[calc(100%-64px)]">
                  {selectedFiles.length === 0 ? (
                    <div className="text-slate-400">
                      Select one or more files to view details.
                    </div>
                  ) : (
                    selectedFiles.map((f) => (
                      <div
                        key={f.id}
                        className="p-2 border border-slate-800 rounded bg-slate-950"
                      >
                        <div className="font-medium truncate" title={f.name}>
                          {f.name}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          Status: {f.status}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          Category: {f.category}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          Target: {f.target}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          Source: {f.classificationSource ?? "extension"}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          Confidence: {f.confidence ?? "n/a"}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          Reason: {f.reason ?? "n/a"}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          Manual override: {f.manualCategory ?? "none"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </aside>
            )}
          </section>
        </main>
      </div>

      {/* Move Confirmation Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-96 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold">Confirm Move</h3>
            <p className="text-slate-400 text-sm mt-2">
              You are about to move selected files. Conflicts will be skipped.
              No files will be deleted.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={moveSelected}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-800"
              >
                Move Selected Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Confirmation Modal */}
      {showUndoModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-96 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold">Confirm Undo</h3>
            <p className="text-slate-400 text-sm mt-2">
              This will attempt to restore files from the latest operation. Undo
              is best-effort and file-level atomic.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowUndoModal(false)}
                className="px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={undoLatest}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-800"
              >
                Undo Latest Operation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
