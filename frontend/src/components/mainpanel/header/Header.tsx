import './Header.css'
import { motion } from 'framer-motion'
import { MainPanelView, PocketSubView } from '../dock/Dock'
import React, { useRef } from 'react'

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

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
)

interface HeaderProps {
  onMenuToggle: () => void
  onTabsToggle: () => void
  isMenuExpanded: boolean
  isTabsExpanded: boolean
  activeView: MainPanelView
  onViewChange: (view: MainPanelView) => void
  pocketView: PocketSubView
  onPocketViewChange: (view: PocketSubView) => void
  title?: string
  onTitleChange?: (title: string) => void
}

export function Header({
  onMenuToggle,
  onTabsToggle,
  isMenuExpanded,
  isTabsExpanded,
  activeView,
  onViewChange,
  pocketView,
  onPocketViewChange,
  title = 'Untitled',
  onTitleChange
}: HeaderProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)

  const handleTitleClick = () => {
    if (titleInputRef.current) {
      titleInputRef.current.select()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      titleInputRef.current?.blur()
    }
  }

  return (
    <header className="main-panel-header">
      <div className="header-content">
        <div className="header-left">
          {/* Sidebar toggle and add buttons */}
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
            </div>
          )}
          
          <div className="header-title-container">
            <div className="header-title-wrapper">
              <input 
                ref={titleInputRef}
                className="header-title-input" 
                value={title} 
                onChange={(e) => onTitleChange?.(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={handleTitleClick}
                spellCheck={false}
                size={1}
              />
              <span className="header-title-measure">{title || ' '}</span>
            </div>
            <button className="header-title-dropdown">
              <ChevronDownIcon />
            </button>
          </div>
        </div>
        
        <div className="header-center">
          {activeView === 'pocket' && (
            <div className="header-subview-toggle" style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <Button 
                className="small" 
                variant={pocketView === 'desk' ? 'primary' : 'ghost'}
                onClick={() => onPocketViewChange('desk')}
              >
                Desk
              </Button>
              <Button 
                className="small" 
                variant={pocketView === 'feed' ? 'primary' : 'ghost'}
                onClick={() => onPocketViewChange('feed')}
              >
                Feed
              </Button>
              <Button 
                className="small" 
                variant={pocketView === 'log' ? 'primary' : 'ghost'}
                onClick={() => onPocketViewChange('log')}
              >
                Log
              </Button>
            </div>
          )}
        </div>
        
        <div className="header-right">
          <span className="header-view-label">{activeView}</span>
        </div>
      </div>
    </header>
  )
}
