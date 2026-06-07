/// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "../App";
import type { ScannedFile } from "../shared/types";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

declare global {
  interface Window {
    electron: {
      platform: string;
      selectFolder: () => Promise<string | null>;
      scanFolder: (
        folderPath: string,
      ) => Promise<ApiResponse<{ files: ScannedFile[] }>>;
      buildMovePlan: (request: {
        scannedFiles: ScannedFile[];
        destinationRoot: string;
      }) => Promise<ApiResponse<{ plan: unknown[] }>>;
      moveFiles: (request: { plans: unknown[] }) => Promise<
        ApiResponse<{
          results: {
            id: string;
            sourcePath: string;
            targetPath: string;
            status: ScannedFile["status"];
            error?: string | null;
          }[];
        }>
      >;
      undoLatestOperation: () => Promise<
        { ok: true; results?: unknown[] } | { ok: false; error: string }
      >;
    };
  }
}

const sampleFiles: ScannedFile[] = [
  {
    id: "1",
    name: "Report 2026.pdf",
    extension: "pdf",
    size: 245678,
    category: "01_Documents",
    target: "01_Documents",
    status: "Ready",
    path: "C:/Test/Report 2026.pdf",
  },
  {
    id: "2",
    name: "installer_v2.exe",
    extension: "exe",
    size: 12345678,
    category: "04_Installers",
    target: "04_Installers",
    status: "Moved",
    path: "C:/Test/installer_v2.exe",
  },
];

let container: HTMLDivElement;
let root: Root | null = null;

beforeEach(() => {
  document.body.innerHTML = "";
  container = document.createElement("div");
  document.body.appendChild(container);

  window.electron = {
    platform: "win32",
    selectFolder: vi.fn().mockResolvedValue("C:/Test/SelectedFolder"),
    scanFolder: vi
      .fn()
      .mockResolvedValue({ ok: true, data: { files: sampleFiles } }),
    buildMovePlan: vi.fn().mockResolvedValue({
      ok: true,
      data: {
        plan: [
          {
            id: "1",
            name: "Report 2026.pdf",
            size: 245678,
            sourcePath: "C:/Test/Report 2026.pdf",
            targetFolder: "01_Documents",
            targetPath: "C:/Test/SelectedFolder/01_Documents/Report 2026.pdf",
            conflict: false,
          },
        ],
      },
    }),
    moveFiles: vi.fn().mockResolvedValue({
      ok: true,
      data: {
        results: [
          {
            id: "1",
            sourcePath: "C:/Test/Report 2026.pdf",
            targetPath: "C:/Test/SelectedFolder/01_Documents/Report 2026.pdf",
            status: "Moved",
            error: null,
          },
        ],
      },
    }),
    undoLatestOperation: vi.fn().mockResolvedValue({ ok: true, results: [] }),
  };
});

afterEach(() => {
  if (root) {
    root.unmount();
    root = null;
  }
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

const renderApp = async () => {
  await act(async () => {
    root = createRoot(container);
    root.render(<App />);
  });
};

const clickButtonWithText = async (
  text: string,
  { occurrence = "first" }: { occurrence?: "first" | "last" } = {},
) => {
  const buttons = Array.from(container.querySelectorAll("button")).filter(
    (node) => node.textContent?.trim() === text,
  );
  const button = occurrence === "last" ? buttons.at(-1) : buttons[0];
  if (!button) {
    throw new Error(`Button with text '${text}' not found`);
  }
  await act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

describe("src/App.tsx renderer IPC wiring", () => {
  it("calls selectFolder and scanFolder when Choose Folder is clicked", async () => {
    await renderApp();

    await clickButtonWithText("Choose Folder");

    expect(window.electron.selectFolder).toHaveBeenCalledTimes(1);
    expect(window.electron.scanFolder).toHaveBeenCalledWith(
      "C:/Test/SelectedFolder",
    );
    expect(container.textContent).toContain("C:/Test/SelectedFolder");
  });

  it("calls buildMovePlan and moveFiles when moving a selected ready file", async () => {
    await renderApp();
    await clickButtonWithText("Choose Folder");

    const checkbox = container.querySelector(
      "input[type=checkbox]",
    ) as HTMLInputElement | null;
    expect(checkbox).not.toBeNull();

    await act(async () => {
      checkbox?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await clickButtonWithText("Move Selected Files");
    await clickButtonWithText("Move Selected Files", { occurrence: "last" });

    expect(window.electron.buildMovePlan).toHaveBeenCalledWith({
      scannedFiles: [sampleFiles[0]],
      destinationRoot: "C:/Test/SelectedFolder",
    });
    expect(window.electron.moveFiles).toHaveBeenCalledWith({
      plans: [
        {
          id: "1",
          name: "Report 2026.pdf",
          size: 245678,
          sourcePath: "C:/Test/Report 2026.pdf",
          targetFolder: "01_Documents",
          targetPath: "C:/Test/SelectedFolder/01_Documents/Report 2026.pdf",
          conflict: false,
        },
      ],
    });
  });

  it("calls undoLatestOperation when Undo Latest Operation is confirmed", async () => {
    await renderApp();
    await clickButtonWithText("Choose Folder");

    const undoButton = Array.from(container.querySelectorAll("button")).find(
      (node) => node.textContent?.trim() === "Undo Latest Operation",
    );
    expect(undoButton).not.toBeNull();

    await clickButtonWithText("Undo Latest Operation");
    await clickButtonWithText("Undo Latest Operation", { occurrence: "last" });

    expect(window.electron.undoLatestOperation).toHaveBeenCalledTimes(1);
  });
});
