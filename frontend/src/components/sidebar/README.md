# Sidebar Component Structure

This folder contains the organized Sidebar component and its sub-components.

## Components

### `Sidebar.tsx`
Main sidebar container component that handles:
- Resize functionality
- Component composition
- State management for width and resizing

### `SidebarHeader.tsx`
Header component containing:
- Title display
- Close button
- Overlay positioning

### `SidebarMenu.tsx`
Menu component containing:
- Navigation items
- Recent items
- Scrollable content area

### `TabBar.tsx`
Tab bar component containing:
- Explorer, Search, Settings, Extensions tabs
- Icon-based navigation
- Active state management

## Styling

Each component has its own CSS file:
- `Sidebar.css` - Main container and resize handle
- `SidebarHeader.css` - Header overlay and controls
- `SidebarMenu.css` - Menu content and items
- `TabBar.css` - Tab navigation and icons

## Usage

```typescript
import { Sidebar } from '@/components/sidebar'

// Or import individual components
import { Sidebar, SidebarHeader, SidebarMenu, TabBar } from '@/components/sidebar'
```

The original `Sidebar.tsx` in the `layout` folder now re-exports from this organized structure for backward compatibility.
