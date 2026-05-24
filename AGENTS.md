# AI Agent Instructions for Smart File Organizer

## Purpose

Smart File Organizer is a local desktop MVP built with Electron + React + Vite + TypeScript + Tailwind CSS.

The application helps the user select a local folder, scan regular top-level files, preview deterministic file moves, move selected files safely, store local operation history, and undo the latest operation.

---

## Phase 1 Guidance

Phase 1 is fully offline and deterministic.

Sorting must be based only on:

- file extension
- explicit predefined rules
- predictable local logic

Do not add AI, cloud sync, semantic content analysis, or automatic sorting.

---

## Critical Phase 1 Rules

You are working on Phase 1 of Smart File Organizer.

Phase 1 must be simple, safe, offline, deterministic, and reversible.

### Hard Restrictions

Do not add:

- AI features
- LLM calls
- Gemini API
- cloud sync
- OCR
- PDF content analysis
- image analysis
- semantic classification
- automatic sorting without user confirmation
- recursive folder scanning
- file deletion
- overwrite behavior
- complex user-defined rules

### Deterministic Sorting Only

Phase 1 must classify files only by file extension and explicit predefined rules.

Do not classify files into semantic categories such as:

- Finance
- Personal
- Work
- Photos
- Screenshots
- Invoices
- Contracts
- CVs
- Family photos

Reason:

These categories require filename analysis, content analysis, manual classification, or AI. They belong to Phase 2+.

---

## Allowed Phase 1 Folder Taxonomy

Use only the Phase 1 extension-based taxonomy:

```txt
01_Documents
02_Media
03_Archives
04_Installers
05_Code
06_To_Review
07_Other
```

Do not introduce semantic Phase 1 folders.

---

## Scan Scope

Phase 1 must scan only regular top-level files inside the selected folder root.

Do not recursively scan subfolders.

Ignore directories.

This prevents the app from re-processing files that were already moved into the generated folder structure.

---

## File Operation Safety

Data safety is more important than sorting completeness.

Rules:

1. Never delete user files.
2. Never overwrite existing files.
3. Always show a preview before moving files.
4. Move only files explicitly selected by the user.
5. If a destination file already exists, mark the file as `Conflict` and skip it.
6. Failed moves must leave the original file in place.
7. All attempted moves must be logged.
8. Undo must be based on the latest operation record.
9. Undo must be best-effort and file-level atomic.
10. If one file fails during undo, continue processing the remaining files.

---

## History Storage

Store operation history in Electron's user data directory:

```ts
app.getPath("userData") + "/history.json"
```

Do not store operation history inside the selected folder.

Reason:

The selected folder may be moved, deleted, cleaned, or sorted by the user.

---

## Electron Security Rules

The renderer process must not access Node.js `fs` directly.

All file-system operations must be handled in the Electron main process.

Use a narrow typed preload API for communication between renderer and main process.

Required security direction:

```ts
nodeIntegration: false
contextIsolation: true
```

The preload API should expose only safe high-level methods, such as:

```ts
export interface FileOrganizerApi {
  selectFolder(): Promise<string | null>;
  scanFolder(folderPath: string): Promise<ScanResult>;
  moveFiles(plan: MovePlan): Promise<MoveResult>;
  undoLatestOperation(): Promise<UndoResult>;
}
```

Do not expose raw file-system access to the renderer.

---

## UI Implementation Boundaries

Follow the UI specification.

The UI must support:

- folder selection
- scan summary
- preview table
- file status display
- conflict display
- bulk selection controls
- move confirmation modal
- undo confirmation modal
- error details drawer
- operation result feedback

Do not add advanced features beyond the Phase 1 UI scope unless explicitly requested.

---

## Reference Planning Docs

- [Phase 1 Context](planning/phases/01-ui-and-mock-preview/01-CONTEXT.md)
- [Discussion Log](planning/phases/01-ui-and-mock-preview/02-DISCUSSION-LOG.md)
- [UI Spec](planning/phases/01-ui-and-mock-preview/03-UI-SPEC.md)
- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [File Rules](docs/FILE_RULES.md)

---

## Agent Behavior Guidance

- Keep changes focused on local folder selection, preview, move confirmation, logging, and undo.
- Prefer deterministic, safe file operations.
- Keep all Phase 1 logic transparent and reversible.
- Use the planning docs for UI and architectural boundaries.
- If a requested feature violates Phase 1 scope, do not implement it without explicit approval.
