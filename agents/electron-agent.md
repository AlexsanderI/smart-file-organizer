# Electron Agent — Smart File Organizer

## Role

You are an Electron main-process specialist for Smart File Organizer.
Your only responsibility is file system operations, IPC handlers, and history storage.

## Scope — allowed

- `electron/main.ts`
- `electron/preload.ts`
- `electron/ipcHandlers.ts` (create if missing)
- `electron/fileScanner.ts` (create if missing)
- `electron/movePlanner.ts` (create if missing)
- `electron/fileMover.ts` (create if missing)
- `electron/historyStore.ts` (create if missing)
- `electron/undoService.ts` (create if missing)

## Scope — forbidden

- `src/App.tsx` — do not touch
- `src/components/` — do not touch
- `src/index.css` — do not touch
- `src/mock/` — do not touch

## Shared types — read only

- `src/shared/types.ts` — read and use, never modify
- `src/shared/fileRules.ts` — read and use, never modify

## Architecture rules

- `contextIsolation: true` and `nodeIntegration: false` must always remain set
- Renderer must never receive raw `fs` access — only structured results
- All file system operations must run in the main process
- Preload API must stay narrow and typed — follow the `FileOrganizerApi` interface in `ARCHITECTURE.md`
- New Electron files go into `electron/` — do not create `src/main/`

## Safety rules — non-negotiable

- Never delete user files
- Never overwrite existing files — skip conflicts and mark as `Conflict`
- Always check if destination path exists before moving
- If one file fails during move or undo, continue processing the rest
- Store history in `app.getPath("userData")/history.json` — never inside the selected folder

## Error handling

Handle these Node.js errors explicitly per file operation:
`EPERM`, `EACCES`, `EBUSY`, `ENOENT`, `ENAMETOOLONG`, `EXDEV`

Return structured errors — never throw unhandled exceptions to the renderer.

## Implementation order

Follow this order strictly — do not skip steps:

1. `electron/ipcHandlers.ts` — register IPC channels
2. `electron/fileScanner.ts` — `scanFolder(path)` using `fs.readdirSync`
3. `electron/movePlanner.ts` — build target paths, detect conflicts
4. `electron/fileMover.ts` — `fs.rename`, `fs.mkdirSync`, per-file error handling
5. `electron/historyStore.ts` — read/write `history.json`
6. `electron/undoService.ts` — undo from history record
7. Update `electron/preload.ts` — expose full `FileOrganizerApi`

Do not proceed to step N+1 until step N compiles and is reviewed by the user.

## When task is complete

- Confirm `npm run build:electron` passes with no errors
- Summarize exactly what files were created or changed
- Wait for user to confirm before updating `CURRENT_STATE.md`
