import { useState } from 'react'
import { Header } from './header/Header'
import { Dock, PocketSubView } from './dock/Dock'
import { PocketViewer } from './viewers/PocketViewer'
import { FileViewer } from './viewers/FileViewer'
import { RoleViewer } from './viewers/RoleViewer'
import { WelcomeSelector } from './viewers/WelcomeSelector'
import { CustomScrollbar } from '../ui/CustomScrollbar'
import { Tab, TabType } from '../../types/tabs'
import './MainPanel.css'

interface MainPanelProps {
  onMenuToggle: () => void
  isMenuExpanded: boolean
  activeTab: Tab
  onUpdateTabType: (type: TabType) => void
  onUpdateTabTitle: (title: string) => void
  sidebarOffset: number
}

export function MainPanel({ 
  onMenuToggle, 
  isMenuExpanded, 
  activeTab,
  onUpdateTabType,
  onUpdateTabTitle,
  sidebarOffset
}: MainPanelProps) {
  const [pocketView, setPocketView] = useState<PocketSubView>('desk')

  const renderViewer = () => {
    switch (activeTab.type) {
      case 'pocket': return <PocketViewer activeSubView={pocketView} />
      case 'file': return <FileViewer activeTab={activeTab} />
      case 'role': return <RoleViewer />
      case 'welcome': return <WelcomeSelector onSelect={onUpdateTabType} />
      default: return <PocketViewer activeSubView={pocketView} />
    }
  }

  return (
    <div className="main-panel-container">
      <Header 
        onMenuToggle={onMenuToggle}
        onTabsToggle={() => {}}
        isMenuExpanded={isMenuExpanded}
        isTabsExpanded={false}
        activeView={activeTab.type === 'welcome' ? 'pocket' : activeTab.type as any}
        onViewChange={onUpdateTabType}
        pocketView={pocketView}
        onPocketViewChange={setPocketView}
        title={activeTab.title}
        onTitleChange={onUpdateTabTitle}
        activeTab={activeTab}
      />
      
      <div className="main-panel-body" style={{ marginLeft: `${sidebarOffset}px` }}>
        <CustomScrollbar className="main-panel-scroller">
          <main className="main-panel-content">
            {renderViewer()}
          </main>
        </CustomScrollbar>

        <Dock 
          activeView={activeTab.type === 'welcome' ? 'pocket' : activeTab.type as any} 
          pocketView={pocketView}
          onPocketViewChange={setPocketView}
        />
      </div>
    </div>
  )
}
