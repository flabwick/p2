import { Tab } from '../../../types/tabs'

// Custom SVG icons
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

interface MobileTabManagerProps {
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onAddTab: () => void
  onCloseTab: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export const MobileTabManager = ({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
  isOpen,
  onClose
}: MobileTabManagerProps) => {
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
    if (tabs.length > 1) {
      onCloseTab(tabId)
    }
  }

  const getFileIcon = (extension?: string) => {
    if (!extension) return '📄'
    
    const ext = extension.toLowerCase()
    switch (ext) {
      case 'pdf': return '📕'
      case 'epub': return '📗'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return '🖼️'
      case 'md':
      case 'markdown': return '📝'
      default: return '📄'
    }
  }

  const getTabIcon = (tab: Tab) => {
    switch (tab.type) {
      case 'pocket': return '📁'
      case 'file': return getFileIcon(tab.fileExtension)
      case 'role': return '🎭'
      case 'welcome': return '🏠'
      default: return '📄'
    }
  }

  if (!isOpen) return null

  return (
    <div className="mobile-tab-manager">
      {/* Backdrop */}
      <div className="mobile-tab-backdrop" onClick={onClose} />
      
      {/* Tab Grid Container */}
      <div className="mobile-tab-grid-container">
        {/* Header */}
        <div className="mobile-tab-header">
          <h2 className="mobile-text">Tabs ({tabs.length})</h2>
          <div className="mobile-tab-actions">
            <div className="mobile-touch-target" onClick={handleAddTab}>
              <PlusIcon />
            </div>
            <div className="mobile-touch-target" onClick={onClose}>
              <CloseIcon />
            </div>
          </div>
        </div>

        {/* Tab Grid */}
        <div className="mobile-tab-grid">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`mobile-tab-card ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <div className="mobile-tab-card-content">
                <div className="mobile-tab-icon">
                  {getTabIcon(tab)}
                </div>
                <div className="mobile-tab-info">
                  <div className="mobile-tab-title mobile-text">
                    {tab.title || 'Untitled'}
                  </div>
                  <div className="mobile-tab-type mobile-text-small">
                    {tab.type}
                    {tab.fileExtension && ` • .${tab.fileExtension}`}
                  </div>
                </div>
                {tabs.length > 1 && (
                  <div 
                    className="mobile-tab-close mobile-touch-target"
                    onClick={(e) => handleCloseTab(e, tab.id)}
                  >
                    <CloseIcon />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Add New Tab Card */}
          <div className="mobile-tab-card mobile-add-tab" onClick={handleAddTab}>
            <div className="mobile-tab-card-content">
              <div className="mobile-tab-icon">
                <PlusIcon />
              </div>
              <div className="mobile-tab-info">
                <div className="mobile-tab-title mobile-text">New Tab</div>
                <div className="mobile-tab-type mobile-text-small">Create new</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
