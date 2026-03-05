import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import { 
  SearchIcon, FilterIcon, NewFileIcon, NewPocketIcon, UploadIcon, 
  SortIcon, MarkdownIcon, SelectorIcon, getFileIcon, stripExtension,
  FolderOpenIcon
} from './SidebarCommon';
import './SidebarCommon.css';
import './SidebarContent.css';

import { useVaultStore } from '@/features/vault/store/vaultStore';
import { useShallow } from 'zustand/shallow';
import { VaultFolder, VaultFile } from '@/shared/types/vault';

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  nodeId: string | null;
  nodeName: string | null;
}

interface MoveState {
  visible: boolean;
  nodeId: string | null;
  nodeName: string | null;
  searchTerm: string;
  selectedTargetId: string | null;
}

interface ShelfSidebarProps {
  onOpenFile: (fileId: string, title: string, forceNewTab?: boolean) => void;
}

export function ShelfSidebar({ onOpenFile }: ShelfSidebarProps) {
  const [isVaultSelectorOpen, setIsVaultSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ 
    x: 0, y: 0, visible: false, nodeId: null, nodeName: null 
  });
  const [moveState, setMoveState] = useState<MoveState>({
    visible: false, nodeId: null, nodeName: null, searchTerm: '', selectedTargetId: null
  });
  
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const movePopupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createFile = useVaultStore(state => state.createFile);
  const renameNode = useVaultStore(state => state.renameNode);
  const moveNode = useVaultStore(state => state.moveNode);
  const deleteNode = useVaultStore(state => state.deleteNode);
  const uploadFile = useVaultStore(state => state.uploadFile);
  const setIsCreating = useVaultStore(state => state.setIsCreating);
  const setIsEditing = useVaultStore(state => state.setIsEditing);
  const setActiveVaultId = useVaultStore(state => state.setActiveVaultId);

  const { activeVaultId, vaults, isLoading, isCreating, isEditing, folders, files, checkDuplicate } = useVaultStore(useShallow(state => ({
    activeVaultId: state.activeVaultId,
    vaults: state.vaults,
    isLoading: state.isLoading,
    isCreating: state.isCreating,
    isEditing: state.isEditing,
    folders: state.folders,
    files: state.files,
    checkDuplicate: state.checkDuplicate
  })));

  const shelfFiles = useMemo(() => {
    let filtered = files.filter(f => f.is_on_shelf);
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(lowSearch));
    }
    return [...filtered].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [files, searchTerm]);

  const folderPaths = useMemo(() => {
    const map = new Map<string, VaultFolder>();
    folders.forEach(f => map.set(f.id, f));
    const getPath = (f: VaultFolder): string => {
      if (!f.parent_id) return f.name;
      const parent = map.get(f.parent_id);
      return parent ? `${getPath(parent)} / ${f.name}` : f.name;
    };
    return folders.map(f => ({
      id: f.id, name: f.name, path: getPath(f)
    })).sort((a, b) => a.path.localeCompare(b.path));
  }, [folders]);

  const filteredFolderPaths = useMemo(() => {
    const search = moveState.searchTerm.toLowerCase();
    return folderPaths.filter(f => f.path.toLowerCase().includes(search));
  }, [folderPaths, moveState.searchTerm]);

  const selectedVault = useMemo(() => 
    vaults.find(v => v.id === activeVaultId)?.name || 'Select Vault',
    [vaults, activeVaultId]
  );

  const handleContextMenu = (e: React.MouseEvent, file: VaultFile) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ 
      x: e.clientX, y: e.clientY, visible: true, nodeId: file.id, nodeName: file.name 
    });
  };

  const handleCreateFile = () => {
    setIsCreating({ type: 'file', initialValue: '' });
  };

  const handleCreateMarkdown = () => {
    setIsCreating({ type: 'file', initialValue: '', defaultExtension: '.md' });
  };

  const handleCreatePocket = () => {
    setIsCreating({ type: 'file', initialValue: '', defaultExtension: '.pocket' });
  };

  const handleCommitCreation = async (name: string) => {
    if (!isCreating) return;
    const { defaultExtension } = isCreating;
    let finalName = name.trim();
    if (finalName) {
      if (defaultExtension && !finalName.toLowerCase().endsWith(defaultExtension.toLowerCase())) {
        finalName += defaultExtension;
      }
      setIsCreating(null);
      await createFile(finalName, undefined, true);
    } else setIsCreating(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i], undefined, true);
    }
    e.target.value = '';
  };

  const handleRename = () => {
    if (!contextMenu.nodeId || !contextMenu.nodeName) return;
    setIsEditing({ id: contextMenu.nodeId, type: 'file', name: contextMenu.nodeName });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleCommitRename = async (newName: string) => {
    if (!isEditing) return;
    const { id, name: oldName } = isEditing;
    const trimmedNewName = newName.trim();
    if (trimmedNewName && trimmedNewName.toLowerCase() !== oldName.trim().toLowerCase()) {
      setIsEditing(null);
      await renameNode(id, 'file', trimmedNewName);
    } else setIsEditing(null);
  };

  const handleOpenMovePopup = () => {
    if (!contextMenu.nodeId || !contextMenu.nodeName) return;
    setMoveState({
      visible: true, nodeId: contextMenu.nodeId, nodeName: contextMenu.nodeName, 
      searchTerm: '', selectedTargetId: null
    });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleExecuteMove = async () => {
    if (!moveState.nodeId || !moveState.nodeName) return;
    // Move from shelf to library
    await moveNode(moveState.nodeId, 'file', moveState.selectedTargetId, false);
    setMoveState(prev => ({ ...prev, visible: false }));
  };

  const handleDelete = async () => {
    if (!contextMenu.nodeId) return;
    await deleteNode(contextMenu.nodeId, 'file');
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
    if (contextMenu.visible || isVaultSelectorOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu.visible, isVaultSelectorOpen]);

  useEffect(() => {
    if (contextMenu.visible && contextMenuRef.current) {
      const menu = contextMenuRef.current;
      const rect = menu.getBoundingClientRect();
      let { x, y } = contextMenu;
      if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 5;
      if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 5;
      menu.style.left = `${x}px`; menu.style.top = `${y}px`;
    }
  }, [contextMenu.visible, contextMenu.x, contextMenu.y]);

  const InlineInput = ({ onCommit, onCancel, initialValue = '', defaultExtension }: { 
    onCommit: (name: string) => void, onCancel: () => void, initialValue?: string, defaultExtension?: string
  }) => {
    const [name, setName] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { inputRef.current?.focus(); if (initialValue) inputRef.current?.select(); }, [initialValue]);
    
    const { icon, colorClass } = getFileIcon(name.includes('.') ? name : name + (defaultExtension || ''));

    return (
      <div className="pocket-mini-item editing">
        <div className="pocket-mini-icon" style={{ display: 'flex', alignItems: 'center' }}>{icon}</div>
        <input 
          ref={inputRef} 
          className="vault-inline-input" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          onKeyDown={(e) => { if (e.key === 'Enter') onCommit(name); if (e.key === 'Escape') onCancel(); }} 
          onBlur={() => onCommit(name)} 
        />
      </div>
    );
  };

  return (
    <div className="vault-sidebar shelf-sidebar">
      <div className="vault-sidebar-top">
        <div className="vault-search-container">
          <div className="vault-search-input-wrapper">
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search shelf..." 
              className="vault-search-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="vault-filter-btn" disabled><FilterIcon /></button>
        </div>
      </div>

      <div className="pocket-tab-flex-layout">
        <CustomScrollbar className="pocket-content-scroll">
          <div className="pocket-list-skinnier">
            {isCreating && !isCreating.parentId && (
              <InlineInput 
                onCommit={handleCommitCreation} 
                onCancel={() => setIsCreating(null)} 
                initialValue={isCreating.initialValue} 
                defaultExtension={isCreating.defaultExtension} 
              />
            )}
            {shelfFiles.map(file => {
              if (isEditing && isEditing.id === file.id) {
                return (
                  <InlineInput 
                    key={file.id}
                    onCommit={handleCommitRename} 
                    onCancel={() => setIsEditing(null)} 
                    initialValue={isEditing.name} 
                  />
                );
              }
              const { icon, colorClass } = getFileIcon(file.name);
              return (
                <div 
                  key={file.id} 
                  className={`pocket-mini-item ${colorClass}`} 
                  onClick={() => onOpenFile(file.id, file.name)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <div className="pocket-mini-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    {icon}
                  </div>
                  <div className="pocket-mini-name" title={file.name}>{stripExtension(file.name)}</div>
                  <div className="pocket-mini-meta">
                    <span className="pocket-mini-date">
                      {new Date(file.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
            {!isLoading && shelfFiles.length === 0 && !isCreating && (
              <div className="vault-loading" style={{ opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>
                Shelf is empty
              </div>
            )}
            {isLoading && <div className="vault-loading">Loading...</div>}
          </div>
        </CustomScrollbar>
      </div>

      <div className="vault-sidebar-bottom" ref={selectorRef}>
        <div className="vault-action-bar">
          <button className="std-button small square" title="New Markdown" onClick={handleCreateMarkdown}><MarkdownIcon /></button>
          <button className="std-button small square" title="New File" onClick={handleCreateFile}><NewFileIcon /></button>
          <button className="std-button small square" title="Add Pocket" onClick={handleCreatePocket}><NewPocketIcon /></button>
          <button className="std-button small square" title="Upload" onClick={handleUploadClick}><UploadIcon /></button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} multiple />
          <button className="std-button small square" disabled title="Sort"><SortIcon /></button>
        </div>

        <button className="vault-selector-btn" onClick={() => setIsVaultSelectorOpen(!isVaultSelectorOpen)}>
          <span className="vault-selector-name">{selectedVault}</span>
          <SelectorIcon />
        </button>

        {isVaultSelectorOpen && (
          <div className="vault-selector-dropdown">
            {vaults.map(vault => (
              <button key={vault.id} className={`vault-selector-item ${activeVaultId === vault.id ? 'active' : ''}`} onClick={() => { setActiveVaultId(vault.id); setIsVaultSelectorOpen(false); }}>{vault.name}</button>
            ))}
            <div className="vault-selector-divider" />
            <button className="vault-selector-item disabled" disabled>Manage Vaults</button>
          </div>
        )}
      </div>

      {contextMenu.visible && (
        <div className="vault-context-menu" ref={contextMenuRef} style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }}>
          <div className="context-menu-file-info">{contextMenu.nodeName}</div>
          <button className="context-menu-item" onClick={handleRename}>Rename</button>
          <button className="context-menu-item" onClick={handleOpenMovePopup}>Add to Library</button>
          <div className="context-menu-divider" />
          <button className="context-menu-item danger" onClick={handleDelete}>Delete</button>
        </div>
      )}

      {moveState.visible && (
        <div className="vault-move-overlay">
          <div className="vault-move-popup" ref={movePopupRef}>
            <div className="vault-move-header">
              <span>Add "{moveState.nodeName}" to Library...</span>
              <button className="vault-move-close" onClick={() => setMoveState(prev => ({ ...prev, visible: false }))}>✕</button>
            </div>
            <div className="vault-move-search">
              <div className="vault-search-input-wrapper">
                <SearchIcon />
                <input type="text" placeholder="Search folders..." className="vault-search-input" value={moveState.searchTerm} onChange={(e) => setMoveState(prev => ({ ...prev, searchTerm: e.target.value }))} autoFocus />
              </div>
            </div>
            <div className="vault-move-list-container">
              <CustomScrollbar>
                <div className="vault-move-list">
                  <button className={`vault-move-item ${moveState.selectedTargetId === null ? 'selected' : ''}`} onClick={() => setMoveState(prev => ({ ...prev, selectedTargetId: null }))}>
                    <div className="vault-tree-icon"><FolderOpenIcon /></div>
                    <span className="vault-move-item-path">Root</span>
                  </button>
                  {filteredFolderPaths.map(folder => (
                    <button key={folder.id} className={`vault-move-item ${moveState.selectedTargetId === folder.id ? 'selected' : ''}`} onClick={() => setMoveState(prev => ({ ...prev, selectedTargetId: folder.id }))}>
                      <div className="vault-tree-icon"><FolderOpenIcon /></div>
                      <span className="vault-move-item-path">{folder.path}</span>
                    </button>
                  ))}
                </div>
              </CustomScrollbar>
            </div>
            <div className="vault-move-actions">
              <button className="std-button secondary" onClick={() => setMoveState(prev => ({ ...prev, visible: false }))}>Cancel</button>
              <button className="std-button primary" onClick={handleExecuteMove}>ADD</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
