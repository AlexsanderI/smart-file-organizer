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

- `electron/main.ts` — opens a BrowserWindow, loads the Vite dev server or production renderer build, opens DevTools in development mode
- `electron/preload.ts` — exposes only minimal safe data through `contextBridge`; no real file organizer API yet
- `electron/fileScanner.ts` — real top-level scanner implemented and compiles
- `electron/tests/fileScanner.test.ts` — tests written and passing (12 tests)

---

## What Is NOT Implemented Yet

### Electron main process — missing

The following real file-operation modules are not implemented yet:

- [ ] `electron/ipcHandlers.ts` — IPC channel registration
- [x] `electron/fileScanner.ts` — implemented and compiles; scanner tests pass
- [ ] `electron/movePlanner.ts` — target path construction and conflict detection
- [ ] `electron/fileMover.ts` — actual safe file moving and target folder creation
- [ ] `electron/historyStore.ts` — read/write `history.json` in `app.getPath("userData")`
- [ ] `electron/undoService.ts` — undo the latest operation from history records

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

**Begin Electron main-process implementation by adding `electron/movePlanner.ts`.**

With `electron/fileScanner.ts` implemented and tested, the next work is building target paths and detecting conflicts in `electron/movePlanner.ts`.

Do not change the mock renderer yet. Focus on:

- constructing deterministic target folder paths using `EXTENSION_RULES` and the scanned file metadata
- detecting destination conflicts when a target file already exists
- returning structured plan items (source path, target folder, target path, conflict flag)
- keeping behavior local to the main process (no IPC changes yet)

Do not add:

- actual file moving (leave to `fileMover.ts`)
- undo logic (leave to `undoService.ts`)
- AI, OCR, or semantic classification
- new dependencies unless explicitly approved

### Implementation guidance

- Keep `electron/movePlanner.ts` focused on path construction and conflict detection only
- Use Node.js `path` utilities and `fs.existsSync` safely in the main process
- Do not modify the renderer in this step
- After `movePlanner.ts` compiles and tests pass, proceed to `electron/fileMover.ts`

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
