# AI Agent Instructions for Smart File Organizer

## Purpose

This repository is a small desktop application MVP for organizing files in a local folder, primarily designed for Windows. The core Phase 1 behavior is offline, deterministic sorting based on file extensions and predefined folder rules.

## What an AI coding agent should know

- The app is a local desktop product using Electron + React + Vite + TypeScript + Tailwind CSS.
- Phase 1 must not use AI: sorting is based only on file extension, type mapping, and deterministic rules.
- The app should support selecting a folder, previewing files, choosing which files to move, moving files into a predictable folder structure, logging operations locally, and undoing the latest sort.
- Avoid adding AI or cloud-based features in the current MVP unless explicitly moving into Phase 3 or later.

## Key project doc

- [Product Requirements Document](docs/PRD.md)

## Agent behavior guidance

- Prefer small, safe changes that keep sorting deterministic.
- Preserve the no-AI Phase 1 constraint unless the user asks to evolve the project to Phase 2/3.
- If adding new functionality, keep it aligned with local desktop operation, file system safety, and undo history.

## Suggested next customization

- Add a `skill` for validating desktop file operations and local-history behavior.
- Add a `prompt` for phase-specific feature planning (Phase 1, Phase 2, Phase 3).
