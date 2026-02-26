import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';

// Icons only
const PocketsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M3 4h18v12H3z" /><path d="M3 16h18" /><path d="M8 20v-4h8v4" />
  </svg>
);

const VaultIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M8 10h8" /><circle cx="12" cy="15" r="2" />
  </svg>
);

const RolesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const EventsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ModelsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const MIN_WIDTH = 280;
const BUTTON_COUNT = 6;
const BASE_MARGIN = 8;

const Sidebar = ({ isOpen, width, onResize }: { isOpen: boolean; width: number; onResize: (w: number) => void }) => {
  const [activeTab, setActiveTab] = useState('pockets');
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  const tabs = [
    { id: 'pockets', icon: PocketsIcon, label: 'Pockets' },
    { id: 'vault', icon: VaultIcon, label: 'Vault' },
    { id: 'roles', icon: RolesIcon, label: 'Roles' },
    { id: 'events', icon: EventsIcon, label: 'Events' },
    { id: 'models', icon: ModelsIcon, label: 'Models' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.max(MIN_WIDTH, startWidthRef.current + delta);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onResize]);

  if (!isOpen) return null;

  const extraSpace = width - MIN_WIDTH;
  const sideMargin = Math.min(extraSpace / 2, 24);

  return (
    <>
      <aside className="layout-sidebar" style={{ width }}>
        <div className="sidebar-header">
          <div className="sidebar-tabs-container" style={{ margin: `0 ${sideMargin}px` }}>
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                className="square"
                onClick={() => setActiveTab(tab.id)}
                active={activeTab === tab.id}
                title={tab.label}
              >
                <tab.icon />
              </Button>
            ))}
          </div>
        </div>

        <div className="sidebar-content-area">
          {activeTab === 'pockets' && (
            <div className="sidebar-section">
              <h3 className="list-title">OPEN POCKETS</h3>
              <div className="pocket-card">
                <span className="pocket-card-title">Main Context</span>
                <span className="pocket-card-count">3 items</span>
              </div>
              <div className="pocket-card">
                <span className="pocket-card-title">Design Review</span>
                <span className="pocket-card-count">5 items</span>
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="sidebar-section">
              <h3 className="list-title">VAULT</h3>
              <div className="placeholder-content">
                <p>File vault</p>
                <p>~/Documents</p>
                <p>~/Downloads</p>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="sidebar-section">
              <h3 className="list-title">ROLES</h3>
              <div className="placeholder-content">
                <p>Admin</p>
                <p>Editor</p>
                <p>Viewer</p>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="sidebar-section">
              <h3 className="list-title">EVENTS</h3>
              <div className="placeholder-content">
                <p>System events</p>
                <p>User actions</p>
                <p>Sync logs</p>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="sidebar-section">
              <h3 className="list-title">MODELS</h3>
              <div className="placeholder-content">
                <p>GPT-4</p>
                <p>Claude</p>
                <p>Local LLM</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="sidebar-section">
              <h3 className="list-title">SETTINGS</h3>
              <div className="placeholder-content">
                <p>Preferences</p>
                <p>Theme</p>
                <p>Account</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="sidebar-resize-handle" onMouseDown={handleMouseDown} />
    </>
  );
};

export default Sidebar;
