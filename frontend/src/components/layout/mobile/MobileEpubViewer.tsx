import { Tab } from '../../../types/tabs'

interface MobileEpubViewerProps {
  activeTab: Tab
  onUpdateTabTitle: (title: string) => void
}

export const MobileEpubViewer = ({ activeTab, onUpdateTabTitle }: MobileEpubViewerProps) => {
  return (
    <div className="mobile-epub-viewer mobile-text">
      <div className="mobile-viewer-header">
        <h3>{activeTab.title || 'EPUB Book'}</h3>
      </div>
      <div className="mobile-epub-content">
        <div className="mobile-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <p>EPUB Reader</p>
          <p className="mobile-text-small">Mobile EPUB reading coming soon</p>
        </div>
      </div>
    </div>
  )
}
