import React from 'react'

export type MenuState = 'shelf' | 'inbox' | 'library' | 'more'

interface MobileToggleMenuProps {
  onMenuChange: (state: MenuState) => void
  activeMenu: MenuState
}

// Custom SVG icons matching the desktop ToggleMenu
const ShelfIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18v18H3zM3 9h18M3 15h18" />
  </svg>
)

const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)

const LibraryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 6 4 14M12 6v14M8 8v12M4 4v16" />
  </svg>
)

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
)

export function MobileToggleMenu({ onMenuChange, activeMenu }: MobileToggleMenuProps) {
  return (
    <div className="mobile-toggle-menu">
      <button
        className={`mobile-toggle-button ${activeMenu === 'shelf' ? 'active' : ''} mobile-touch-target`}
        onClick={() => onMenuChange('shelf')}
        title="Shelf"
      >
        <ShelfIcon />
        <span className="mobile-toggle-label mobile-text-small">Shelf</span>
      </button>
      
      <button
        className={`mobile-toggle-button ${activeMenu === 'inbox' ? 'active' : ''} mobile-touch-target`}
        onClick={() => onMenuChange('inbox')}
        title="Inbox"
      >
        <InboxIcon />
        <span className="mobile-toggle-label mobile-text-small">Inbox</span>
      </button>

      <button
        className={`mobile-toggle-button ${activeMenu === 'library' ? 'active' : ''} mobile-touch-target`}
        onClick={() => onMenuChange('library')}
        title="Library"
      >
        <LibraryIcon />
        <span className="mobile-toggle-label mobile-text-small">Library</span>
      </button>
      
      <button
        className={`mobile-toggle-button ${activeMenu === 'more' ? 'active' : ''} mobile-touch-target`}
        onClick={() => onMenuChange('more')}
        title="More"
      >
        <MoreIcon />
        <span className="mobile-toggle-label mobile-text-small">More</span>
      </button>
    </div>
  )
}
