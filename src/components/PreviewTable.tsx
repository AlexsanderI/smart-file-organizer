import React from "react";
import type { ScannedFile } from "../shared/types";
import FileRow from "./FileRow";
import ExpandedFileDetails from "./ExpandedFileDetails";

type PreviewTableProps = {
  visibleFiles: ScannedFile[];
  selectedIds: Record<string, boolean>;
  expandedFileIds: Record<string, boolean>;
  expandDetailsMode: "none" | "manual" | "selected" | "conflicts";
  selectedCount: number;
  conflictCount: number;
  filterLabel: string;
  onToggleSelect: (id: string) => void;
  onToggleExpanded: (id: string) => void;
};

export default function PreviewTable({
  visibleFiles,
  selectedIds,
  expandedFileIds,
  expandDetailsMode,
  selectedCount,
  conflictCount,
  filterLabel,
  onToggleSelect,
  onToggleExpanded,
}: PreviewTableProps) {
  return (
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
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    No files match this filter. Click Total to show all files.
                  </td>
                </tr>
              ) : (
                visibleFiles.map((file) => (
                  <React.Fragment key={file.id}>
                    <FileRow
                      file={file}
                      isSelected={!!selectedIds[file.id]}
                      isExpanded={!!expandedFileIds[file.id]}
                      onToggleSelect={() => onToggleSelect(file.id)}
                      onToggleExpanded={() => onToggleExpanded(file.id)}
                    />
                    {expandedFileIds[file.id] && (
                      <ExpandedFileDetails file={file} />
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
