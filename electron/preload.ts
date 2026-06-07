import { contextBridge, ipcRenderer } from "electron";
import type { ScannedFile } from "../src/shared/types";

export interface FileOrganizerApi {
  selectFolder(): Promise<string | null>;
  scanFolder(folderPath: string): Promise<unknown>;
  buildMovePlan(request: {
    scannedFiles: ScannedFile[];
    destinationRoot: string;
  }): Promise<unknown>;
  moveFiles(request: { plans: unknown[] }): Promise<unknown>;
  undoLatestOperation(): Promise<unknown>;
}

// Inline the IPC channel names to avoid importing main-process modules
// into the preload bundle (which can cause runtime issues).
export const IPC_CHANNELS = {
  selectFolder: "file-organizer:select-folder",
  scanFolder: "file-organizer:scan-folder",
  buildMovePlan: "file-organizer:build-move-plan",
  moveFiles: "file-organizer:move-files",
  undoLatestOperation: "file-organizer:undo-latest-operation",
  readHistory: "file-organizer:read-history",
} as const;

// Build the API object once so we can expose it via contextBridge
// and also attach a safe fallback to the preload global for environments
// where the bridge might not be available (dev tooling edge-cases).
const electronApi: FileOrganizerApi & { platform: NodeJS.Platform } = {
  platform: process.platform,
  selectFolder: () => ipcRenderer.invoke(IPC_CHANNELS.selectFolder),
  scanFolder: (folderPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.scanFolder, folderPath),
  buildMovePlan: (request: {
    scannedFiles: ScannedFile[];
    destinationRoot: string;
  }) => ipcRenderer.invoke(IPC_CHANNELS.buildMovePlan, request),
  moveFiles: (request: { plans: unknown[] }) =>
    ipcRenderer.invoke(IPC_CHANNELS.moveFiles, request),
  undoLatestOperation: () =>
    ipcRenderer.invoke(IPC_CHANNELS.undoLatestOperation),
};

try {
  contextBridge.exposeInMainWorld("electron", electronApi);
} catch (err) {
  // In rare development setups the contextBridge call can fail — attach
  // a best-effort fallback to the global object in the preload scope.
  try {
    (globalThis as any).electron = electronApi;
  } catch (e) {
    // swallow — exposing the API isn't critical for runtime diagnostics
    // the renderer will surface a helpful error if methods are missing.
  }
}
