# Frontend Reorganization

## Overview
The frontend has been reorganized to separate the old version from the new development version.

### Directory Structure

```
p2/
├── frontend/                    # Fresh barebones v2 (current development)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── contexts/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dock/
│   │   │   ├── feed/
│   │   │   ├── generators/
│   │   │   ├── pockets/
│   │   │   └── vault/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
└── version1/                    # Archived original version (reference)
    └── frontend/
        ├── src/
        ├── package.json
        ├── vite.config.ts
        └── index.html
```

## What's New

- **Current Frontend** (`/p2/frontend/`): Fresh barebones structure ready for v2 development
- **Version 1 Archive** (`/p2/version1/frontend/`): Original frontend components preserved for reference

## Getting Started with v2

The new frontend includes:
- Basic folder structure matching the original layout
- `Layout` component scaffold in `components/layout/`
- `Button` component scaffold in `components/ui/`
- Global styles setup
- React Router integration ready in `App.tsx`

All feature modules (auth, dock, feed, generators, pockets, vault) have placeholder directories ready for new components.

## Referencing Version 1

If you need to reference the old components during development:
- Check `/p2/version1/frontend/src/components/` for original component implementations
- Use as reference but rebuild fresh in the new structure
