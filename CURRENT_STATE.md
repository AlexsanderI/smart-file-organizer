# Current State — Smart File Organizer

> Update this file at the end of every development session.
> Last updated: 2026-06-06

---

## Phase

**Phase 1 — in progress**

Current focus: **implement Electron main-process move planning and conflict detection**.

The Phase 1 mock UI is stable enough for now. `electron/fileScanner.ts` is implemented; next work is `electron/movePlanner.ts`.

---

## What Is Actually Working

### Renderer (UI) — connected to real Electron IPC

The current UI is connected to the real Electron IPC and uses real scan/move operations.

Implemented:

- File preview table with columns: name, extension, size, destination, status, details
- Visual `Destination` column that combines the previous `Category` and `Target` display
- Expandable row details: source path, target path, classification source, confidence, reason, manual override, error
- Bulk selection controls: Select All, Deselect All, Select Only Ready, Deselect Conflicts
- Bulk detail controls: Show Selected Details, Show Conflict Details, Hide Details
- Summary sidebar filter cards: Total, Selected, Ready, Conflicts, To Review
- Active filter highlighting and `visibleFiles` table rendering
- Clear active filter feedback above the table
- Status badges for file states such as Ready, Conflict, Skipped, To Review, Moved, Failed, Undone
- Primary visual styling for `Move Selected Files` when files are selected
- Move confirmation modal and Undo confirmation modal connected to real IPC actions
- Real folder selection via IPC and real scan/move operations
- Status-based row color accents
- File scan and move working correctly through Electron IPC
- Bug found: undo shows "no history" because history is not saved after move

Notes:

- File type icons were removed or skipped because they did not render cleanly.
- Disabled buttons should remain visually disabled without using a forbidden/not-allowed cursor.
- The UI has been refactored and shared presentational components are now extracted into `src/components/`.

### Shared logic — implemented

- `src/shared/types.ts` — type definitions for `ScannedFile`, `ScanSummary`, `MockScanResult`, `FileStatus`, and related Phase 1 data shapes
- `src/shared/fileRules.ts` — `EXTENSION_RULES` map covering all 7 Phase 1 categories
- `src/tests/fileRules.test.ts` — Vitest tests verifying extension mapping and unknown/case-insensitive behavior
- `vitest.config.ts` — Vitest configuration for node-based test execution
- `src/mock/mockScan.ts` — mock files covering main statuses: Ready, Conflict, Skipped, To Review

### Electron shell — minimal

- `electron/main.ts` — opens a BrowserWindow, loads the Vite dev server or production renderer build, opens DevTools in development mode; now wired `registerIpcHandlers()`
- `electron/preload.ts` — exposes the full `FileOrganizerApi` through `contextBridge`
- `electron/fileScanner.ts` — real top-level scanner implemented and compiles
- `electron/tests/fileScanner.test.ts` — tests written and passing
- `electron/movePlanner.ts` — target path construction implemented
- `electron/tests/movePlanner.test.ts` — tests written and passing
- `electron/fileMover.ts` — safe file mover implemented and tests written and passing
- `electron/historyStore.ts` — history store implemented and tests written and passing
- `electron/undoService.ts` — undo service implemented and tests written and passing
- `electron/ipcHandlers.ts` — IPC handlers implemented and tests written and passing
- `electron/tests/ipcHandlers.test.ts` — tests written and passing

Total: 36 tests passing across 6 test files

---

## What Is NOT Implemented Yet

### Electron main process — missing

The following real file-operation modules are not implemented yet:

- [x] `electron/ipcHandlers.ts` — IPC channel registration implemented and tests pass
- [x] `electron/fileScanner.ts` — implemented and compiles; scanner tests pass
- [x] `electron/movePlanner.ts` — implemented and tests pass
- [x] `electron/fileMover.ts` — implemented and tests pass
- [x] `electron/historyStore.ts` — implemented and tests pass
- [x] `electron/undoService.ts` — implemented and tests pass

### Preload API — not connected

The full safe preload API is not implemented yet:

- [ ] `selectFolder()` — native folder picker is not wired
- [ ] `scanFolder()` — real scan is not implemented
- [ ] `moveFiles()` — real move operation is not implemented
- [ ] `undoLatestOperation()` — real undo is not implemented

### Renderer — connected to real data

The renderer now uses real Electron IPC for file scan and move operations.

- [x] "Choose Folder" uses real folder selection via IPC
- [x] "Move Selected Files" uses real move operations via IPC
- [x] "Undo Latest Operation" now logs move history persistence and path resolution for `history.json`
- [x] Renderer calls real `window.electron.*` file organizer methods

### Code structure — refactored

- [x] `src/App.tsx` has been refactored and now delegates UI rendering to extracted component files
- [x] `src/App.corrected.tsx` has been deleted
- [x] Presentational component files are extracted into `src/components/`

Planned component direction:

```txt
src/components/
├── Sidebar.tsx
├── SummaryCard.tsx
├── TopControls.tsx
├── PreviewTable.tsx
├── FileRow.tsx
├── StatusBadge.tsx
├── ExpandedFileDetails.tsx
├── MoveConfirmModal.tsx
└── UndoConfirmModal.tsx
```

### Quality — missing

- [ ] No ESLint / Prettier config yet
- [ ] No packaging setup yet (`electron-builder` or `electron-forge`)

---

## Next Step

**Verify runtime history file creation in AppData/Roaming after move operation.**

The electron move handler now logs `appendHistory()` results and resolves the `history.json` path via `app.getPath("userData")`.

Focus on:

- confirming the runtime path printed in logs is the expected user data folder
- verifying `history.json` is created after a successful move
- ensuring `undoLatestOperation()` can now read the saved history
- preserving safe file move behavior and structured IPC responses

Do not add:

- AI, OCR, or semantic classification
- new dependencies unless explicitly approved

### Implementation guidance

- Keep `electron/preload.ts` as a thin bridge to IPC
- Have `electron/main.ts` import and call `registerIpcHandlers()` before creating the BrowserWindow
- Return structured responses from IPC handlers, not raw `fs` objects
- Verify the full Electron module graph compiles before moving to renderer wiring

---

## Later Step — Electron Main Process

Start this only after the mock UI is stable and `src/App.tsx` has been split into components.

All new Electron main-process files should go into `electron/` to match the existing structure:

```txt
electron/
├── main.ts
├── preload.ts
├── ipcHandlers.ts
├── fileScanner.ts
├── movePlanner.ts
├── fileMover.ts
├── historyStore.ts
└── undoService.ts
```

Before creating any new folders, inspect the existing project structure and preserve it.

Do not create a parallel `src/main/` folder unless this architecture change is explicitly decided.

---

## Key Decisions Already Made

- Phase 1 uses extension-only classification.
- Phase 1 does not use filename analysis, AI, OCR, PDF content analysis, image analysis, or semantic classification.
- Phase 1 scans only regular top-level files in the selected folder root.
- Phase 1 does not scan subfolders recursively.
- Files must never be deleted.
- Existing files must never be overwritten.
- Conflicts are skipped by default.
- User must see a preview before moving files.
- User must explicitly select files before moving them.
- Operation history must be stored in `app.getPath("userData")/history.json`, never inside the selected folder.
- Undo is best-effort and file-level atomic.
- If one file fails during undo, the app must continue with the remaining files.
- Electron security direction: `contextIsolation: true`, `nodeIntegration: false`.
- The renderer must not access Node.js `fs` directly.

---

## Rejected Ideas — Do Not Re-Suggest

- Semantic Phase 1 categories such as Finance, Work, Personal, Invoices, Contracts, CVs, Family Photos
- Recursive folder scanning in Phase 1
- Automatic sorting without user confirmation
- File deletion
- Overwriting existing files
- AI / LLM / Gemini API in Phase 1
- OCR or content analysis in Phase 1
- Cloud sync in Phase 1
