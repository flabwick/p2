import { useState } from 'react'
import { MobileToggleMenu, MenuState } from './MobileToggleMenu'
import { MobileSidebarContent } from './MobileSidebarContent'
import { Tab } from '../../../types/tabs'

// Custom SVG icons matching the project style
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onAddTab: () => void
  onCloseTab: (id: string) => void
  onUpdateTabType: (id: string, type: string) => void
  onUpdateTabTitle: (id: string, title: string) => void
}

export const MobileSidebar = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onUpdateTabType,
  onUpdateTabTitle
}: MobileSidebarProps) => {
  const [activeMenu, setActiveMenu] = useState<MenuState>('shelf')

  const handleOpenFile = (fileId: string, title: string, forceNewTab?: boolean) => {
    // Handle file opening logic
    console.log('Open file:', fileId, title, forceNewTab)
  }

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId)
    onClose()
  }

  const handleAddTab = () => {
    onAddTab()
    onClose()
  }

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    onCloseTab(tabId)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="mobile-sidebar-backdrop" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar-mobile ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="mobile-sidebar-header">
          <h3 className="mobile-text">P2 Mobile</h3>
          <div className="mobile-touch-target" onClick={onClose}>
            <CloseIcon />
          </div>
        </div>

        {/* Toggle Menu */}
        <MobileToggleMenu 
          activeMenu={activeMenu} 
          onMenuChange={setActiveMenu} 
        />

        {/* Content */}
        <MobileSidebarContent 
          activeMenu={activeMenu}
          onOpenFile={handleOpenFile}
          tabs={tabs}
        />
        
        {/* Tabs */}
        <div className="mobile-sidebar-content">
          <div className="mobile-sidebar-section">
            <div className="mobile-section-header">
              <span className="mobile-text-small">Tabs ({tabs.length})</span>
              <div className="mobile-touch-target" onClick={handleAddTab}>
                <PlusIcon />
              </div>
            </div>
            
            <div className="mobile-tabs-list">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`mobile-tab-item ${tab.id === activeTabId ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <div className="mobile-tab-info">
                    <div className="mobile-tab-title mobile-text">{tab.title}</div>
                    <div className="mobile-tab-type mobile-text-small">{tab.type}</div>
                  </div>
                  {tabs.length > 1 && (
                    <div 
                      className="mobile-tab-close mobile-touch-target"
                      onClick={(e) => handleCloseTab(e, tab.id)}
                    >
                      <XIcon />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
