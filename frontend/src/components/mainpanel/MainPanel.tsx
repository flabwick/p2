import { useState } from 'react'
import { Header } from './header/Header'
import { Dock, MainPanelView, PocketSubView } from './dock/Dock'
import { PocketViewer } from './viewers/PocketViewer'
import { FileViewer } from './viewers/FileViewer'
import { RoleViewer } from './viewers/RoleViewer'
import { CustomScrollbar } from '../ui/CustomScrollbar'
import './MainPanel.css'

interface MainPanelProps {
  onMenuToggle: () => void
  isMenuExpanded: boolean
}

export function MainPanel({ onMenuToggle, isMenuExpanded }: MainPanelProps) {
  const [activeView, setActiveView] = useState<MainPanelView>('pocket')
  const [pocketView, setPocketView] = useState<PocketSubView>('desk')

  const renderViewer = () => {
    switch (activeView) {
      case 'pocket': return <PocketViewer activeSubView={pocketView} />
      case 'file': return <FileViewer />
      case 'role': return <RoleViewer />
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
      />
      
      <div className="main-panel-body">
        <CustomScrollbar className="main-panel-scroller">
          <main className="main-panel-content">
            {renderViewer()}
          </main>
        </CustomScrollbar>

        <Dock 
          activeView={activeView} 
          pocketView={pocketView}
          onPocketViewChange={setPocketView}
        />
      </div>
    </div>
  )
}
