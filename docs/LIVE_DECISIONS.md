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

---

# ADR-004: Local Development Environment Setup

## Context
We needed a consistent local development environment that mirrors production, supports monorepo workspaces, and allows edge functions to share code with the frontend.

## Decision
- Use **Supabase CLI** with Docker for local database and edge functions.
- Configure **pnpm workspaces** in root, with packages `frontend`, `shared`, and `backend/functions/*`.
- Store environment variables:
  - Root `.env` for OpenRouter and Supabase service role (used by edge functions via symlink).
  - Frontend `.env.local` for `VITE_SUPABASE_URL` and anon key.
  - Edge functions use an `import_map.json` that maps `@/shared/` to the local shared package, ensuring Deno compatibility.
- Symlink `backend/supabase/.env` → `../.env.local` so edge functions inherit frontend env.

## Consequences
- Affects: `frontend/`, `shared/`, `backend/`, `supabase/`
- Trade-offs: Requires manual symlink creation; local Supabase must be started before development.
- Enables rapid iteration with hot‑reloading and real‑time updates identical to production.

---

# ADR-005: LLM Model Selection and Fallback Strategy

## Context
We need a cost‑effective, reliable LLM setup for the two‑tier executive/proposal system. The project must handle provider outages gracefully.

## Decision
- **Primary model**: `qwen/qwen3-coder-next` (low cost, strong coding, long context).
- **Backup model**: `minimax/minimax-m2.5` (high‑performance, excellent tool use).
- Both are accessed via OpenRouter; fallback is implemented in code (try primary, catch errors, fallback to backup).
- The shared `llm/client.ts` accepts model name and API key, encapsulating the fallback logic.
- No streaming initially; full responses are processed.

## Consequences
- Affects: `shared/src/llm/client.ts`, all edge functions that call LLM.
- Trade-offs: Slightly higher latency on fallback, but ensures uptime. OpenRouter provider‑level fallback already reduces risk.
- The two‑tier executive/proposal split can later be implemented by calling the same client with different model parameters.

---

# ADR-006: Standardized Button Component with Physical Press Animation

## Context
We needed a reusable button component that provides consistent physical keyboard-like feedback across the entire UI, reinforcing the paper-digital neo-brutalist aesthetic.

## Decision
- Create a centralized `Button` component in `components/ui/Button.tsx` using **Framer Motion**.
- Implement 90s keyboard press animation:
  - **whileTap**: `y: 3`, `boxShadow: '0 0 0 transparent'` (pressed down effect)
  - **whileHover**: `y: -1`, `boxShadow: '0 4px 0 var(--depth-color)'` (lifted effect)
- Support `active` prop for toggle states (swaps to accent-deep-teal background).
- Accepts `children`, `onClick`, `active`, `title`, and `className` props.
- All buttons throughout the app (sidebar tabs, view toggles, pocket menu) use this standardized component.

## Consequences
- Affects: `frontend/src/components/ui/Button.tsx`
- Trade-offs: Requires Framer Motion dependency, but provides smooth hardware-accelerated animations.
- Ensures consistent physical feel across all interactive elements.
- The component is easily copyable for new buttons without recreating the animation logic.

---

# ADR-007: Sidebar with Tab Navigation, Expand/Collapse, and Drag-to-Resize

## Context
The main navigation needed a sidebar that supports multiple feature areas (Pockets, Vault, Roles, Events, Models, Settings) while being flexible and user-adjustable.

## Decision
- **Tab Navigation**: Sidebar contains icon-only buttons for 6 tabs: Pockets, Vault, Roles, Events, Models, Settings. Each tab reveals relevant placeholder content in the sidebar content area.
- **Expand/Collapse**: Sidebar can be toggled open/closed via a menu button in the fixed toggle wrapper (top-left of main content). State managed in Zustand (`isSidebarOpen`).
- **Drag-to-Resize**: Implemented with mouse event handlers (`mousedown`, `mousemove`, `mouseup`):
  - Minimum width: 280px
  - Resize handle is a dedicated div on the right edge of the sidebar
  - Dynamically calculates side margins based on extra width for aesthetic spacing.
- **State Management**: Zustand store (`useLayoutState` hook) manages sidebar state, pocket collection, active pocket, and theme.

## Consequences
- Affects: `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/hooks/useLayoutState.ts`
- Trade-offs: Requires careful mouse event cleanup in useEffect; resize can feel jumpy if not throttled (currently direct update).
- Provides familiar desktop-app feel with intuitive resize handle.
- Content area adapts automatically as sidebar width changes.

---

# ADR-008: Hierarchical Vault Folders and UUID Standardization

## Context
The project required a scalable way to organize user files and folders within "Vaults," ensuring clear ownership and simple database interactions. We also needed to standardize how primary keys are generated across all tables.

## Decision
- **UUID Generation**: Switched from `uuid_generate_v4()` (requires `uuid-ossp` extension) to the native Postgres `gen_random_uuid()`. This reduces extension dependencies and follows modern Supabase/PostgreSQL best practices.
- **Hierarchical Vaults**: Implemented a recursive folder structure for Pockets and Vaults using `parent_id` foreign keys.
- **State Management**: Created a specialized `vaultStore` in Zustand to handle the complex tree-building logic of the file explorer, rather than relying on heavy prop drilling or multiple hooks.
- **UI Interaction**: Standardized on "Inline Input" for creating and renaming folders/files directly within the tree, providing a seamless desktop-like experience.

## Consequences
- Affects: `backend/supabase/migrations/`, `frontend/src/features/vault/store/vaultStore.ts`, `frontend/src/components/sidebar/sidebarmenu/VaultSidebar.tsx`
- Trade-offs: Recursive tree building happens on the client, which is efficient for typical vault sizes but may need optimization if vaults grow to thousands of items.
- Benefit: Consistent ID generation across all tables simplifies database maintenance and ensures portability.