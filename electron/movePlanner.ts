import fs from "fs";
import path from "path";
import { ScannedFile } from "../src/shared/types";
import {
  EXTENSION_RULES,
  DEFAULT_TARGET_FOLDER,
} from "../src/shared/fileRules";

export interface MovePlanItem {
  id: string;
  name: string;
  size: number;
  sourcePath: string;
  targetFolder: string; // e.g. 01_Documents
  targetPath: string; // full destination path
  conflict: boolean;
  reason?: string | null;
}

/**
 * Build a deterministic move plan for scanned files.
 * - Uses `scannedFile.target` when present, otherwise falls back to `EXTENSION_RULES`.
 * - Constructs `targetPath` under the provided `destinationRoot`.
 * - Marks `conflict` when the target path already exists (no overwrite).
 */
export function buildMovePlan(
  scannedFiles: ScannedFile[],
  destinationRoot: string,
): MovePlanItem[] {
  const root = path.resolve(destinationRoot);

  return scannedFiles.map((f) => {
    const extLookup = (f.extension || "").toLowerCase();
    const targetFolder =
      f.target || EXTENSION_RULES[extLookup] || DEFAULT_TARGET_FOLDER;

    const targetDir = path.join(root, targetFolder);
    const targetPath = path.join(targetDir, f.name);

    const conflict = fs.existsSync(targetPath);

    const item: MovePlanItem = {
      id: f.id,
      name: f.name,
      size: f.size,
      sourcePath: f.path,
      targetFolder,
      targetPath,
      conflict,
      reason: conflict ? "destination exists" : null,
    };

    return item;
  });
}

export default buildMovePlan;
