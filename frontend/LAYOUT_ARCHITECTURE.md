# Frontend Layout V2 - Architecture

## Overview

The new frontend uses a simplified three-part layout structure inspired by the v1 design but rebuilt from scratch:

```
┌─────────────────────────────────────┐
│          HEADER                     │
│ (Application title, view indicator) │
├─────────────────────────────────────┤
│                                     │
│          MAIN PANEL                 │
│      (Content area)                 │
│                                     │
├─────────────────────────────────────┤
│    DOCK (View buttons + actions)    │
└─────────────────────────────────────┘
```

## Components

### 1. Header
**Location:** `components/layout/Layout.tsx`

The header provides application branding and view status:
- **Left section**: Application title
- **Center section**: Current view label (desk/feed/log)
- **Right section**: Space for additional actions

**Styling:**
- Paper ivory background (`--paper-ivory`)
- 2px solid black border
- 6px depth shadow effect
- Neo-brutalist design aesthetic

### 2. Main Panel
**Location:** `components/layout/Layout.tsx`

Flexible content area that occupies the middle of the layout:
- Full height minus header and dock heights
- Scrollable if content exceeds viewport
- Oatmeal background (`--paper-oatmeal`)
- Padding and spacing for comfortable content viewing
- Ready for dynamic route rendering

### 3. Dock (Footer)
**Location:** `components/layout/Layout.tsx`

Bottom navigation and actions bar inspired by macOS Dock design:
- **View buttons** (Desk, Feed, Log)
  - Icon + label display
  - Active state highlighting (burnt orange accent)
  - Hover effects with slight upward translation
  - Grouped in a rounded container

- **Actions section** (expandable)
  - Separated by vertical border
  - Context-sensitive buttons
  - Space reserved for view-specific actions

**Styling:**
- Cream background for button group
- Burnt orange (`--accent-burnt-orange`) for active states
- Physical transition effects (0.1s cubic-bezier)
- Hover states with slight elevation

## Design System

### Color Palette
```
Paper Tones:
- --paper-ivory:    #fcf9f0 (lightest, header/dock)
- --paper-cream:    #faf5e9 (dock button group)
- --paper-oatmeal:  #f5ede1 (main panel background)
- --paper-linen:    #efe6d8 (hover state)
- --paper-kraft:    #e8ddcd (strongest paper tone)

Ink (Text & Borders):
- --ink-black:      #1e1e1e (borders, primary text)
- --ink-dark:       #3a3a3a (headings)
- --ink-medium:     #5e5e5e (secondary text)
- --ink-light:      #8a8a8a (tertiary, shadows)

Accents:
- --accent-burnt-orange: #c56c3c (primary action)
- --accent-deep-teal:    #1f6d6a (secondary)
- --accent-oxblood:      #792e3a (danger/warning)
- --accent-mustard:      #cb9e4a (tertiary)
```

### Spacing System
- `--space-xs`: 0.5rem
- `--space-sm`: 1rem
- `--space-md`: 1.5rem
- `--space-lg`: 2rem
- `--space-xl`: 3rem

### Typography
- **Sans serif**: System font stack (Apple → Windows)
- **Monospace**: IBM Plex Mono or Courier
- **Transitions**: 0.1s physical (snappy, responsive feel)

## File Structure

```
src/
├── components/
│   └── layout/
│       ├── Layout.tsx      # Main layout component + sub-components
│       └── Layout.css      # Complete styling
├── styles/
│   └── globals.css         # Global resets
├── App.tsx                 # Router wrapper
└── main.tsx               # Entry point
```

## Usage

### Basic Layout
```tsx
import Layout from './components/layout/Layout'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        {/* Content here */}
      </Layout>
    </BrowserRouter>
  )
}
```

### With Custom Content
```tsx
<Layout>
  <div className="layout-main-panel">
    <YourComponent />
  </div>
</Layout>
```

## Features

✅ **Responsive Design** - Adapts to mobile/tablet screens  
✅ **Accessibility** - Proper semantic HTML, ARIA labels  
✅ **Neo-brutalist Aesthetic** - Bold borders, warm paper tones  
✅ **Physical Interactions** - Snappy transitions and hover states  
✅ **Extensible** - Ready for adding views, features, and actions  

## Adding View-Specific Actions

Edit the `Dock` component to add actions based on `activeView`:

```tsx
function Dock({ activeView, onViewChange }: DockProps) {
  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'feed-refresh':
        // Handle feed refresh
        break
      // ... more actions
    }
  }

  return (
    <footer className="layout-dock">
      {/* ... existing code ... */}
      <div className="dock-actions">
        {activeView === 'feed' && (
          <button onClick={() => handleAction('feed-refresh')}>
            Refresh
          </button>
        )}
      </div>
    </footer>
  )
}
```

## Next Steps

1. Create view-specific components (Desk, Feed, Log)
2. Implement routing for different views
3. Add context providers for shared state
4. Build feature modules (auth, pockets, vault, etc.)
5. Style individual view components
