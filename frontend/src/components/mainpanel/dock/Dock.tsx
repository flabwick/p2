import './Dock.css'

export type MainPanelView = 'pocket' | 'file' | 'role'
export type PocketSubView = 'desk' | 'feed' | 'log'

interface DockProps {
  activeView: MainPanelView
  pocketView: PocketSubView
  onPocketViewChange: (view: PocketSubView) => void
}

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
)

const UndoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 7v6h6M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
)

const RedoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 7v6h-6M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
  </svg>
)

const SkipBackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </svg>
)

const SkipForwardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
)

const EnterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
)

export function Dock({ activeView, pocketView, onPocketViewChange }: DockProps) {
  const showPanelPart = activeView === 'pocket' && pocketView === 'feed';
  const showSelectorPart = activeView === 'pocket';

  return (
    <footer className="main-panel-dock">
      <div className="dock-stack">
        {/* Top: Live Dock (Always Visible) */}
        <div className="dock-live-part">
          <div className="live-dock-container">
            <button className="std-button ghost square small enter-btn" aria-label="Enter">
              <EnterIcon />
            </button>
            <div className="live-editor-wrapper">
              <input 
                type="text" 
                className="live-editor-input" 
                placeholder="Type here..." 
              />
            </div>
          </div>
        </div>

        {/* Middle: Panel-dependent controls (Collapsible) */}
        <div className={`dock-collapsible-section ${showPanelPart ? 'is-expanded' : ''}`}>
          <div className="dock-collapsible-content">
            <div className="dock-divider" />
            <div className="dock-panel-part">
              <div className="dock-panel-controls feed-controls">
                <button className="std-button ghost square small" aria-label="Skip Back">
                  <SkipBackIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Undo">
                  <UndoIcon />
                </button>
                
                <button className="std-button primary refresh-button" aria-label="Refresh Feed">
                  <RefreshIcon />
                </button>
                
                <button className="std-button ghost square small" aria-label="Redo">
                  <RedoIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Skip Forward">
                  <SkipForwardIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Subview selector (Collapsible) */}
        <div className={`dock-collapsible-section ${showSelectorPart ? 'is-expanded' : ''}`}>
          <div className="dock-collapsible-content">
            <div className="dock-divider" />
            <div className="dock-selector-part">
              <div className="dock-subview-toggle">
                <button 
                  className={`subview-button ${pocketView === 'desk' ? 'active' : ''}`}
                  onClick={() => onPocketViewChange('desk')}
                >
                  Desk
                </button>
                <button 
                  className={`subview-button ${pocketView === 'feed' ? 'active' : ''}`}
                  onClick={() => onPocketViewChange('feed')}
                >
                  Feed
                </button>
                <button 
                  className={`subview-button ${pocketView === 'log' ? 'active' : ''}`}
                  onClick={() => onPocketViewChange('log')}
                >
                  Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
