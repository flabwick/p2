import { Tab } from '../../../types/tabs'
import { MobilePdfViewer } from './MobilePdfViewer'
import { MobileEpubViewer } from './MobileEpubViewer'
import { MobileImageViewer } from './MobileImageViewer'

interface MobileFileViewerProps {
  activeTab: Tab
  onUpdateTabTitle: (title: string) => void
}

export const MobileFileViewer = ({ activeTab, onUpdateTabTitle }: MobileFileViewerProps) => {
  const fileExtension = activeTab.fileExtension?.toLowerCase()
  
  const renderViewer = () => {
    if (!fileExtension) {
      return (
        <div className="mobile-error-view mobile-text">
          Unknown file type
        </div>
      )
    }

    // PDF files
    if (fileExtension === 'pdf') {
      return (
        <MobilePdfViewer
          activeTab={activeTab}
          onUpdateTabTitle={onUpdateTabTitle}
        />
      )
    }

    // EPUB files
    if (fileExtension === 'epub') {
      return (
        <MobileEpubViewer
          activeTab={activeTab}
          onUpdateTabTitle={onUpdateTabTitle}
        />
      )
    }

    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return (
        <MobileImageViewer
          activeTab={activeTab}
          onUpdateTabTitle={onUpdateTabTitle}
        />
      )
    }

    // Unsupported files
    return (
      <div className="mobile-unsupported-view mobile-text">
        <div className="mobile-unsupported-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <h3 className="mobile-text">Unsupported File</h3>
        <p className="mobile-text-small">.{fileExtension} files cannot be viewed on mobile yet</p>
      </div>
    )
  }

  return (
    <div className="mobile-file-viewer">
      {renderViewer()}
    </div>
  )
}
