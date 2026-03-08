import { Tab } from '../../../types/tabs'

interface MobilePdfViewerProps {
  activeTab: Tab
  onUpdateTabTitle: (title: string) => void
}

export const MobilePdfViewer = ({ activeTab, onUpdateTabTitle }: MobilePdfViewerProps) => {
  return (
    <div className="mobile-pdf-viewer mobile-text">
      <div className="mobile-viewer-header">
        <h3>{activeTab.title || 'PDF Document'}</h3>
      </div>
      <div className="mobile-pdf-content">
        <div className="mobile-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <p>PDF Viewer</p>
          <p className="mobile-text-small">Mobile PDF viewing coming soon</p>
        </div>
      </div>
    </div>
  )
}
