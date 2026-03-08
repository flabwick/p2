import { useState, useEffect } from 'react'
import { MobileHeader } from './mobile/MobileHeader'
import { MobileSidebar } from './mobile/MobileSidebar'
import { MobileDock } from './mobile/MobileDock'
import { MobileContent } from './mobile/MobileContent'
import { MobileTabManager } from './mobile/MobileTabManager'
import { Tab, TabType } from '../../types/tabs'

interface MobileLayoutProps {
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onAddTab: () => void
  onCloseTab: (id: string) => void
  onUpdateTabType: (id: string, type: TabType) => void
  onUpdateTabTitle: (id: string, title: string) => void
}

export const MobileLayout = ({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onUpdateTabType,
  onUpdateTabTitle
}: MobileLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isTabManagerOpen, setIsTabManagerOpen] = useState(false)
  const [currentView, setCurrentView] = useState<'main'>('main')

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  const handleTabCounterClick = () => {
    setIsTabManagerOpen(true)
  }

  const handleTabManagerClose = () => {
    setIsTabManagerOpen(false)
  }

  const handleBottomNavPress = (view: 'main') => {
    setCurrentView(view)
  }

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isSidebarOpen && !target.closest('.sidebar-mobile') && !target.closest('.mobile-header')) {
        setIsSidebarOpen(false)
      }
    }

    if (isSidebarOpen) {
      document.addEventListener('click', handleOutsideClick)
      return () => document.removeEventListener('click', handleOutsideClick)
    }
  }, [isSidebarOpen])

  // Prevent body scroll when overlays are open
  useEffect(() => {
    if (isSidebarOpen || isTabManagerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSidebarOpen, isTabManagerOpen])

  return (
    <div className="mobile-layout">
      {/* Mobile Header */}
      <MobileHeader
        title={activeTab?.title || 'P2 Mobile'}
        onMenuToggle={handleMenuToggle}
        currentView={'main'}
        tabCount={tabs.length}
        onTabCounterClick={handleTabCounterClick}
      />

      {/* Mobile Sidebar - Overlay */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={onSelectTab}
        onAddTab={onAddTab}
        onCloseTab={onCloseTab}
        onUpdateTabType={onUpdateTabType}
        onUpdateTabTitle={onUpdateTabTitle}
      />

      {/* Mobile Tab Manager - Full Screen Overlay */}
      <MobileTabManager
        isOpen={isTabManagerOpen}
        onClose={handleTabManagerClose}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={onSelectTab}
        onAddTab={onAddTab}
        onCloseTab={onCloseTab}
      />

      {/* Mobile Content Area */}
      <MobileContent
        currentView={currentView}
        activeTab={activeTab}
        onUpdateTabType={(type: TabType) => onUpdateTabType(activeTabId, type)}
        onUpdateTabTitle={(title: string) => onUpdateTabTitle(activeTabId, title)}
      />

      {/* Mobile Dock */}
      <MobileDock
        activeTabId={activeTabId}
      />
    </div>
  )
}
