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

### Renderer (UI) — stable mock implementation in `src/App.tsx`

The current UI works with mock data only.

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
- Move confirmation modal (UI only — no real file move)
- Undo confirmation modal (UI only — no real undo)
- Mock folder switching via "Choose Folder" button (cycles between hardcoded mock paths)
- "Rescan / Reset Mock Data" button reloads mock data
- Status-based row color accents
- In-memory mock move: changes file status to Moved/Skipped and enables the Undo button
- In-memory mock undo: restores previous file states from the latest in-memory operation snapshot

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

### Renderer — not connected to real data

The renderer still uses mock behavior:

- [ ] "Choose Folder" uses mock folder switching only
- [ ] "Move Selected Files" simulates file moving in memory only
- [ ] "Undo Latest Operation" simulates undo in memory only
- [ ] Renderer does not call real `window.electron.*` file organizer methods yet

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

**Connect the renderer to the real `window.electron.*` file organizer API instead of the mock implementation.**

With the Electron preload API exposed and IPC handlers wired, the next step is to update the renderer to call the real file organizer methods.

Focus on:

- replacing mock folder selection with `window.electron.selectFolder()`
- replacing mock scan operations with `window.electron.scanFolder(folderPath)`
- replacing mock move actions with `window.electron.moveFiles({ plans })`
- replacing mock undo with `window.electron.undoLatestOperation()`
- preserving the renderer-only UI responsibilities and not exposing raw Node.js APIs

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
