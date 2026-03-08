import React from 'react'
import { MenuState } from './MobileToggleMenu'
import { Tab } from '../../../types/tabs'

interface MobileSidebarContentProps {
  activeMenu: MenuState
  onOpenFile: (fileId: string, title: string, forceNewTab?: boolean) => void
  tabs: Tab[]
}

// Custom SVG icons
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
)

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
)

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
)

export function MobileSidebarContent({ activeMenu, onOpenFile, tabs }: MobileSidebarContentProps) {
  const renderShelfContent = () => (
    <div className="mobile-sidebar-section">
      <div className="mobile-section-header">
        <span>Shelf</span>
        <div className="mobile-section-actions">
          <div className="mobile-action-button mobile-touch-target">
            <SearchIcon />
          </div>
          <div className="mobile-action-button mobile-touch-target">
            <FilterIcon />
          </div>
          <div className="mobile-action-button mobile-touch-target">
            <PlusIcon />
          </div>
        </div>
      </div>
      <div className="mobile-sidebar-list">
        <div className="mobile-list-item mobile-touch-target">
          <div className="mobile-list-icon">
            <FolderIcon />
          </div>
          <div className="mobile-list-content">
            <div className="mobile-list-title mobile-text">Documents</div>
            <div className="mobile-list-subtitle mobile-text-small">12 items</div>
          </div>
        </div>
        <div className="mobile-list-item mobile-touch-target">
          <div className="mobile-list-icon">
            <FileIcon />
          </div>
          <div className="mobile-list-content">
            <div className="mobile-list-title mobile-text">Notes.md</div>
            <div className="mobile-list-subtitle mobile-text-small">Markdown</div>
          </div>
        </div>
        <div className="mobile-list-item mobile-touch-target">
          <div className="mobile-list-icon">
            <FileIcon />
          </div>
          <div className="mobile-list-content">
            <div className="mobile-list-title mobile-text">Project.pdf</div>
            <div className="mobile-list-subtitle mobile-text-small">PDF</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderInboxContent = () => (
    <div className="mobile-sidebar-section">
      <div className="mobile-section-header">
        <span>Inbox</span>
        <div className="mobile-section-actions">
          <div className="mobile-action-button mobile-touch-target">
            <SearchIcon />
          </div>
          <div className="mobile-action-button mobile-touch-target">
            <FilterIcon />
          </div>
        </div>
      </div>
      <div className="mobile-sidebar-list">
        <div className="mobile-list-item mobile-touch-target">
          <div className="mobile-list-icon">
            <FileIcon />
          </div>
          <div className="mobile-list-content">
            <div className="mobile-list-title mobile-text">Recent Upload</div>
            <div className="mobile-list-subtitle mobile-text-small">2 hours ago</div>
          </div>
        </div>
        <div className="mobile-list-item mobile-touch-target">
          <div className="mobile-list-icon">
            <FileIcon />
          </div>
          <div className="mobile-list-content">
            <div className="mobile-list-title mobile-text">Shared File</div>
            <div className="mobile-list-subtitle mobile-text-small">Yesterday</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLibraryContent = () => (
    <div className="mobile-sidebar-section">
      <div className="mobile-section-header">
        <span>Library</span>
        <div className="mobile-section-actions">
          <div className="mobile-action-button mobile-touch-target">
            <SearchIcon />
          </div>
          <div className="mobile-action-button mobile-touch-target">
            <PlusIcon />
          </div>
        </div>
      </div>
      <div className="mobile-sidebar-list">
        <div className="mobile-list-item mobile-touch-target">
          <div className="mobile-list-icon">
            <FileIcon />
          </div>
          <div className="mobile-list-content">
            <div className="mobile-list-title mobile-text">Research Papers</div>
            <div className="mobile-list-subtitle mobile-text-small">5 files</div>
          </div>
        </div>
        <div className="mobile-list-item mobile-touch-target">
          <div className="mobile-list-icon">
            <FileIcon />
          </div>
          <div className="mobile-list-content">
            <div className="mobile-list-title mobile-text">Images</div>
            <div className="mobile-list-subtitle mobile-text-small">23 files</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMoreContent = () => (
    <div className="mobile-sidebar-section">
      <div className="mobile-section-header">
        <span>More</span>
      </div>
      <div className="mobile-sidebar-list">
        <div className="mobile-list-item mobile-touch-target">
          <div className="mobile-list-content">
            <div className="mobile-list-title mobile-text">Settings</div>
          </div>
        </div>
        <div className="mobile-list-item mobile-touch-target">
          <div className="mobile-list-content">
            <div className="mobile-list-title mobile-text">Help</div>
          </div>
        </div>
        <div className="mobile-list-item mobile-touch-target">
          <div className="mobile-list-content">
            <div className="mobile-list-title mobile-text">About</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeMenu) {
      case 'shelf':
        return renderShelfContent()
      case 'inbox':
        return renderInboxContent()
      case 'library':
        return renderLibraryContent()
      case 'more':
        return renderMoreContent()
      default:
        return renderShelfContent()
    }
  }

  return (
    <div className="mobile-sidebar-content">
      {renderContent()}
    </div>
  )
}
