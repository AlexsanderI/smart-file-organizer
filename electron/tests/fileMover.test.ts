import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import moveFiles from "../fileMover";

const tempDir = path.join(__dirname, "temp-filemover-test");

beforeEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("electron/fileMover.ts", () => {
  it("moves a file successfully and creates target directories", () => {
    const srcDir = path.join(tempDir, "source");
    const destRoot = path.join(tempDir, "dest");
    fs.mkdirSync(srcDir, { recursive: true });

    const srcPath = path.join(srcDir, "file.txt");
    fs.writeFileSync(srcPath, "hello", "utf8");

    const plan = [
      {
        id: "1",
        name: "file.txt",
        size: 5,
        sourcePath: srcPath,
        targetFolder: "05_Code",
        targetPath: path.join(destRoot, "05_Code", "file.txt"),
        conflict: false,
      },
    ];

    const results = moveFiles(plan as any);
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("Moved");

    expect(fs.existsSync(srcPath)).toBe(false);
    expect(fs.existsSync(plan[0].targetPath)).toBe(true);
    expect(fs.readFileSync(plan[0].targetPath, "utf8")).toBe("hello");
  });

  it("skips move and returns Conflict when destination exists", () => {
    const srcDir = path.join(tempDir, "source2");
    const destRoot = path.join(tempDir, "dest2");
    fs.mkdirSync(srcDir, { recursive: true });

    const srcPath = path.join(srcDir, "photo.jpg");
    fs.writeFileSync(srcPath, "imgdata", "utf8");

    const targetPath = path.join(destRoot, "02_Media", "photo.jpg");
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, "existing", "utf8");

    const plan = [
      {
        id: "2",
        name: "photo.jpg",
        size: 7,
        sourcePath: srcPath,
        targetFolder: "02_Media",
        targetPath: targetPath,
        conflict: true,
      },
    ];

    const results = moveFiles(plan as any);
    expect(results[0].status).toBe("Conflict");
    expect(results[0].error).toBe("destination exists");
    // source should remain
    expect(fs.existsSync(srcPath)).toBe(true);
    expect(fs.readFileSync(targetPath, "utf8")).toBe("existing");
  });

  it("falls back to copy+unlink on EXDEV and reports Moved", () => {
    const srcDir = path.join(tempDir, "source3");
    const destRoot = path.join(tempDir, "dest3");
    fs.mkdirSync(srcDir, { recursive: true });

    const srcPath = path.join(srcDir, "video.mp4");
    fs.writeFileSync(srcPath, "videodata", "utf8");

    const plan = [
      {
        id: "3",
        name: "video.mp4",
        size: 9,
        sourcePath: srcPath,
        targetFolder: "02_Media",
        targetPath: path.join(destRoot, "02_Media", "video.mp4"),
        conflict: false,
      },
    ];

    // Mock renameSync to throw EXDEV once
    const renameMock = vi.spyOn(fs, "renameSync").mockImplementation(() => {
      const e: any = new Error("cross-device");
      e.code = "EXDEV";
      throw e;
    });

    const copySpy = vi.spyOn(fs, "copyFileSync");
    const unlinkSpy = vi.spyOn(fs, "unlinkSync");

    const results = moveFiles(plan as any);
    expect(results[0].status).toBe("Moved");
    expect(fs.existsSync(plan[0].targetPath)).toBe(true);
    expect(fs.existsSync(srcPath)).toBe(false);

    expect(renameMock).toHaveBeenCalled();
    expect(copySpy).toHaveBeenCalled();
    expect(unlinkSpy).toHaveBeenCalled();
  });

  it("returns Failed on EACCES error and leaves source intact", () => {
    const srcDir = path.join(tempDir, "source4");
    const destRoot = path.join(tempDir, "dest4");
    fs.mkdirSync(srcDir, { recursive: true });

    const srcPath = path.join(srcDir, "secret.dat");
    fs.writeFileSync(srcPath, "secret", "utf8");

    const plan = [
      {
        id: "4",
        name: "secret.dat",
        size: 6,
        sourcePath: srcPath,
        targetFolder: "01_Documents",
        targetPath: path.join(destRoot, "01_Documents", "secret.dat"),
        conflict: false,
      },
    ];

    // Mock renameSync to throw EACCES
    vi.spyOn(fs, "renameSync").mockImplementation(() => {
      const e: any = new Error("permission denied");
      e.code = "EACCES";
      throw e;
    });

    const results = moveFiles(plan as any);
    expect(results[0].status).toBe("Failed");
    expect(results[0].error).toContain("permission denied");
    expect(fs.existsSync(srcPath)).toBe(true);
    expect(fs.existsSync(plan[0].targetPath)).toBe(false);
  });
});
