import { useState, useEffect, useMemo } from 'react'
import { MainPanel } from '../mainpanel/MainPanel'
import { Sidebar } from '../sidebar'
import { MobileLayout } from './MobileLayout'
import { usePocketStore } from '../../features/pockets/store/pocketStore'
import { useTabStore } from '../../features/tabs/store/tabStore'
import { useShallow } from 'zustand/shallow'
import { useMobileDetection } from '../../hooks/useMobileDetection'
import './Layout.css'

interface LayoutProps {
  children?: React.ReactNode
}

const MIN_MAIN_PANEL_WIDTH = 600; // Minimum width for main panel before sidebar overlays

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useMobileDetection()
  const [isMenuExpanded, setIsMenuExpanded] = useState(() => {
    return localStorage.getItem('sidebar-expanded') === 'true'
  })
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebar-width')
    return savedWidth ? parseInt(savedWidth, 10) : 320
  })
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [isSidebarResizing, setIsSidebarResizing] = useState(false)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const needsOverlay = useMemo(() => {
    return windowWidth < sidebarWidth + MIN_MAIN_PANEL_WIDTH
  }, [windowWidth, sidebarWidth])

  // Track the previous needsOverlay state to detect transition from pushing to overlaying while open
  const [prevNeedsOverlay, setPrevNeedsOverlay] = useState(needsOverlay)
  useEffect(() => {
    // If the sidebar is open and the window (or sidebar) resizes such that it would now squish the main panel,
    // automatically close the sidebar. Subsequent opening will use the new overlay functionality.
    if (isMenuExpanded && needsOverlay && !prevNeedsOverlay) {
      setIsMenuExpanded(false)
    }
    setPrevNeedsOverlay(needsOverlay)
  }, [needsOverlay, isMenuExpanded, prevNeedsOverlay])
  
  const { 
    tabs, 
    activeTabId, 
    setActiveTabId, 
    addTab, 
    closeTab, 
    duplicateTab, 
    reorderTabs, 
    updateTabType, 
    updateTabTitle, 
    openFile,
    validateTabs
  } = useTabStore(useShallow(state => ({
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    setActiveTabId: state.setActiveTabId,
    addTab: state.addTab,
    closeTab: state.closeTab,
    duplicateTab: state.duplicateTab,
    reorderTabs: state.reorderTabs,
    updateTabType: state.updateTabType,
    updateTabTitle: state.updateTabTitle,
    openFile: state.openFile,
    validateTabs: state.validateTabs
  })))

  useEffect(() => {
    localStorage.setItem('sidebar-width', sidebarWidth.toString())
  }, [sidebarWidth])

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', isMenuExpanded.toString())
  }, [isMenuExpanded])

  // Validate stale localStorage tabs on mount
  useEffect(() => {
    validateTabs();
  }, [validateTabs]);

  const handleMenuToggle = () => {
    setIsMenuExpanded(!isMenuExpanded)
  }

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width)
  }

  const { createPocket } = usePocketStore()

  const handleUpdateTabType = async (id: string, type: any) => {
    console.log(`[Layout] Updating tab ${id} to type: ${type}`)
    
    if (type === 'pocket') {
      const tab = tabs.find(t => t.id === id)
      if (tab && !tab.fileId) {
        // Atomic creation: Create the pocket FIRST, then update the tab state
        const newPocket = await createPocket('New Pocket', undefined, false, false, true)
        if (newPocket) {
          updateTabType(id, 'pocket', newPocket.id, newPocket.name)
          return
        }
      }
    }
    
    updateTabType(id, type)
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]

  // Return mobile layout for mobile devices
  if (isMobile) {
    return (
      <MobileLayout
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onAddTab={addTab}
        onCloseTab={closeTab}
        onUpdateTabType={updateTabType}
        onUpdateTabTitle={updateTabTitle}
      />
    )
  }

  // Return desktop layout for desktop devices

  return (
    <div 
      className={`layout-wrapper ${isMenuExpanded ? 'sidebar-open' : ''} ${needsOverlay ? 'is-overlay' : ''} ${isSidebarResizing ? 'no-transition' : ''}`}
      style={{
        marginLeft: (isMenuExpanded && !needsOverlay) ? `${sidebarWidth}px` : '0',
        width: (isMenuExpanded && !needsOverlay) ? `calc(100% - ${sidebarWidth}px)` : '100%',
        '--sidebar-width': isMenuExpanded ? `${sidebarWidth}px` : '0px'
      } as React.CSSProperties}
    >
      <MainPanel
        onMenuToggle={handleMenuToggle}
        isMenuExpanded={isMenuExpanded}
        activeTab={activeTab}
        onUpdateTabType={(type) => handleUpdateTabType(activeTabId, type)}
        onUpdateTabTitle={(title) => updateTabTitle(activeTabId, title)}
        sidebarOffset={isMenuExpanded ? 0 : 48}
      />

      {isMenuExpanded && needsOverlay && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsMenuExpanded(false)}
        />
      )}
      
      <Sidebar 
        isOpen={isMenuExpanded} 
        onClose={() => setIsMenuExpanded(false)}
        onWidthChange={handleSidebarWidthChange}
        onResizingChange={setIsSidebarResizing}
        initialWidth={sidebarWidth}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onReorderTabs={reorderTabs}
        onAddTab={addTab}
        onOpenFile={openFile}
        onCloseTab={closeTab}
        onDuplicateTab={duplicateTab}
      />
    </div>
  )
}

export default Layout
