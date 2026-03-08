// Custom SVG icons
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
)

interface MobileBottomNavProps {
  currentView: 'main' | 'files'
  onViewChange: (view: 'main' | 'files') => void
}

export const MobileBottomNav = ({ currentView, onViewChange }: MobileBottomNavProps) => {
  const NavItem = ({ view, Icon, label }: { view: 'main' | 'files', Icon: React.FC, label: string }) => (
    <div
      className={`mobile-nav-item ${currentView === view ? 'active' : ''}`}
      onClick={() => onViewChange(view)}
    >
      <div className="mobile-nav-icon">
        <Icon />
      </div>
      <div className="mobile-nav-label mobile-text-small">
        {label}
      </div>
    </div>
  )

  return (
    <nav className="mobile-bottom-nav mobile-safe-bottom">
      <NavItem view="main" Icon={HomeIcon} label="Home" />
      <NavItem view="files" Icon={FileIcon} label="Files" />
    </nav>
  )
}
