import React, { useState, useRef, useEffect } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import './VaultSidebar.css';

// --- Icons ---

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

const NewFileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const NewFolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    <line x1="12" y1="11" x2="12" y2="17"></line>
    <line x1="9" y1="14" x2="15" y2="14"></line>
  </svg>
);

const SortIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6"></line>
    <line x1="10" y1="12" x2="21" y2="12"></line>
    <line x1="10" y1="18" x2="21" y2="18"></line>
    <polyline points="3 6 5 4 7 6"></polyline>
    <polyline points="3 18 5 20 7 18"></polyline>
    <line x1="5" y1="20" x2="5" y2="4"></line>
  </svg>
);

const CollapseAllIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
    <polyline points="6 15 12 9 18 15"></polyline>
  </svg>
);

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

const ChevronUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const SelectorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="7 15 12 20 17 15" />
    <polyline points="7 9 12 4 17 9" />
  </svg>
);

// --- Types ---

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  children?: FileNode[];
}

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  nodeType: 'folder' | 'file' | null;
}

// --- Component ---

export function VaultSidebar() {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'root': true });
  const [isVaultSelectorOpen, setIsVaultSelectorOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState('Main Vault');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false, nodeType: null });
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  const vaults = ['Main Vault', 'Project Alpha', 'Personal Notes', 'Archive'];

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

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'file') => {
    e.preventDefault();
    e.stopPropagation();
    
    let x = e.clientX;
    let y = e.clientY;

    // We'll adjust for bounds in useEffect or right here if we have dimensions
    setContextMenu({ x, y, visible: true, nodeType: type });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsVaultSelectorOpen(false);
      }
    };

    if (contextMenu.visible || isVaultSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.visible, isVaultSelectorOpen]);

  // Adjust context menu position to stay within bounds
  useEffect(() => {
    if (contextMenu.visible && contextMenuRef.current) {
      const menu = contextMenuRef.current;
      const rect = menu.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let { x, y } = contextMenu;

      if (x + rect.width > screenWidth) {
        x = screenWidth - rect.width - 5;
      }
      if (y + rect.height > screenHeight) {
        y = screenHeight - rect.height - 5;
      }

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [contextMenu.visible, contextMenu.x, contextMenu.y]);

  const FileTreeNode = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.id];
    const hasChildren = isFolder && node.children && node.children.length > 0;
    const isClickable = isFolder;

    return (
      <div key={node.id}>
        <div
          className={`vault-tree-item ${isClickable ? 'clickable' : ''}`}
          style={{ paddingLeft: `${level * 12}px` }}
          onClick={() => isClickable && toggleFolder(node.id)}
          onContextMenu={(e) => handleContextMenu(e, node.type)}
        >
          <div className="vault-tree-toggle">
            {isFolder ? (isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />) : <div className="vault-tree-spacer" />}
          </div>
          <div className="vault-tree-icon">
            {isFolder ? <FolderOpenIcon /> : <FileIcon />}
          </div>
          <span className="vault-tree-name">{node.name}</span>
        </div>
        {isFolder && isExpanded && hasChildren && (
          <div className="vault-tree-children">
            {node.children!.map((child) => (
              <FileTreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="vault-sidebar">
      <div className="vault-sidebar-top">
        <div className="vault-search-container">
          <div className="vault-search-input-wrapper">
            <SearchIcon />
            <input type="text" placeholder="Search files..." className="vault-search-input" />
          </div>
          <button className="vault-filter-btn" disabled>
            <FilterIcon />
          </button>
        </div>
      </div>

      <CustomScrollbar className="sidebar-content">
        <div className="vault-tree">
          {vaultTree.children && vaultTree.children.map((node) => (
            <FileTreeNode key={node.id} node={node} level={0} />
          ))}
        </div>
      </CustomScrollbar>

      <div className="vault-sidebar-bottom" ref={selectorRef}>
        <div className="vault-action-bar">
          <button className="std-button small square" disabled title="New File">
            <NewFileIcon />
          </button>
          <button className="std-button small square" disabled title="New Folder">
            <NewFolderIcon />
          </button>
          <button className="std-button small square" disabled title="Sort">
            <SortIcon />
          </button>
          <button className="std-button small square" disabled title="Collapse All">
            <CollapseAllIcon />
          </button>
        </div>

        <button 
          className="vault-selector-btn"
          onClick={() => setIsVaultSelectorOpen(!isVaultSelectorOpen)}
        >
          <span className="vault-selector-name">{selectedVault}</span>
          <SelectorIcon />
        </button>

        {isVaultSelectorOpen && (
          <div className="vault-selector-dropdown">
            {vaults.map(vault => (
              <button 
                key={vault} 
                className={`vault-selector-item ${selectedVault === vault ? 'active' : ''}`}
                onClick={() => {
                  setSelectedVault(vault);
                  setIsVaultSelectorOpen(false);
                }}
              >
                {vault}
              </button>
            ))}
            <div className="vault-selector-divider" />
            <button className="vault-selector-item disabled" disabled>
              Manage Vaults
            </button>
          </div>
        )}
      </div>

      {contextMenu.visible && (
        <div 
          className="vault-context-menu" 
          ref={contextMenuRef}
          style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }}
        >
          <button className="context-menu-item">Rename</button>
          <button className="context-menu-item">Move</button>
          <button className="context-menu-item">Duplicate</button>
          <button className="context-menu-item">Copy Path</button>
          {contextMenu.nodeType === 'file' && <button className="context-menu-item">Convert</button>}
          <div className="context-menu-divider" />
          <button className="context-menu-item danger">Delete</button>
        </div>
      )}
    </div>
  );
}
