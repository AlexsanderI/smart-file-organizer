import fs from "fs";
import path from "path";
import { ScannedFile } from "../src/shared/types";
import {
  DEFAULT_TARGET_FOLDER,
  EXTENSION_RULES,
} from "../src/shared/fileRules";

export function scanFolder(folderPath: string): ScannedFile[] {
  const resolvedPath = path.resolve(folderPath);
  const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    if (!entry.isFile()) {
      return [];
    }

    const fullPath = path.join(resolvedPath, entry.name);
    let stats: fs.Stats;

    try {
      stats = fs.statSync(fullPath);
    } catch {
      return [];
    }

    if (!stats.isFile()) {
      return [];
    }

    const extension = path.extname(entry.name).slice(1).toLowerCase();
    const target = EXTENSION_RULES[extension] ?? DEFAULT_TARGET_FOLDER;

    const file: ScannedFile = {
      id: fullPath,
      name: entry.name,
      extension,
      size: stats.size,
      category: target,
      target,
      status: "Ready",
      path: fullPath,
    };

    return [file];
  });
}
