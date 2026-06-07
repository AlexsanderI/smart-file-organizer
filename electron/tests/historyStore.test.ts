import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const tempDir = path.join(__dirname, "temp-history-test");

vi.mock("electron", () => ({
  app: {
    getPath: () => tempDir,
  },
}));

import {
  readHistory,
  writeHistory,
  appendHistory,
  getHistoryFilePath,
} from "../historyStore";

beforeEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("electron/historyStore.ts", () => {
  it("returns empty array when history file does not exist", () => {
    const hist = readHistory();
    expect(Array.isArray(hist)).toBe(true);
    expect(hist).toHaveLength(0);
  });

  it("writeHistory writes file and readHistory returns content", () => {
    const filePath = getHistoryFilePath();
    expect(filePath.startsWith(tempDir)).toBe(true);

    const records = [
      {
        id: "op1",
        timestamp: new Date().toISOString(),
        operation: { moved: [] },
      },
    ];

    const w = writeHistory(records as any);
    expect(w.ok).toBe(true);
    expect(fs.existsSync(filePath)).toBe(true);

    const read = readHistory();
    expect(read).toHaveLength(1);
    expect(read[0].id).toBe("op1");
  });

  it("appendHistory adds a record and returns ok with record timestamp", () => {
    const res = appendHistory({ id: "op2", operation: { moved: [] } } as any);
    expect(res.ok).toBe(true);
    expect(res.record).toBeDefined();
    expect(res.record.id).toBe("op2");
    expect(typeof res.record.timestamp).toBe("string");

    const read = readHistory();
    expect(read.some((r) => r.id === "op2")).toBe(true);
  });
});
