import React, { useState, useRef, useEffect, useMemo } from 'react';
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

const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
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

import { FileNode } from '@/shared/types/vault';
import { useVaultStore } from '@/features/vault/store/vaultStore';
import { useShallow } from 'zustand/shallow';

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  nodeId: string | null;
  nodeType: 'folder' | 'file' | null;
  nodeName: string | null;
}

// --- Component ---

export function VaultSidebar() {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'root': true });
  const [isVaultSelectorOpen, setIsVaultSelectorOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ 
    x: 0, y: 0, visible: false, nodeId: null, nodeType: null, nodeName: null 
  });
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Pick stable actions individually to guarantee reference stability
  const fetchVaults = useVaultStore(state => state.fetchVaults);
  const fetchVaultContent = useVaultStore(state => state.fetchVaultContent);
  const createFolder = useVaultStore(state => state.createFolder);
  const createFile = useVaultStore(state => state.createFile);
  const renameNode = useVaultStore(state => state.renameNode);
  const moveNode = useVaultStore(state => state.moveNode);
  const deleteNode = useVaultStore(state => state.deleteNode);
  const setIsCreating = useVaultStore(state => state.setIsCreating);
  const setActiveVaultId = useVaultStore(state => state.setActiveVaultId);

  // Pick state
  const { activeVaultId, vaults, isLoading, isCreating, folders, files } = useVaultStore(useShallow(state => ({
    activeVaultId: state.activeVaultId,
    vaults: state.vaults,
    isLoading: state.isLoading,
    isCreating: state.isCreating,
    folders: state.folders,
    files: state.files
  })));

  // Memoize tree building to fix "getSnapshot" warning and unnecessary re-renders
  const vaultTree = useMemo(() => {
    const buildTree = (parentId: string | null = null): FileNode[] => {
      const currentFolders = folders
        .filter((f) => (f.parent_id || null) === parentId)
        .map((f) => ({
          id: f.id,
          name: f.name,
          type: 'folder' as const,
          parentId: f.parent_id || undefined,
          children: buildTree(f.id),
        }));

      const currentFiles = files
        .filter((f) => (f.folder_id || null) === parentId)
        .map((f) => ({
          id: f.id,
          name: f.name,
          type: 'file' as const,
          parentId: f.folder_id || undefined,
          extension: f.name.split('.').pop(),
        }));

      return [...currentFolders, ...currentFiles];
    };
    return buildTree(null);
  }, [folders, files]);

  const selectedVault = useMemo(() => 
    vaults.find(v => v.id === activeVaultId)?.name || 'Select Vault',
    [vaults, activeVaultId]
  );

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  useEffect(() => {
    if (activeVaultId) {
      fetchVaultContent(activeVaultId);
    }
  }, [activeVaultId, fetchVaultContent]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({ 
      x: e.clientX, 
      y: e.clientY, 
      visible: true, 
      nodeId: node.id, 
      nodeType: node.type,
      nodeName: node.name
    });
  };

  const handleCreateFolder = () => {
    setIsCreating('folder');
  };

  const handleCreateFile = () => {
    setIsCreating('file');
  };

  const handleCommitCreation = async (name: string) => {
    if (name.trim()) {
      setIsCreating(null); // Clear early for better UX
      if (isCreating === 'folder') {
        await createFolder(name);
      } else if (isCreating === 'file') {
        await createFile(name);
      }
    } else {
      setIsCreating(null);
    }
  };

  const InlineInput = ({ type, onCommit, onCancel }: { type: 'file' | 'folder', onCommit: (name: string) => void, onCancel: () => void }) => {
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') onCommit(name);
      if (e.key === 'Escape') onCancel();
    };

    return (
      <div className="vault-tree-item editing">
        <div className="vault-tree-toggle"><div className="vault-tree-spacer" /></div>
        <div className="vault-tree-icon">
          {type === 'folder' ? <FolderOpenIcon /> : <FileIcon />}
        </div>
        <input
          ref={inputRef}
          className="vault-inline-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onCommit(name)}
        />
      </div>
    );
  };

  const handleRename = async () => {
    if (!contextMenu.nodeId || !contextMenu.nodeType || !contextMenu.nodeName) return;
    const newName = prompt('New name:', contextMenu.nodeName);
    if (newName && newName !== contextMenu.nodeName) {
      await renameNode(contextMenu.nodeId, contextMenu.nodeType, newName);
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleDelete = async () => {
    if (!contextMenu.nodeId || !contextMenu.nodeType) return;
    if (confirm(`Are you sure you want to delete this ${contextMenu.nodeType}?`)) {
      await deleteNode(contextMenu.nodeId, contextMenu.nodeType);
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
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
          onContextMenu={(e) => handleContextMenu(e, node)}
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
          {isLoading ? (
            <div className="vault-loading">Loading...</div>
          ) : (
            <>
              {isCreating && (
                <InlineInput 
                  type={isCreating} 
                  onCommit={handleCommitCreation} 
                  onCancel={() => setIsCreating(null)} 
                />
              )}
              {vaultTree.map((node) => (
                <FileTreeNode key={node.id} node={node} level={0} />
              ))}
            </>
          )}
        </div>
      </CustomScrollbar>

      <div className="vault-sidebar-bottom" ref={selectorRef}>
        <div className="vault-action-bar">
          <button 
            className="std-button small square" 
            title="New File"
            onClick={handleCreateFile}
          >
            <NewFileIcon />
          </button>
          <button 
            className="std-button small square" 
            title="New Folder"
            onClick={handleCreateFolder}
          >
            <NewFolderIcon />
          </button>
          <button className="std-button small square" disabled title="Upload">
            <UploadIcon />
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
          <span className="vault-selector-name">{selectedVault || 'Select Vault'}</span>
          <SelectorIcon />
        </button>

        {isVaultSelectorOpen && (
          <div className="vault-selector-dropdown">
            {vaults.map(vault => (
              <button 
                key={vault.id} 
                className={`vault-selector-item ${activeVaultId === vault.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveVaultId(vault.id);
                  setIsVaultSelectorOpen(false);
                }}
              >
                {vault.name}
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
          <button className="context-menu-item" onClick={handleRename}>Rename</button>
          <button className="context-menu-item" disabled>Move</button>
          <button className="context-menu-item" disabled>Duplicate</button>
          <button className="context-menu-item" disabled>Copy Path</button>
          {contextMenu.nodeType === 'file' && <button className="context-menu-item">Convert</button>}
          <div className="context-menu-divider" />
          <button className="context-menu-item danger" onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}
