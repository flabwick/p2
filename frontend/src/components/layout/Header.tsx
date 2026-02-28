import './Header.css'
import { SidebarToggles } from './SidebarToggles'
import { ViewButtons } from './ViewButtons'

interface HeaderProps {
  activeView: string
  onMenuToggle: () => void
  onTabsToggle: () => void
  isMenuExpanded: boolean
  isTabsExpanded: boolean
  onViewChange: (view: 'desk' | 'feed' | 'log') => void
}

export function Header({
  activeView,
  onMenuToggle,
  onTabsToggle,
  isMenuExpanded,
  isTabsExpanded,
  onViewChange,
}: HeaderProps) {
  return (
    <header className="layout-header">
      <SidebarToggles
        onMenuToggle={onMenuToggle}
        onTabsToggle={onTabsToggle}
        isMenuExpanded={isMenuExpanded}
        isTabsExpanded={isTabsExpanded}
      />
      
      <div className="header-content">
        <div className="header-left">
          <ViewButtons
            activeView={activeView as 'desk' | 'feed' | 'log'}
            onViewChange={onViewChange}
          />
          <span className="header-tab-title">{activeView}</span>
        </div>
        
        <div className="header-center">
          <span className="header-view-label">Current View: {activeView}</span>
        </div>
        
        <div className="header-right">
          {/* Header actions go here */}
        </div>
      </div>
    </header>
  )
}
