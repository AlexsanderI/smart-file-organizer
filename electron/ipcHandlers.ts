import { dialog, ipcMain } from "electron";
import { ScannedFile } from "../src/shared/types";
import { scanFolder } from "./fileScanner";
import buildMovePlan, { MovePlanItem } from "./movePlanner";
import moveFiles, { MoveResultItem } from "./fileMover";
import { appendHistory, readHistory, HistoryRecord } from "./historyStore";
import { undoLatestOperation, UndoResult } from "./undoService";

export const IPC_CHANNELS = {
  selectFolder: "file-organizer:select-folder",
  scanFolder: "file-organizer:scan-folder",
  buildMovePlan: "file-organizer:build-move-plan",
  moveFiles: "file-organizer:move-files",
  undoLatestOperation: "file-organizer:undo-latest-operation",
  readHistory: "file-organizer:read-history",
} as const;

export interface ScanFolderResponse {
  files: ScannedFile[];
}

export interface BuildMovePlanRequest {
  scannedFiles: ScannedFile[];
  destinationRoot: string;
}

export interface MoveFilesRequest {
  plans: MovePlanItem[];
}

export interface MoveFilesResponse {
  results: MoveResultItem[];
}

export interface ReadHistoryResponse {
  history: HistoryRecord[];
}

function safeResponse<T>(data: T) {
  return { ok: true as const, data };
}

function errorResponse(error: string) {
  return { ok: false as const, error };
}

export function registerIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.selectFolder, async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return result.filePaths[0];
    } catch (err: any) {
      return null;
    }
  });

  ipcMain.handle(IPC_CHANNELS.scanFolder, (_, folderPath: string) => {
    try {
      const files = scanFolder(folderPath);
      return safeResponse<ScanFolderResponse>({ files });
    } catch (err: any) {
      return errorResponse(String(err));
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.buildMovePlan,
    (_, request: BuildMovePlanRequest) => {
      try {
        const plan = buildMovePlan(
          request.scannedFiles,
          request.destinationRoot,
        );
        return safeResponse({ plan });
      } catch (err: any) {
        return errorResponse(String(err));
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.moveFiles, (_, request: MoveFilesRequest) => {
    try {
      const results = moveFiles(request.plans);
      console.log("ipcHandlers.moveFiles: moveFiles completed", {
        planned: request.plans.length,
        resultsCount: results.length,
      });

      const historyResult = appendHistory({
        id: `move-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        operation: { plan: request.plans, moved: results },
      });
      console.log("ipcHandlers.moveFiles: appendHistory result", historyResult);

      if (!historyResult.ok) {
        return errorResponse(
          `move succeeded but failed to save history: ${historyResult.error}`,
        );
      }

      return safeResponse<MoveFilesResponse>({ results });
    } catch (err: any) {
      return errorResponse(String(err));
    }
  });

  ipcMain.handle(IPC_CHANNELS.undoLatestOperation, () => {
    try {
      const result: UndoResult = undoLatestOperation();
      return result;
    } catch (err: any) {
      return errorResponse(String(err));
    }
  });

  ipcMain.handle(IPC_CHANNELS.readHistory, () => {
    try {
      const history = readHistory();
      return safeResponse<ReadHistoryResponse>({ history });
    } catch (err: any) {
      return errorResponse(String(err));
    }
  });
}

export default {
  registerIpcHandlers,
};
