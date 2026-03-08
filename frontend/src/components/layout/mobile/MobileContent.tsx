import { Tab } from '../../../types/tabs'
import { MobileFileViewer } from './MobileFileViewer'
import { MobilePocketViewer } from './MobilePocketViewer'
import { MobileWelcomeView } from './MobileWelcomeView'

interface MobileContentProps {
  currentView: 'main'
  activeTab: Tab
  onUpdateTabType: (type: string) => void
  onUpdateTabTitle: (title: string) => void
}

export const MobileContent = ({
  currentView,
  activeTab,
  onUpdateTabType,
  onUpdateTabTitle
}: MobileContentProps) => {
  const renderMainContent = () => {
    switch (activeTab.type) {
      case 'file':
        return (
          <MobileFileViewer
            activeTab={activeTab}
            onUpdateTabTitle={onUpdateTabTitle}
          />
        )
      case 'pocket':
        return (
          <MobilePocketViewer
            activeTab={activeTab}
            onUpdateTabType={onUpdateTabType}
            onUpdateTabTitle={onUpdateTabTitle}
          />
        )
      case 'welcome':
        return (
          <MobileWelcomeView
            onSelect={onUpdateTabType}
          />
        )
      default:
        return (
          <div className="mobile-content-placeholder mobile-text">
            Select a tab to view content
          </div>
        )
    }
  }

  return (
    <main className="mobile-content mobile-scroll-area">
      {renderMainContent()}
    </main>
  )
}
