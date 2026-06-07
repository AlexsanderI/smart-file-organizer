import fs from "fs";
import path from "path";
import { readHistory } from "./historyStore";
import moveFiles, { MoveResultItem } from "./fileMover";

export interface UndoResult {
  ok: boolean;
  results?: MoveResultItem[];
  error?: string;
}

/**
 * Undo the latest operation from history.json.
 * Behavior:
 * - Reads the latest history record
 * - Reconstructs reverse move plan from either `operation.plan` or `operation.moved`
 * - Uses `moveFiles()` to perform safe moves (skips overwrites)
 * - Continues on per-file errors and returns per-file results
 */
export function undoLatestOperation(): UndoResult {
  try {
    const history = readHistory();
    if (!history || history.length === 0) {
      return { ok: false, error: "no history" };
    }

    const last = history[history.length - 1];
    const op = (last as any).operation ?? {};

    const reversePlans: Array<any> = [];

    if (Array.isArray(op.plan) && op.plan.length > 0) {
      for (const p of op.plan) {
        const src = p.targetPath;
        const dst = p.sourcePath;
        // skip if dst already exists to avoid overwrite
        const conflict = fs.existsSync(dst);
        reversePlans.push({
          id: p.id ?? p.name ?? dst,
          name: p.name ?? path.basename(dst),
          size: p.size ?? 0,
          sourcePath: src,
          targetPath: dst,
          conflict,
        });
      }
    } else if (Array.isArray(op.moved) && op.moved.length > 0) {
      for (const r of op.moved) {
        // r: MoveResultItem-like { sourcePath, targetPath, status }
        if (r.status !== "Moved") continue;
        const src = r.targetPath;
        const dst = r.sourcePath;
        const conflict = fs.existsSync(dst);
        reversePlans.push({
          id: r.id ?? dst,
          name: path.basename(dst),
          size: r.size ?? 0,
          sourcePath: src,
          targetPath: dst,
          conflict,
        });
      }
    } else {
      return {
        ok: false,
        error: "no actionable move data in latest history record",
      };
    }

    if (reversePlans.length === 0) {
      return { ok: false, error: "no files to undo" };
    }

    const results: MoveResultItem[] = moveFiles(reversePlans as any);

    return { ok: true, results };
  } catch (err: any) {
    return { ok: false, error: String(err) };
  }
}

export default undoLatestOperation;
