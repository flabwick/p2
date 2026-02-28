import './SidebarToggles.css'

interface SidebarTogglesProps {
  onMenuToggle: () => void
  onTabsToggle: () => void
  isMenuExpanded: boolean
  isTabsExpanded: boolean
}

export function SidebarToggles({
  onMenuToggle,
  onTabsToggle,
  isMenuExpanded,
  isTabsExpanded,
}: SidebarTogglesProps) {
  return (
    <div className="sidebar-toggles">
      <button
        className="sidebar-toggle-header-btn sidebar-toggle-tabs-btn"
        onClick={onTabsToggle}
        title={isTabsExpanded ? 'Collapse tabs' : 'Expand tabs'}
        aria-label="Toggle tab sidebar"
      >
        <span className="toggle-header-icon">#</span>
      </button>

      <button
        className={`sidebar-toggle-header-btn sidebar-toggle-menu-btn ${isMenuExpanded ? 'expanded' : ''}`}
        onClick={onMenuToggle}
        title={isMenuExpanded ? 'Collapse menu' : 'Expand menu'}
        aria-label="Toggle sidebar menu"
      >
        <span className="toggle-header-icon">
          {isMenuExpanded ? '◀ menu' : '▶'}
        </span>
      </button>
    </div>
  )
}
