import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';

// Icons - Neo-brutalist style with square stroke-linecap and stroke-linejoin
const PocketsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
    <rect x="20" y="30" width="60" height="45" />
    <line x1="20" y1="30" x2="35" y2="18" />
    <line x1="80" y1="30" x2="65" y2="18" />
  </svg>
);

const VaultIcon = () => (
  <svg width="18" height="18" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
    <rect x="18" y="20" width="64" height="60" />
    <circle cx="72" cy="50" r="10" />
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

const InboxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="22 12 18 12 15 21 9 21 6 12 2 12" /><path d="M9 11V7a3 3 0 0 1 6 0v4" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

// File type icons
const FolderOpenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="13" x2="12" y2="17" /><line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const FileCodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const FileImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

const FileDataIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MIN_WIDTH = 280;
const BUTTON_COUNT = 6;
const BASE_MARGIN = 8;

const Sidebar = ({ isOpen, width, onResize }: { isOpen: boolean; width: number; onResize: (w: number) => void }) => {
  const [activeTab, setActiveTab] = useState('pockets');
  const [activePocketTab, setActivePocketTab] = useState('recents');
  const [isResizing, setIsResizing] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'root': true });
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

  // File tree structure
  interface FileNode {
    id: string;
    name: string;
    type: 'folder' | 'file';
    extension?: string;
    children?: FileNode[];
  }

  const vaultTree: FileNode = {
    id: 'root',
    name: 'Vault',
    type: 'folder',
    children: [
      {
        id: 'docs',
        name: 'Documents',
        type: 'folder',
        children: [
          { id: 'doc1', name: 'README.md', type: 'file', extension: 'md' },
          { id: 'doc2', name: 'SPEC.md', type: 'file', extension: 'md' },
          { id: 'doc3', name: 'report.pdf', type: 'file', extension: 'pdf' },
        ],
      },
      {
        id: 'code',
        name: 'Code',
        type: 'folder',
        children: [
          { id: 'code1', name: 'main.py', type: 'file', extension: 'py' },
          { id: 'code2', name: 'utils.js', type: 'file', extension: 'js' },
          { id: 'code3', name: 'styles.css', type: 'file', extension: 'css' },
        ],
      },
      {
        id: 'images',
        name: 'Images',
        type: 'folder',
        children: [
          { id: 'img1', name: 'screenshot.png', type: 'file', extension: 'png' },
          { id: 'img2', name: 'mockup.jpg', type: 'file', extension: 'jpg' },
        ],
      },
      { id: 'data', name: 'data.json', type: 'file', extension: 'json' },
      { id: 'config', name: 'config.yaml', type: 'file', extension: 'yaml' },
    ],
  };

  const getFileIcon = (type: 'folder' | 'file', extension?: string) => {
    if (type === 'folder') return <FolderOpenIcon />;
    
    switch (extension) {
      case 'md':
      case 'txt':
      case 'pdf':
        return <FileTextIcon />;
      case 'py':
      case 'js':
      case 'tsx':
      case 'css':
      case 'html':
        return <FileCodeIcon />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return <FileImageIcon />;
      case 'json':
      case 'csv':
      case 'xlsx':
      case 'yaml':
      case 'yml':
        return <FileDataIcon />;
      default:
        return <FileIcon />;
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders({
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId],
    });
  };

  const FileTreeNode = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.id];
    const hasChildren = isFolder && node.children && node.children.length > 0;
    const isClickable = isFolder && hasChildren;

    return (
      <div key={node.id}>
        <div
          className={`vault-tree-item ${isClickable ? 'clickable' : ''}`}
          style={{ paddingLeft: `${level * 12}px` }}
          onClick={() => isClickable && toggleFolder(node.id)}
        >
          {isFolder && hasChildren ? (
            <div className="vault-tree-toggle">
              {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </div>
          ) : (
            <div className="vault-tree-spacer" />
          )}
          <div className="vault-tree-icon">
            {getFileIcon(node.type, node.extension)}
          </div>
          <span className="vault-tree-name">{node.name}</span>
        </div>
        {isFolder && hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => (
              <FileTreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

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
              {/* Create New Pocket */}
              <Button 
                className="pocket-create-btn"
                onClick={() => console.log('Create new pocket')}
                title="Create new pocket"
              >
                <PlusIcon />
                <span>New Pocket</span>
              </Button>

              {/* Pocket Sub-Tabs */}
              <div className="pocket-subtabs">
                <button
                  className={`pocket-subtab ${activePocketTab === 'recents' ? 'active' : ''}`}
                  onClick={() => setActivePocketTab('recents')}
                >
                  Recents
                </button>
                <button
                  className={`pocket-subtab ${activePocketTab === 'inbox' ? 'active' : ''}`}
                  onClick={() => setActivePocketTab('inbox')}
                >
                  Inbox
                  <span className="pocket-subtab-badge">2</span>
                </button>
                <button
                  className={`pocket-subtab ${activePocketTab === 'folders' ? 'active' : ''}`}
                  onClick={() => setActivePocketTab('folders')}
                >
                  Folders
                </button>
              </div>

              {/* Recents Tab Content */}
              {activePocketTab === 'recents' && (
                <div className="pocket-subtab-content">
                  <div className="pocket-list">
                    <div className="pocket-item">
                      <div className="pocket-item-header">
                        <span className="pocket-item-name">Main Context</span>
                        <span className="pocket-item-count">3</span>
                      </div>
                      <span className="pocket-item-date">2h ago</span>
                    </div>
                    <div className="pocket-item">
                      <div className="pocket-item-header">
                        <span className="pocket-item-name">Design Review</span>
                        <span className="pocket-item-count">5</span>
                      </div>
                      <span className="pocket-item-date">1d ago</span>
                    </div>
                    <div className="pocket-item">
                      <div className="pocket-item-header">
                        <span className="pocket-item-name">Research Notes</span>
                        <span className="pocket-item-count">12</span>
                      </div>
                      <span className="pocket-item-date">3d ago</span>
                    </div>
                    <div className="pocket-item">
                      <div className="pocket-item-header">
                        <span className="pocket-item-name">Archive 2025</span>
                        <span className="pocket-item-count">8</span>
                      </div>
                      <span className="pocket-item-date">10d ago</span>
                    </div>
                    <div className="pocket-item">
                      <div className="pocket-item-header">
                        <span className="pocket-item-name">Quick Notes</span>
                        <span className="pocket-item-count">2</span>
                      </div>
                      <span className="pocket-item-date">1w ago</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Inbox Tab Content */}
              {activePocketTab === 'inbox' && (
                <div className="pocket-subtab-content">
                  <div className="pocket-list">
                    <div className="pocket-item inbox-item">
                      <div className="pocket-item-header">
                        <span className="pocket-item-name">Daily News Brief</span>
                      </div>
                      <span className="pocket-item-date">today</span>
                    </div>
                    <div className="pocket-item inbox-item">
                      <div className="pocket-item-header">
                        <span className="pocket-item-name">Weekly Summary</span>
                      </div>
                      <span className="pocket-item-date">2d ago</span>
                    </div>
                    <div className="pocket-item inbox-item">
                      <div className="pocket-item-header">
                        <span className="pocket-item-name">Generated Digest</span>
                      </div>
                      <span className="pocket-item-date">5d ago</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Folders Tab Content */}
              {activePocketTab === 'folders' && (
                <div className="pocket-subtab-content">
                  <div className="pocket-folders-header">
                    <h4 className="pocket-subsection-title">Folders</h4>
                    <button 
                      className="pocket-add-folder-icon"
                      onClick={() => console.log('Add folder')}
                      title="Add new folder"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                  <div className="pocket-list">
                    <div className="pocket-folder">
                      <div className="pocket-folder-header">
                        <span className="pocket-folder-name">Work Projects</span>
                        <span className="pocket-folder-count">4</span>
                      </div>
                    </div>
                    <div className="pocket-folder">
                      <div className="pocket-folder-header">
                        <span className="pocket-folder-name">Personal</span>
                        <span className="pocket-folder-count">2</span>
                      </div>
                    </div>
                    <div className="pocket-folder">
                      <div className="pocket-folder-header">
                        <span className="pocket-folder-name">Archives</span>
                        <span className="pocket-folder-count">8</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="sidebar-section">
              <div className="vault-header">
                <h3 className="vault-title">Vault</h3>
              </div>
              <div className="vault-tree">
                {vaultTree.children && vaultTree.children.map((node) => (
                  <FileTreeNode key={node.id} node={node} level={0} />
                ))}
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
