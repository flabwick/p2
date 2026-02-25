Frontend
- React + Typescript + Vite
- Zustand (state)
- React Router (navigation)
- TailwindCSS + CSS Modules
- DnD kit
- Framer motion for animation

Backend with supabase. Tables for
- Users
- Vaults
- Pockets
- Cards
- Generators
- Events



```folder structure
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/useAuth.ts
│   │   └── store/authStore.ts
│   │
│   ├── vault/
│   │   ├── components/
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── FilePreview/
│   │   │   │   ├── PolaroidPreview.tsx
│   │   │   │   └── NewspaperClip.tsx
│   │   │   └── FileUploader.tsx
│   │   ├── hooks/useVault.ts
│   │   └── store/vaultStore.ts
│   │
│   ├── pockets/
│   │   ├── components/
│   │   │   ├── PocketGrid.tsx
│   │   │   ├── RecentPockets.tsx
│   │   │   ├── Inbox/
│   │   │   │   ├── InboxList.tsx
│   │   │   │   └── GeneratedPocketCard.tsx
│   │   │   └── Folders/
│   │   ├── hooks/usePockets.ts
│   │   └── store/pocketStore.ts
│   │
│   ├── feed/
│   │   ├── components/
│   │   │   ├── FeedContainer.tsx
│   │   │   ├── Card/
│   │   │   │   ├── CardRenderer.tsx
│   │   │   │   ├── CardHeader.tsx
│   │   │   │   └── CardOperations/
│   │   │   │       ├── OperationPreview.tsx
│   │   │   │       ├── DiffDisplay.tsx
│   │   │   │       └── AcceptDeclineBar.tsx
│   │   │   └── RefreshButton.tsx
│   │   ├── blocks/
│   │   │   ├── BlockRegistry.ts
│   │   │   ├── BlockRenderer.tsx
│   │   │   ├── types/
│   │   │   │   ├── TextBlock/
│   │   │   │   │   ├── TextBlock.tsx
│   │   │   │   │   └── TextBlock.module.css
│   │   │   │   ├── InteractiveBlock/
│   │   │   │   └── GeneratedBlock/
│   │   │   └── builtins/
│   │   ├── hooks/
│   │   │   ├── useRefresh.ts
│   │   │   ├── useOperations.ts
│   │   │   └── useCardDrag.ts
│   │   ├── lib/
│   │   │   ├── dslParser.ts
│   │   │   ├── operationApplier.ts
│   │   │   └── diffGenerator.ts
│   │   └── store/
│   │       ├── feedStore.ts
│   │       └── cardStore.ts
│   │
│   ├── generators/
│   │   ├── components/
│   │   │   ├── GeneratorForm.tsx
│   │   │   └── SchedulePicker.tsx
│   │   ├── hooks/useGenerators.ts
│   │   └── store/generatorStore.ts
│   │
│   └── dock/
│       ├── components/
│       │   ├── Dock.tsx
│       │   ├── DockItem.tsx
│       │   └── DockMenu.tsx
│       └── store/dockStore.ts
│
├── components/
│   ├── ui/ (shared dumb components)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.module.css  # physical click animation
│   │   ├── Card/
│   │   ├── Input/
│   │   └── Modal/
│   └── layout/
│       ├── Sidebar/
│       ├── Header/
│       └── Footer/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── queries/
│   ├── llm/
│   │   ├── openrouter.ts
│   │   ├── prompts/
│   │   │   ├── executivePrompt.ts
│   │   │   └── proposalPrompt.ts
│   │   └── routers/
│   │       └── modelRouter.ts  # weak/strong logic
│   └── utils/
│       ├── idGenerator.ts  # low-token IDs for blocks
│       └── eventBus.ts  # local event system
│
├── hooks/
│   ├── useRealtime.ts  # Supabase subscriptions
│   └── useDragAndDrop.ts
│
├── contexts/
│   ├── ThemeContext.tsx  # paper textures, colors
│   └── RoleContext.tsx  # current feed role
│
├── styles/
│   ├── tokens.css  # colors, borders, paper textures
│   ├── globals.css
│   └── paper.css  # paper texture overlays
│
└── types/
    ├── pocket.types.ts
    ├── card.types.ts
    ├── block.types.ts
    ├── operation.types.ts
    └── generator.types.ts
```