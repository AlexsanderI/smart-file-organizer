import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import buildMovePlan from "../movePlanner";

const tempDir = path.join(__dirname, "temp-moveplanner-test");

beforeEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("electron/movePlanner.ts", () => {
  it("constructs targetPath under destinationRoot using extension rules", () => {
    const scanned = [
      {
        id: "/src/file1.pdf",
        name: "file1.pdf",
        extension: "pdf",
        size: 123,
        category: "01_Documents",
        target: undefined,
        status: "Ready",
        path: "/src/file1.pdf",
      },
    ];

    const plan = buildMovePlan(scanned as any, tempDir);
    expect(plan).toHaveLength(1);
    expect(plan[0].targetFolder).toBe("01_Documents");
    expect(plan[0].targetPath).toBe(
      path.join(tempDir, "01_Documents", "file1.pdf"),
    );
    expect(plan[0].conflict).toBe(false);
  });

  it("marks conflict when destination file already exists", () => {
    const scanned = [
      {
        id: "/src/photo.jpg",
        name: "photo.jpg",
        extension: "jpg",
        size: 321,
        category: "02_Media",
        target: undefined,
        status: "Ready",
        path: "/src/photo.jpg",
      },
    ];

    const expectedTargetDir = path.join(tempDir, "02_Media");
    fs.mkdirSync(expectedTargetDir, { recursive: true });
    fs.writeFileSync(
      path.join(expectedTargetDir, "photo.jpg"),
      "exists",
      "utf8",
    );

    const plan = buildMovePlan(scanned as any, tempDir);
    expect(plan[0].conflict).toBe(true);
    expect(plan[0].reason).toBe("destination exists");
  });

  it("uses DEFAULT_TARGET_FOLDER for unknown extensions", () => {
    const scanned = [
      {
        id: "/src/unknownfile",
        name: "unknownfile",
        extension: "",
        size: 10,
        category: "07_Other",
        target: undefined,
        status: "Ready",
        path: "/src/unknownfile",
      },
    ];

    const plan = buildMovePlan(scanned as any, tempDir);
    expect(plan[0].targetFolder).toBe("07_Other");
    expect(plan[0].targetPath).toBe(
      path.join(tempDir, "07_Other", "unknownfile"),
    );
  });

  it("respects an explicit scanned file target override", () => {
    const scanned = [
      {
        id: "/src/review.docx",
        name: "review.docx",
        extension: "docx",
        size: 200,
        category: "01_Documents",
        target: "06_To_Review",
        status: "To Review",
        path: "/src/review.docx",
      },
    ];

    const plan = buildMovePlan(scanned as any, tempDir);
    expect(plan[0].targetFolder).toBe("06_To_Review");
    expect(plan[0].targetPath).toBe(
      path.join(tempDir, "06_To_Review", "review.docx"),
    );
  });
});
