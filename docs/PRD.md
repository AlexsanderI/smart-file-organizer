# Smart File Organizer MVP — PRD

## 1. Project Name

**Smart File Organizer MVP**

A local desktop application for organizing files from the user's Downloads folder or any other selected folder.

---

## 2. Product Summary

Smart File Organizer is a desktop application that helps users clean up a cluttered downloads folder.

The user selects a folder, the application scans the files inside it, detects file types based on file extensions, shows a preview table, and suggests where each file should be moved. After user confirmation, the selected files are moved into a clean and predictable folder structure.

All operations are logged locally, and the latest sorting operation can be reverted using the Undo feature.

In Phase 1, the application works fully offline and does not use AI.

---

## 3. Problem Statement

The Downloads folder often becomes cluttered with different types of files:

- PDF documents
- photos
- screenshots
- videos
- audio files
- archives
- software installers
- work documents
- personal documents
- technical files
- unknown file formats

As a result, users have difficulty finding files, understanding what they downloaded, and keeping their folder organized.

---

## 4. MVP Goal

The goal of the MVP is to build a minimal but reliable desktop application that can:

1. Work with a real folder on the user's computer.
2. Allow the user to select a folder.
3. Scan files inside the selected folder.
4. Detect file categories based on file extensions.
5. Show a preview table before moving files.
6. Allow the user to select which files should be moved.
7. Move selected files into a clear folder structure.
8. Save a local history of operations.
9. Allow the user to undo the latest sorting operation.

---

## 5. Platform and Tech Stack

## Target Platform

Desktop application.

Primary MVP focus:

- Windows
- local file system access
- Downloads folder or any other user-selected folder

## Approved Tech Stack

The MVP must use the following stack:

- **Electron** — desktop shell and access to the local file system
- **React** — user interface
- **Vite** — frontend build tooling
- **TypeScript** — type safety and maintainable architecture
- **Tailwind CSS** — UI styling
- **Node.js fs API** — reading folders, creating folders, moving files
- **Local JSON log file** — operation history storage

---

## 6. Core MVP Principle

Phase 1 must be simple, safe, and predictable.

**Phase 1 must not use AI.**

Sorting must be based only on:

- file extension
- basic file type
- predefined deterministic rules

The application must not try to understand the semantic content of PDFs, images, or documents in Phase 1.

---

# 7. Development Roadmap

---

## Phase 1 — Local MVP Without AI

Goal: build the local application foundation and sort files by extension.

Phase 1 rules:

- Strict extension-based taxonomy only: `01_Documents`, `02_Media`, `03_Archives`, `04_Installers`, `05_Code`, `06_To_Review`, `07_Other`.
- No semantic categories such as Finance, Personal, or Work in Phase 1; semantic sorting is reserved for Phase 2+.
- Non-Recursive Scan Rule: scan only regular top-level files in the selected folder root; do not scan subfolders recursively.
- Overwrite Prevention Rule: if a target file conflict exists, skip the file by default, mark it as `Conflict` in the preview table, and never overwrite user data.
- Undo Safety Rule: undo must be best-effort and file-level atomic based on the operation record; if one file fails to undo, continue undoing the remaining files.
- Operation history must be stored in Electron's `app.getPath("userData")/history.json`, not in the selected folder.

### Included in Phase 1

- Electron desktop application
- React user interface
- folder selection by the user
- scanning files in the selected folder
- detecting file types by extension
- preview table before moving files
- checkboxes for selecting files to move
- creating the target folder structure
- moving selected files
- preventing file overwrites
- operation history
- Undo for the latest sorting operation
- basic error handling

### Not Included in Phase 1

- Gemini API
- AI-based file classification
- PDF content analysis
- OCR
- family photo detection
- document photo detection
- automatic sorting without confirmation
- sorting entire hard drives
- duplicate file detection
- deleting files
- cloud sync
- complex user-defined rules

---

## Phase 2 — Improved Local Rule-Based Logic

Goal: improve sorting quality without AI.

Possible features:

- file name analysis
- screenshot detection by file name
- installer detection
- archive detection
- better document rules
- manual category editing before sorting
- saved user rules

Examples:

- `invoice_2026.pdf` → `01_Documents` in Phase 1; Phase 2 may later route such files to semantic folders like Finance.
- `bewerbung.pdf` → `01_Documents` in Phase 1; Phase 2 may later route such files to Work.
- `IMG_20260524.jpg` → `02_Media`
- `Screenshot_2026.png` → `02_Media`

---

## Phase 3 — Gemini API Integration

Goal: add intelligent content analysis.

Possible features:

- PDF content analysis
- document type detection
- invoice, contract, CV, manual, and form detection
- image analysis
- document photo detection
- family photo detection
- screenshot detection
- AI-based confidence score
- low-confidence files moved to `06_To_Review`

Important:

Gemini API must only be added after the local architecture is stable.

---

## Phase 4 — Scaling

Goal: expand the application beyond a single Downloads folder.

Possible features:

- multiple watched folders
- external drive support
- large directory support
- similar file detection
- duplicate detection
- automatic sorting rules
- sorting profiles
- scheduled sorting
- analysis-only mode without moving files

---

# 8. Target Folder Structure

The application must create a clear and predictable folder structure inside the selected folder.

For example, if the user selects:

```txt
C:\Users\User\Downloads
```

Then the application must create the following structure inside it:

Selected_Folder/
│
├── 01_Documents/
├── 02_Media/
├── 03_Archives/
├── 04_Installers/
├── 05_Code/
├── 06_To_Review/
└── 07_Other/

## Product North Star

The long-term goal of Smart File Organizer is not merely to sort files by extension.

The long-term goal is to help users clean a cluttered Downloads folder by organizing files into meaningful, human-friendly categories such as:

- Invoices
- Insurance documents
- Housing documents
- Work documents
- Personal documents
- Document photos
- Personal photos
- Screenshots
- Installers
- Archives
- To Review

The final product should help the user understand what each file likely is and where it should go before any move operation happens.

However, Phase 1 intentionally does not implement semantic classification.

Phase 1 exists to build the safe local foundation:

- folder selection
- deterministic scan
- preview before moving
- explicit confirmation
- safe move operation
- local operation history
- undo latest operation
- overwrite prevention
- no deletion

Semantic classification is a future layer built on top of this foundation.

The project must not be considered complete when extension-based sorting works. Extension-based sorting is only the first technical milestone.
