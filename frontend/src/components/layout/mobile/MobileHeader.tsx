// Custom SVG icons matching the project style
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
)

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
)

import { MobileTabCounter } from './MobileTabCounter'

interface MobileHeaderProps {
  title: string
  onMenuToggle: () => void
  currentView: 'main' | 'files'
  tabCount: number
  onTabCounterClick: () => void
}

export const MobileHeader = ({ 
  title, 
  onMenuToggle, 
  currentView, 
  tabCount, 
  onTabCounterClick 
}: MobileHeaderProps) => {
  const getViewIcon = () => {
    switch (currentView) {
      case 'main': return <HomeIcon />
      case 'files': return <FolderIcon />
      default: return <HomeIcon />
    }
  }

  return (
    <header className="mobile-header mobile-safe-top">
      <div className="mobile-touch-target" onClick={onMenuToggle}>
        <MenuIcon />
      </div>
      
      <div className="mobile-header-title mobile-text">
        {title}
      </div>
      
      <div className="mobile-header-right">
        <MobileTabCounter tabCount={tabCount} onClick={onTabCounterClick} />
        <div className="mobile-header-icon">
          {getViewIcon()}
        </div>
      </div>
    </header>
  )
}
