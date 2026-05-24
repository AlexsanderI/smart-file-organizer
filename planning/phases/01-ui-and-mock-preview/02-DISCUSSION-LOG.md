# Discussion Log

This document records important product and architecture decisions for Smart File Organizer.

The purpose of this file is to prevent repeated discussion, scope creep, and accidental implementation of features that belong to later phases.

---

## Decision: Phase 1 Is Extension-Only

Phase 1 must classify files only by file extension.

No AI, OCR, PDF analysis, image analysis, filename-based semantic analysis, or cloud services are allowed.

Reason:

The first MVP must be predictable, safe, and easy to test before any intelligent classification is introduced.

---

## Decision: Semantic Folders Are Phase 2+

The following categories are not allowed for automatic Phase 1 classification:

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

These categories cannot be determined reliably from file extension alone.

They require at least one of the following:

- filename analysis
- user-defined rules
- manual category editing
- content analysis
- AI-based classification

Therefore, they belong to Phase 2 or Phase 3.

---

## Decision: Phase 1 Uses Extension-Based Folder Taxonomy

Allowed Phase 1 root folders:

```txt
01_Documents
02_Media
03_Archives
04_Installers
05_Code
06_To_Review
07_Other
```

This taxonomy is intentionally simple and deterministic.

---

## Decision: Non-Recursive Scanning

Phase 1 scans only regular top-level files in the selected folder root.

Subfolders are not scanned recursively.

Directories are ignored.

Reason:

The application creates target folders inside the selected folder. Recursive scanning could accidentally re-process already organized files.

---

## Decision: Conflict Handling

If the destination file already exists, the file is marked as `Conflict` and skipped.

Phase 1 must not overwrite files.

Phase 1 must not auto-rename conflicting files unless this behavior is explicitly added later.

Reason:

Skipping conflicts is safer and easier to explain than overwriting or renaming.

---

## Decision: Undo Behavior

Undo is best-effort and file-level atomic.

If one file cannot be restored, the app continues restoring other files and reports the failed items.

Undo must be based on the latest operation record.

Reason:

The user may manually rename, move, delete, or modify files after sorting. Undo must handle this safely.

---

## Decision: History Storage Location

Operation history must be stored in Electron's user data directory:

```ts
app.getPath("userData") + "/history.json"
```

History must not be stored inside the selected folder.

Reason:

The selected folder is user-controlled and may be cleaned, moved, deleted, or sorted.

---

## Decision: Renderer Must Not Access fs Directly

The renderer process must not use Node.js `fs` directly.

All file-system operations must run in the Electron main process.

The preload layer must expose only safe high-level methods.

Reason:

This keeps the Electron architecture safer, cleaner, and easier to maintain.
