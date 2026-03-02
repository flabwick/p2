import React, { useState } from 'react';
import { ToggleMenu, MenuState, PocketSidebar, VaultSidebar, RoleSidebar, MoreSidebar } from './sidebarmenu/index';
import './SidebarMenu.css'

interface SidebarMenuProps {
  onOpenFile: (fileId: string, title: string) => void
}

export function SidebarMenu({ onOpenFile }: SidebarMenuProps) {
  const [activeMenu, setActiveMenu] = useState<MenuState>('pocket');

  const renderSidebarContent = () => {
    switch (activeMenu) {
      case 'pocket':
        return <PocketSidebar />;
      case 'vault':
        return <VaultSidebar onOpenFile={onOpenFile} />;
      case 'role':
        return <RoleSidebar />;
      case 'more':
        return <MoreSidebar />;
      default:
        return <PocketSidebar />;
    }
  };

  return (
    <div className="sidebar-menu">
      <ToggleMenu 
        activeMenu={activeMenu} 
        onMenuChange={setActiveMenu} 
      />
      {renderSidebarContent()}
    </div>
  )
}
