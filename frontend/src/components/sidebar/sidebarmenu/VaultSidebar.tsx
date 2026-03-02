import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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

const ImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const PdfIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const TextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
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

// --- Utils ---

const stripExtension = (name: string) => {
  const parts = name.split('.');
  if (parts.length > 1) {
    parts.pop();
    return parts.join('.');
  }
  return name;
};

const normalizeExtension = (ext?: string) => {
  if (!ext) return '';
  const e = ext.toLowerCase();
  if (['txt', 'md', 'rtf', 'log', 'json', 'text'].includes(e)) return 'text';
  return e;
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return { icon: <ImageIcon />, colorClass: 'file-image' };
    case 'pdf':
      return { icon: <PdfIcon />, colorClass: 'file-pdf' };
    case 'epub':
      return { icon: <BookIcon />, colorClass: 'file-book' };
    case 'txt':
    case 'md':
    case 'json':
    case 'rtf':
    case 'text':
      return { icon: <TextIcon />, colorClass: 'file-text' };
    default:
      return { icon: <FileIcon />, colorClass: 'file-default' };
  }
};

// --- Types ---

import { FileNode } from '@/shared/types/vault';
import { useVaultStore } from '@/features/vault/store/vaultStore';
import { useShallow } from 'zustand/shallow';
import { VaultFolder } from '@/shared/types/vault';

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  nodeId: string | null;
  nodeType: 'folder' | 'file' | null;
  nodeName: string | null;
  nodeExtension?: string;
}

interface MoveState {
  visible: boolean;
  nodeId: string | null;
  nodeType: 'folder' | 'file' | null;
  nodeName: string | null;
  searchTerm: string;
  selectedTargetId: string | null; // null means Root
}

interface ConflictState {
  visible: boolean;
  sourceId: string | null;
  sourceType: 'folder' | 'file' | null;
  sourceName: string | null;
  targetId: string | null; // The existing item's ID
  targetFolderId: string | null;
}

// --- Component ---

interface VaultSidebarProps {
  onOpenFile: (fileId: string, title: string) => void;
}

export function VaultSidebar({ onOpenFile }: VaultSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'root': true });
  const [isVaultSelectorOpen, setIsVaultSelectorOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ 
    x: 0, y: 0, visible: false, nodeId: null, nodeType: null, nodeName: null 
  });
  const [moveState, setMoveState] = useState<MoveState>({
    visible: false,
    nodeId: null,
    nodeType: null,
    nodeName: null,
    searchTerm: '',
    selectedTargetId: null
  });
  const [conflictState, setConflictState] = useState<ConflictState>({
    visible: false,
    sourceId: null,
    sourceType: null,
    sourceName: null,
    targetId: null,
    targetFolderId: null
  });
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string | undefined>(undefined);

  const contextMenuRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const movePopupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pick stable actions individually to guarantee reference stability
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

  // Pick state
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

  // Helper to get folder paths for the move menu
  const folderPaths = useMemo(() => {
    const map = new Map<string, VaultFolder>();
    folders.forEach(f => map.set(f.id, f));

    const getPath = (f: VaultFolder): string => {
      if (!f.parent_id) return f.name;
      const parent = map.get(f.parent_id);
      return parent ? `${getPath(parent)} / ${f.name}` : f.name;
    };

    return folders.map(f => ({
      id: f.id,
      name: f.name,
      path: getPath(f)
    })).sort((a, b) => a.path.localeCompare(b.path));
  }, [folders]);

  const filteredFolderPaths = useMemo(() => {
    const search = moveState.searchTerm.toLowerCase();
    return folderPaths.filter(f => 
      f.path.toLowerCase().includes(search) && f.id !== moveState.nodeId
    );
  }, [folderPaths, moveState.searchTerm, moveState.nodeId]);

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
          mime_type: f.mime_type,
          size: f.size
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
      nodeName: node.name,
      nodeExtension: node.extension
    });
  };

  const handleRootContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ 
      x: e.clientX, 
      y: e.clientY, 
      visible: true, 
      nodeId: null, 
      nodeType: 'folder',
      nodeName: 'Root'
    });
  };

  const handleCreateFolder = (parentId?: string | any) => {
    const pId = typeof parentId === 'string' ? parentId : undefined;
    if (pId) {
      setExpandedFolders(prev => ({ ...prev, [pId]: true }));
    }
    setIsCreating({ type: 'folder', parentId: pId });
  };

  const handleCreateFile = (parentId?: string | any) => {
    const pId = typeof parentId === 'string' ? parentId : undefined;
    if (pId) {
      setExpandedFolders(prev => ({ ...prev, [pId]: true }));
    }
    setIsCreating({ type: 'file', parentId: pId });
  };

  const handleCommitCreation = async (name: string) => {
    if (!isCreating) return;
    const { type, parentId } = isCreating;
    
    if (name.trim()) {
      if (checkDuplicate(name, type, parentId || null)) {
        // We don't clear isCreating so the input stays open
        return; 
      }
      setIsCreating(null);
      if (type === 'folder') {
        await createFolder(name, parentId);
      } else if (type === 'file') {
        await createFile(name, parentId);
      }
    } else {
      setIsCreating(null);
    }
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

    // Reset input
    e.target.value = '';
    setUploadTargetFolderId(undefined);
  };

  const InlineInput = ({ type, onCommit, onCancel, level = 0, initialValue = '', parentId = null, excludeId }: { 
    type: 'file' | 'folder', 
    onCommit: (name: string) => void, 
    onCancel: () => void, 
    level?: number,
    initialValue?: string,
    parentId?: string | null,
    excludeId?: string
  }) => {
    const [name, setName] = useState(initialValue);
    const [isDup, setIsDup] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      inputRef.current?.focus();
      if (initialValue) {
        inputRef.current?.select();
      }
    }, [initialValue]);

    useEffect(() => {
      if (name.trim() && name.toLowerCase() !== initialValue.toLowerCase()) {
        setIsDup(checkDuplicate(name, type, parentId, excludeId));
      } else {
        setIsDup(false);
      }
    }, [name, type, parentId, initialValue, excludeId]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!isDup) onCommit(name);
      }
      if (e.key === 'Escape') onCancel();
    };

    const { icon } = type === 'folder' ? { icon: <FolderOpenIcon /> } : getFileIcon(name);

    return (
      <div className="vault-tree-item-wrapper">
        <div className={`vault-tree-item editing ${isDup ? 'duplicate-error' : ''}`} style={{ paddingLeft: `${level * 12}px` }}>
          <div className="vault-tree-toggle"><div className="vault-tree-spacer" /></div>
          <div className="vault-tree-icon">
            {icon}
          </div>
          <input
            ref={inputRef}
            className="vault-inline-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => !isDup ? onCommit(name) : undefined}
          />
        </div>
        {isDup && <div className="vault-inline-error-toast">Duplicate name in this folder</div>}
      </div>
    );
  };

  const handleRename = async () => {
    if (!contextMenu.nodeId || !contextMenu.nodeType || !contextMenu.nodeName) return;
    
    setIsEditing({
      id: contextMenu.nodeId,
      type: contextMenu.nodeType,
      name: contextMenu.nodeName
    });
    
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleCommitRename = async (newName: string) => {
    if (!isEditing) return;
    const { id, type, name: oldName } = isEditing;
    
    const trimmedNewName = newName.trim();
    if (trimmedNewName && trimmedNewName.toLowerCase() !== oldName.trim().toLowerCase()) {
      // Find parentId to check for duplicates
      let parentId: string | null = null;
      if (type === 'file') {
        parentId = files.find(f => f.id === id)?.folder_id || null;
      } else {
        parentId = folders.find(f => f.id === id)?.parent_id || null;
      }

      if (checkDuplicate(trimmedNewName, type, parentId, id)) {
        // Keep editing open
        return;
      }
      
      setIsEditing(null);
      await renameNode(id, type, trimmedNewName);
    } else {
      setIsEditing(null);
    }
  };

  const handleOpenMovePopup = () => {
    if (!contextMenu.nodeId || !contextMenu.nodeType || !contextMenu.nodeName) return;
    
    // Find current parent for initial selection if possible
    let currentParentId: string | null = null;
    if (contextMenu.nodeType === 'file') {
      currentParentId = files.find(f => f.id === contextMenu.nodeId)?.folder_id || null;
    } else {
      currentParentId = folders.find(f => f.id === contextMenu.nodeId)?.parent_id || null;
    }

    setMoveState({
      visible: true,
      nodeId: contextMenu.nodeId,
      nodeType: contextMenu.nodeType,
      nodeName: contextMenu.nodeName,
      searchTerm: '',
      selectedTargetId: currentParentId
    });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleExecuteMove = async () => {
    if (!moveState.nodeId || !moveState.nodeType || !moveState.nodeName) return;
    
    // Prevent moving folder into itself
    if (moveState.nodeType === 'folder' && moveState.nodeId === moveState.selectedTargetId) {
      alert("Cannot move a folder into itself.");
      return;
    }

    // Check if target is a subfolder of source (only for folders)
    if (moveState.nodeType === 'folder' && moveState.selectedTargetId) {
      let currentId: string | undefined = moveState.selectedTargetId;
      while (currentId) {
        if (currentId === moveState.nodeId) {
          alert("Cannot move a folder into its own subfolder.");
          return;
        }
        currentId = folders.find(f => f.id === currentId)?.parent_id;
      }
    }

    // Duplicate detection for move
    const existing = moveState.nodeType === 'folder' 
      ? folders.find(f => (f.name || '').trim().toLowerCase() === moveState.nodeName!.trim().toLowerCase() && (f.parent_id || null) === (moveState.selectedTargetId || null))
      : files.find(f => (f.name || '').trim().toLowerCase() === moveState.nodeName!.trim().toLowerCase() && (f.folder_id || null) === (moveState.selectedTargetId || null));

    if (existing && existing.id !== moveState.nodeId) {
      setConflictState({
        visible: true,
        sourceId: moveState.nodeId,
        sourceType: moveState.nodeType,
        sourceName: moveState.nodeName,
        targetId: existing.id,
        targetFolderId: moveState.selectedTargetId
      });
      return;
    }

    await moveNode(moveState.nodeId, moveState.nodeType, moveState.selectedTargetId);
    setMoveState(prev => ({ ...prev, visible: false }));
  };

  const handleDelete = async () => {
    if (!contextMenu.nodeId || !contextMenu.nodeType) return;
    await deleteNode(contextMenu.nodeId, contextMenu.nodeType);
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

  // --- Drag & Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    e.dataTransfer.setData('nodeId', node.id);
    e.dataTransfer.setData('nodeType', node.type);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a ghost image or just set drag image
    const dragEl = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(dragEl, 10, 10);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(targetId || 'root-drop');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);

    // Check if it's a native file drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        await uploadFile(e.dataTransfer.files[i], targetFolderId || undefined);
      }
      return;
    }

    const nodeId = e.dataTransfer.getData('nodeId');
    const nodeType = e.dataTransfer.getData('nodeType') as 'folder' | 'file';

    if (!nodeId || !nodeType) return;
    if (nodeId === targetFolderId) return;

    // Get the name of the dragged node
    const nodeName = nodeType === 'folder' 
      ? folders.find(f => f.id === nodeId)?.name 
      : files.find(f => f.id === nodeId)?.name;

    if (!nodeName) return;

    // Recursive check for folders
    if (nodeType === 'folder' && targetFolderId) {
      let currentId: string | undefined = targetFolderId;
      while (currentId) {
        if (currentId === nodeId) {
          return; // Cannot move into self or subfolder
        }
        currentId = folders.find(f => f.id === currentId)?.parent_id;
      }
    }

    // Duplicate detection for drop
    const existing = nodeType === 'folder' 
      ? folders.find(f => (f.name || '').trim().toLowerCase() === nodeName.trim().toLowerCase() && (f.parent_id || null) === (targetFolderId || null))
      : files.find(f => (f.name || '').trim().toLowerCase() === nodeName.trim().toLowerCase() && (f.folder_id || null) === (targetFolderId || null));

    if (existing && existing.id !== nodeId) {
      setConflictState({
        visible: true,
        sourceId: nodeId,
        sourceType: nodeType,
        sourceName: nodeName,
        targetId: existing.id,
        targetFolderId: targetFolderId
      });
      return;
    }

    await moveNode(nodeId, nodeType, targetFolderId);
  };

  const handleResolveConflict = async (action: 'replace' | 'cancel') => {
    if (action === 'replace' && conflictState.sourceId && conflictState.sourceType && conflictState.targetId) {
      // Delete existing
      await deleteNode(conflictState.targetId, conflictState.sourceType);
      // Move new
      await moveNode(conflictState.sourceId, conflictState.sourceType, conflictState.targetFolderId);
    }
    
    setConflictState(prev => ({ ...prev, visible: false }));
    setMoveState(prev => ({ ...prev, visible: false }));
  };

  const FileTreeNode = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.id];
    const hasChildren = isFolder && node.children && node.children.length > 0;
    const isClickable = isFolder;
    const isDragOver = dragOverId === node.id;

    const showInlineInput = isCreating && isCreating.parentId === node.id;
    const isEditingThis = isEditing && isEditing.id === node.id;

    if (isEditingThis) {
      return (
        <InlineInput 
          type={isEditing!.type} 
          onCommit={handleCommitRename} 
          onCancel={() => setIsEditing(null)} 
          level={level}
          initialValue={isEditing!.name}
          parentId={node.parentId || null}
          excludeId={node.id}
        />
      );
    }

    const { icon, colorClass } = isFolder ? { icon: <FolderOpenIcon />, colorClass: '' } : getFileIcon(node.name);

    return (
      <div key={node.id}>
        <div
          className={`vault-tree-item ${isClickable || !isFolder ? 'clickable' : ''} ${isDragOver ? 'drag-over' : ''} ${colorClass}`}
          style={{ paddingLeft: `${level * 12}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.id);
            } else {
              onOpenFile(node.id, node.name);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, isFolder ? node.id : (node.parentId || null))}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, isFolder ? node.id : (node.parentId || null))}
        >
          <div className="vault-tree-toggle">
            {isFolder ? (isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />) : <div className="vault-tree-spacer" />}
          </div>
          <div className="vault-tree-icon">
            {icon}
          </div>
          <span className="vault-tree-name">
            {isFolder ? node.name : stripExtension(node.name)}
          </span>
        </div>
        {isFolder && isExpanded && (
          <div className={`vault-tree-children ${isDragOver ? 'drag-over-area' : ''}`}>
            {showInlineInput && (
              <InlineInput 
                type={isCreating!.type} 
                onCommit={handleCommitCreation} 
                onCancel={() => setIsCreating(null)} 
                level={level + 1}
                parentId={node.id}
              />
            )}
            {hasChildren && node.children!.map((child) => (
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
        <div 
          className={`vault-tree ${dragOverId === 'root-drop' ? 'drag-over-root' : ''}`}
          onDragOver={(e) => handleDragOver(e, null)}
          onDrop={(e) => handleDrop(e, null)}
          onContextMenu={handleRootContextMenu}
        >
          {isLoading ? (
            <div className="vault-loading">Loading...</div>
          ) : (
            <>
              {isCreating && !isCreating.parentId && (
                <InlineInput 
                  type={isCreating.type} 
                  onCommit={handleCommitCreation} 
                  onCancel={() => setIsCreating(null)} 
                  parentId={null}
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
            onClick={() => handleCreateFile()}
          >
            <NewFileIcon />
          </button>
          <button 
            className="std-button small square" 
            title="New Folder"
            onClick={() => handleCreateFolder()}
          >
            <NewFolderIcon />
          </button>
          <button 
            className="std-button small square" 
            title="Upload"
            onClick={() => handleUploadClick()}
          >
            <UploadIcon />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
            multiple
          />
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
          {contextMenu.nodeType === 'file' && (
            <div className="context-menu-file-info">
              {contextMenu.nodeName}
            </div>
          )}
          {contextMenu.nodeType === 'folder' && (
            <>
              <button className="context-menu-item" onClick={() => {
                handleCreateFile(contextMenu.nodeId!);
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}>New File</button>
              <button className="context-menu-item" onClick={() => {
                handleCreateFolder(contextMenu.nodeId!);
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}>New Folder</button>
              <button className="context-menu-item" onClick={() => {
                handleUploadClick(contextMenu.nodeId || undefined);
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}>Upload Here</button>
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
                <input 
                  type="text" 
                  placeholder="Search folders..." 
                  className="vault-search-input" 
                  value={moveState.searchTerm}
                  onChange={(e) => setMoveState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  autoFocus
                />
              </div>
            </div>

            <div className="vault-move-list-container">
              <CustomScrollbar>
                <div className="vault-move-list">
                  <button 
                    className={`vault-move-item ${moveState.selectedTargetId === null ? 'selected' : ''}`}
                    onClick={() => setMoveState(prev => ({ ...prev, selectedTargetId: null }))}
                  >
                    <div className="vault-tree-icon"><FolderOpenIcon /></div>
                    <span className="vault-move-item-path">Root</span>
                  </button>
                  
                  {filteredFolderPaths.map(folder => (
                    <button 
                      key={folder.id}
                      className={`vault-move-item ${moveState.selectedTargetId === folder.id ? 'selected' : ''}`}
                      onClick={() => setMoveState(prev => ({ ...prev, selectedTargetId: folder.id }))}
                    >
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
            <div className="vault-move-header">
              <span>Duplicate Found</span>
            </div>
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
