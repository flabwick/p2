import { SidebarMenu } from './SidebarMenu'
import { TabSidebar } from './TabSidebar'
import './SidebarMaster.css'

interface SidebarMasterProps {
  children?: React.ReactNode
  isMenuExpanded?: boolean
  isTabsExpanded?: boolean
}

export function SidebarMaster({
  children,
  isMenuExpanded = false,
  isTabsExpanded = false,
}: SidebarMasterProps) {
  return (
    <div className="sidebar-master">
      <TabSidebar isExpanded={isTabsExpanded} />
      <SidebarMenu isExpanded={isMenuExpanded} />
      
      <div className="sidebar-master-center">
        {children}
      </div>
    </div>
  )
}
