import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileCard as IFileCard } from '@shared/types/desk';
import { useDeskStore } from '@/features/pockets/store/deskStore';
import { useVaultStore } from '@/features/vault/store/vaultStore';
import { FileViewer } from '@/features/viewers';
import { Editor } from '@/features/editor/Editor';
import { CustomScrollbar } from '../../../../ui/CustomScrollbar';
import { 
  SearchIcon, FolderOpenIcon, ChevronRightIcon, ChevronDownIcon, 
  getFileIcon, stripExtension, ShelfIcon 
} from '../../../../sidebar/sidebarmenu/SidebarCommon';
import './DeskFileCard.css';
import { FileNode } from '@/shared/types/vault';

interface DeskFileCardProps {
  card: IFileCard;
  pocketId: string;
  isDragOverlay?: boolean;
  isPlaceholder?: boolean;
}

interface ConflictState {
  visible: boolean;
  sourceId: string | null;
  sourceName: string | null;
  targetId: string | null;
  targetFolderId: string | 'shelf' | null;
}

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const ConvertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const DragHandleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <circle cx="9" cy="5" r="1" fill="currentColor" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="9" cy="19" r="1" fill="currentColor" />
    <circle cx="15" cy="5" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="19" r="1" fill="currentColor" />
  </svg>
);

export const DeskFileCard: React.FC<DeskFileCardProps> = ({ card, pocketId, isDragOverlay, isPlaceholder }) => {
  const { desks, toggleCard, removeFileCard, updateFileCard } = useDeskStore();
  const { moveNode, renameNode, deleteNode, folders, files } = useVaultStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isMovePopupVisible, setIsMovePopupVisible] = useState(false);
  const [moveSearchTerm, setMoveSearchTerm] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState<string | 'shelf' | 'unsave' | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'root': true });
  const [conflictState, setConflictState] = useState<ConflictState>({
    visible: false, sourceId: null, sourceName: null, targetId: null, targetFolderId: null
  });
  const [renameError, setRenameError] = useState<{ visible: boolean, name: string }>({ visible: false, name: '' });
  const [isInputFocused, setIsInputFocused] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const isRenamingRef = useRef(false);
  
  const file = useMemo(() => files.find(f => f.id === card.file_id), [files, card.file_id]);

  const currentLocationId = useMemo(() => {
    if (!card.is_liked) return 'unsave';
    if (file?.is_on_shelf) return 'shelf';
    return file?.folder_id || null; // null is root
  }, [card.is_liked, file]);

  const getExtension = (name: string) => {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop() : '';
  };
  
  const stripExt = (name: string) => {
    const parts = name.split('.');
    if (parts.length > 1) {
      parts.pop();
      return parts.join('.');
    }
    return name;
  };

  const [localName, setLocalName] = useState(stripExt(card.name));
  const cardExtension = useMemo(() => getExtension(card.name), [card.name]);
  
  // Keep local state in sync with external updates unless we are actively editing
  useEffect(() => {
    if (!isRenamingRef.current && document.activeElement !== titleInputRef.current) {
      setLocalName(stripExt(card.name));
    }
  }, [card.name]);

  const commitRename = async () => {
    const trimmedBase = localName.trim();
    if (!trimmedBase || trimmedBase === stripExt(card.name)) {
      setLocalName(stripExt(card.name));
      isRenamingRef.current = false;
      return;
    }

    const extensionStr = cardExtension ? `.${cardExtension}` : '';
    const fullNewName = trimmedBase + extensionStr;

    // Duplicate Name Check on Desk
    const desk = desks[pocketId];
    const items = desk?.feed_state?.items || [];
    const isDuplicate = items.some(item => item.id !== card.id && item.name.toLowerCase() === fullNewName.toLowerCase());
    
    if (isDuplicate) {
      setRenameError({ visible: true, name: fullNewName });
      setLocalName(stripExt(card.name));
      isRenamingRef.current = false;
      return;
    }
    
    // Set ref to prevent the useEffect from reverting the name during the async flow
    isRenamingRef.current = true;
    
    // 1. Immediate local update
    updateFileCard(pocketId, card.id, { name: fullNewName });
    
    // 2. Async persistence
    try {
      await renameNode(card.file_id, 'file', fullNewName);
    } finally {
      isRenamingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      titleInputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setLocalName(stripExt(card.name));
      isRenamingRef.current = false;
      titleInputRef.current?.blur();
    }
  };

  const handleCountChange = (counts: { words: number; tokens: number }) => {
    // Only update if changed to avoid loop
    if (card.word_count !== counts.words || card.token_count !== counts.tokens) {
      updateFileCard(pocketId, card.id, { 
        word_count: counts.words, 
        token_count: counts.tokens 
      });
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragOverlay ? 'none' : transition,
  };

  // Determine if it's a text file
  const extLower = (cardExtension || '').toLowerCase();
  const isText = ['md', 'txt', 'markdown'].includes(extLower) || card.mime_type === 'text/plain' || card.mime_type === 'text/markdown';

  const handleToggleShelf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;

    if (card.is_liked) {
      // If already liked (saved to shelf or library), open the move popup
      setSelectedTargetId(currentLocationId === 'unsave' ? 'shelf' : currentLocationId);
      setIsMovePopupVisible(true);
      return;
    }

    // Default fast-save to shelf if not currently liked
    setIsSaving(true);
    try {
      await moveNode(card.file_id, 'file', null, true, false);
      await updateFileCard(pocketId, card.id, { is_liked: true, content: undefined });
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleExecuteMove = async () => {
    if (isSaving) return;

    // Duplicate detection (not for shelf or unsave)
    if (selectedTargetId !== 'shelf' && selectedTargetId !== 'unsave') {
      const targetFolderId = selectedTargetId as string | null;
      const existing = files.find(f => 
        !f.is_on_shelf && 
        !f.is_on_desk && 
        (f.folder_id || null) === targetFolderId && 
        f.name.toLowerCase() === card.name.toLowerCase() &&
        f.id !== card.file_id
      );

      if (existing) {
        setConflictState({
          visible: true,
          sourceId: card.file_id,
          sourceName: card.name,
          targetId: existing.id,
          targetFolderId: targetFolderId
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      if (selectedTargetId === 'unsave') {
        // Unsave from library/shelf, keep only on desk
        await moveNode(card.file_id, 'file', null, false, true);
        await updateFileCard(pocketId, card.id, { is_liked: false });
      } else if (selectedTargetId === 'shelf') {
        // Move to shelf (and remove from library folders)
        await moveNode(card.file_id, 'file', null, true, false);
        await updateFileCard(pocketId, card.id, { is_liked: true });
      } else {
        // Move to specific library folder (and remove from shelf)
        await moveNode(card.file_id, 'file', selectedTargetId as string | null, false, false);
        await updateFileCard(pocketId, card.id, { is_liked: true });
      }
      
      // Verification: Wait a tick for Zustand to update local state and confirm
      // This helps ensure the UI reflects the change immediately in the sidebars
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsMovePopupVisible(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolveConflict = async (action: 'replace' | 'cancel') => {
    if (action === 'replace' && conflictState.sourceId && conflictState.targetId) {
      setIsSaving(true);
      try {
        // Delete the existing file first
        await deleteNode(conflictState.targetId, 'file');
        // Then execute the move
        await moveNode(conflictState.sourceId, 'file', conflictState.targetFolderId as string | null, false, false);
        await updateFileCard(pocketId, card.id, { is_liked: true });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsMovePopupVisible(false);
      } finally {
        setIsSaving(false);
      }
    }
    setConflictState(prev => ({ ...prev, visible: false }));
  };

  const FileTreeNode = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.id];
    const isSelected = selectedTargetId === node.id;
    const isCurrent = currentLocationId === node.id;
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
              setSelectedTargetId(node.id);
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
            {node.children?.map((child) => <FileTreeNode key={child.id} node={child} level={level + 1} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`desk-file-card-v2 ${isDragging ? 'is-dragging' : ''} ${isDragOverlay ? 'is-drag-overlay' : ''} ${isPlaceholder ? 'is-placeholder' : ''} ${card.is_in_context ? 'in-context' : ''} ${card.is_folded ? 'folded' : ''} ${card.is_hidden ? 'is-hidden' : ''}`}
    >
      <div 
        className="dfc-card-header"
        {...(!isDragOverlay && !isInputFocused ? attributes : {})}
        {...(!isDragOverlay && !isInputFocused ? listeners : {})}
        style={{ cursor: isDragOverlay ? 'grabbing' : (isInputFocused ? 'default' : 'grab') }}
      >
        <div className="dfc-header-left">
          <div 
            className="dfc-icon-btn drag-handle" 
            title="Drag to reorder"
          >
            <DragHandleIcon />
          </div>

          <button 
            className="dfc-icon-btn fold-btn" 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={(e) => { e.stopPropagation(); toggleCard(pocketId, card.id, 'is_folded'); }}
            title={card.is_folded ? "Unfold" : "Fold"}
          >
            {card.is_folded ? <ChevronDown /> : <ChevronUp />}
          </button>
          
          <div 
            className="dfc-title-container" 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dfc-title-wrapper">
              <input 
                ref={titleInputRef}
                className="dfc-title-input" 
                value={localName} 
                onChange={(e) => { isRenamingRef.current = true; setLocalName(e.target.value); }}
                onKeyDown={handleKeyDown}
                onBlur={() => { setIsInputFocused(false); commitRename(); }}
                onFocus={() => setIsInputFocused(true)}
                onClick={(e) => { e.stopPropagation(); titleInputRef.current?.select(); }}
                spellCheck={false}
                size={1}
                readOnly={isDragOverlay}
              />
              <span className="dfc-title-measure">{localName || ' '}</span>
            </div>
            {cardExtension && (
              <span className="dfc-title-extension">.{cardExtension}</span>
            )}
          </div>

          {!isDragOverlay && (
            <div className="dfc-counts" onPointerDown={(e) => e.stopPropagation()}>
              <span className="dfc-count-item">
                <span className="dfc-count-value">{(card.word_count || 0).toLocaleString()}</span>
                <span className="dfc-count-label">words</span>
              </span>
              <span className="dfc-count-divider">·</span>
              <span className="dfc-count-item">
                <span className="dfc-count-value">{(card.token_count || 0).toLocaleString()}</span>
                <span className="dfc-count-label">tokens</span>
              </span>
            </div>
          )}
        </div>
        
        <div className="dfc-header-right">
          <div className="dfc-header-controls">
            <div className="dfc-control-group">
              <button 
                className={`dfc-icon-btn spotify-btn ${card.is_liked ? 'active' : ''}`} 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleToggleShelf}
                title={card.is_liked ? "Saved (Manage...)" : "Save to Shelf"}
                style={{ cursor: isSaving ? 'wait' : (isDragOverlay ? 'default' : 'pointer') }}
                disabled={isSaving || isDragOverlay}
              >
                {card.is_liked ? <CheckIcon /> : <PlusIcon />}
              </button>
            </div>

            <div className="dfc-control-group">
              <button 
                className="dfc-icon-btn" 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); alert('Conversion options...'); }}
                title="Convert"
                disabled={isDragOverlay}
              >
                <ConvertIcon />
              </button>
              <button 
                className={`dfc-icon-btn ${card.is_hidden ? 'muted' : ''}`} 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); toggleCard(pocketId, card.id, 'is_hidden'); }}
                title={card.is_hidden ? "Show" : "Hide"}
                disabled={isDragOverlay}
              >
                {card.is_hidden ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="dfc-control-group">
              <button 
                className="dfc-icon-btn danger" 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); removeFileCard(pocketId, card.id); }}
                title="Remove from desk"
                disabled={isDragOverlay}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {(!card.is_folded && !isDragOverlay) && (
        <div className="dfc-card-content">
          <div className="dfc-viewer-wrapper">
            {isText ? (
              <Editor 
                fileId={card.file_id} 
                title={card.name} 
                pocketId={pocketId}
                cardId={card.id}
                isDeskOnly={card.type === 'file' && !card.is_liked}
                initialContent={card.content}
                onCountChange={handleCountChange}
              />
            ) : (
              <FileViewer 
                fileId={card.file_id} 
                title={card.name} 
                fileExtension={extLower} 
                isEmbedded={true} 
                onCountChange={handleCountChange}
              />
            )}
          </div>
        </div>
      )}

      {isMovePopupVisible && (
        <div className="dfc-move-overlay" onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsMovePopupVisible(false)}>
          <div className="dfc-move-popup" onClick={(e) => e.stopPropagation()}>
            <div className="dfc-move-header">
              <span>Save "{card.name}"</span>
              <button className="dfc-move-close" onClick={() => setIsMovePopupVisible(false)}>✕</button>
            </div>
            
            <div className="dfc-move-list-container" style={{ maxHeight: '400px' }}>
              <CustomScrollbar>
                <div className="vault-tree" style={{ padding: '8px 0' }}>
                  {/* Shelf Toggle Option */}
                  <div 
                    className={`vault-tree-item ${currentLocationId === 'shelf' ? 'disabled' : 'clickable'} ${selectedTargetId === 'shelf' ? 'selected' : ''}`} 
                    onClick={() => currentLocationId !== 'shelf' && setSelectedTargetId('shelf')}
                    style={{ 
                      background: selectedTargetId === 'shelf' ? 'var(--accent-deep-teal-faded)' : 'var(--paper-linen)', 
                      marginBottom: '12px',
                      borderLeft: selectedTargetId === 'shelf' ? '3px solid var(--accent-deep-teal)' : 'none',
                      paddingLeft: '12px',
                      opacity: 1
                    }}
                  >
                    <div className="vault-tree-toggle"><div className="vault-tree-spacer" /></div>
                    <div className="vault-tree-icon" style={{ color: 'var(--accent-deep-teal)' }}><ShelfIcon /></div>
                    <span className="vault-tree-name" style={{ fontWeight: 700, color: 'var(--accent-deep-teal)', fontSize: '0.75rem' }}>
                      {currentLocationId === 'shelf' ? 'Shelf (Current)' : 'Add to Shelf'}
                    </span>
                  </div>

                  <div 
                    className={`vault-tree-item ${currentLocationId === null ? 'disabled' : 'clickable'} ${selectedTargetId === null ? 'selected' : ''}`} 
                    onClick={() => currentLocationId !== null && setSelectedTargetId(null)}
                    style={{ 
                      paddingLeft: '12px',
                      background: selectedTargetId === null ? 'var(--accent-deep-teal-faded)' : 'transparent',
                      borderLeft: selectedTargetId === null ? '3px solid var(--accent-deep-teal)' : 'none'
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
                      root {currentLocationId === null && <span style={{ opacity: 0.5, fontWeight: 400, fontSize: '0.65rem', marginLeft: '4px' }}>(current)</span>}
                    </span>
                  </div>

                  {vaultTree.map((node) => <FileTreeNode key={node.id} node={node} level={0} />)}
                </div>
              </CustomScrollbar>
            </div>

            <div className="dfc-move-actions" style={{ padding: '8px 12px', background: 'var(--paper-linen)' }}>
              <button 
                className="std-button small ghost danger-text" 
                style={{ marginRight: 'auto', color: 'var(--accent-oxblood)', border: 'none', fontWeight: 700 }}
                onClick={() => { setSelectedTargetId('unsave'); handleExecuteMove(); }}
                disabled={isSaving}
              >
                UNSAVE
              </button>
              <button 
                className="std-button small ghost" 
                onClick={() => setIsMovePopupVisible(false)}
              >
                Cancel
              </button>
              <button 
                className="std-button small primary" 
                onClick={handleExecuteMove}
                disabled={isSaving || selectedTargetId === 'unsave' || selectedTargetId === currentLocationId}
              >
                {isSaving ? '...' : 'SAVE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {conflictState.visible && (
        <div className="dfc-move-overlay" style={{ zIndex: 1200 }}>
          <div className="dfc-move-popup conflict">
            <div className="dfc-move-header"><span>Duplicate Found</span></div>
            <div className="vault-conflict-body">
              <p>A file named "<strong>{conflictState.sourceName}</strong>" already exists in the destination.</p>
              <p>Do you want to replace it?</p>
            </div>
            <div className="dfc-move-actions">
              <button className="std-button secondary small" onClick={() => handleResolveConflict('cancel')}>Cancel</button>
              <button className="std-button primary danger small" onClick={() => handleResolveConflict('replace')}>{isSaving ? '...' : 'Replace'}</button>
            </div>
          </div>
        </div>
      )}

      {renameError.visible && (
        <div className="dfc-move-overlay" style={{ zIndex: 1200 }} onClick={() => setRenameError({ visible: false, name: '' })}>
          <div className="dfc-move-popup conflict" onClick={(e) => e.stopPropagation()}>
            <div className="dfc-move-header"><span>Rename Error</span></div>
            <div className="vault-conflict-body">
              <p>A file named "<strong>{renameError.name}</strong>" already exists on this desk.</p>
            </div>
            <div className="dfc-move-actions">
              <button className="std-button primary small" onClick={() => setRenameError({ visible: false, name: '' })}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
