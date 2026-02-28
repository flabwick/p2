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

## Architecture Summary
- **Frontend**: React + TypeScript + Vite, Zustand, DnD Kit, Framer Motion.
- **Backend**: Supabase (PostgreSQL, Storage, Realtime, Edge Functions) + OpenRouter for LLM.
- **Shared**: Pure TypeScript code (DSL parser, types, utilities) usable in frontend and edge functions.
- **Directory structure** – feature‑based (vault, pockets, feed, generators, dock) with shared UI components.

---

# Index

# Project Index

Quick reference for navigating the Mental Models codebase.

## Core Concepts
- **Vaults** – File directories (upload/create files)
- **Pockets** – Context windows (Recent, Inbox, Folders)
- **Feed** – LLM-driven interactive form (not chat)
- **Cards/Blocks** – Modular content units
- **Generators** – Automated pocket creation
- **Roles** – Feed behavior instructions

## Key Directories
- `features/` – Feature-based modules (auth, vault, pockets, feed, generators, dock)
- `components/ui/` – Shared dumb components (Button with 90s press anim)
- `components/layout/` – Sidebar, Header, Footer
- `lib/` – Supabase, LLM (OpenRouter), utils
- `shared/` – Cross-platform TypeScript (DSL parser, types)

## Active ADRs
- ADR-001: Tech stack (React+Vite, Supabase, OpenRouter)
- ADR-002: Standardized Button component (Framer Motion 90s press)
- ADR-003: Sidebar resize + view toggle pattern

## Styling Rules
- Paper-digital + neo-brutalist aesthetic
- Antique white/oatmeal bg, monochrome + bold accents
- 2D depth (borders), no drop shadows
- Bento-box spacing, physical press feedback
- Polaroid/newspaper image treatments

## Current Status
Web-first MVP. React + TypeScript + Vite frontend. Supabase backend.

---

# Decisions

# ADR-001: Initial Tech Stack and Project Structure

## Context
We needed a solid foundation for a web app with complex UI, real‑time sync, LLM integration, and a distinctive paper/neo‑brutalist aesthetic. The project must be maintainable, extensible, and ready for future mobile/desktop ports.

## Decision
- **Frontend**: React + TypeScript + Vite for fast builds and modern DX. Zustand for state. DnD Kit for drag‑drop. Framer Motion for physical animations.
- **Backend**: Supabase (PostgreSQL, Storage, Realtime, Edge Functions) – provides auth, DB, file storage, and real‑time out of the box. LLM calls go through OpenRouter (simplifies provider switching).
- **Shared code**: A `shared/` folder with pure TypeScript (DSL parser, types, utilities) that can run on both frontend and edge functions.
- **Folder structure**: Feature‑based under `frontend/src/features/` (auth, vault, pockets, feed, generators, dock). Shared UI in `components/ui/` and `components/layout/`. This scales well and keeps related code together.

## Consequences
- **Affects**: All initial code; sets the pattern for future development.
- **Trade‑offs**: Supabase locks us into their ecosystem, but it accelerates MVP. Using OpenRouter adds a small cost but avoids building our own LLM proxy. Feature‑based structure may need adjustment if features grow too large.

---

# ADR-002: Standardized Button Component with 90s Keyboard Animation

## Context
The UI needed consistent button behavior across sidebar toggles, header controls, and footer view switching. Each button should feel tactile with a physical "keyboard press" animation.

## Decision
Created a reusable `Button` component using Framer Motion with:
- `whileTap`: moves down 3px with no shadow (pressed key effect)
- `whileHover`: lifts up 1px with enhanced shadow
- `active` prop: applies deep teal background with white text (matches sidebar toggle style)
- `square` class variant: fixed 40x40px for icon-only buttons

## Consequences
- **Affects**: `components/ui/Button.tsx`, all button usages in Header, Sidebar, Footer, Layout
- **Trade-offs**: Requires passing `active` boolean prop explicitly for toggle states

---

# ADR-003: Sidebar Resize and View Toggle Pattern

## Context
The sidebar needed drag-to-resize capability while maintaining a minimum width that accommodates toggle buttons without cramping. The footer required a view switcher (Desk/Feed/Log) for main panel content.

## Decision
- **Sidebar**: Min-width 280px, resize handle on right edge with hover highlight. Toggle buttons centered in a padded container with dynamic margins when expanded.
- **Footer**: Three-button toggle using standardized Button component with `active` prop for selected state. "Log" button styled as secondary.

## Consequences
- **Affects**: `Sidebar.tsx`, `Layout.tsx`, `Footer.tsx`, view routing in Layout
- **Trade-offs**: Larger min-width (280 vs 240) ensures buttons fit but uses more screen space on small windows