#!/bin/bash
# Visual component structure guide

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║                  FRONTEND V2 LAYOUT COMPONENT STRUCTURE                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

App.tsx
├── <BrowserRouter>
│   └── <Layout />
│       ├── <Header />
│       │   ├── .header-left
│       │   │   └── <h1>.header-title
│       │   ├── .header-center
│       │   │   └── <span>.header-view-label
│       │   └── .header-right
│       │       └── [Future: additional actions]
│       │
│       ├── <main>.layout-main-panel
│       │   ├── .main-placeholder (current)
│       │   └── [Future: 
│       │       <DeskViewer /> (activeView === 'desk')
│       │       <FeedViewer /> (activeView === 'feed')
│       │       <LogViewer />  (activeView === 'log')
│       │   ]
│       │
│       └── <Dock />
│           ├── .dock-content
│           │   ├── .dock-view-buttons
│           │   │   ├── <button>.dock-button [Desk] ← activeView
│           │   │   ├── <button>.dock-button [Feed] ← activeView
│           │   │   └── <button>.dock-button [Log]  ← activeView
│           │   └── .dock-actions
│           │       └── [Future: context-specific buttons]
│           │
│           └── [Sub-components]
│               ├── <DeskIcon />
│               ├── <FeedIcon />
│               └── <LogIcon />


╔══════════════════════════════════════════════════════════════════════════════╗
║                            STATE MANAGEMENT                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

Layout Component State:
  const [activeView, setActiveView] = useState<'desk' | 'feed' | 'log'>('desk')

Flow:
  1. User clicks dock button → onViewChange(view)
  2. setActiveView(view) updates state
  3. Header re-renders with new label
  4. Main panel re-renders appropriate viewer
  5. Dock button shows active state


╔══════════════════════════════════════════════════════════════════════════════╗
║                           STYLING HIERARCHY                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

Layout.css (Single file, well-organized sections):
  ├── :root { CSS custom properties }
  ├── .layout-wrapper { Full-height flex container }
  ├── .layout-header { Top navigation bar }
  ├── .layout-main-panel { Content area }
  ├── .layout-dock { Footer navigation }
  ├── .dock-button { View toggle buttons }
  ├── .dock-button.active { Active state styling }
  ├── @media (max-width: 768px) { Responsive design }
  └── @keyframes { Animations }


╔══════════════════════════════════════════════════════════════════════════════╗
║                          COLOR & SPACING SCALE                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Paper Colors (Background):
  --paper-ivory:      #fcf9f0   ← Header & Dock
  --paper-cream:      #faf5e9   ← Button group background
  --paper-oatmeal:    #f5ede1   ← Main panel
  --paper-linen:      #efe6d8   ← Hover state
  --paper-kraft:      #e8ddcd

Ink Colors (Text & Borders):
  --ink-black:        #1e1e1e   ← Borders, headings
  --ink-dark:         #3a3a3a   ← Primary text
  --ink-medium:       #5e5e5e   ← Secondary text
  --ink-light:        #8a8a8a   ← Shadows
  --ink-faint:        #c0c0c0

Accent Colors:
  --accent-burnt-orange: #c56c3c ← Active/Primary
  --accent-deep-teal:    #1f6d6a
  --accent-oxblood:      #792e3a
  --accent-mustard:      #cb9e4a

Spacing Scale:
  --space-xs:  0.5rem  (8px)
  --space-sm:  1rem    (16px)
  --space-md:  1.5rem  (24px)
  --space-lg:  2rem    (32px)
  --space-xl:  3rem    (48px)


╔══════════════════════════════════════════════════════════════════════════════╗
║                        READY TO BUILD NEXT:                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

Priority 1 - Create View Components:
  □ features/desk/DeskViewer.tsx
  □ features/feed/FeedViewer.tsx
  □ features/log/LogViewer.tsx

Priority 2 - Add State Management:
  □ Create contexts for shared state
  □ Add hooks for view-specific logic
  □ Implement data fetching

Priority 3 - Expand Features:
  □ Authentication in features/auth/
  □ Pocket management in features/pockets/
  □ Vault storage in features/vault/
  □ Content generation in features/generators/

Priority 4 - Polish:
  □ Add transitions and animations
  □ Implement responsive design refinements
  □ Add accessibility features
  □ Create reusable components in components/

╔══════════════════════════════════════════════════════════════════════════════╗

EOF

echo ""
echo "✨ Layout v2 is ready to expand! All components are documented and styled."
echo "📚 Read QUICK_START.md and LAYOUT_ARCHITECTURE.md for detailed guides."
echo ""
