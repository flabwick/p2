import './Header.css'
import { motion } from 'framer-motion'
import { MainPanelView, PocketSubView } from '../dock/Dock'
import React, { useRef, useState, useEffect } from 'react'
import { Tab } from '../../../types/tabs'
import { useVaultStore } from '../../../features/vault/store/vaultStore'

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
  activeView: MainPanelView
  onViewChange: (view: MainPanelView) => void
  pocketView: PocketSubView
  onPocketViewChange: (view: PocketSubView) => void
  title?: string
  onTitleChange?: (title: string) => void
  activeTab?: Tab
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
  onTitleChange,
  activeTab
}: HeaderProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  const stripExt = (name: string) => {
    if (activeTab?.type !== 'file') return name;
    const ext = activeTab.fileExtension;
    if (ext && name.endsWith(`.${ext}`)) {
      return name.slice(0, -(ext.length + 1));
    }
    const parts = name.split('.');
    if (parts.length > 1) {
      parts.pop();
      return parts.join('.');
    }
    return name;
  };

  const [localTitle, setLocalTitle] = useState(stripExt(title))
  const [isDup, setIsDup] = useState(false)
  
  const { files, checkDuplicate, renameNode } = useVaultStore()
  const file = activeTab?.type === 'file' ? files.find(f => f.id === activeTab.fileId) : null

  useEffect(() => {
    setLocalTitle(stripExt(title))
  }, [title, activeTab?.type, activeTab?.fileExtension])

  useEffect(() => {
    if (activeTab?.type === 'file' && file) {
      const extension = activeTab.fileExtension ? `.${activeTab.fileExtension}` : '';
      const fullTitle = localTitle.trim() + extension;
      if (fullTitle && fullTitle.toLowerCase() !== file.name.toLowerCase()) {
        setIsDup(checkDuplicate(fullTitle, 'file', file.folder_id || null, file.id))
      } else {
        setIsDup(false)
      }
    } else {
      setIsDup(false)
    }
  }, [localTitle, activeTab, file, checkDuplicate])

  const handleTitleClick = () => {
    if (titleInputRef.current) {
      titleInputRef.current.select()
    }
  }

  const commitRename = async () => {
    const trimmedBase = localTitle.trim()
    const extension = activeTab?.type === 'file' && activeTab.fileExtension ? `.${activeTab.fileExtension}` : '';
    const fullNewTitle = trimmedBase + extension;
    
    if (!trimmedBase || isDup) {
      setLocalTitle(stripExt(title))
      return
    }

    if (fullNewTitle !== title) {
      onTitleChange?.(fullNewTitle)
      
      if (activeTab?.type === 'file' && activeTab.fileId) {
        await renameNode(activeTab.fileId, 'file', fullNewTitle)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      titleInputRef.current?.blur()
    } else if (e.key === 'Escape') {
      setLocalTitle(stripExt(title))
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
            <div className={`header-title-wrapper ${isDup ? 'duplicate-error' : ''}`}>
              <input 
                ref={titleInputRef}
                className="header-title-input" 
                value={localTitle} 
                onChange={(e) => setLocalTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={commitRename}
                onClick={handleTitleClick}
                spellCheck={false}
                size={1}
              />
              <span className="header-title-measure">{localTitle || ' '}</span>
            </div>
            {activeTab?.type === 'file' && activeTab.fileExtension && (
              <span className="header-title-extension">.{activeTab.fileExtension}</span>
            )}
            {isDup && (
              <div className="header-title-error-toast">
                Duplicate name in this folder
              </div>
            )}
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
