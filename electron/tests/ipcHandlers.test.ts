import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

const registeredHandlers: Record<string, Function> = {};
const showOpenDialogMock = vi.fn();
const scanFolderMock = vi.fn();
const buildMovePlanMock = vi.fn();
const moveFilesMock = vi.fn();
const appendHistoryMock = vi.fn();
const readHistoryMock = vi.fn();
const undoLatestOperationMock = vi.fn();

const electronMock = {
  ipcMain: {
    handle: vi.fn((channel: string, listener: Function) => {
      registeredHandlers[channel] = listener;
    }),
  },
  dialog: {
    showOpenDialog: showOpenDialogMock,
  },
};

vi.doMock("electron", () => electronMock);
vi.doMock("../fileScanner", () => ({ scanFolder: scanFolderMock }));
vi.doMock("../movePlanner", () => ({
  __esModule: true,
  default: buildMovePlanMock,
}));
vi.doMock("../fileMover", () => ({ __esModule: true, default: moveFilesMock }));
vi.doMock("../historyStore", () => ({
  readHistory: readHistoryMock,
  appendHistory: appendHistoryMock,
}));
vi.doMock("../undoService", () => ({
  undoLatestOperation: undoLatestOperationMock,
}));

const { registerIpcHandlers, IPC_CHANNELS } = await import("../ipcHandlers");

describe("electron/ipcHandlers.ts", () => {
  beforeEach(() => {
    Object.keys(registeredHandlers).forEach((key) => {
      delete registeredHandlers[key];
    });
    showOpenDialogMock.mockReset();
    electronMock.ipcMain.handle.mockReset();
    scanFolderMock.mockReset();
    buildMovePlanMock.mockReset();
    moveFilesMock.mockReset();
    appendHistoryMock.mockReset();
    readHistoryMock.mockReset();
    undoLatestOperationMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers IPC handlers for all expected channels", () => {
    registerIpcHandlers();

    expect(electronMock.ipcMain.handle).toHaveBeenCalledTimes(6);
    expect(Object.keys(registeredHandlers)).toEqual(
      expect.arrayContaining(Object.values(IPC_CHANNELS)),
    );
  });

  it("returns the selected folder path when dialog selection succeeds", async () => {
    showOpenDialogMock.mockResolvedValue({
      canceled: false,
      filePaths: ["C:\\selected-folder"],
    });

    registerIpcHandlers();
    const result = await registeredHandlers[IPC_CHANNELS.selectFolder]();

    expect(result).toBe("C:\\selected-folder");
  });

  it("returns null when folder selection is canceled", async () => {
    showOpenDialogMock.mockResolvedValue({
      canceled: true,
      filePaths: [],
    });

    registerIpcHandlers();
    const result = await registeredHandlers[IPC_CHANNELS.selectFolder]();

    expect(result).toBeNull();
  });

  it("wraps scanFolder results in a success response", () => {
    const fakeFiles = [
      {
        id: "1",
        name: "file.txt",
        extension: "txt",
        size: 5,
        category: "07_Other",
        target: "07_Other",
        status: "Ready",
        path: "/tmp/file.txt",
      },
    ];
    scanFolderMock.mockReturnValue(fakeFiles);

    registerIpcHandlers();
    const response = registeredHandlers[IPC_CHANNELS.scanFolder](null, "/tmp");

    expect(response).toEqual({ ok: true, data: { files: fakeFiles } });
    expect(scanFolderMock).toHaveBeenCalledWith("/tmp");
  });

  it("returns an error response when scanFolder throws", () => {
    scanFolderMock.mockImplementation(() => {
      throw new Error("scan failed");
    });

    registerIpcHandlers();
    const response = registeredHandlers[IPC_CHANNELS.scanFolder](null, "/tmp");

    expect(response).toEqual({ ok: false, error: "Error: scan failed" });
  });

  it("returns a move plan payload from buildMovePlan", () => {
    const fakePlan = [
      {
        id: "1",
        sourcePath: "/src/file.txt",
        targetPath: "/dest/01_Documents/file.txt",
        targetFolder: "01_Documents",
        conflict: false,
      },
    ];
    buildMovePlanMock.mockReturnValue(fakePlan);

    registerIpcHandlers();

    const response = registeredHandlers[IPC_CHANNELS.buildMovePlan](null, {
      scannedFiles: [],
      destinationRoot: "/dest",
    });

    expect(response).toEqual({ ok: true, data: { plan: fakePlan } });
    expect(buildMovePlanMock).toHaveBeenCalledWith([], "/dest");
  });

  it("returns move results from moveFiles", () => {
    const fakeResults = [
      {
        id: "1",
        sourcePath: "/src/file.txt",
        targetPath: "/dest/file.txt",
        status: "Moved",
      },
    ];
    moveFilesMock.mockReturnValue(fakeResults);
    appendHistoryMock.mockReturnValue({
      ok: true,
      record: {
        id: "history-1",
        timestamp: new Date().toISOString(),
        operation: { moved: fakeResults },
      },
    });

    registerIpcHandlers();

    const requestPlans = [
      {
        id: "1",
        sourcePath: "/src/file.txt",
        targetPath: "/dest/file.txt",
        targetFolder: "01_Documents",
        conflict: false,
      },
    ];

    const response = registeredHandlers[IPC_CHANNELS.moveFiles](null, {
      plans: requestPlans,
    });

    expect(response).toEqual({ ok: true, data: { results: fakeResults } });
    expect(moveFilesMock).toHaveBeenCalledWith(requestPlans);
    expect(appendHistoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: { plan: requestPlans, moved: fakeResults },
      }),
    );
  });

  it("returns the undo operation result directly", () => {
    const fakeResult = { ok: true, results: [] };
    undoLatestOperationMock.mockReturnValue(fakeResult);

    registerIpcHandlers();

    const response = registeredHandlers[IPC_CHANNELS.undoLatestOperation]();

    expect(response).toBe(fakeResult);
    expect(undoLatestOperationMock).toHaveBeenCalled();
  });

  it("reads history and wraps it in a success response", () => {
    const fakeHistory = [
      {
        id: "h1",
        timestamp: new Date().toISOString(),
        operation: { moved: [] },
      },
    ];
    readHistoryMock.mockReturnValue(fakeHistory);

    registerIpcHandlers();

    const response = registeredHandlers[IPC_CHANNELS.readHistory]();

    expect(response).toEqual({ ok: true, data: { history: fakeHistory } });
    expect(readHistoryMock).toHaveBeenCalled();
  });
});
