# UI Specification

## Goal

Provide a safe, strict dark-themed desktop interface for selecting a local folder, previewing deterministic file moves, confirming selected moves, viewing operation results, and undoing the latest operation.

The UI must support Phase 1 only.

Phase 1 means:

- local folder selection
- deterministic extension-based scan
- preview before move
- explicit user confirmation
- local operation history
- undo latest operation
- no AI
- no content analysis
- no recursive scan

---

## Layout

- The app uses a strict dark mode palette.
- Sidebar and main content are clearly separated via layout, spacing, and borders.
- Backgrounds should use deep dark tones such as `#1e1e1e`, `slate-950`, or `slate-900`.
- Text should use `text-slate-100` with subdued accent text for metadata.
- Prefer clean borders over heavy shadows.
- Use subtle hover state tint changes.
- Keep spacing consistent and readable.
- Avoid visual clutter.

The application uses a two-column layout:

1. Left sidebar
2. Main content area

---

## Sidebar

The sidebar includes:

- App title: `Smart File Organizer`
- Short app description
- Selected folder path
- Folder selection status
- `Choose Folder` button
- `Rescan` button
- `Clear Selection` button
- Scan summary cards for:
  - Total files in root folder
  - Selected files for moving
  - Ready files
  - Conflict files
  - Skipped files
  - To Review files
  - Category counts
- `Undo Latest Operation` button
- Last operation timestamp, if available

Sidebar cards should be simple bordered panels with clear labels and values.

---

## Main Area

The main content area includes:

1. Header section
   - Current selected folder
   - Current scan status
   - Primary action button: `Move Selected Files`

2. Bulk action controls

3. Preview table

4. Error/details drawer or slide-over panel

5. Operation result feedback

---

## Bulk Action Controls

The UI must provide:

- `Select All`
- `Deselect All`
- `Select Only Ready`
- `Deselect Conflicts`
- `Filter Conflicts`
- `Move Selected Files`

The move button must be disabled when:

- no folder is selected
- scan is not completed
- no files are selected
- selected files contain no movable files
- a move operation is already in progress

---

## Preview Table

The preview table must contain the following columns:

- Checkbox
- Name
- Extension
- Size
- Category
- Current location
- Target
- Status

Each row should show:

- original file name
- detected extension
- computed category
- computed target folder
- current status

The table header should remain visible.

Rows should highlight on hover.

Conflicts and failed rows should be visually distinguishable.

---

## File Status Values

The UI must support these statuses:

- `Ready`
- `Conflict`
- `Skipped`
- `Moved`
- `Failed`
- `Undone`
- `To Review`

Status meaning:

- `Ready`: file can be moved safely.
- `Conflict`: destination already exists; file will be skipped.
- `Skipped`: file was intentionally not moved.
- `Moved`: file was moved successfully.
- `Failed`: file operation failed.
- `Undone`: file was restored by undo.
- `To Review`: file needs manual review or has no reliable extension mapping.

---

## Required UI States

The UI must support:

- No folder selected
- Folder selected but scan not started
- Scanning in progress
- Scan completed with files
- Scan completed with no files
- Scan completed with conflicts
- Move in progress
- Move completed successfully
- Move partially failed
- No previous operation available for undo
- Undo available
- Undo in progress
- Undo completed successfully
- Undo partially failed
- Scan failed

---

## Empty States

The UI must show clear empty states for:

- No folder selected
- No files found
- No movable files found
- No previous operation available for undo
- Scan failed

Example empty-state text:

```txt
No folder selected yet.
Choose a folder to scan regular top-level files.
```

```txt
No movable files found.
This folder may be empty or contain only unsupported items.
```

---

## Move Confirmation Modal

Before moving files, the UI must show a confirmation modal.

Text:

```txt
You are about to move X selected files into Y target folders.

No files will be deleted.
Existing files will not be overwritten.
Conflicting files will be skipped.
```

Buttons:

- `Cancel`
- `Move Selected Files`

The primary action must be visually clear but not destructive.

---

## Undo Confirmation Modal

Before undoing the latest operation, the UI must show a confirmation modal.

Text:

```txt
This will try to move files from the latest operation back to their original locations.

Some files may not be restored if they were renamed, deleted, moved manually, or if another file already exists at the original path.
```

Buttons:

- `Cancel`
- `Undo Latest Operation`

The modal must clearly state that undo is best-effort and file-level atomic.

---

## Error Details Drawer

Provide an error details drawer or slide-over panel for file-level failure details.

The drawer should list errors with:

- file name
- status
- source path
- target path
- error message

Example:

```txt
file.pdf — Failed — EBUSY: file is currently open in another application
photo.jpg — Conflict — destination file already exists
archive.zip — Skipped — unsupported or unsafe operation
```

Include actions to:

- close the drawer
- retry only if retry behavior is explicitly implemented
- keep it hidden when there are no errors

---

## Operation Result Feedback

After a move operation, show a clear result summary:

- moved files
- skipped files
- failed files
- conflict files

Example:

```txt
Move completed with warnings.

Moved: 18
Skipped: 3
Failed: 1
Conflicts: 2
```

After undo, show:

- restored files
- failed restore items
- skipped undo items

---

## Dark Theme Requirements

Use Tailwind classes consistent with strict dark mode.

Suggested style direction:

```txt
bg-slate-950
bg-slate-900
bg-slate-800
border-slate-700
text-slate-100
text-slate-400
hover:bg-slate-800
```

Avoid light backgrounds.

Avoid heavy shadows.

Prefer calm, technical, predictable UI.
