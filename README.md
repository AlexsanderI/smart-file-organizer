# Smart File Organizer

Electron + React + Vite + TypeScript + Tailwind CSS boilerplate for the Phase 1 MVP.

---

## Setup

```bash
npm install
```

---

## Development

```bash
npm run dev
```

This runs Vite for the renderer and launches Electron after the web server is ready.

---

## Build

```bash
npm run build
```

---

## Notes

- Renderer output is written to `dist/`.
- Electron main/preload artifacts are written to `dist-electron/`.
- The app loads the Vite dev server in development mode.

---

## Phase 1 Scope

This project is currently in Phase 1.

Phase 1 is a local deterministic MVP:

- no AI
- no LLM calls
- no Gemini API
- no cloud sync
- no content analysis
- no OCR
- no image analysis
- no automatic sorting
- no recursive folder scanning
- no file deletion
- no overwriting existing files

Files are classified only by extension.

All real file-system operations must be handled by the Electron main process.

The renderer process must not access Node.js `fs` directly.

---

## Phase 1 Core Flow

1. User selects a local folder.
2. App scans only regular top-level files.
3. App classifies files by extension.
4. App shows a preview table.
5. User selects files to move.
6. App shows a confirmation modal.
7. App moves only selected files.
8. App logs operation history locally.
9. User can undo the latest operation.

---

## Safety Principles

- Never delete user files.
- Never overwrite existing files.
- Skip conflicts by default.
- Show preview before moving.
- Log every attempted move.
- Undo must be best-effort and file-level atomic.
