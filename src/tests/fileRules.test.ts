import { describe, expect, it } from "vitest";
import { DEFAULT_TARGET_FOLDER, EXTENSION_RULES } from "../shared/fileRules";

const resolveTargetFolder = (extension: string) => {
  const normalized = extension.trim().toLowerCase();
  return EXTENSION_RULES[normalized] ?? DEFAULT_TARGET_FOLDER;
};

describe("src/shared/fileRules.ts", () => {
  it("maps document extensions to 01_Documents", () => {
    const documentExtensions = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
      "csv",
      "md",
      "rtf",
      "odt",
    ];

    documentExtensions.forEach((ext) => {
      expect(EXTENSION_RULES[ext]).toBe("01_Documents");
    });
  });

  it("maps media extensions to 02_Media", () => {
    const mediaExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "svg",
      "bmp",
      "webp",
      "mp4",
      "mov",
      "avi",
      "mkv",
      "mp3",
      "wav",
      "flac",
      "aac",
      "m4a",
    ];

    mediaExtensions.forEach((ext) => {
      expect(EXTENSION_RULES[ext]).toBe("02_Media");
    });
  });

  it("maps archive extensions to 03_Archives", () => {
    const archiveExtensions = ["zip", "rar", "7z", "tar", "gz", "bz2", "iso"];
    archiveExtensions.forEach((ext) => {
      expect(EXTENSION_RULES[ext]).toBe("03_Archives");
    });
  });

  it("maps installer extensions to 04_Installers", () => {
    const installerExtensions = ["exe", "msi", "dmg", "pkg", "deb", "appimage"];
    installerExtensions.forEach((ext) => {
      expect(EXTENSION_RULES[ext]).toBe("04_Installers");
    });
  });

  it("maps code extensions to 05_Code", () => {
    const codeExtensions = [
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
      "json",
      "yaml",
      "yml",
      "py",
      "java",
      "c",
      "cpp",
      "cs",
      "go",
      "rs",
      "php",
      "rb",
      "swift",
      "kt",
      "dart",
      "sh",
      "bash",
      "ps1",
      "bat",
    ];
    codeExtensions.forEach((ext) => {
      expect(EXTENSION_RULES[ext]).toBe("05_Code");
    });
  });

  it("returns DEFAULT_TARGET_FOLDER for unknown extensions", () => {
    expect(resolveTargetFolder("unknownext")).toBe(DEFAULT_TARGET_FOLDER);
  });

  it("resolves extensions case-insensitively", () => {
    expect(resolveTargetFolder("PDF")).toBe("01_Documents");
    expect(resolveTargetFolder("Mp4")).toBe("02_Media");
    expect(resolveTargetFolder("JsX")).toBe("05_Code");
  });

  it("returns DEFAULT_TARGET_FOLDER for an empty string extension", () => {
    expect(resolveTargetFolder("")).toBe(DEFAULT_TARGET_FOLDER);
  });
});
