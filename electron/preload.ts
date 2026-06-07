import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./ipcHandlers";

export interface FileOrganizerApi {
  selectFolder(): Promise<string | null>;
  scanFolder(folderPath: string): Promise<unknown>;
  moveFiles(request: { plans: unknown[] }): Promise<unknown>;
  undoLatestOperation(): Promise<unknown>;
}

contextBridge.exposeInMainWorld("electron", {
  platform: process.platform,
  selectFolder: () => ipcRenderer.invoke(IPC_CHANNELS.selectFolder),
  scanFolder: (folderPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.scanFolder, folderPath),
  moveFiles: (request: { plans: unknown[] }) =>
    ipcRenderer.invoke(IPC_CHANNELS.moveFiles, request),
  undoLatestOperation: () =>
    ipcRenderer.invoke(IPC_CHANNELS.undoLatestOperation),
});
