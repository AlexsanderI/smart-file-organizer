import React, { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopControls from "./components/TopControls";
import PreviewTable from "./components/PreviewTable";
import ConfirmMoveModal from "./components/ConfirmMoveModal";
import ConfirmUndoModal from "./components/ConfirmUndoModal";
import type { ScannedFile } from "./shared/types";

type FileFilter = "all" | "selected" | "ready" | "conflicts" | "to-review";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

type MoveResultItem = {
  id: string;
  sourcePath: string;
  targetPath: string;
  status: ScannedFile["status"];
  error?: string | null;
};

export default function App() {
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [expandDetailsMode, setExpandDetailsMode] = useState<
    "none" | "manual" | "selected" | "conflicts"
  >("none");
  const [activeFilter, setActiveFilter] = useState<FileFilter>("all");
  const [scanError, setScanError] = useState<string | null>(null);

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

  const scanFolder = async (folderPath: string) => {
    const response = (await window.electron.scanFolder(
      folderPath,
    )) as ApiResponse<{ files: ScannedFile[] }>;

    if (response.ok) {
      setSelectedFolder(folderPath);
      setScanError(null);
      setFiles(response.data.files);
      setSelectedIds({});
      setExpandedIds({});
      setExpandDetailsMode("none");
      setActiveFilter("all");
      return;
    }

    setScanError(response.error);
    setFiles([]);
  };

  const chooseFolder = async () => {
    const folder = await window.electron.selectFolder();
    if (folder) {
      await scanFolder(folder);
    }
  };

  const rescanFolder = async () => {
    if (!selectedFolder) {
      await chooseFolder();
      return;
    }

    await scanFolder(selectedFolder);
  };

  const moveSelected = async () => {
    const toMove = files.filter(
      (f) => selectedIds[f.id] && f.status === "Ready",
    );

    if (toMove.length === 0 || !selectedFolder) {
      setShowMoveModal(false);
      return;
    }

    const planResponse = (await window.electron.buildMovePlan({
      scannedFiles: toMove,
      destinationRoot: selectedFolder,
    })) as ApiResponse<{ plan: unknown[] }>;

    if (!planResponse.ok) {
      setScanError(planResponse.error);
      setShowMoveModal(false);
      return;
    }

    const moveResponse = (await window.electron.moveFiles({
      plans: planResponse.data.plan as any[],
    })) as ApiResponse<{ results: MoveResultItem[] }>;

    if (!moveResponse.ok) {
      setScanError(moveResponse.error);
      setShowMoveModal(false);
      return;
    }

    const results = moveResponse.data.results;
    setFiles((prev) =>
      prev.map((file) => {
        const result = results.find((r) => r.id === file.id);
        if (!result) {
          return file;
        }

        return {
          ...file,
          status: result.status,
          reason: result.error ?? file.reason,
        };
      }),
    );

    setSelectedIds({});
    setShowMoveModal(false);
  };

  const undoLatest = async () => {
    const undoResponse = (await window.electron.undoLatestOperation()) as
      | { ok: true; results?: MoveResultItem[] }
      | { ok: false; error: string };

    if (!undoResponse.ok) {
      setScanError(undoResponse.error);
      setShowUndoModal(false);
      return;
    }

    if (selectedFolder) {
      await scanFolder(selectedFolder);
    }

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
        <Sidebar
          selectedFolder={selectedFolder}
          summary={summary}
          activeFilter={activeFilter}
          selectedCount={selectedCount}
          anySelected={anySelected}
          canUndo={canUndo}
          onFilterChange={setActiveFilter}
          onChooseFolder={chooseFolder}
          onRescan={rescanFolder}
          onClearSelection={clearSelection}
          onOpenMoveModal={openMoveModal}
          onOpenUndoModal={openUndoModal}
        />

        <main className="flex h-full min-h-0 flex-col">
          <header className="shrink-0">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-semibold">Preview</h2>
                  <div className="text-slate-400 text-sm">
                    {scanError
                      ? `Scan error: ${scanError}`
                      : selectedFolder
                        ? "Preview detected files"
                        : "Choose a folder to scan"}
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

      {showMoveModal && (
        <ConfirmMoveModal
          onCancel={() => setShowMoveModal(false)}
          onConfirm={moveSelected}
        />
      )}

      {showUndoModal && (
        <ConfirmUndoModal
          onCancel={() => setShowUndoModal(false)}
          onConfirm={undoLatest}
        />
      )}
    </div>
  );
}
