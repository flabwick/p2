# Frontend Styles Organization

## Overview

The styles are organized into a clean, modular structure in `src/styles/` with component-specific styles living alongside their components.

## File Structure

```
src/
├── styles/
│   ├── globals.css          ← Entry point (imports all)
│   ├── tokens.css           ← Design system variables
│   ├── resets.css           ← Global resets & normalization
│   └── utilities.css        ← Utility classes
│
└── components/
    └── layout/
        ├── Layout.tsx       ← Component
        ├── Layout.css       ← Layout wrapper styles
        ├── Header.tsx       ← Component
        ├── Header.css       ← Header styles
        ├── MainPanel.tsx    ← Component
        ├── MainPanel.css    ← Main panel styles
        ├── Dock.tsx         ← Component
        └── Dock.css         ← Dock styles
```

## File Descriptions

### `globals.css`
**Entry point** for all global styles. Imports other CSS files in order:
1. `tokens.css` - CSS custom properties (variables)
2. `resets.css` - Global normalization
3. `utilities.css` - Helper classes

### `tokens.css`
**Design system variables** defined in `:root`:

```css
/* Colors */
--paper-ivory: #fcf9f0
--paper-cream: #faf5e9
--paper-oatmeal: #f5ede1
--accent-burnt-orange: #c56c3c
--ink-dark: #3a3a3a

/* Spacing */
--space-xs: 0.5rem
--space-sm: 1rem
--space-md: 1.5rem

/* Typography */
--font-sans: system fonts
--font-mono: 'IBM Plex Mono'

/* Transitions */
--transition-physical: 0.1s cubic-bezier(...)
```

### `resets.css`
**Global resets and normalization**:
- Element resets (margins, padding)
- Typography defaults
- Form element styling
- Scrollbar customization
- Link and button defaults

### `utilities.css`
**Reusable utility classes** for:
- Spacing (margin, padding)
- Display (flex, grid, hidden)
- Text (alignment, font-weight, size)
- Background colors
- Borders and radius
- Sizing and positioning
- Opacity and visibility

## Component Styles

Each layout component has its own CSS file:

### Header.css
```css
.layout-header          ← Main header container
.header-left            ← Left section
.header-center          ← Center section
.header-right           ← Right section
.header-title           ← Application title
.header-view-label      ← Current view indicator
```

### MainPanel.css
```css
.layout-main-panel      ← Main content area
.main-placeholder       ← Placeholder content
```

### Dock.css
```css
.layout-dock            ← Footer navigation
.dock-content           ← Inner wrapper
.dock-view-buttons      ← Button group container
.dock-button            ← Individual button
.dock-button.active     ← Active state
.dock-actions           ← Actions section
```

### Layout.css
```css
.layout-wrapper         ← Full-height flex container
                        ← Design tokens (now imported)
                        ← Animations
```

## Design System

### Color Palette

**Paper Tones** (Backgrounds):
- `--paper-ivory`: #fcf9f0 (lightest)
- `--paper-cream`: #faf5e9
- `--paper-oatmeal`: #f5ede1 (main background)
- `--paper-linen`: #efe6d8
- `--paper-kraft`: #e8ddcd (darkest)

**Ink** (Text & Borders):
- `--ink-black`: #1e1e1e (borders, primary text)
- `--ink-dark`: #3a3a3a (headings)
- `--ink-medium`: #5e5e5e (secondary text)
- `--ink-light`: #8a8a8a (tertiary, shadows)

**Accents**:
- `--accent-burnt-orange`: #c56c3c (primary)
- `--accent-deep-teal`: #1f6d6a (secondary)
- `--accent-oxblood`: #792e3a (danger)
- `--accent-mustard`: #cb9e4a (tertiary)

### Spacing Scale
```
0.5rem  → --space-xs (8px)
1rem    → --space-sm (16px)
1.5rem  → --space-md (24px)
2rem    → --space-lg (32px)
3rem    → --space-xl (48px)
4rem    → --space-xxl (64px)
```

### Typography
```
Sans:   -apple-system, BlinkMacSystemFont, etc.
Serif:  Georgia, Times New Roman
Mono:   IBM Plex Mono, Courier New
```

## How to Use

### Import in Components
```tsx
// Component CSS imports its own styles
import './Header.css'

export function Header() { ... }
```

### Use Design Tokens
```css
/* Use variables in your CSS */
.my-element {
  background-color: var(--paper-ivory);
  border: var(--border-medium);
  padding: var(--space-md);
  font-family: var(--font-mono);
  transition: all var(--transition-physical);
}
```

### Use Utility Classes
```tsx
// Apply utility classes in JSX
<div className="flex flex-center gap-md">
  <button className="p-sm bg-ivory">Click</button>
</div>
```

## Adding New Styles

### Option 1: Component-Specific CSS
Create alongside the component:
```
MyComponent.tsx
MyComponent.css  ← Import in component
```

### Option 2: Utility Classes
Add to `utilities.css` for reusable patterns

### Option 3: Global Resets
Add to `resets.css` for element defaults

## Customization

### Change Colors
Edit `tokens.css`:
```css
--paper-ivory: #your-color;
--accent-burnt-orange: #your-color;
```

### Add Spacing Value
Add to `tokens.css`:
```css
--space-2xl: 5rem; /* 80px */
```

### Add New Utility
Add to `utilities.css`:
```css
.text-uppercase { text-transform: uppercase; }
```

## Best Practices

✅ **Do:**
- Use CSS variables for consistent styling
- Keep component styles with components
- Use utility classes for common patterns
- Keep nesting shallow (max 2 levels)
- Organize selectors logically

❌ **Don't:**
- Use inline styles
- Create global selectors that might conflict
- Use `!important` (except for utilities)
- Duplicate color values
- Create deeply nested selectors

## Next Steps

1. Create feature-specific style files as needed
2. Follow the same token-based approach
3. Reference existing components for patterns
4. Update `utilities.css` with new reusable classes
