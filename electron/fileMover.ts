import fs from "fs";
import path from "path";
import { FileStatus } from "../src/shared/types";
import { MovePlanItem } from "./movePlanner";

export interface MoveResultItem {
  id: string;
  sourcePath: string;
  targetPath: string;
  status: FileStatus;
  error?: string | null;
}

function safeRename(src: string, dest: string) {
  try {
    fs.renameSync(src, dest);
    return { ok: true };
  } catch (err: any) {
    // EXDEV: cross-device rename not permitted — fall back to copy + unlink
    if (err && err.code === "EXDEV") {
      try {
        fs.copyFileSync(src, dest);
        try {
          fs.unlinkSync(src);
        } catch (unlinkErr: any) {
          return {
            ok: false,
            error: `moved but failed to remove source: ${String(unlinkErr)}`,
          };
        }
        return { ok: true };
      } catch (copyErr: any) {
        return { ok: false, error: String(copyErr) };
      }
    }

    return { ok: false, error: String(err) };
  }
}

/**
 * Move files according to a move plan.
 * Safety rules enforced:
 * - Never overwrite existing destination files (skip and mark Conflict)
 * - Never delete files except as part of a successful move (rename or copy+unlink)
 * - Per-file errors are returned; processing continues for remaining files
 */
export function moveFiles(plans: MovePlanItem[]): MoveResultItem[] {
  const results: MoveResultItem[] = [];

  for (const p of plans) {
    const res: MoveResultItem = {
      id: p.id,
      sourcePath: p.sourcePath,
      targetPath: p.targetPath,
      status: "Failed",
      error: null,
    };

    try {
      // If planner already detected conflict, skip
      if (p.conflict || fs.existsSync(p.targetPath)) {
        res.status = "Conflict";
        res.error = "destination exists";
        results.push(res);
        continue;
      }

      // Ensure target directory exists
      const dir = path.dirname(p.targetPath);
      fs.mkdirSync(dir, { recursive: true });

      const moved = safeRename(p.sourcePath, p.targetPath);
      if (moved.ok) {
        res.status = "Moved";
        res.error = null;
      } else {
        res.status = "Failed";
        res.error = moved.error || "unknown error";
      }
    } catch (err: any) {
      res.status = "Failed";
      res.error = String(err);
    }

    results.push(res);
  }

  return results;
}

export default moveFiles;
