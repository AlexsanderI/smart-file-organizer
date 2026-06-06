import type { ScannedFile } from "../shared/types";

type ExpandedFileDetailsProps = {
  file: ScannedFile;
};

function getStatusAccent(status: string) {
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
}

export default function ExpandedFileDetails({
  file,
}: ExpandedFileDetailsProps) {
  return (
    <tr className="border-b border-slate-800">
      <td colSpan={7} className="px-3 py-2">
        <div
          className={`rounded-2xl p-4 ${getStatusAccent(file.status)} text-slate-200`}
        >
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-2 text-xs leading-5 text-slate-300">
              <div>
                <span className="font-medium text-slate-100">File name:</span>{" "}
                {file.name}
              </div>
              <div>
                <span className="font-medium text-slate-100">Extension:</span>{" "}
                {file.extension}
              </div>
              <div>
                <span className="font-medium text-slate-100">Status:</span>{" "}
                {file.status}
              </div>
              <div>
                <span className="font-medium text-slate-100">Category:</span>{" "}
                {file.category}
              </div>
              <div>
                <span className="font-medium text-slate-100">Target:</span>{" "}
                {file.target}
              </div>
              <div>
                <span className="font-medium text-slate-100">Source path:</span>
                <div className="break-words text-slate-300">{file.path}</div>
              </div>
            </div>
            <div className="space-y-2 text-xs leading-5 text-slate-300">
              <div>
                <span className="font-medium text-slate-100">Target path:</span>
                <div className="break-words text-slate-300">
                  {(file as any).targetPath ?? "n/a"}
                </div>
              </div>
              <div>
                <span className="font-medium text-slate-100">
                  Classification source:
                </span>{" "}
                {file.classificationSource ?? "extension"}
              </div>
              <div>
                <span className="font-medium text-slate-100">Confidence:</span>{" "}
                {file.confidence ?? "n/a"}
              </div>
              <div>
                <span className="font-medium text-slate-100">Reason:</span>{" "}
                {file.reason ?? "n/a"}
              </div>
              <div>
                <span className="font-medium text-slate-100">
                  Manual override:
                </span>{" "}
                {file.manualCategory ?? "none"}
              </div>
              <div>
                <span className="font-medium text-slate-100">
                  Error message:
                </span>{" "}
                {file.status === "Failed"
                  ? "There was a problem moving this file."
                  : "None"}
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
