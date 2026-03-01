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
- ADR-008: Hierarchical Vault Folders and UUID Standardization

## Styling Rules
- Paper-digital + neo-brutalist aesthetic
- Antique white/oatmeal bg, monochrome + bold accents
- 2D depth (borders), no drop shadows
- Bento-box spacing, physical press feedback
- Polaroid/newspaper image treatments

## Current Status
- **Database** – 10 tables created with RLS enabled, foreign keys to `auth.users`. Test data inserted for user `4c81c558-2705-465c-b85e-3687c2bbe962` (email `test@example.com`).
- **Environment** – Root `.env` holds OpenRouter keys and Supabase service role; frontend `.env.local` holds anon key for local Supabase. Edge functions import map configured to use shared code.
- **LLM Strategy** – Primary: `qwen/qwen3-coder-next`; backup: `minimax/minimax-m2.5`. Fallback implemented in shared LLM client.
- **Test Data** – Vaults, pocket folders, pockets, roles, feeds, desks, generators, and files populated. See verification queries in logs.
- **Frontend Implementation** – Working React + TypeScript + Vite interface with:
  - **Sidebar** – Tabs for Pockets, Vault, Roles, Events, Models, Settings. Expand/collapse toggle and drag-to-resize functionality (min-width 280px).
  - **Main Panel** – Displays pocket content with header showing pocket name/ID, placeholder content grid, and footer with status. Panel toggles for Desk/Feed/Log views via Footer component.
  - **Standardized Button** – Reusable component (`components/ui/Button.tsx`) with Framer Motion 90s keyboard press animation (whileTap: y:3 + boxShadow removal, whileHover: y:-1 + boxShadow offset). Used throughout sidebar tabs and view toggles.
  - **State Management** – Zustand store (`hooks/useLayoutState.ts`) managing sidebar state, pockets collection, active pocket, and theme.
- **Styling** – Neo-brutalist paper-digital aesthetic with CSS custom properties (tokens.css): paper palette (ivory, cream, oatmeal, linen, kraft), ink monochrome scale, bold accents (burnt orange, deep teal, oxblood, mustard), 2D depth via border offsets instead of shadows.