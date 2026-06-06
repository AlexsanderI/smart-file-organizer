# Agent Workflow Rules

## Before changing code

Every coding agent must first read:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/FILE_RULES.md`
- `planning/phases/01-ui-and-mock-preview/03-UI-SPEC.md`

## Current phase

The project is in Product Phase 1.

Phase 1 is a local deterministic mock/local MVP.

Do not add:

- real AI
- OCR
- semantic classification
- real file moving
- file deletion
- overwrite behavior
- recursive scanning
- cloud sync

## Change scope

Make the smallest possible change.

Do not rewrite unrelated files.

Do not refactor the whole project unless explicitly requested.

## Validation

After code changes, run:

```bash
npm run build:renderer
```
