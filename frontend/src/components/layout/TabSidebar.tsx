import './TabSidebar.css'

interface TabSidebarProps {
  isExpanded?: boolean
}

export function TabSidebar({ isExpanded = false }: TabSidebarProps) {
  return (
    <aside className="tab-sidebar">
      <nav className="tab-list">
        <div className="tab-item" title="Tab 1">
          <span className="tab-icon">📝</span>
        </div>
        <div className="tab-item" title="Tab 2">
          <span className="tab-icon">📊</span>
        </div>
        <div className="tab-item" title="Tab 3">
          <span className="tab-icon">⚙️</span>
        </div>
      </nav>
    </aside>
  )
}
