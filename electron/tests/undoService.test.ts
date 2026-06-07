import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const tempDir = path.join(__dirname, "temp-undo-test");

// Mock Electron app.getPath at top level so historyStore reads from tempDir
vi.mock("electron", () => ({
  app: {
    getPath: () => tempDir,
  },
}));

import { undoLatestOperation } from "../undoService";

beforeEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("electron/undoService.ts", () => {
  it("returns error when no history is present", () => {
    // ensure history file missing
    if (fs.existsSync(path.join(tempDir, "history.json")))
      fs.rmSync(path.join(tempDir, "history.json"));

    const res = undoLatestOperation();
    expect(res.ok).toBe(false);
    expect(res.error).toBe("no history");
  });

  it("moves files back using operation.plan", () => {
    const src = path.join(tempDir, "orig", "fileA.txt");
    const dest = path.join(tempDir, "dest", "fileA.txt");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, "data", "utf8");

    const fakeHistory = [
      {
        id: "h1",
        timestamp: new Date().toISOString(),
        operation: {
          plan: [
            {
              id: "p1",
              name: "fileA.txt",
              size: 4,
              sourcePath: src,
              targetPath: dest,
            },
          ],
        },
      },
    ];

    fs.writeFileSync(
      path.join(tempDir, "history.json"),
      JSON.stringify(fakeHistory),
      "utf8",
    );

    const res = undoLatestOperation();
    expect(res.ok).toBe(true);
    expect(res.results).toBeDefined();
    expect(res.results?.length).toBe(1);
    expect(res.results && res.results[0].status).toBe("Moved");

    // destination should be moved back to src
    expect(fs.existsSync(src)).toBe(true);
    expect(fs.existsSync(dest)).toBe(false);
  });

  it("continues processing remaining files when one file fails", () => {
    const dest1 = path.join(tempDir, "d1", "a.txt");
    const dest2 = path.join(tempDir, "d2", "b.txt");
    const src1 = path.join(tempDir, "s1", "a.txt");
    const src2 = path.join(tempDir, "s2", "b.txt");
    fs.mkdirSync(path.dirname(dest1), { recursive: true });
    fs.mkdirSync(path.dirname(dest2), { recursive: true });
    fs.writeFileSync(dest1, "one", "utf8");
    fs.writeFileSync(dest2, "two", "utf8");

    const fakeHistory = [
      {
        id: "h2",
        timestamp: new Date().toISOString(),
        operation: {
          plan: [
            { id: "a", name: "a.txt", sourcePath: src1, targetPath: dest1 },
            { id: "b", name: "b.txt", sourcePath: src2, targetPath: dest2 },
          ],
        },
      },
    ];

    fs.writeFileSync(
      path.join(tempDir, "history.json"),
      JSON.stringify(fakeHistory),
      "utf8",
    );

    // Mock renameSync to throw for the first call only
    const originalRename = fs.renameSync;
    let called = 0;
    vi.spyOn(fs, "renameSync").mockImplementation(((...args: any[]) => {
      called += 1;
      if (called === 1) {
        const e: any = new Error("io error");
        e.code = "EIO";
        throw e;
      }
      return (originalRename as any).apply(fs, args);
    }) as any);

    const res = undoLatestOperation();
    expect(res.ok).toBe(true);
    expect(res.results).toBeDefined();
    expect(res.results?.length).toBe(2);
    expect(res.results?.[0].status).toBe("Failed");
    expect(res.results?.[1].status).toBe("Moved");
  });

  it("does not overwrite existing files at the original path", () => {
    const src = path.join(tempDir, "orig2", "fileB.txt");
    const dest = path.join(tempDir, "dest2", "fileB.txt");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.mkdirSync(path.dirname(src), { recursive: true });
    fs.writeFileSync(dest, "moved", "utf8");
    fs.writeFileSync(src, "original", "utf8");

    const fakeHistory = [
      {
        id: "h3",
        timestamp: new Date().toISOString(),
        operation: {
          plan: [
            {
              id: "p2",
              name: "fileB.txt",
              sourcePath: src,
              targetPath: dest,
            },
          ],
        },
      },
    ];

    fs.writeFileSync(
      path.join(tempDir, "history.json"),
      JSON.stringify(fakeHistory),
      "utf8",
    );

    const res = undoLatestOperation();
    expect(res.ok).toBe(true);
    expect(res.results && res.results[0].status).toBe("Conflict");

    // original should remain, dest should remain
    expect(fs.readFileSync(src, "utf8")).toBe("original");
    expect(fs.readFileSync(dest, "utf8")).toBe("moved");
  });
});
