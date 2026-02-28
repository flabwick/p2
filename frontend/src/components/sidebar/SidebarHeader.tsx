import './SidebarHeader.css'

interface SidebarHeaderProps {
  onClose: () => void
}

export function SidebarHeader({ onClose }: SidebarHeaderProps) {
  return (
    <div className="sidebar-header-overlay">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Papyrus</h2>
        <button className="sidebar-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )
}
