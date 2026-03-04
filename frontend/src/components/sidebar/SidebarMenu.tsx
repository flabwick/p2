import React, { useState } from 'react';
import { Tab } from '../../types/tabs';
import { ToggleMenu, MenuState, MoreSidebar, ShelfSidebar, InboxSidebar, LibrarySidebar } from './sidebarmenu/index';
import './SidebarMenu.css'

interface SidebarMenuProps {
  onOpenFile: (fileId: string, title: string, forceNewTab?: boolean) => void;
  tabs: Tab[];
}

export function SidebarMenu({ onOpenFile, tabs }: SidebarMenuProps) {
  const [activeMenu, setActiveMenu] = useState<MenuState>('shelf');

  const renderSidebarContent = () => {
    switch (activeMenu) {
      case 'shelf':
        return <ShelfSidebar onOpenFile={onOpenFile} />;
      case 'inbox':
        return <InboxSidebar onOpenFile={onOpenFile} />;
      case 'library':
        return <LibrarySidebar onOpenFile={onOpenFile} tabs={tabs} />;
      case 'more':
        return <MoreSidebar />;
      default:
        return null;
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
