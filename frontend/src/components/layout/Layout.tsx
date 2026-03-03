import { useState, useEffect } from 'react'
import { MainPanel } from '../mainpanel/MainPanel'
import { Sidebar } from '../sidebar'
import { Tab, TabType } from '../../types/tabs'
import './Layout.css'

interface LayoutProps {
  children?: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(() => {
    return localStorage.getItem('sidebar-expanded') === 'true'
  })
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebar-width')
    return savedWidth ? parseInt(savedWidth, 10) : 320
  })
  
  // Load initial tabs from localStorage
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const savedTabs = localStorage.getItem('sidebar-tabs')
    if (savedTabs) {
      try {
        return JSON.parse(savedTabs)
      } catch (e) {
        console.error('Failed to parse saved tabs', e)
      }
    }
    return [{ id: '1', type: 'pocket', title: 'New Tab' }]
  })

  // Load initial activeTabId from localStorage
  const [activeTabId, setActiveTabId] = useState(() => {
    const savedActiveId = localStorage.getItem('active-tab-id')
    if (savedActiveId && tabs.some(t => t.id === savedActiveId)) {
      return savedActiveId
    }
    return tabs[0]?.id || '1'
  })

  // Persist tabs to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-tabs', JSON.stringify(tabs))
  }, [tabs])

  // Persist activeTabId to localStorage
  useEffect(() => {
    localStorage.setItem('active-tab-id', activeTabId)
  }, [activeTabId])

  useEffect(() => {
    localStorage.setItem('sidebar-width', sidebarWidth.toString())
  }, [sidebarWidth])

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', isMenuExpanded.toString())
  }, [isMenuExpanded])

  const handleMenuToggle = () => {
    setIsMenuExpanded(!isMenuExpanded)
  }

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width)
  }

  const handleAddTab = () => {
    const newId = Date.now().toString()
    const newTab: Tab = { id: newId, type: 'welcome', title: 'New Tab' }
    setTabs([...tabs, newTab])
    setActiveTabId(newId)
  }

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) return
    const newTabs = tabs.filter(tab => tab.id !== id)
    setTabs(newTabs)
    if (activeTabId === id) {
      const activeIndex = tabs.findIndex(t => t.id === id)
      const nextTab = newTabs[activeIndex] || newTabs[activeIndex - 1]
      setActiveTabId(nextTab.id)
    }
  }

  const handleDuplicateTab = (id: string) => {
    const tabToDuplicate = tabs.find(tab => tab.id === id)
    if (tabToDuplicate) {
      const newId = Date.now().toString()
      setTabs([...tabs, { ...tabToDuplicate, id: newId }])
      setActiveTabId(newId)
    }
  }

  const handleSelectTab = (id: string) => {
    setActiveTabId(id)
  }

  const handleReorderTabs = (newTabs: Tab[]) => {
    setTabs(newTabs)
  }

  const handleOpenFile = (fileId: string, title: string, forceNewTab = false) => {
    if (!forceNewTab) {
      const existingTab = tabs.find(tab => tab.fileId === fileId)
      if (existingTab) {
        setActiveTabId(existingTab.id)
        return
      }
    }
    const fileExtension = title.split('.').pop()
    const newId = Date.now().toString()
    const newTab: Tab = { 
      id: newId, 
      type: 'file', 
      title, 
      fileId,
      fileExtension 
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newId)
  }

  const handleUpdateTabType = (id: string, type: TabType) => {
    setTabs(tabs.map(tab => tab.id === id ? { ...tab, type } : tab))
  }

  const handleUpdateTabTitle = (id: string, title: string) => {
    setTabs(tabs.map(tab => {
      if (tab.id === id) {
        const fileExtension = tab.type === 'file' ? title.split('.').pop() : tab.fileExtension
        return { ...tab, title, fileExtension }
      }
      return tab
    }))
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]

  return (
    <div 
      className={`layout-wrapper ${isMenuExpanded ? 'sidebar-open' : ''}`}
      style={{
        marginLeft: isMenuExpanded ? `${sidebarWidth}px` : '0',
        width: isMenuExpanded ? `calc(100% - ${sidebarWidth}px)` : '100%'
      }}
    >
      <MainPanel
        onMenuToggle={handleMenuToggle}
        isMenuExpanded={isMenuExpanded}
        activeTab={activeTab}
        onUpdateTabType={(type) => handleUpdateTabType(activeTabId, type)}
        onUpdateTabTitle={(title) => handleUpdateTabTitle(activeTabId, title)}
        sidebarOffset={isMenuExpanded ? 0 : 48}
      />
      
      <Sidebar 
        isOpen={isMenuExpanded} 
        onClose={() => setIsMenuExpanded(false)}
        onWidthChange={handleSidebarWidthChange}
        initialWidth={sidebarWidth}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onReorderTabs={handleReorderTabs}
        onAddTab={handleAddTab}
        onOpenFile={handleOpenFile}
        onCloseTab={handleCloseTab}
        onDuplicateTab={handleDuplicateTab}
      />
    </div>
  )
}

export default Layout
