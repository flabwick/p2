import { useState, useRef, useEffect } from 'react'
import './Dock.css'

export type MainPanelView = 'pocket' | 'file' | 'role'
export type PocketSubView = 'desk' | 'feed' | 'log'

interface DockProps {
  activeView: MainPanelView
  pocketView: PocketSubView
  onPocketViewChange: (view: PocketSubView) => void
}

const RefreshIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.0" stroke-linecap="round" stroke-linejoin="round">
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

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const MicrophoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
)

const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
)

const ExportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const ConvertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

const PaperclipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
)

const EnterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
)

export function Dock({ activeView, pocketView, onPocketViewChange }: DockProps) {
  const [tabs, setTabs] = useState([1, 2, 3]);
  const [activeTab, setActiveTab] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: false, right: false });

  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setScrollState({
        left: scrollLeft > 2,
        right: scrollLeft < scrollWidth - clientWidth - 2
      });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      updateScrollState();
      el.addEventListener('scroll', updateScrollState);
      window.addEventListener('resize', updateScrollState);
      return () => {
        el.removeEventListener('scroll', updateScrollState);
        window.removeEventListener('resize', updateScrollState);
      };
    }
  }, [tabs]);

  const handleAddTab = () => {
    const newTabs = [...tabs, tabs.length + 1];
    setTabs(newTabs);
    setActiveTab(newTabs.length);
  };

  const handleDeleteTab = () => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.slice(0, -1);
    setTabs(newTabs);
    if (activeTab > newTabs.length) {
      setActiveTab(newTabs.length);
    }
  };

  const getMaskImage = () => {
    const { left, right } = scrollState;
    if (!left && !right) return 'none';
    const leftFade = left ? 'transparent, black 20px' : 'black 0px';
    const rightFade = right ? 'black calc(100% - 20px), transparent' : 'black 100%';
    return `linear-gradient(to right, ${leftFade}, ${rightFade})`;
  };

  const showPanelPart = activeView === 'pocket' && pocketView === 'feed';

  return (
    <footer className="main-panel-dock">
      <div className="dock-stack">
        {/* Top: Live Dock (Always Visible) */}
        <div className="dock-live-part">
          <div className="live-dock-container">
            <div className="live-editor-wrapper">
              <textarea 
                className="live-editor-input custom-scrollbar" 
                placeholder="Type here..." 
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <button className="std-button ghost square small enter-btn" aria-label="Enter">
                <EnterIcon />
              </button>
            </div>

            <div className="live-dock-footer">
              <div className="live-dock-tabs">
                <div 
                  ref={scrollRef}
                  className="tab-list"
                  style={{ 
                    maskImage: getMaskImage(),
                    WebkitMaskImage: getMaskImage()
                  }}
                >
                  {tabs.map((_, index) => {
                    const id = index + 1;
                    return (
                      <button 
                        key={id}
                        className={`std-button square small tab-btn ${activeTab === id ? 'active' : ''}`}
                        onClick={() => setActiveTab(id)}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>
                <div className="tab-actions">
                  <button 
                    className="std-button ghost square small" 
                    aria-label="Add Tab"
                    onClick={handleAddTab}
                  >
                    <PlusIcon />
                  </button>
                  <button 
                    className="std-button ghost square small" 
                    aria-label="Delete Tab"
                    onClick={handleDeleteTab}
                    disabled={tabs.length <= 1}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <div className="live-dock-actions-right">
                <button className="std-button ghost square small" aria-label="Attach" disabled>
                  <PaperclipIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Microphone" disabled>
                  <MicrophoneIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Clipboard" disabled>
                  <ClipboardIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Export" disabled>
                  <ExportIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Convert" disabled>
                  <ConvertIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Expand" disabled>
                  <ChevronUpIcon />
                </button>
              </div>
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
                
                <button className="std-button primary square refresh-button" aria-label="Refresh Feed">
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
      </div>
    </footer>
  )
}
