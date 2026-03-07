import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import { 
  SearchIcon, FilterIcon, NewFileIcon, NewPocketIcon, UploadIcon, 
  SortIcon, MarkdownIcon, SelectorIcon, getFileIcon, stripExtension,
  FolderOpenIcon, ChevronRightIcon, ChevronDownIcon, ShelfIcon
} from './SidebarCommon';
import './SidebarCommon.css';
import './SidebarContent.css';

import { useVaultStore } from '@/features/vault/store/vaultStore';
import { usePocketStore } from '@/features/pockets/store/pocketStore';
import { useShallow } from 'zustand/shallow';
import { VaultFolder, VaultFile, FileNode } from '@/shared/types/vault';
import { supabase } from '@/lib/supabase';

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  nodeId: string | null;
  nodeType: 'file' | 'pocket' | null;
  nodeName: string | null;
}

interface MoveState {
  visible: boolean;
  nodeId: string | null;
  nodeName: string | null;
  selectedTargetId: string | null;
}

interface ConflictState {
  visible: boolean;
  sourceId: string | null;
  sourceName: string | null;
  targetId: string | null;
  targetFolderId: string | null;
}

interface ShelfSidebarProps {
  onOpenFile: (fileId: string, title: string, forceNewTab?: boolean) => void;
}

export function ShelfSidebar({ onOpenFile }: ShelfSidebarProps) {
  const [isVaultSelectorOpen, setIsVaultSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ 
    x: 0, y: 0, visible: false, nodeId: null, nodeType: null, nodeName: null 
  });
  const [moveState, setMoveState] = useState<MoveState>({
    visible: false, nodeId: null, nodeName: null, selectedTargetId: null
  });
  const [conflictState, setConflictState] = useState<ConflictState>({
    visible: false, sourceId: null, sourceName: null, targetId: null, targetFolderId: null
  });
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'root': true });
  const [isSaving, setIsSaving] = useState(false);
  
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

  const { activeVaultId, vaults, isLoading: vaultLoading, isCreating, isEditing, folders, files, checkDuplicate, fetchVaults, fetchVaultContent } = useVaultStore(useShallow(state => ({
    activeVaultId: state.activeVaultId,
    vaults: state.vaults,
    isLoading: state.isLoading,
    isCreating: state.isCreating,
    isEditing: state.isEditing,
    folders: state.folders,
    files: state.files,
    checkDuplicate: state.checkDuplicate,
    fetchVaults: state.fetchVaults,
    fetchVaultContent: state.fetchVaultContent
  })));

  const { pockets, fetchPockets, createPocket, deletePocket, isLoading: pocketLoading } = usePocketStore();

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  useEffect(() => {
    if (activeVaultId) {
      fetchVaultContent(activeVaultId);
    }
  }, [activeVaultId, fetchVaultContent]);

  useEffect(() => {
    fetchPockets();
  }, [fetchPockets]);

  const shelfItems = useMemo(() => {
    const shelfFiles = files.filter(f => f.is_on_shelf).map(f => ({
      id: f.id,
      name: f.name,
      type: 'file' as const,
      updated_at: f.updated_at
    }));

    const shelfPockets = pockets.filter(p => p.is_on_shelf).map(p => ({
      id: p.id,
      name: p.name,
      type: 'pocket' as const,
      updated_at: p.updated_at
    }));

    let combined = [...shelfFiles, ...shelfPockets];

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      combined = combined.filter(item => item.name.toLowerCase().includes(lowSearch));
    }

    return combined.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [files, pockets, searchTerm]);

  const vaultTree = useMemo(() => {
    const buildTree = (parentId: string | null = null): FileNode[] => {
      const currentFolders = folders
        .filter((f) => (f.parent_id || null) === parentId)
        .map((f) => ({
          id: f.id, name: f.name, type: 'folder' as const, parentId: f.parent_id || undefined, children: buildTree(f.id),
        }));
      const currentFiles = files
        .filter((f) => (f.folder_id || null) === parentId && !f.is_on_shelf && !f.is_on_desk)
        .map((f) => ({
          id: f.id, name: f.name, 
          type: f.name.toLowerCase().endsWith('.pocket') ? 'pocket' as const : 'file' as const, 
          parentId: f.folder_id || undefined,
        }));
      return [...currentFolders, ...currentFiles];
    };
    return buildTree(null);
  }, [folders, files]);

  const selectedVault = useMemo(() => 
    vaults.find(v => v.id === activeVaultId)?.name || 'Select Vault',
    [vaults, activeVaultId]
  );

  const handleContextMenu = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ 
      x: e.clientX, y: e.clientY, visible: true, nodeId: item.id, nodeType: item.type, nodeName: item.name 
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
      if (defaultExtension === '.pocket') {
        setIsCreating(null);
        await createPocket(finalName, undefined, true);
      } else {
        if (defaultExtension && !finalName.toLowerCase().endsWith(defaultExtension.toLowerCase())) {
          finalName += defaultExtension;
        }
        setIsCreating(null);
        await createFile(finalName, undefined, true);
      }
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
    if (!contextMenu.nodeId || !contextMenu.nodeName || !contextMenu.nodeType) return;
    setIsEditing({ id: contextMenu.nodeId, type: contextMenu.nodeType === 'pocket' ? 'file' : 'file', name: contextMenu.nodeName });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleCommitRename = async (newName: string) => {
    if (!isEditing) return;
    const { id, name: oldName } = isEditing;
    const trimmedNewName = newName.trim();
    if (trimmedNewName && trimmedNewName.toLowerCase() !== oldName.trim().toLowerCase()) {
      setIsEditing(null);
      // Determine if it was a pocket or file
      const pocket = pockets.find(p => p.id === id);
      if (pocket) {
        await supabase.from('pockets').update({ name: trimmedNewName }).eq('id', id);
        fetchPockets();
      } else {
        await renameNode(id, 'file', trimmedNewName);
      }
    } else setIsEditing(null);
  };

  const handleOpenMovePopup = () => {
    if (!contextMenu.nodeId || !contextMenu.nodeName) return;
    const movingFile = files.find(f => f.id === contextMenu.nodeId);
    setMoveState({
      visible: true, 
      nodeId: contextMenu.nodeId, 
      nodeName: contextMenu.nodeName, 
      selectedTargetId: movingFile?.folder_id || null
    });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleExecuteMove = async () => {
    if (!moveState.nodeId || !moveState.nodeName) return;
    if (isSaving) return;

    // Duplicate detection
    const targetFolderId = moveState.selectedTargetId;
    const existing = files.find(f => 
      !f.is_on_shelf && 
      !f.is_on_desk && 
      (f.folder_id || null) === targetFolderId && 
      f.name.toLowerCase() === moveState.nodeName!.toLowerCase() &&
      f.id !== moveState.nodeId
    );

    if (existing) {
      setConflictState({
        visible: true,
        sourceId: moveState.nodeId,
        sourceName: moveState.nodeName,
        targetId: existing.id,
        targetFolderId: targetFolderId
      });
      return;
    }

    setIsSaving(true);
    try {
      // Move from shelf to library
      const pocket = pockets.find(p => p.id === moveState.nodeId);
      if (pocket) {
        // Pockets don't support library/folders yet, but we can set is_on_shelf to false
        await supabase.from('pockets').update({ is_on_shelf: false }).eq('id', moveState.nodeId);
        fetchPockets();
      } else {
        await moveNode(moveState.nodeId, 'file', moveState.selectedTargetId, false);
      }
      
      // Verification: Wait a tick for Zustand to update local state and confirm
      await new Promise(resolve => setTimeout(resolve, 100));
      setMoveState(prev => ({ ...prev, visible: false }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolveConflict = async (action: 'replace' | 'cancel') => {
    if (action === 'replace' && conflictState.sourceId && conflictState.targetId) {
      setIsSaving(true);
      try {
        await deleteNode(conflictState.targetId, 'file');
        await moveNode(conflictState.sourceId, 'file', conflictState.targetFolderId, false);
        await new Promise(resolve => setTimeout(resolve, 100));
        setMoveState(prev => ({ ...prev, visible: false }));
      } finally {
        setIsSaving(false);
      }
    }
    setConflictState(prev => ({ ...prev, visible: false }));
  };

  const handleDelete = async () => {
    if (!contextMenu.nodeId) return;
    if (contextMenu.nodeType === 'pocket') {
      await deletePocket(contextMenu.nodeId);
    } else {
      await deleteNode(contextMenu.nodeId, 'file');
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

  const handleDragStart = (e: React.DragEvent, item: any) => {
    e.dataTransfer.setData('nodeId', item.id);
    e.dataTransfer.setData('nodeType', item.type);
    e.dataTransfer.setData('text/plain', item.id); // Standard fallback
    
    if (item.type === 'pocket') {
      e.dataTransfer.setData('application/x-pocket', item.id);
    }
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 10, 10);
  };

  const MoveFileTreeNode = ({ node, level = 0, currentFolderId }: { node: FileNode; level?: number, currentFolderId: string | null }) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.id];
    const isSelected = moveState.selectedTargetId === node.id;
    const isCurrent = currentFolderId === node.id;
    const { icon, colorClass } = isFolder ? { icon: <FolderOpenIcon />, colorClass: '' } : getFileIcon(node.name);

    return (
      <div key={node.id}>
        <div 
          className={`vault-tree-item ${isFolder && !isCurrent ? 'clickable' : 'disabled'} ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''} ${colorClass}`} 
          style={{ 
            paddingLeft: `${level * 12 + 12}px`,
            opacity: isFolder ? (isCurrent ? 0.6 : 1) : 0.4,
            cursor: isFolder && !isCurrent ? 'pointer' : 'default',
            background: isSelected ? 'var(--accent-deep-teal-faded)' : 'transparent',
            borderLeft: isSelected ? '3px solid var(--accent-deep-teal)' : 'none'
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isFolder && !isCurrent) {
              setMoveState(prev => ({ ...prev, selectedTargetId: node.id }));
            }
          }}
        >
          <div 
            className="vault-tree-toggle" 
            onClick={(e) => {
              if (isFolder) {
                e.stopPropagation();
                setExpandedFolders(prev => ({ ...prev, [node.id]: !prev[node.id] }));
              }
            }}
          >
            {isFolder ? (isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />) : <div className="vault-tree-spacer" />}
          </div>
          <div className="vault-tree-icon">{icon}</div>
          <span className="vault-tree-name" style={{ fontSize: '0.7rem' }}>
            {isFolder ? node.name : stripExtension(node.name)}
            {isCurrent && <span style={{ opacity: 0.5, fontSize: '0.6rem', marginLeft: '4px' }}>(current)</span>}
          </span>
        </div>
        {isFolder && isExpanded && (
          <div className="vault-tree-children">
            {node.children?.map((child) => <MoveFileTreeNode key={child.id} node={child} level={level + 1} currentFolderId={currentFolderId} />)}
          </div>
        )}
      </div>
    );
  };

  const InlineInput = ({ onCommit, onCancel, initialValue = '', defaultExtension }: { 
    onCommit: (name: string) => void, onCancel: () => void, initialValue?: string, defaultExtension?: string
  }) => {
    const [name, setName] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { inputRef.current?.focus(); if (initialValue) inputRef.current?.select(); }, [initialValue]);
    
    const { icon } = getFileIcon(name.includes('.') ? name : name + (defaultExtension || ''));

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
            {shelfItems.map(item => {
              if (isEditing && isEditing.id === item.id) {
                return (
                  <InlineInput 
                    key={item.id}
                    onCommit={handleCommitRename} 
                    onCancel={() => setIsEditing(null)} 
                    initialValue={isEditing.name} 
                  />
                );
              }
              const { icon, colorClass } = getFileIcon(item.type === 'pocket' ? `${item.name}.pocket` : item.name);
              return (
                <div 
                  key={item.id} 
                  className={`pocket-mini-item ${colorClass}`} 
                  onClick={() => onOpenFile(item.id, item.type === 'pocket' ? `${item.name}.pocket` : item.name)}
                  onContextMenu={(e) => handleContextMenu(e, item)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                >
                  <div className="pocket-mini-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    {icon}
                  </div>
                  <div className="pocket-mini-name" title={item.name}>{stripExtension(item.name)}</div>
                  <div className="pocket-mini-meta">
                    <span className="pocket-mini-date">
                      {new Date(item.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
            {!vaultLoading && !pocketLoading && shelfItems.length === 0 && !isCreating && (
              <div className="vault-loading" style={{ opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>
                Shelf is empty
              </div>
            )}
            {(vaultLoading || pocketLoading) && <div className="vault-loading">Loading...</div>}
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
          <button className="context-menu-item" onClick={handleOpenMovePopup}>Move</button>
          <div className="context-menu-divider" />
          <button className="context-menu-item danger" onClick={handleDelete}>Delete</button>
        </div>
      )}

      {moveState.visible && (
        <div className="vault-move-overlay">
          <div className="vault-move-popup" ref={movePopupRef}>
            <div className="vault-move-header">
              <span>Save "{moveState.nodeName}"</span>
              <button className="vault-move-close" onClick={() => setMoveState(prev => ({ ...prev, visible: false }))}>✕</button>
            </div>
            
            <div className="vault-move-list-container" style={{ maxHeight: '400px' }}>
              <CustomScrollbar>
                <div className="vault-tree" style={{ padding: '8px 0' }}>
                  {/* Shelf is always current for items in this sidebar */}
                  <div 
                    className="vault-tree-item disabled" 
                    style={{ 
                      background: 'var(--paper-linen)', 
                      marginBottom: '12px',
                      paddingLeft: '12px',
                      opacity: 1
                    }}
                  >
                    <div className="vault-tree-toggle"><div className="vault-tree-spacer" /></div>
                    <div className="vault-tree-icon" style={{ color: 'var(--accent-deep-teal)' }}><ShelfIcon /></div>
                    <span className="vault-tree-name" style={{ fontWeight: 700, color: 'var(--accent-deep-teal)', fontSize: '0.75rem' }}>
                      Shelf (Current)
                    </span>
                  </div>

                  {(() => {
                    const movingFile = files.find(f => f.id === moveState.nodeId);
                    const isRootCurrent = movingFile && movingFile.folder_id === null && !movingFile.is_on_shelf;
                    return (
                      <div 
                        className={`vault-tree-item clickable ${isRootCurrent ? 'disabled' : ''} ${moveState.selectedTargetId === null ? 'selected' : ''}`} 
                        onClick={() => !isRootCurrent && setMoveState(prev => ({ ...prev, selectedTargetId: null }))}
                        style={{ 
                          paddingLeft: '12px',
                          background: moveState.selectedTargetId === null ? 'var(--accent-deep-teal-faded)' : 'transparent',
                          borderLeft: moveState.selectedTargetId === null ? '3px solid var(--accent-deep-teal)' : 'none'
                        }}
                      >
                        <div className="vault-tree-toggle"><div className="vault-tree-spacer" /></div>
                        <div className="vault-tree-icon" style={{ opacity: 0.7 }}><FolderOpenIcon /></div>
                        <span className="vault-tree-name" style={{ 
                          fontSize: '0.85rem', 
                          fontFamily: 'var(--font-mono)', 
                          textTransform: 'lowercase',
                          fontWeight: 800,
                          letterSpacing: '-0.02em'
                        }}>
                          root {isRootCurrent && <span style={{ opacity: 0.5, fontWeight: 400, fontSize: '0.65rem', marginLeft: '4px' }}>(current)</span>}
                        </span>
                      </div>
                    );
                  })()}

                  {vaultTree.map((node) => {
                    const movingFile = files.find(f => f.id === moveState.nodeId);
                    const isNodeCurrent = movingFile && movingFile.folder_id === node.id && !movingFile.is_on_shelf;
                    return (
                      <MoveFileTreeNode 
                        key={node.id} 
                        node={node} 
                        level={0} 
                        currentFolderId={isNodeCurrent ? node.id : (movingFile?.is_on_shelf ? '___shelf___' : (movingFile?.folder_id || null))} 
                      />
                    );
                  })}
                </div>
              </CustomScrollbar>
            </div>
            <div className="vault-move-actions" style={{ padding: '8px 12px', background: 'var(--paper-linen)' }}>
              <button className="std-button small ghost" onClick={() => setMoveState(prev => ({ ...prev, visible: false }))}>Cancel</button>
              <button 
                className="std-button small primary" 
                onClick={handleExecuteMove}
                disabled={(() => {
                  const movingFile = files.find(f => f.id === moveState.nodeId);
                  const isCurrent = movingFile?.is_on_shelf ? 'shelf' : (movingFile?.folder_id || null);
                  return moveState.selectedTargetId === isCurrent || isSaving;
                })()}
              >
                {isSaving ? '...' : 'SAVE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {conflictState.visible && (
        <div className="vault-move-overlay" style={{ zIndex: 1200 }}>
          <div className="vault-move-popup conflict">
            <div className="vault-move-header"><span>Duplicate Found</span></div>
            <div className="vault-conflict-body" style={{ padding: '16px', fontSize: '0.85rem' }}>
              <p>A file named "<strong>{conflictState.sourceName}</strong>" already exists in the destination.</p>
              <p>Do you want to replace it?</p>
            </div>
            <div className="vault-move-actions" style={{ padding: '8px 12px', background: 'var(--paper-linen)' }}>
              <button className="std-button secondary small" onClick={() => handleResolveConflict('cancel')}>Cancel</button>
              <button className="std-button primary danger small" onClick={() => handleResolveConflict('replace')}>{isSaving ? '...' : 'Replace'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
