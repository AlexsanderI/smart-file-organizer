/// <reference types="vite/client" />

import type { ScannedFile } from "./shared/types";

export interface MovePlanItem {
  id: string;
  name: string;
  size: number;
  sourcePath: string;
  targetFolder: string;
  targetPath: string;
  conflict: boolean;
  reason?: string | null;
}

export interface MoveResultItem {
  id: string;
  sourcePath: string;
  targetPath: string;
  status: ScannedFile["status"];
  error?: string | null;
}

declare global {
  interface Window {
    electron: {
      platform: string;
      selectFolder(): Promise<string | null>;
      scanFolder(
        folderPath: string,
      ): Promise<
        | { ok: true; data: { files: ScannedFile[] } }
        | { ok: false; error: string }
      >;
      buildMovePlan(request: {
        scannedFiles: ScannedFile[];
        destinationRoot: string;
      }): Promise<
        | { ok: true; data: { plan: MovePlanItem[] } }
        | { ok: false; error: string }
      >;
      moveFiles(request: {
        plans: MovePlanItem[];
      }): Promise<
        | { ok: true; data: { results: MoveResultItem[] } }
        | { ok: false; error: string }
      >;
      undoLatestOperation(): Promise<
        { ok: true; results?: MoveResultItem[] } | { ok: false; error: string }
      >;
    };
  }
}

export {};
