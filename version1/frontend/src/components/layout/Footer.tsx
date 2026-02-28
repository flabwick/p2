import { useState } from 'react';
import Button from '../ui/Button';

type ViewType = 'desk' | 'feed' | 'log';

interface FeedState {
  role: string;
  isDirty: boolean;
  cards: any[];
}

interface FooterProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  feedState: FeedState;
  onFeedRefresh: () => Promise<void>;
}

// Icons - Neo-brutalist style with square stroke-linecap and stroke-linejoin
const VaultIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
    <rect x="18" y="20" width="64" height="60" />
    <circle cx="72" cy="50" r="10" />
  </svg>
);

const PocketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
    <rect x="20" y="30" width="60" height="45" />
    <line x1="20" y1="30" x2="35" y2="18" />
    <line x1="80" y1="30" x2="65" y2="18" />
  </svg>
);

const DeskIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
    <line x1="10" y1="45" x2="90" y2="45" strokeWidth="10" />
    <line x1="30" y1="45" x2="30" y2="80" />
    <line x1="70" y1="45" x2="70" y2="80" />
  </svg>
);

const FeedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
    <line x1="20" y1="30" x2="80" y2="30" strokeWidth="8" />
    <line x1="20" y1="50" x2="80" y2="50" strokeWidth="8" />
    <line x1="20" y1="70" x2="80" y2="70" strokeWidth="8" />
  </svg>
);

const LogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
    <rect x="25" y="20" width="55" height="65" />
    <rect x="20" y="28" width="8" height="8" />
    <rect x="20" y="48" width="8" height="8" />
    <rect x="20" y="68" width="8" height="8" />
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const UploadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const LinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const FolderIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36" />
  </svg>
);

// Feed actions - Refresh is now primary
const feedActions = [
  { id: 'refresh', label: 'Refresh', icon: <RefreshIcon />, variant: 'primary' as const },
  { id: 'add', label: 'Add Card', icon: <PlusIcon />, variant: 'secondary' as const },
  { id: 'remove', label: 'Clear', icon: <TrashIcon />, variant: 'ghost' as const },
];

// Desk actions
const deskActions = [
  { id: 'new-file', label: 'New File', icon: <PlusIcon />, variant: 'primary' as const },
  { id: 'import', label: 'Import', icon: <UploadIcon />, variant: 'secondary' as const },
  { id: 'open-folder', label: 'Open Folder', icon: <FolderIcon />, variant: 'secondary' as const },
];

// Log actions
const logActions = [
  { id: 'refresh', label: 'Refresh', icon: <RefreshIcon />, variant: 'secondary' as const },
  { id: 'export', label: 'Export', icon: <DownloadIcon />, variant: 'secondary' as const },
  { id: 'clear', label: 'Clear', icon: <TrashIcon />, variant: 'ghost' as const },
];

const Footer = ({ activeView, onViewChange, feedState, onFeedRefresh }: FooterProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(feedState.role);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const handleActionClick = async (actionId: string) => {
    if (actionId === 'refresh' && activeView === 'feed') {
      setIsRefreshing(true);
      try {
        await onFeedRefresh();
      } finally {
        setIsRefreshing(false);
      }
      return;
    }
    console.log(`Action clicked: ${actionId}`);
  };

  // Get actions for current view
  const getViewActions = () => {
    switch (activeView) {
      case 'feed': return feedActions;
      case 'desk': return deskActions;
      case 'log': return logActions;
      default: return [];
    }
  };

  const currentActions = getViewActions();
  const roles = ['default', 'advanced'];

  return (
    <footer className="layout-footer">
      <div className="footer-content">
        {/* View toggle on left */}
        <div className="view-toggle">
          <Button
            className="view-toggle-btn icon-only"
            active={activeView === 'desk'}
            onClick={() => onViewChange('desk')}
            title="Desk"
          >
            <DeskIcon />
          </Button>
          <Button
            className="view-toggle-btn icon-only prominent"
            variant="primary"
            active={activeView === 'feed'}
            onClick={() => onViewChange('feed')}
            title="Feed"
          >
            <FeedIcon />
          </Button>
          <Button
            className="view-toggle-btn icon-only"
            active={activeView === 'log'}
            onClick={() => onViewChange('log')}
            title="Log"
          >
            <LogIcon />
          </Button>
        </div>

        {/* View-specific actions in center/right */}
        <div className="footer-actions-section">
          <div className="view-actions-row">
            {/* Feed-specific controls */}
            {activeView === 'feed' && (
              <>
                <Button
                  className={`view-action-btn ${isRefreshing ? 'loading' : ''}`}
                  variant="primary"
                  onClick={() => handleActionClick('refresh')}
                  title="Refresh feed - sends current state to LLM for executive operations"
                >
                  <span className="action-icon"><RefreshIcon /></span>
                  <span className="action-label">
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </span>
                </Button>
                
                <div className="feed-role-dropdown">
                  <Button
                    className="role-dropdown-btn"
                    onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                    active={isRoleMenuOpen}
                    title="Select feed role"
                  >
                    <span>{selectedRole}</span>
                  </Button>
                  {isRoleMenuOpen && (
                    <div className="role-dropdown-menu">
                      {roles.map((role) => (
                        <button
                          key={role}
                          className={`role-menu-item ${role === selectedRole ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedRole(role);
                            setIsRoleMenuOpen(false);
                          }}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Non-feed view actions */}
            {activeView !== 'feed' && currentActions.map((action) => (
              <Button
                key={action.id}
                className="view-action-btn"
                variant={action.variant}
                onClick={() => handleActionClick(action.id)}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
