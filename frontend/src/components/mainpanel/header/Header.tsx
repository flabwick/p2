import './Header.css'
import { motion } from 'framer-motion'

// Button component using v1 CSS classes
const Button = ({ children, onClick, active, title, className = '', variant = 'primary' }: any) => {
  return (
    <motion.button
      className={`std-button ${variant} ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      title={title}
      whileTap={{ 
        y: 2
      }}
    >
      {children}
    </motion.button>
  );
};

interface HeaderProps {
  onMenuToggle: () => void
  onTabsToggle: () => void
  isMenuExpanded: boolean
  isTabsExpanded: boolean
}

export function Header({
  onMenuToggle,
  onTabsToggle,
  isMenuExpanded,
  isTabsExpanded,
}: HeaderProps) {
  return (
    <header className="main-panel-header">
      <div className="header-content">
        <div className="header-left">
          {/* Sidebar toggle and add buttons - hidden when menu is expanded */}
          {!isMenuExpanded && (
            <div className="header-controls">
              <Button 
                className="square small" 
                variant="ghost" 
                title="Toggle Sidebar"
                onClick={onMenuToggle}
              >
                ☰
              </Button>
              <Button 
                className="square small" 
                variant="ghost" 
                title="Add New"
              >
                +
              </Button>
            </div>
          )}
          
          {/* Divider line - hidden when menu is expanded */}
          {!isMenuExpanded && <div className="header-divider" />}
        </div>
        
        <div className="header-center">
          <span className="header-view-label">Main Panel Header</span>
        </div>
        
        <div className="header-right">
          {/* Header actions go here */}
        </div>
      </div>
    </header>
  )
}
