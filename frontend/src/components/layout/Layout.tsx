import { useState } from 'react'
import { MainPanel } from '../mainpanel/MainPanel'
import { Sidebar } from '../sidebar'
import { Tab, TabType } from '../../types/tabs'
import './Layout.css'

interface LayoutProps {
  children?: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', type: 'pocket', title: 'New Tab' }
  ])
  const [activeTabId, setActiveTabId] = useState('1')

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

  const handleSelectTab = (id: string) => {
    setActiveTabId(id)
  }

  const handleUpdateTabType = (id: string, type: TabType) => {
    setTabs(tabs.map(tab => tab.id === id ? { ...tab, type } : tab))
  }

  const handleUpdateTabTitle = (id: string, title: string) => {
    setTabs(tabs.map(tab => tab.id === id ? { ...tab, title } : tab))
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
        onAddTab={handleAddTab}
      />
    </div>
  )
}

export default Layout
