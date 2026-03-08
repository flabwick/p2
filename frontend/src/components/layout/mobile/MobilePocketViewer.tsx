import { Tab } from '../../../types/tabs'

interface MobilePocketViewerProps {
  activeTab: Tab
  onUpdateTabType: (type: string) => void
  onUpdateTabTitle: (title: string) => void
}

export const MobilePocketViewer = ({ activeTab, onUpdateTabType, onUpdateTabTitle }: MobilePocketViewerProps) => {
  return (
    <div className="mobile-pocket-viewer mobile-text">
      <div className="mobile-viewer-header">
        <h3>{activeTab.title || 'Pocket'}</h3>
      </div>
      <div className="mobile-pocket-content">
        <div className="mobile-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <p>Pocket View</p>
          <p className="mobile-text-small">Mobile pocket interface coming soon</p>
        </div>
      </div>
    </div>
  )
}
