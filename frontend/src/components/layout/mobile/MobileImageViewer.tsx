import { Tab } from '../../../types/tabs'

interface MobileImageViewerProps {
  activeTab: Tab
  onUpdateTabTitle: (title: string) => void
}

export const MobileImageViewer = ({ activeTab, onUpdateTabTitle }: MobileImageViewerProps) => {
  return (
    <div className="mobile-image-viewer mobile-text">
      <div className="mobile-viewer-header">
        <h3>{activeTab.title || 'Image'}</h3>
      </div>
      <div className="mobile-image-content">
        <div className="mobile-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p>Image Viewer</p>
          <p className="mobile-text-small">Mobile image viewing coming soon</p>
        </div>
      </div>
    </div>
  )
}
