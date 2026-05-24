# Phase 1 Context

This phase covers the local Electron + React boilerplate for the Smart File Organizer MVP.

Boundaries:

- Fully offline desktop application.
- Deterministic sorting only, based on file extensions and explicit type rules.
- No AI, no content analysis, no cloud services.
- Phase 1 folder taxonomy is strictly extension-based:
  - `01_Documents`
  - `02_Media`
  - `03_Archives`
  - `04_Installers`
  - `05_Code`
  - `06_To_Review`
  - `07_Other`
- Semantic categories such as Finance, Personal, and Work are Phase 2+ only.
- Non-Recursive Scan Rule: scan only regular top-level files in the selected folder root; do not scan subfolders recursively.
- Overwrite Prevention Rule: if a target path conflict exists, skip the file by default, mark it as `Conflict` in the preview table, and never overwrite user data.
- Undo Safety Rule: undo is best-effort and file-level atomic based on the operation record; if one file fails to undo, continue undoing the remaining files.
- Store operation history in Electron's `app.getPath("userData")/history.json`, not in the selected folder.
- Focus on safe folder selection, preview, move confirmation, local logging, and undo.
