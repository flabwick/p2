import React, { useState, useRef, useEffect } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import './PocketSidebar.css';

// --- Icons ---

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Styled Pocket Icon from ToggleMenu
const PocketIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width={size} height={size}>
    <path d="M 15 58 L 15 92 Q 15 118 60 125 Q 105 118 105 92 L 105 58"
          fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M 15 58 Q 15 34 60 47 Q 105 34 105 58 Q 82 73 60 79 Q 38 73 15 58 Z"
          fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round"/>
    <circle cx="60" cy="79" r="12" fill="currentColor"/>
    <circle cx="60" cy="79" r="10" fill="none" stroke="var(--paper-ivory)" strokeWidth="6"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const AddFolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    <line x1="12" y1="11" x2="12" y2="17"></line>
    <line x1="9" y1="14" x2="15" y2="14"></line>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const ArchiveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
);

// --- Types ---

interface Pocket {
  id: string;
  name: string;
  lastEdited: string;
  itemCount: number;
  isRead?: boolean;
}

interface Folder {
  id: string;
  name: string;
  itemCount: number;
  contents: (Pocket | Folder)[];
}

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  type: 'pocket' | 'folder' | 'inbox' | 'archived';
  id: string | null;
}

export function PocketSidebar() {
  const [activeTab, setActiveTab] = useState('recents');
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false, type: 'pocket', id: null });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'recents', icon: <ClockIcon />, title: 'Recents' },
    { id: 'inbox', icon: <MailIcon />, title: 'Inbox', badge: 2 },
    { id: 'folders', icon: <FolderIcon />, title: 'Folders' },
    { id: 'archive', icon: <ArchiveIcon />, title: 'Archive' },
  ];

  // Mock Data
  const recents: Pocket[] = [
    { id: 'p1', name: 'Main Context', lastEdited: '2h ago', itemCount: 3 },
    { id: 'p2', name: 'Design Review', lastEdited: '1d ago', itemCount: 5 },
    { id: 'p3', name: 'Research Notes', lastEdited: '3d ago', itemCount: 12 },
    { id: 'p4', name: 'Archive 2025', lastEdited: '10d ago', itemCount: 8 },
    { id: 'p5', name: 'Quick Notes', lastEdited: '1w ago', itemCount: 2 },
    { id: 'p6', name: 'Project Alpha', lastEdited: '2w ago', itemCount: 45 },
    { id: 'p7', name: 'Drafts', lastEdited: '1mo ago', itemCount: 1 },
  ];

  const inbox: (Pocket | Folder)[] = [
    { id: 'i1', name: 'Daily News Brief', lastEdited: 'today', itemCount: 1 } as Pocket,
    { id: 'i2', name: 'Weekly Summary', lastEdited: '2d ago', itemCount: 1 } as Pocket,
    { id: 'i3', name: 'Generated Digest', lastEdited: '5d ago', itemCount: 1 } as Pocket,
    { id: 'if1', name: 'Automated Reports', itemCount: 5, contents: [] } as Folder,
  ];

  const rootFolders: Folder[] = [
    { id: 'f1', name: 'Work Projects', itemCount: 4, contents: [
      { id: 'p10', name: 'Internal Specs', lastEdited: '1d ago', itemCount: 3 },
      { id: 'f1-1', name: 'Legacy Docs', itemCount: 2, contents: [] } as any
    ]},
    { id: 'f2', name: 'Personal', itemCount: 2, contents: [] },
    { id: 'f3', name: 'Archives', itemCount: 8, contents: [] },
  ];

  const archived: Pocket[] = [
    { id: 'a1', name: 'Old Design Specs', lastEdited: '3mo ago', itemCount: 15 },
    { id: 'a2', name: 'Meeting Notes 2024', lastEdited: '1y ago', itemCount: 42 },
  ];

  const handleContextMenu = (e: React.MouseEvent, type: ContextMenuState['type'], id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true, type, id });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu.visible]);

  useEffect(() => {
    if (contextMenu.visible && contextMenuRef.current) {
      const menu = contextMenuRef.current;
      const rect = menu.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      let { x, y } = contextMenu;
      if (x + rect.width > screenWidth) x = screenWidth - rect.width - 5;
      if (y + rect.height > screenHeight) y = screenHeight - rect.height - 5;
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [contextMenu.visible, contextMenu.x, contextMenu.y]);

  const renderPocketItem = (p: Pocket, type: ContextMenuState['type'], showIcon: boolean = false) => (
    <div 
      key={p.id} 
      className="pocket-mini-item" 
      onContextMenu={(e) => handleContextMenu(e, type, p.id)}
    >
      {showIcon && <PocketIcon size={12} />}
      <div className="pocket-mini-name" title={p.name}>{p.name}</div>
      <div className="pocket-mini-meta">
        <span className="pocket-mini-date">{p.lastEdited}</span>
      </div>
    </div>
  );

  const SearchBar = () => (
    <div className="vault-search-container">
      <div className="vault-search-input-wrapper">
        <SearchIcon />
        <input type="text" placeholder="Search..." className="vault-search-input" />
      </div>
      <button className="vault-filter-btn" disabled>
        <FilterIcon />
      </button>
    </div>
  );

  return (
    <div className="pocket-sidebar">
      {/* Sub-Tabs (Icons only) */}
      <div className="pocket-subtabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`pocket-subtab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== 'folders') setCurrentFolder(null);
            }}
            title={tab.title}
          >
            <div className="pocket-subtab-icon-wrapper">
              {tab.icon}
              {tab.badge && <span className="pocket-subtab-badge">{tab.badge}</span>}
            </div>
          </button>
        ))}
      </div>

      <div className="pocket-tab-container">
        {activeTab === 'recents' && (
          <div className="pocket-tab-flex-layout">
            <CustomScrollbar className="pocket-content-scroll">
              <div className="pocket-list-skinnier">
                {recents.map(p => renderPocketItem(p, 'pocket', false))}
              </div>
            </CustomScrollbar>
            <div className="pocket-tab-footer">
              <SearchBar />
              <button className="pocket-create-btn prominent">
                <PlusIcon />
                <span>NEW POCKET</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'inbox' && (
          <div className="pocket-tab-flex-layout">
            <CustomScrollbar className="pocket-content-scroll">
              <div className="pocket-list-skinnier">
                {inbox.map(item => (
                  'contents' in item ? (
                    <div 
                      key={item.id} 
                      className="pocket-mini-item folder" 
                      onContextMenu={(e) => handleContextMenu(e, 'folder', item.id)}
                    >
                      <div className="pocket-mini-name">{item.name}</div>
                      <span className="pocket-mini-count">{item.itemCount}</span>
                    </div>
                  ) : (
                    renderPocketItem(item as Pocket, 'inbox', false)
                  )
                ))}
              </div>
            </CustomScrollbar>
            <div className="pocket-tab-footer inbox-footer">
              <SearchBar />
              <button className="pocket-manage-gen-btn" disabled>
                Manage generators
              </button>
            </div>
          </div>
        )}

        {activeTab === 'folders' && (
          <div className="pocket-tab-flex-layout">
            <div className="pocket-folders-nav">
              {currentFolder ? (
                <button className="pocket-folders-back" onClick={() => setCurrentFolder(null)}>
                  <ChevronLeftIcon />
                  <span>{currentFolder.name}</span>
                </button>
              ) : (
                <div className="pocket-folders-root-label">Root Folders</div>
              )}
            </div>

            <CustomScrollbar className="pocket-content-scroll">
              <div className="pocket-list-skinnier">
                {!currentFolder ? (
                  rootFolders.map(f => (
                    <div 
                      key={f.id} 
                      className="pocket-mini-item folder" 
                      onClick={() => setCurrentFolder(f)}
                      onContextMenu={(e) => handleContextMenu(e, 'folder', f.id)}
                    >
                      <FolderIcon />
                      <div className="pocket-mini-name">{f.name}</div>
                      <span className="pocket-mini-count">{f.itemCount}</span>
                    </div>
                  ))
                ) : (
                  currentFolder.contents.map(item => (
                    'contents' in item ? (
                      <div 
                        key={item.id} 
                        className="pocket-mini-item folder" 
                        onClick={() => setCurrentFolder(item as Folder)}
                        onContextMenu={(e) => handleContextMenu(e, 'folder', item.id)}
                      >
                        <FolderIcon />
                        <div className="pocket-mini-name">{item.name}</div>
                        <span className="pocket-mini-count">{(item as Folder).itemCount}</span>
                      </div>
                    ) : (
                      <div 
                        key={item.id} 
                        className="pocket-mini-item"
                        onContextMenu={(e) => handleContextMenu(e, 'pocket', item.id)}
                      >
                        <PocketIcon size={12} />
                        <div className="pocket-mini-name">{item.name}</div>
                        <span className="pocket-mini-date">{item.lastEdited}</span>
                      </div>
                    )
                  ))
                )}
              </div>
            </CustomScrollbar>

            <div className="pocket-tab-footer folders-footer">
              <SearchBar />
              <div className="pocket-footer-actions">
                <button className="pocket-footer-btn" title="Add Pocket">
                  <PlusIcon />
                  <span>Add Pocket</span>
                </button>
                <button className="pocket-footer-btn" title="Add Folder">
                  <AddFolderIcon />
                  <span>Add Folder</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="pocket-tab-flex-layout">
            <CustomScrollbar className="pocket-content-scroll">
              <div className="pocket-list-skinnier">
                {archived.map(p => renderPocketItem(p, 'archived', false))}
              </div>
            </CustomScrollbar>
            <div className="pocket-tab-footer">
              <SearchBar />
            </div>
          </div>
        )}
      </div>

      {contextMenu.visible && (
        <div 
          className="vault-context-menu" 
          ref={contextMenuRef}
          style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.type === 'pocket' && (
            <>
              <button className="context-menu-item">Rename</button>
              <button className="context-menu-item">Move to folder</button>
              <button className="context-menu-item">Archive</button>
              <div className="context-menu-divider" />
              <button className="context-menu-item danger">Delete</button>
            </>
          )}
          {contextMenu.type === 'inbox' && (
            <>
              <button className="context-menu-item">Rename</button>
              <button className="context-menu-item">Move to folder</button>
              <button className="context-menu-item">Mark as read</button>
              <button className="context-menu-item">Archive</button>
              <div className="context-menu-divider" />
              <button className="context-menu-item danger">Delete</button>
            </>
          )}
          {contextMenu.type === 'folder' && (
            <>
              <button className="context-menu-item">Rename</button>
              <button className="context-menu-item">Move folder</button>
              <div className="context-menu-divider" />
              <button className="context-menu-item danger">Delete</button>
            </>
          )}
          {contextMenu.type === 'archived' && (
            <>
              <button className="context-menu-item">Restore</button>
              <button className="context-menu-item">Move to folder</button>
              <div className="context-menu-divider" />
              <button className="context-menu-item danger">Delete</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
