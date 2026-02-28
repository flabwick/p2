import { useState } from 'react'
import { MainPanel } from '../mainpanel/MainPanel'
import { Sidebar } from '../sidebar'
import './Layout.css'

interface LayoutProps {
  children?: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)

  const handleMenuToggle = () => {
    setIsMenuExpanded(!isMenuExpanded)
  }

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width)
  }

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
      />
      
      <Sidebar 
        isOpen={isMenuExpanded} 
        onClose={() => setIsMenuExpanded(false)}
        onWidthChange={handleSidebarWidthChange}
        initialWidth={sidebarWidth}
      />
    </div>
  )
}

export default Layout
