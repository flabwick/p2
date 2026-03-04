import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import { 
  SearchIcon, FilterIcon, NewFileIcon, NewPocketIcon, NewFolderIcon, UploadIcon, 
  SortIcon, MarkdownIcon, FolderOpenIcon, ChevronRightIcon, ChevronDownIcon, 
  SelectorIcon, getFileIcon, stripExtension 
} from './SidebarCommon';
import './SidebarCommon.css';
import './SidebarContent.css';

import { FileNode } from '@/shared/types/vault';
import { useVaultStore } from '@/features/vault/store/vaultStore';
import { useShallow } from 'zustand/shallow';
import { VaultFolder } from '@/shared/types/vault';
import { Tab } from '../../../types/tabs';

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  nodeId: string | null;
  nodeType: 'folder' | 'file' | 'pocket' | 'inbox' | null;
  nodeName: string | null;
  nodeExtension?: string;
}

interface MoveState {
  visible: boolean;
  nodeId: string | null;
  nodeType: 'folder' | 'file' | null;
  nodeName: string | null;
  searchTerm: string;
  selectedTargetId: string | null;
}

interface ConflictState {
  visible: boolean;
  sourceId: string | null;
  sourceType: 'folder' | 'file' | null;
  sourceName: string | null;
  targetId: string | null;
  targetFolderId: string | null;
}

interface LibrarySidebarProps {
  onOpenFile: (fileId: string, title: string, forceNewTab?: boolean) => void;
  tabs: Tab[];
}

export function LibrarySidebar({ onOpenFile, tabs }: LibrarySidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'root': true });
  const [isVaultSelectorOpen, setIsVaultSelectorOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ 
    x: 0, y: 0, visible: false, nodeId: null, nodeType: null, nodeName: null 
  });
  const [moveState, setMoveState] = useState<MoveState>({
    visible: false, nodeId: null, nodeType: null, nodeName: null, searchTerm: '', selectedTargetId: null
  });
  const [conflictState, setConflictState] = useState<ConflictState>({
    visible: false, sourceId: null, sourceType: null, sourceName: null, targetId: null, targetFolderId: null
  });
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string | undefined>(undefined);

  const contextMenuRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const movePopupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVaults = useVaultStore(state => state.fetchVaults);
  const fetchVaultContent = useVaultStore(state => state.fetchVaultContent);
  const createFolder = useVaultStore(state => state.createFolder);
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
    return folderPaths.filter(f => f.path.toLowerCase().includes(search) && f.id !== moveState.nodeId);
  }, [folderPaths, moveState.searchTerm, moveState.nodeId]);

  const vaultTree = useMemo(() => {
    const buildTree = (parentId: string | null = null): FileNode[] => {
      const currentFolders = folders
        .filter((f) => (f.parent_id || null) === parentId)
        .map((f) => ({
          id: f.id, name: f.name, type: 'folder' as const, parentId: f.parent_id || undefined, children: buildTree(f.id),
        }));
      const currentFiles = files
        .filter((f) => (f.folder_id || null) === parentId)
        .map((f) => ({
          id: f.id, name: f.name, type: 'file' as const, parentId: f.folder_id || undefined,
          extension: f.name.split('.').pop(), mime_type: f.mime_type, size: f.size
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
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ 
      x: e.clientX, y: e.clientY, visible: true, nodeId: node.id, nodeType: node.type,
      nodeName: node.name, nodeExtension: node.extension
    });
  };

  const handleRootContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ 
      x: e.clientX, y: e.clientY, visible: true, nodeId: null, nodeType: 'folder', nodeName: 'Root'
    });
  };

  const handleCreateFolder = (parentId?: string | any) => {
    const pId = typeof parentId === 'string' ? parentId : undefined;
    if (pId) setExpandedFolders(prev => ({ ...prev, [pId]: true }));
    setIsCreating({ type: 'folder', parentId: pId, initialValue: '' });
  };

  const handleCreateFile = (parentId?: string | any) => {
    const pId = typeof parentId === 'string' ? parentId : undefined;
    if (pId) setExpandedFolders(prev => ({ ...prev, [pId]: true }));
    setIsCreating({ type: 'file', parentId: pId, initialValue: '' });
  };

  const handleCreateMarkdown = (parentId?: string | any) => {
    const pId = typeof parentId === 'string' ? parentId : undefined;
    if (pId) setExpandedFolders(prev => ({ ...prev, [pId]: true }));
    setIsCreating({ type: 'file', parentId: pId, initialValue: '', defaultExtension: '.md' });
  };

  const handleCommitCreation = async (name: string) => {
    if (!isCreating) return;
    const { type, parentId, defaultExtension } = isCreating;
    let finalName = name.trim();
    if (finalName) {
      if (type === 'file' && defaultExtension && !finalName.toLowerCase().endsWith(defaultExtension.toLowerCase())) {
        finalName += defaultExtension;
      }
      if (checkDuplicate(finalName, type, parentId || null)) {
        setIsCreating(null);
        return;
      }
      setIsCreating(null);
      if (type === 'folder') await createFolder(finalName, parentId);
      else if (type === 'file') await createFile(finalName, parentId);
    } else setIsCreating(null);
  };

  const handleUploadClick = (folderId?: string | any) => {
    const targetId = typeof folderId === 'string' ? folderId : undefined;
    setUploadTargetFolderId(targetId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i], uploadTargetFolderId);
    }
    e.target.value = '';
    setUploadTargetFolderId(undefined);
  };

  const handleRename = async () => {
    if (!contextMenu.nodeId || !contextMenu.nodeType || !contextMenu.nodeName) return;
    setIsEditing({ id: contextMenu.nodeId, type: contextMenu.nodeType as 'file' | 'folder', name: contextMenu.nodeName });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleCommitRename = async (newName: string) => {
    if (!isEditing) return;
    const { id, type, name: oldName } = isEditing;
    const trimmedNewName = newName.trim();
    if (trimmedNewName && trimmedNewName.toLowerCase() !== oldName.trim().toLowerCase()) {
      let pId: string | null = null;
      if (type === 'file') pId = files.find(f => f.id === id)?.folder_id || null;
      else pId = folders.find(f => f.id === id)?.parent_id || null;
      if (checkDuplicate(trimmedNewName, type, pId, id)) return;
      setIsEditing(null);
      await renameNode(id, type, trimmedNewName);
    } else setIsEditing(null);
  };

  const handleOpenMovePopup = () => {
    if (!contextMenu.nodeId || !contextMenu.nodeType || !contextMenu.nodeName) return;
    let currentParentId: string | null = null;
    if (contextMenu.nodeType === 'file') currentParentId = files.find(f => f.id === contextMenu.nodeId)?.folder_id || null;
    else currentParentId = folders.find(f => f.id === contextMenu.nodeId)?.parent_id || null;
    setMoveState({
      visible: true, nodeId: contextMenu.nodeId, nodeType: contextMenu.nodeType as 'file' | 'folder',
      nodeName: contextMenu.nodeName, searchTerm: '', selectedTargetId: currentParentId
    });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleExecuteMove = async () => {
    if (!moveState.nodeId || !moveState.nodeType || !moveState.nodeName) return;
    if (moveState.nodeType === 'folder' && moveState.nodeId === moveState.selectedTargetId) return;
    if (moveState.nodeType === 'folder' && moveState.selectedTargetId) {
      let currentId: string | undefined = moveState.selectedTargetId;
      while (currentId) {
        if (currentId === moveState.nodeId) return;
        currentId = folders.find(f => f.id === currentId)?.parent_id;
      }
    }
    const existing = moveState.nodeType === 'folder' 
      ? folders.find(f => (f.name || '').trim().toLowerCase() === moveState.nodeName!.trim().toLowerCase() && (f.parent_id || null) === (moveState.selectedTargetId || null))
      : files.find(f => (f.name || '').trim().toLowerCase() === moveState.nodeName!.trim().toLowerCase() && (f.folder_id || null) === (moveState.selectedTargetId || null));

    if (existing && existing.id !== moveState.nodeId) {
      setConflictState({
        visible: true, sourceId: moveState.nodeId, sourceType: moveState.nodeType, sourceName: moveState.nodeName,
        targetId: existing.id, targetFolderId: moveState.selectedTargetId
      });
      return;
    }
    await moveNode(moveState.nodeId, moveState.nodeType, moveState.selectedTargetId);
    setMoveState(prev => ({ ...prev, visible: false }));
  };

  const handleDelete = async () => {
    if (!contextMenu.nodeId || !contextMenu.nodeType) return;
    await deleteNode(contextMenu.nodeId, contextMenu.nodeType as 'file' | 'folder');
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

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    e.dataTransfer.setData('nodeId', node.id);
    e.dataTransfer.setData('nodeType', node.type);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 10, 10);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault(); e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(targetId || 'root-drop');
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault(); e.stopPropagation();
    setDragOverId(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) await uploadFile(e.dataTransfer.files[i], targetFolderId || undefined);
      return;
    }
    const nodeId = e.dataTransfer.getData('nodeId');
    const nodeType = e.dataTransfer.getData('nodeType') as 'folder' | 'file';
    if (!nodeId || !nodeType || nodeId === targetFolderId) return;
    const nodeName = nodeType === 'folder' ? folders.find(f => f.id === nodeId)?.name : files.find(f => f.id === nodeId)?.name;
    if (!nodeName) return;
    if (nodeType === 'folder' && targetFolderId) {
      let curr: string | undefined = targetFolderId;
      while (curr) { if (curr === nodeId) return; curr = folders.find(f => f.id === curr)?.parent_id; }
    }
    const existing = nodeType === 'folder' 
      ? folders.find(f => (f.name || '').trim().toLowerCase() === nodeName.trim().toLowerCase() && (f.parent_id || null) === (targetFolderId || null))
      : files.find(f => (f.name || '').trim().toLowerCase() === nodeName.trim().toLowerCase() && (f.folder_id || null) === (targetFolderId || null));
    if (existing && existing.id !== nodeId) {
      setConflictState({ visible: true, sourceId: nodeId, sourceType: nodeType, sourceName: nodeName, targetId: existing.id, targetFolderId: targetFolderId });
      return;
    }
    await moveNode(nodeId, nodeType, targetFolderId);
  };

  const handleResolveConflict = async (action: 'replace' | 'cancel') => {
    if (action === 'replace' && conflictState.sourceId && conflictState.sourceType && conflictState.targetId) {
      await deleteNode(conflictState.targetId, conflictState.sourceType);
      await moveNode(conflictState.sourceId, conflictState.sourceType, conflictState.targetFolderId);
    }
    setConflictState(prev => ({ ...prev, visible: false }));
    setMoveState(prev => ({ ...prev, visible: false }));
  };

  const InlineInput = ({ type, onCommit, onCancel, level = 0, initialValue = '', parentId = null, excludeId, defaultExtension }: { 
    type: 'file' | 'folder', onCommit: (name: string) => void, onCancel: () => void, level?: number, initialValue?: string, parentId?: string | null, excludeId?: string, defaultExtension?: string
  }) => {
    const [name, setName] = useState(initialValue);
    const [isDup, setIsDup] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { inputRef.current?.focus(); if (initialValue) inputRef.current?.select(); }, [initialValue]);
    useEffect(() => { 
      const checkName = name.trim() + (name.includes('.') ? '' : (defaultExtension || ''));
      if (checkName && checkName.toLowerCase() !== initialValue.toLowerCase()) setIsDup(checkDuplicate(checkName, type, parentId, excludeId)); else setIsDup(false); 
    }, [name, type, parentId, initialValue, excludeId, defaultExtension]);
    
    const { icon, colorClass } = type === 'folder' 
      ? { icon: <FolderOpenIcon />, colorClass: '' } 
      : getFileIcon(name.includes('.') ? name : name + (defaultExtension || ''));

    return (
      <div className="vault-tree-item-wrapper">
        <div className={`vault-tree-item editing ${isDup ? 'duplicate-error' : ''} ${colorClass}`} style={{ paddingLeft: `${level * 12}px` }}>
          <div className="vault-tree-toggle"><div className="vault-tree-spacer" /></div>
          <div className="vault-tree-icon">{icon}</div>
          <input ref={inputRef} className="vault-inline-input" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onCommit(name); if (e.key === 'Escape') onCancel(); }} onBlur={() => onCommit(name)} />
        </div>
        {isDup && <div className="vault-inline-error-toast">Duplicate name in this folder</div>}
      </div>
    );
  };

  const FileTreeNode = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.id];
    const isDragOver = dragOverId === node.id;
    const isEditingThis = isEditing && isEditing.id === node.id;
    if (isEditingThis) return <InlineInput type={isEditing!.type} onCommit={handleCommitRename} onCancel={() => setIsEditing(null)} level={level} initialValue={isEditing!.name} parentId={node.parentId || null} excludeId={node.id} />;
    const { icon, colorClass } = isFolder ? { icon: <FolderOpenIcon />, colorClass: '' } : getFileIcon(node.name);
    return (
      <div key={node.id}>
        <div className={`vault-tree-item ${isFolder || true ? 'clickable' : ''} ${isDragOver ? 'drag-over' : ''} ${colorClass}`} style={{ paddingLeft: `${level * 12}px` }} onClick={() => isFolder ? toggleFolder(node.id) : onOpenFile(node.id, node.name)} onContextMenu={(e) => handleContextMenu(e, node)} draggable onDragStart={(e) => handleDragStart(e, node)} onDragOver={(e) => handleDragOver(e, isFolder ? node.id : (node.parentId || null))} onDragLeave={() => setDragOverId(null)} onDrop={(e) => handleDrop(e, isFolder ? node.id : (node.parentId || null))}>
          <div className="vault-tree-toggle">{isFolder ? (isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />) : <div className="vault-tree-spacer" />}</div>
          <div className="vault-tree-icon">{icon}</div>
          <span className="vault-tree-name">{isFolder ? node.name : stripExtension(node.name)}</span>
        </div>
        {isFolder && isExpanded && (
          <div className={`vault-tree-children ${isDragOver ? 'drag-over-area' : ''}`}>
            {isCreating && isCreating.parentId === node.id && <InlineInput type={isCreating!.type} onCommit={handleCommitCreation} onCancel={() => setIsCreating(null)} level={level + 1} parentId={node.id} initialValue={isCreating.initialValue} defaultExtension={isCreating.defaultExtension} />}
            {node.children?.map((child) => <FileTreeNode key={child.id} node={child} level={level + 1} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="vault-sidebar library-sidebar">
      <div className="vault-sidebar-top">
        <div className="vault-search-container">
          <div className="vault-search-input-wrapper">
            <SearchIcon />
            <input type="text" placeholder="Search..." className="vault-search-input" />
          </div>
          <button className="vault-filter-btn" disabled><FilterIcon /></button>
        </div>
      </div>

      <CustomScrollbar className="sidebar-content">
        <div className={`vault-tree ${dragOverId === 'root-drop' ? 'drag-over-root' : ''}`} onDragOver={(e) => handleDragOver(e, null)} onDrop={(e) => handleDrop(e, null)} onContextMenu={handleRootContextMenu}>
          {isLoading ? <div className="vault-loading">Loading...</div> : (
            <>
              {isCreating && !isCreating.parentId && <InlineInput type={isCreating.type} onCommit={handleCommitCreation} onCancel={() => setIsCreating(null)} parentId={isCreating.parentId || null} initialValue={isCreating.initialValue} defaultExtension={isCreating.defaultExtension} />}
              {vaultTree.map((node) => <FileTreeNode key={node.id} node={node} level={0} />)}
            </>
          )}
        </div>
      </CustomScrollbar>

      <div className="vault-sidebar-bottom" ref={selectorRef}>
        <div className="vault-action-bar">
          <button className="std-button small square" title="New Markdown" onClick={() => handleCreateMarkdown()}><MarkdownIcon /></button>
          <button className="std-button small square" title="New File" onClick={() => handleCreateFile()}><NewFileIcon /></button>
          <button className="std-button small square" title="Add Pocket" onClick={() => {}}><NewPocketIcon /></button>
          <button className="std-button small square" title="New Folder" onClick={() => handleCreateFolder()}><NewFolderIcon /></button>
          <button className="std-button small square" title="Upload" onClick={() => handleUploadClick()}><UploadIcon /></button>
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
          {contextMenu.nodeType === 'file' && (
            <>
              <div className="context-menu-file-info">{contextMenu.nodeName}</div>
              {tabs.some(tab => tab.fileId === contextMenu.nodeId) && (
                <button className="context-menu-item" onClick={() => { onOpenFile(contextMenu.nodeId!, contextMenu.nodeName!, true); setContextMenu(prev => ({ ...prev, visible: false })); }}>Open in New Tab</button>
              )}
              <div className="context-menu-divider" />
            </>
          )}
          {contextMenu.nodeType === 'folder' && (
            <>
              <button className="context-menu-item" onClick={() => { handleCreateMarkdown(contextMenu.nodeId!); setContextMenu(prev => ({ ...prev, visible: false })); }}>New Markdown</button>
              <button className="context-menu-item" onClick={() => { handleCreateFile(contextMenu.nodeId!); setContextMenu(prev => ({ ...prev, visible: false })); }}>New File</button>
              <button className="context-menu-item" onClick={() => { handleCreateFolder(contextMenu.nodeId!); setContextMenu(prev => ({ ...prev, visible: false })); }}>New Folder</button>
              <button className="context-menu-item" onClick={() => { handleUploadClick(contextMenu.nodeId || undefined); setContextMenu(prev => ({ ...prev, visible: false })); }}>Upload Here</button>
              {contextMenu.nodeId && <div className="context-menu-divider" />}
            </>
          )}
          {contextMenu.nodeId && (
            <>
              <button className="context-menu-item" onClick={handleRename}>Rename</button>
              <button className="context-menu-item" onClick={handleOpenMovePopup}>Move</button>
              <button className="context-menu-item" disabled>Duplicate</button>
              <button className="context-menu-item" disabled>Copy Path</button>
              {contextMenu.nodeType === 'file' && <button className="context-menu-item">Convert</button>}
              <div className="context-menu-divider" />
              <button className="context-menu-item danger" onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
      )}

      {moveState.visible && (
        <div className="vault-move-overlay">
          <div className="vault-move-popup" ref={movePopupRef}>
            <div className="vault-move-header">
              <span>Move "{moveState.nodeName}" to...</span>
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
              <button className="std-button primary" onClick={handleExecuteMove}>MOVE</button>
            </div>
          </div>
        </div>
      )}

      {conflictState.visible && (
        <div className="vault-move-overlay" style={{ zIndex: 1200 }}>
          <div className="vault-move-popup conflict">
            <div className="vault-move-header"><span>Duplicate Found</span></div>
            <div className="vault-conflict-body">
              <p>A {conflictState.sourceType} named "<strong>{conflictState.sourceName}</strong>" already exists in the destination.</p>
              <p>Do you want to replace it?</p>
            </div>
            <div className="vault-move-actions">
              <button className="std-button secondary small" onClick={() => handleResolveConflict('cancel')}>Cancel</button>
              <button className="std-button primary danger small" onClick={() => handleResolveConflict('replace')}>Replace</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
