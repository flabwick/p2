import './SidebarMenu.css'

interface SidebarMenuProps {
  isExpanded: boolean
}

export function SidebarMenu({ isExpanded }: SidebarMenuProps) {
  return (
    <aside className={`sidebar-menu ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-menu-content">
        <h3>Menu</h3>
        <nav className="menu-list">
          <div className="menu-item">Home</div>
          <div className="menu-item">Settings</div>
          <div className="menu-item">Profile</div>
          <div className="menu-item">Help</div>
        </nav>
      </div>
    </aside>
  )
}
