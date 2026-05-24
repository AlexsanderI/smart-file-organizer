# Phase 1 Architecture

## Goal

Define the Phase 1 architecture for Smart File Organizer.

Phase 1 must be local, deterministic, safe, reversible, and easy to test.

---

## Process Separation

The application uses Electron with strict process separation.

There are three main layers:

1. Main process
2. Preload layer
3. Renderer process

---

## Renderer Process

The renderer process is responsible only for UI.

Allowed renderer responsibilities:

- displaying selected folder
- displaying scan results
- displaying preview table
- collecting user file selection
- showing confirmation modals
- showing operation results
- showing error details
- triggering high-level API calls through preload

The renderer must not use Node.js `fs` directly.

The renderer must not receive raw file-system capabilities.

---

## Main Process

The main process is responsible for all file-system operations.

Main process responsibilities:

- opening native folder picker
- scanning selected folder
- reading file metadata
- creating move plans
- detecting target path conflicts
- creating target folders
- moving files
- writing operation history
- reading operation history
- undoing the latest operation
- returning structured success/error results to the renderer

---

## Preload API

The preload layer exposes a narrow typed API between renderer and main process.

Example API shape:

```ts
export interface FileOrganizerApi {
  selectFolder(): Promise<string | null>;
  scanFolder(folderPath: string): Promise<ScanResult>;
  moveFiles(plan: MovePlan): Promise<MoveResult>;
  undoLatestOperation(): Promise<UndoResult>;
}
```

Do not expose raw Node.js or `fs` APIs.

Do not expose arbitrary path read/write methods.

---

## Electron Security Requirements

Required direction:

```ts
nodeIntegration: false
contextIsolation: true
```

All file-system operations must run in the main process.

Renderer-to-main communication must use explicit IPC handlers.

---

## Suggested Source Structure

```txt
src/
├── main/
│   ├── main.ts
│   ├── ipcHandlers.ts
│   ├── fileScanner.ts
│   ├── movePlanner.ts
│   ├── fileMover.ts
│   ├── historyStore.ts
│   └── undoService.ts
│
├── preload/
│   └── preload.ts
│
├── renderer/
│   ├── App.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── PreviewTable.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── ConfirmMoveModal.tsx
│   │   └── ConfirmUndoModal.tsx
│   └── mock/
│       └── mockFileScan.ts
│
└── shared/
    ├── types.ts
    └── fileRules.ts
```

---

## Shared Types

Shared types should be placed in:

```txt
src/shared/types.ts
```

Example direction:

```ts
export type FileStatus =
  | "Ready"
  | "Conflict"
  | "Skipped"
  | "Moved"
  | "Failed"
  | "Undone"
  | "To Review";

export interface ScannedFile {
  id: string;
  name: string;
  extension: string | null;
  size: number;
  sourcePath: string;
  targetPath: string | null;
  category: string;
  status: FileStatus;
  error?: string;
}

export interface ScanResult {
  folderPath: string;
  files: ScannedFile[];
  summary: {
    total: number;
    ready: number;
    conflicts: number;
    skipped: number;
    toReview: number;
  };
}

export interface MovePlan {
  operationId: string;
  files: ScannedFile[];
}

export interface MoveResult {
  operationId: string;
  moved: number;
  skipped: number;
  failed: number;
  conflicts: number;
  records: MoveRecord[];
}

export interface MoveRecord {
  operationId: string;
  timestamp: string;
  sourcePath: string;
  destinationPath: string;
  status: "planned" | "moved" | "skipped" | "failed" | "undone";
  error?: string;
}

export interface UndoResult {
  operationId: string;
  restored: number;
  failed: number;
  skipped: number;
  records: MoveRecord[];
}
```

---

## History Storage

Operation history must be stored in Electron's user data directory:

```ts
app.getPath("userData") + "/history.json"
```

The history file must not be stored inside the selected folder.

---

## Error Handling

All file operations must return structured errors.

The app must not crash if one file fails.

Failed files must be reported in the UI.

Common Windows errors to handle:

- `EPERM`
- `EACCES`
- `EBUSY`
- `ENOENT`
- `ENAMETOOLONG`
- `EXDEV`

---

## Undo Strategy

Undo is based on the latest operation record.

Undo behavior:

1. Read latest operation from history.
2. For each moved file, check whether destination still exists.
3. Check whether original source path is free.
4. Move file back if safe.
5. Mark result per file.
6. Continue even if one file fails.
7. Return a structured undo summary to the UI.

Undo must never overwrite files.
