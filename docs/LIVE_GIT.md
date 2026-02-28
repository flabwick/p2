# Project Context: p2 (Mental Models)

## Vision
A chat-like app where content is modular—users mix, match, and rearrange blocks rather than scrolling an endless conversation. The UI blends paper‑digital and neo‑brutalist aesthetics: antique cardstock, bold borders, bento‑box spacing, and physical click feedback.

## Core Entities
- **Vaults** – file directories (folders/files). Can be uploaded or created in‑app.
- **Pockets** – the central unit (like a context window). Organised in Recent, Inbox (auto‑generated), and Folders.
- **Feed** – the main editable area inside a Pocket, composed of **Cards** and **Blocks**. Refreshed via LLM.
- **Desks / Log / Dock** – supporting UI panels.

## Guiding Principles
- **Lo‑fi, intentional feel** – calm colours, paper texture, 2D depth, no drop shadows.
- **Modular & extensible** – blocks are pluggable; operations use a low‑token DSL.
- **Real‑time & cloud‑sync** – Supabase for auth, DB, storage, and real‑time.
- **LLM orchestration** – weak model for executive decisions, strong model for focused proposals.
- **Mobile first?** Web first, then React Native, then desktop.
- **Physical UI feedback** – all interactive elements use standardized button component with 90s keyboard press animation.
- **Local‑first development** – The project uses Supabase local development with Docker, mirroring production. All environment variables are split between frontend (`VITE_*`) and edge functions (via symlinked `.env`). Shared code is strictly platform‑agnostic and validated in both Deno and browser environments.

## Architecture Summary
- **Frontend**: React + TypeScript + Vite, Zustand, DnD Kit, Framer Motion.
- **Backend**: Supabase (PostgreSQL, Storage, Realtime, Edge Functions) + OpenRouter for LLM.
- **Shared**: Pure TypeScript code (DSL parser, types, utilities) usable in frontend and edge functions.
- **Directory structure** – feature‑based (vault, pockets, feed, generators, dock) with shared UI components.

---

# Git Setup: Initial Feature Branch Workflow

**Date:** 2026-02-26

## Branch Structure Established

| Branch | Purpose | Status |
|--------|---------|--------|
| `master` | Empty baseline (README only) | Preserved |
| `feature/beginnings` | Initial project structure | ✅ Merged to remote |
| `feature/initial-structure-sprint` | Build on beginnings | 🔄 Active |

## Key Decisions

- **No merge to master yet** — waiting for functional MVP
- `node_modules/` removed from history via `git rm --cached` + `.gitignore`
- Clean commit: 35 files, 162KB (was 1000s of dependency files)

## Commands Log

```bash
git add -A
git commit -m "feat: beginnings..."
git rm -r --cached node_modules  # Fix: remove committed deps
git commit --amend --no-edit
git push origin feature/beginnings
git checkout -b feature/initial-structure-sprint