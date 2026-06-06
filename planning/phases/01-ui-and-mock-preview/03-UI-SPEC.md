# UI Specification

## Goal

Provide a safe, strict dark-themed desktop interface for selecting a local folder, previewing deterministic file moves, confirming selected moves, viewing operation results, and undoing the latest operation.

The UI must support Product Phase 1 only.

Phase 1 means:

- local folder selection
- deterministic extension-based scan
- preview before move
- explicit user confirmation
- local operation history
- undo latest operation
- no AI
- no content analysis
- no OCR
- no semantic classification
- no recursive scan
- no automatic sorting without confirmation

The Phase 1 UI is a safety-first preview and control interface.

The UI must help the user understand what will happen before any file operation happens.

The project must not be considered complete when extension-based sorting works. Extension-based sorting is only the first technical milestone.

---

## Current Implementation Priority

The current immediate UI tasks are:

1. Keep the Phase 1 mock UI stable.
2. Make sidebar summary cards clickable filters.
3. Add active filter highlighting.
4. Replace unclear top labels such as `Show Sel` and `Show Conf`.
5. Keep expandable row details directly under the related file row.
6. Preserve internal table scrolling.
7. Preserve clear separation between checkbox selection and details expansion.
8. Keep all core actions directly visible.
9. Do not add real file-system access yet.
10. Do not add IPC yet.
11. Do not add AI, OCR, content analysis, or semantic classification yet.

The next coding agent should focus only on the current UI polish tasks unless the user explicitly requests a different task.

---

## Core UX Principle

This is a desktop utility, not a long scrolling webpage.

Main rule:

```txt
Controls stay visible.
Data scrolls internally.
```

The user should not need to scroll the whole page to reach primary controls.

The following areas should remain visible:

- left sidebar controls
- top selection controls
- top details controls
- preview table header

Scrollable areas:

- preview table body
- expanded file details
- long detail content if needed

---

## Phase 1 Boundaries

The UI must not suggest that Phase 1 understands file meaning.

The UI must not imply semantic classification such as:

- invoices
- insurance
- contracts
- housing documents
- work documents
- personal documents
- family photos
- screenshots by meaning

In Phase 1, classification is deterministic and extension-based only.

The UI may show classification metadata such as:

- classification source
- confidence
- reason
- manual override status

But for Phase 1:

```txt
classification source = extension
confidence = 1
reason = mapped by extension
manual override = none
```

Future semantic classification must be treated as a later layer, not as part of the current Phase 1 UI.

---

## Layout

The application uses a two-column desktop layout:

1. Left sidebar
2. Main preview area

The app shell should use viewport-based sizing:

```txt
h-screen
overflow-hidden
```

The page itself should not become a long scrolling document during normal use.

Use internal scroll containers for the table and expanded details.

Dark theme is mandatory.

Suggested Tailwind direction:

```txt
bg-slate-950
bg-slate-900
bg-slate-800
border-slate-700
text-slate-100
text-slate-400
hover:bg-slate-800
```

Avoid:

- light backgrounds
- heavy shadows
- visual clutter
- oversized buttons
- hidden/collapsed menus for core actions

---

## Sidebar

The sidebar contains:

- App title: `Smart File Organizer`
- Short app description
- Selected folder path
- Summary cards
- Folder/action buttons
- Operation buttons

### Selected Folder Path

The selected folder path must be readable.

Rules:

- Do not clip the path vertically.
- If the path is long, truncate horizontally or wrap carefully.
- Add a `title` attribute with the full path.
- Keep the selected folder box compact but readable.

Example:

```txt
C:/Users/you/Downloads (mock)
```

### Sidebar Summary Cards

The sidebar must show these summary cards:

- Total
- Selected
- Ready
- Conflicts
- To Review

These cards are not only counters. They must work as clickable filters for the preview table.

Expected behavior:

- `Total` shows all files.
- `Selected` shows only files selected with checkboxes.
- `Ready` shows only files with status `Ready`.
- `Conflicts` shows files with status `Conflict` or `Failed`.
- `To Review` shows files with status `To Review`.

The active filter card must be visually highlighted.

Filtering must not change selected files.

Filtering must not change expanded detail rows.

Filtering only changes which rows are visible in the table.

Suggested filter type:

```ts
type FileFilter = "all" | "selected" | "ready" | "conflicts" | "to-review";
```

### Sidebar Buttons

Sidebar buttons should remain directly visible.

Do not hide these actions in menus or dropdowns.

Button order:

```txt
Choose Folder
Rescan / Reset Mock Data

Clear Selection

Move Selected Files
Undo Latest Operation
```

Do not add small section labels such as:

```txt
Folder
Selection
Operations
```

They add visual noise. Use spacing between groups instead.

### Sidebar Button Behavior

`Choose Folder`

- Phase 1 mock UI may simulate this action.
- Later it will open the real folder picker through preload/main process.

`Rescan / Reset Mock Data`

- Restores initial mock data.
- Clears selected files.
- Clears expanded details.
- Resets active filter to `all`.
- Closes modals.
- Clears operation result summary.

`Clear Selection`

- Clears all selected checkboxes.
- Does not change file statuses.
- Does not reset filters unless explicitly intended.

`Move Selected Files`

- Disabled when no files are selected.
- Opens move confirmation modal.
- In mock mode, only selected `Ready` files may become `Moved`.

`Undo Latest Operation`

- Disabled when there is no operation to undo.
- Opens undo confirmation modal or performs mock undo depending on current mock implementation.

---

## Main Area

The main area contains:

1. Header
2. Selection controls
3. Details controls
4. Active filter feedback
5. Preview table
6. Expanded row details
7. Operation result feedback
8. Confirmation modals

The main area must preserve as much vertical space as possible for the preview table.

Top controls should remain visible.

---

## Top Selection Controls

The UI must provide these visible buttons:

- `Select All`
- `Deselect All`
- `Select Only Ready`
- `Deselect Conflicts`

Do not hide these controls in dropdowns.

Do not use icon-only buttons for these main actions.

### Select All Behavior

`Select All` must select all currently visible rows in the active filter.

Rules:

- If the active filter is `all`, it selects all files.
- If the active filter is `ready`, it selects only visible Ready files.
- If the active filter is `conflicts`, it selects only visible Conflict/Failed files.
- If the active filter is `to-review`, it selects only visible To Review files.
- If the active filter is `selected`, it leaves the current selected set unchanged or reselects the currently visible selected rows.

This behavior matches what the user sees on screen.

Hidden rows must not be unexpectedly selected by `Select All`.

### Other Selection Controls

`Deselect All`

- Clears all selected files, including files hidden by the current filter.

`Select Only Ready`

- Selects all files with status `Ready`.
- This may select Ready files outside the current filter only if the UI clearly indicates that global selection behavior.
- Preferred behavior for Phase 1 mock UI: select Ready files visible in the current filter.

`Deselect Conflicts`

- Removes files with status `Conflict` or `Failed` from selection.
- It may remove conflict selections globally, even if some conflict rows are hidden.

Selection controls must not expand or collapse detail rows.

Selection controls only affect checkbox selection.

---

## Top Details Controls

The UI must provide clear details controls.

Use clear labels.

Do not use unclear abbreviations like:

```txt
Show Sel
Show Conf
```

Preferred labels:

- `Show Selected Details`
- `Show Conflict Details`
- `Hide Details`

Dynamic labels:

- `Show Selected Details` ↔ `Hide Selected Details`
- `Show Conflict Details` ↔ `Hide Conflict Details`
- `Hide Details`

### Details Control Behavior

Use an expanded details mode.

Suggested type:

```ts
type ExpandedDetailsMode = "none" | "manual" | "selected" | "conflicts";
```

Keep expanded row IDs separately:

```ts
expandedFileIds: Set<string>;
```

### Show Selected Details

If current mode is not `selected`:

- close all currently expanded details
- open details only for currently selected files
- set mode to `selected`
- button label becomes `Hide Selected Details`

If current mode is `selected`:

- close selected details
- clear expanded file IDs
- set mode to `none`
- button label becomes `Show Selected Details`

If no files are selected:

- button may be disabled
- or show a subtle message/state
- do not open unrelated details

### Show Conflict Details

If current mode is not `conflicts`:

- close all currently expanded details
- open details only for files with status `Conflict` or `Failed`
- set mode to `conflicts`
- button label becomes `Hide Conflict Details`

If current mode is `conflicts`:

- close conflict details
- clear expanded file IDs
- set mode to `none`
- button label becomes `Show Conflict Details`

If there are no conflict/failed files:

- button may be disabled

### Hide Details

Always:

- clear expanded file IDs
- set mode to `none`

### Manual Row Details

Individual row details must still work.

Clicking `View` / `Hide` in a row:

- toggles only that file
- sets mode to `manual`
- does not change checkbox selection
- does not trigger bulk details mode

---

## Preview Table

The preview table is the main working area of the application.

It must contain these columns:

- Checkbox
- Name
- Extension
- Size
- Category
- Target
- Status
- Details

The table header must remain visible.

The table body must scroll internally.

Expanded details must remain inside the table scroll area.

Lower files must remain reachable even when many detail rows are expanded.

### Table Row Behavior

Each file row must show:

- checkbox
- original file name
- detected extension
- file size
- computed category
- computed target
- current status
- `View` / `Hide` details control

Rows should highlight on hover.

Selected rows may have subtle visual feedback.

Expanded rows should have a subtle highlight or accent.

### Checkbox vs Details

Checkbox selection and details expansion are separate concepts.

Checkbox means:

```txt
This file is selected for a bulk operation.
```

Details expansion means:

```txt
Show me why this file is classified this way.
```

Rules:

- Selecting a checkbox must not automatically expand details.
- Expanding details must not automatically select the file.
- Bulk move actions use checkbox selection.
- Details actions use expanded row state.

---

## Expandable Row Details

File details must appear directly under the related table row.

Do not use a right-side drawer for normal file-level details in the current Phase 1 UI.

Reason:

A right-side drawer creates a visual disconnect when many files are selected or inspected.

Expandable details keep context directly under the file.

### Expanded Detail Content

Each expanded detail row should show:

- file name
- extension
- status
- category
- target
- source path
- target path
- classification source
- confidence
- reason
- manual override status
- error message if available

Example:

```txt
File name: Report 2026.pdf
Extension: pdf
Status: Ready
Category: 01_Documents/PDF
Target: 01_Documents/PDF
Source path: C:/Users/you/Downloads/Report 2026.pdf
Target path: C:/Users/you/Downloads/01_Documents/PDF/Report 2026.pdf
Classification source: extension
Confidence: 1
Reason: mapped by extension
Manual override: none
Error message: None
```

### Expanded Detail Styling

Use strict dark theme.

Suggested style:

```txt
bg-slate-900/60
border-slate-700
text-slate-100
text-slate-400
```

Use a left accent border depending on status:

- `Ready`: emerald or slate accent
- `Conflict`: amber accent
- `Failed`: red accent
- `To Review`: sky or purple accent
- `Skipped`: slate accent
- `Moved`: emerald or blue accent
- `Undone`: blue accent

The style should be clear but not too bright.

---

## Filtering Behavior

Sidebar summary cards control the active file filter.

The table must render `visibleFiles`, derived from:

- all files
- selected files
- ready files
- conflict/failed files
- to review files

Filtering must be independent from selection and expanded details.

Example:

```txt
User selects 3 files.
User clicks Ready filter.
Only Ready files are visible.
The selected file state is preserved.
Selected card still shows the real selected count.
User clicks Selected filter.
All selected files are visible again.
```

The UI should show active filter feedback above the table.

Examples:

```txt
Showing: All files — 6
Showing: Ready files — 2
Showing: Conflicts — 1
Showing: Selected files — 3
Showing: To Review — 2
```

If a filter returns no files, show a clear empty state.

Example:

```txt
No files match this filter.
Click Total to show all files.
```

### Expanded Details and Filters

If a filter hides a row with expanded details:

- the expanded state may remain in memory
- the expanded detail row must not render while the parent row is hidden
- when the user returns to a filter where that row is visible, the expanded state may be restored

Filtering must never render orphaned detail rows.

A detail row must always appear directly below its parent file row.

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

`Ready`

- File can be moved safely.

`Conflict`

- Destination already exists or would conflict.
- File must not be overwritten.
- File should be skipped unless later handled manually.

`Skipped`

- File was intentionally not moved.

`Moved`

- File was moved successfully.

`Failed`

- File operation failed.

`Undone`

- File was restored by undo.

`To Review`

- File needs manual review or is intentionally unsafe to auto-move.

In Phase 1, examples for `To Review` include:

- files without extension
- `.crdownload`
- `.part`
- `.tmp`

Unknown but unmapped extensions should normally go to `07_Other`, not `06_To_Review`, unless explicitly defined otherwise.

---

## Mock Data Rules

Phase 1 mock data must stay aligned with `docs/FILE_RULES.md`.

Examples:

```txt
Report 2026.pdf       -> 01_Documents/PDF       Ready
photo_vacation.jpg    -> 02_Media/Images        Ready
installer_v2.exe      -> 04_Installers          Conflict
notes.txt             -> 01_Documents/Text      Skipped
unknownfile.xyz       -> 07_Other               Ready
download.crdownload   -> 06_To_Review           To Review
```

Rules:

- Use `photo_vacation.jpg`, not `photo_vacation.jpgjpg`.
- `.pdf` maps to `01_Documents/PDF`.
- `.jpg` maps to `02_Media/Images`.
- `.txt` maps to `01_Documents/Text`.
- `.exe` maps to `04_Installers`.
- `.xyz` maps to `07_Other`.
- `.crdownload` maps to `06_To_Review`.

Do not send `.xyz` to `06_To_Review` unless this is explicitly changed in file rules.

---

## Shared Rule Source

The UI should avoid duplicating category and extension mapping logic in multiple places.

Preferred implementation direction:

- keep extension rules in a shared file such as `src/shared/fileRules.ts`
- use the same source of truth for mock data, scanner logic, and preview target computation whenever possible
- avoid hardcoding conflicting file mapping logic inside UI components

This prevents inconsistent behavior such as:

```txt
.xyz -> 07_Other in FILE_RULES.md
.xyz -> 06_To_Review in mock UI
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

### Mock Move Behavior

In Phase 1 mock mode:

- only selected files with status `Ready` may become `Moved`
- `Conflict` files remain `Conflict`
- `To Review` files remain `To Review`
- `Skipped` files remain `Skipped`
- no real files are touched

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

### Mock Undo Behavior

In Phase 1 mock mode:

- files with status `Moved` may return to `Ready`
- operation result summary updates
- no real files are touched

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

Moved: 2
Skipped: 1
Failed: 0
Conflicts: 1
```

After undo, show:

- restored files
- failed restore items
- skipped undo items

---

## Required UI States

The UI must support:

- No folder selected
- Folder selected but scan not started
- Scanning in progress
- Scan completed with files
- Scan completed with no files
- Scan completed with conflicts
- Filter returns no files
- Details expanded manually
- Details expanded for selected files
- Details expanded for conflicts
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
- No files match current filter
- No selected files for selected-details action
- No conflicts for conflict-details action
- No previous operation available for undo
- Scan failed

Example:

```txt
No folder selected yet.
Choose a folder to scan regular top-level files.
```

Example:

```txt
No files match this filter.
Click Total to show all files.
```

Example:

```txt
No files selected.
Select one or more files to show selected details.
```

---

## Accessibility and Clarity

Buttons must have clear text labels.

Avoid unclear abbreviations such as:

```txt
Sel
Conf
```

Use:

```txt
Selected
Conflict
Details
```

Main actions should not be icon-only.

Interactive cards should look clickable.

Disabled buttons should look disabled and should not confuse the user.

Long file paths should not break layout.

Use `title` attributes for truncated paths or names.

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

Avoid:

- light backgrounds
- heavy shadows
- overly bright accents
- noisy UI
- unnecessary section labels

Prefer:

- calm technical interface
- compact spacing
- readable text
- predictable interactions
- visible controls
- internal scrolling for data

---

## Componentization Direction

The current `App.tsx` may become too large during UI iteration.

This is acceptable temporarily during early mock UI work, but it should not remain this way for long.

Future refactoring direction:

```txt
src/
├── components/
│   ├── Sidebar.tsx
│   ├── SummaryCard.tsx
│   ├── TopControls.tsx
│   ├── PreviewTable.tsx
│   ├── FileRow.tsx
│   ├── ExpandedFileDetails.tsx
│   ├── MoveConfirmModal.tsx
│   └── UndoConfirmModal.tsx
├── mock/
│   └── mockScan.ts
└── shared/
    ├── types.ts
    └── fileRules.ts
```

Refactoring should be done as a separate explicit task.

Do not mix major component extraction with unrelated UI behavior changes unless the user explicitly asks for it.

---

## Agent Implementation Rules

When an AI coding agent works on this UI:

1. Make the smallest possible change.
2. Prefer modifying only the files needed for the current UI task.
3. For current UI polish tasks, prefer editing `src/App.tsx` only unless another file must be changed.
4. Do not replace the entire `App.tsx` unless the file is already broken or the user explicitly requests a rewrite.
5. Do not rewrite unrelated files.
6. Do not refactor the whole project unless explicitly requested.
7. Do not combine UI polish with architecture refactoring.
8. Do not add real file operations.
9. Do not add IPC.
10. Do not add AI, OCR, or semantic classification.
11. Preserve mock-based behavior.
12. Keep strict dark theme.
13. Run:

```bash
npm run build:renderer
```

14. Report:

- files changed
- what changed
- what was tested
- anything not completed
