import { useState } from 'react'
import { useDockStore } from '@/features/dock/store/dockStore'
import { useShallow } from 'zustand/shallow'

// Custom SVG icons matching the dock styling
const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.0" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
)

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

interface MobileDockProps {
  activeTabId?: string
}

export const MobileDock = ({ activeTabId }: MobileDockProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const { 
    tabs, 
    activeTabIndex, 
    isLoading,
    fetchTabs,
    addTab,
    deleteTab,
    setActiveTabIndex
  } = useDockStore(useShallow(state => ({
    tabs: state.tabs,
    activeTabIndex: state.activeTabIndex,
    isLoading: state.isLoading,
    fetchTabs: state.fetchTabs,
    addTab: state.addTab,
    deleteTab: state.deleteTab,
    setActiveTabIndex: state.setActiveTabIndex
  })))

  const DockButton = ({ 
    icon, 
    onClick, 
    disabled = false, 
    label 
  }: { 
    icon: React.ReactNode, 
    onClick: () => void, 
    disabled?: boolean, 
    label: string 
  }) => (
    <div 
      className={`mobile-dock-button mobile-touch-target ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      title={label}
    >
      {icon}
    </div>
  )

  const handleRefresh = () => {
    fetchTabs()
  }

  const handleAddTab = () => {
    addTab()
  }

  const handleDeleteTab = () => {
    if (tabs.length > 1) {
      deleteTab()
    }
  }

  return (
    <div className="mobile-dock mobile-safe-bottom">
      <div className="mobile-dock-content">
        <div className="mobile-dock-controls">
          <DockButton
            icon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
            label="Refresh"
          />
          
          <DockButton
            icon={<EditIcon />}
            onClick={() => setIsExpanded(!isExpanded)}
            label="Toggle Editor"
          />
          
          <DockButton
            icon={<PlusIcon />}
            onClick={handleAddTab}
            disabled={isLoading}
            label="Add Tab"
          />
          
          <DockButton
            icon={<TrashIcon />}
            onClick={handleDeleteTab}
            disabled={tabs.length <= 1 || isLoading}
            label="Delete Tab"
          />
        </div>
        
        {tabs.length > 0 && (
          <div className="mobile-dock-info">
            <div className="mobile-dock-position mobile-text-small">
              Tab {activeTabIndex + 1} / {tabs.length}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile dock editor (when expanded) */}
      {isExpanded && (
        <div className="mobile-dock-editor">
          <div className="mobile-dock-editor-content">
            <textarea
              className="mobile-dock-textarea mobile-text"
              placeholder="Dock content..."
              value={tabs[activeTabIndex]?.content || ''}
              onChange={(e) => {
                // Update dock content
                const newContent = e.target.value
                // This would need to be connected to the dock store's update method
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
