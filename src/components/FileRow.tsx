import StatusBadge from "./StatusBadge";
import type { ScannedFile } from "../shared/types";

type FileRowProps = {
  file: ScannedFile;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpanded: () => void;
};

function bytesToKB(n: number) {
  return `${Math.round(n / 1024)} KB`;
}

export default function FileRow({
  file,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpanded,
}: FileRowProps) {
  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800">
      <td className="w-[48px] px-3 py-2">
        <input type="checkbox" checked={isSelected} onChange={onToggleSelect} />
      </td>
      <td
        className="min-w-[260px] px-3 py-2 text-sm whitespace-nowrap truncate"
        title={file.name}
      >
        <span className="truncate">{file.name}</span>
      </td>
      <td
        className="w-[120px] px-3 py-2 text-sm whitespace-nowrap truncate"
        title={file.extension}
      >
        {file.extension}
      </td>
      <td
        className="w-[100px] px-3 py-2 text-sm whitespace-nowrap truncate"
        title={bytesToKB(file.size)}
      >
        {bytesToKB(file.size)}
      </td>
      <td className="w-[260px] px-3 py-2 text-sm whitespace-normal">
        <div className="truncate font-medium" title={file.target}>
          {file.target}
        </div>
        {file.target !== file.category && (
          <div className="mt-1 text-xs text-slate-500">
            {file.category} → {file.target}
          </div>
        )}
      </td>
      <td
        className="w-[130px] px-3 py-2 text-sm whitespace-nowrap truncate"
        title={file.status}
      >
        <StatusBadge status={file.status} />
      </td>
      <td className="w-[94px] px-3 py-2">
        <button
          onClick={onToggleExpanded}
          className={`inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 text-xs font-medium transition ${
            isExpanded
              ? "bg-slate-800 text-slate-100"
              : "bg-slate-950 text-slate-200 hover:bg-slate-800"
          }`}
        >
          {isExpanded ? "Hide ▴" : "View ▾"}
        </button>
      </td>
    </tr>
  );
}
