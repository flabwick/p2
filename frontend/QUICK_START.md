# Frontend Layout V2 - Quick Start Guide

## What's New ✨

Your new frontend has a clean, three-part layout:

```
╔═════════════════════════════════════════════════╗
║         🏷️  HEADER                              ║
║  [App Title]   [Current View]   [Actions]       ║
╠═════════════════════════════════════════════════╣
║                                                 ║
║                                                 ║
║              📄 MAIN PANEL                      ║
║         (Your content goes here)                ║
║                                                 ║
║                                                 ║
╠═════════════════════════════════════════════════╣
║ 🖥️  [Desk]  📰  [Feed]  📋  [Log]  |  [More]    ║
║              DOCK (View Buttons)                ║
╚═════════════════════════════════════════════════╝
```

## Key Components

### Header (`./components/layout/Layout.tsx`)
- **Style**: Ivory background, bold 2px border, depth shadow
- **Content**: Title + view indicator + action space
- **Purpose**: Application branding and current state display

### Main Panel
- **Style**: Oatmeal background, scrollable, padded
- **Content**: Dynamically rendered based on active view
- **Placeholder**: Shows "Main Panel" with demo text
- **Future**: Will render DeskViewer, FeedViewer, or LogViewer

### Dock / Footer
- **Style**: Neo-brutalist design, inspired by macOS Dock
- **Features**:
  - View toggle buttons (Desk, Feed, Log)
  - Active state with burnt orange highlight
  - Hover effects (subtle elevation)
  - Separator line for actions section
- **Actions**: Space for context-sensitive buttons

## Design System

### Colors (Warm & Brutalist)
```
Background:     Ivory (#fcf9f0) → Cream (#faf5e9)
Main Content:   Oatmeal (#f5ede1)
Text/Borders:   Ink Black (#1e1e1e)
Active/Primary: Burnt Orange (#c56c3c)
```

### Key Features
- ✅ Bold 2px borders (neo-brutalist)
- ✅ 2D depth shadows (6px offset)
- ✅ Snappy 0.1s transitions
- ✅ Responsive design (collapses on mobile)
- ✅ High contrast (accessibility)
- ✅ Warm, inviting aesthetic

## File Structure

```
frontend/src/
├── components/layout/
│   ├── Layout.tsx      ← Main layout component + Header + Dock
│   └── Layout.css      ← All styling & design system
├── styles/
│   └── globals.css     ← Global resets
├── App.tsx             ← Router wrapper
└── main.tsx            ← Entry point
```

## How It Works

### Current State
The layout uses React `useState` to track:
- `activeView`: 'desk' | 'feed' | 'log'

### Interaction Flow
1. User clicks a dock button (Desk/Feed/Log)
2. `setActiveView(view)` updates state
3. Header updates to show new view
4. Main panel would render appropriate viewer

## Next Steps 🚀

### 1. Create View Components
```
features/
├── desk/
│   └── DeskViewer.tsx
├── feed/
│   └── FeedViewer.tsx
└── log/
    └── LogViewer.tsx
```

### 2. Update Layout to Route Views
```tsx
import DeskViewer from '../features/desk/DeskViewer'
import FeedViewer from '../features/feed/FeedViewer'
import LogViewer from '../features/log/LogViewer'

// In Layout main panel:
{activeView === 'desk' && <DeskViewer />}
{activeView === 'feed' && <FeedViewer />}
{activeView === 'log' && <LogViewer />}
```

### 3. Add Dock Actions
Update the `<Dock>` component to show view-specific actions:
```tsx
{activeView === 'feed' && (
  <button onClick={handleRefresh}>Refresh</button>
)}
{activeView === 'desk' && (
  <button onClick={handleNew}>New</button>
)}
```

### 4. Build Out Features
Create components in `/features` for:
- Authentication
- Pockets management
- Vault storage
- Content generation
- Dock UI enhancements

## Styling Reference

All styles are in `Layout.css` with clear sections:
- `:root` - Design tokens (colors, spacing, fonts)
- `.layout-wrapper` - Main flex container
- `.layout-header` - Header styling
- `.layout-main-panel` - Main content area
- `.layout-dock` - Footer navigation
- Responsive media queries
- Animations & transitions

To customize:
1. Edit CSS variables in `:root`
2. Override specific component classes
3. Add new classes for feature components

## Inspiration ✨

This layout is inspired by the v1 components but:
- ✅ **Simplified** - 3 parts instead of 5+
- ✅ **Cleaner** - Less state, easier to understand
- ✅ **Fresh** - Built from scratch for v2
- ✅ **Extensible** - Ready to grow with features

Reference v1 at `/version1/frontend/src/components/layout/` if needed!

---

**Ready to build?** Start by creating your first viewer component in the `features/` folder! 🎨
