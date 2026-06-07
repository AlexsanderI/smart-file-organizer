import fs from "fs";
import path from "path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { scanFolder } from "../fileScanner";

const tempDir = path.join(__dirname, "temp-scan-test");

const createFile = (name: string, content = "hello") => {
  fs.writeFileSync(path.join(tempDir, name), content, "utf8");
};

beforeEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("electron/fileScanner.ts", () => {
  it("returns only top-level regular files and ignores directories", () => {
    createFile("document.pdf");
    createFile("photo.jpg");
    fs.mkdirSync(path.join(tempDir, "subfolder"));
    fs.writeFileSync(
      path.join(tempDir, "subfolder", "child.txt"),
      "child",
      "utf8",
    );

    const result = scanFolder(tempDir);

    expect(result).toHaveLength(2);
    expect(result.map((file) => file.name).sort()).toEqual([
      "document.pdf",
      "photo.jpg",
    ]);
  });

  it("maps known extensions using fileRules and returns the correct category", () => {
    createFile("presentation.PPTX");
    createFile("script.ts");

    const result = scanFolder(tempDir);
    const pptxFile = result.find((file) => file.name === "presentation.PPTX");
    const tsFile = result.find((file) => file.name === "script.ts");

    expect(pptxFile).toBeDefined();
    expect(pptxFile?.category).toBe("01_Documents");
    expect(pptxFile?.target).toBe("01_Documents");

    expect(tsFile).toBeDefined();
    expect(tsFile?.category).toBe("05_Code");
    expect(tsFile?.target).toBe("05_Code");
  });

  it("uses DEFAULT_TARGET_FOLDER for unknown or missing extensions", () => {
    createFile("archive.unknownext");
    createFile("README");

    const result = scanFolder(tempDir);
    expect(result).toHaveLength(2);
    expect(result.every((file) => file.category === "07_Other")).toBe(true);
  });

  it("uses lowercase extension lookup for extension casing variations", () => {
    createFile("photo.JPEG");
    createFile("movie.Mp4");

    const result = scanFolder(tempDir);
    const jpegFile = result.find((file) => file.name === "photo.JPEG");
    const mp4File = result.find((file) => file.name === "movie.Mp4");

    expect(jpegFile?.extension).toBe("jpeg");
    expect(jpegFile?.category).toBe("02_Media");
    expect(mp4File?.extension).toBe("mp4");
    expect(mp4File?.category).toBe("02_Media");
  });
});
