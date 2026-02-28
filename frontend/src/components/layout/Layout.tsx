import { useState } from 'react'
import { Header } from './Header'
import { MainPanel } from './MainPanel'
import { SidebarMaster } from './SidebarMaster'
import './Layout.css'

interface LayoutProps {
  children?: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [activeView, setActiveView] = useState<'desk' | 'feed' | 'log'>('desk')
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)

  return (
    <div className="layout-wrapper">
      <Header
        activeView={activeView}
        onMenuToggle={() => setIsMenuExpanded(!isMenuExpanded)}
        onTabsToggle={() => {}}
        isMenuExpanded={isMenuExpanded}
        isTabsExpanded={false}
        onViewChange={setActiveView}
      />
      <SidebarMaster
        isMenuExpanded={isMenuExpanded}
        isTabsExpanded={false}
      >
        <MainPanel
          activeView={activeView}
          onViewChange={setActiveView}
        >
          {children}
        </MainPanel>
      </SidebarMaster>
    </div>
  )
}

export default Layout
