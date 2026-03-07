import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDeskStore } from '@/features/pockets/store/deskStore';
import { useVaultStore } from '@/features/vault/store/vaultStore';
import { usePocketStore } from '@/features/pockets/store/pocketStore';
import { useDockStore } from '@/features/dock/store/dockStore';
import { DeskFileCard } from './components/DeskFileCard';
import { supabase } from '@/lib/supabase';
import { CustomScrollbar } from '@/components/ui/CustomScrollbar';
import { 
  SearchIcon, FolderOpenIcon, ChevronRightIcon, ChevronDownIcon, 
  ShelfIcon, getFileIcon, stripExtension
} from '@/components/sidebar/sidebarmenu/SidebarCommon';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import './DeskViewer.css';

interface DeskViewerProps {
  pocketId: string | undefined;
}

export const DeskViewer: React.FC<DeskViewerProps> = ({ pocketId }) => {
  const { 
    desks, 
    fetchDesk, 
    subscribeToDesk, 
    addFileCard, 
    reorderCards, 
    isLoading,
    isAddPopupVisible,
    setIsAddPopupVisible
  } = useDeskStore();
  const { folders, files, fetchVaultContent, activeVaultId, createFile } = useVaultStore();
  const { pockets, fetchPockets } = usePocketStore();
  const { tabs: dockTabs, activeTabIndex: activeDockTabIndex, updateTabContent } = useDockStore();
  
  const [activeTab, setActiveTab] = useState<'shelf' | 'library'>('shelf');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'root': true });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNativeDragging, setIsNativeDragging] = useState(false);
  const [nativeDragOverIndex, setNativeDragOverIndex] = useState<number | null>(null);
  const [nativeDragOverName, setNativeDragOverName] = useState<string>('');
  const [duplicateError, setDuplicateError] = useState<{ visible: boolean, name: string }>({ visible: false, name: '' });

  const lastDragOverTime = useRef<number>(0);

  // Debug: Global listener to see if drop events are firing at all
  useEffect(() => {
    const handleGlobalDrop = (e: DragEvent) => {
      console.log('[DeskViewer] Global drop detected on target:', e.target);
      // If our component missed it but it was a nodeId drag, we can handle it here as a fallback
      const nodeId = e.dataTransfer?.getData('nodeId') || e.dataTransfer?.getData('text/plain');
      if (nodeId && isNativeDragging) {
        console.log('[DeskViewer] Fallback drop handling for nodeId:', nodeId);
      }
    };
    const handleGlobalDragOver = (e: DragEvent) => {
      // If we are in native dragging mode, we MUST prevent default on window to allow drop anywhere if needed,
      // but usually just preventing on the target is enough.
    };
    window.addEventListener('drop', handleGlobalDrop);
    window.addEventListener('dragover', handleGlobalDragOver);
    return () => {
      window.removeEventListener('drop', handleGlobalDrop);
      window.removeEventListener('dragover', handleGlobalDragOver);
    };
  }, [isNativeDragging]);

  useEffect(() => {
    if (pocketId) {
      fetchDesk(pocketId);
      return subscribeToDesk(pocketId);
    }
  }, [pocketId, fetchDesk, subscribeToDesk]);

  useEffect(() => {
    if (isAddPopupVisible) {
      fetchPockets();
      if (activeVaultId) {
        fetchVaultContent(activeVaultId);
      }
    }
  }, [isAddPopupVisible, fetchPockets, fetchVaultContent, activeVaultId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (pocketId && over && active.id !== over.id) {
      reorderCards(pocketId, active.id as string, over.id as string);
    }
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleAddFile = async (fileId: string, name: string, type: 'file' | 'link', mime_type?: string, size?: number) => {
    if (pocketId) {
      await addFileCard(pocketId, fileId, name, type, mime_type, size);
      setIsAddPopupVisible(false);
    }
  };

  const handleNativeDragOver = (e: React.DragEvent) => {
    // CRITICAL: e.preventDefault() must be called to allow drop
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    if (now - lastDragOverTime.current > 2000) {
      console.log('[DeskViewer] Native drag over - dropping is enabled');
      lastDragOverTime.current = now;
    }

    const isPocket = e.dataTransfer.types.includes('application/x-pocket');
    if (isPocket) {
      e.dataTransfer.dropEffect = 'none';
      if (nativeDragOverIndex !== null) setNativeDragOverIndex(null);
      return;
    }

    // Set drop effect to match sidebar's effectAllowed
    e.dataTransfer.dropEffect = 'move';

    // Calculate insertion index
    const deskList = document.querySelector('.desk-list');
    if (!deskList) return;

    const cards = Array.from(deskList.querySelectorAll('.desk-file-card-v2:not(.is-placeholder)'));
    let foundIndex = cards.length;

    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== nativeDragOverIndex) {
      setNativeDragOverIndex(foundIndex);
    }
  };

  const handleNativeDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[DeskViewer] Native drag enter');
    
    const isPocket = e.dataTransfer.types.includes('application/x-pocket');
    const isDockContent = e.dataTransfer.types.includes('dock-content');
    if (!isPocket) {
      setIsNativeDragging(true);
    }
  };

  const handleNativeDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we are really leaving the element (and not just entering a child)
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      console.log('[DeskViewer] Native drag leave');
      setIsNativeDragging(false);
      setNativeDragOverIndex(null);
    }
  };

  const handleNativeDrop = async (e: React.DragEvent) => {
    console.log('[DeskViewer] ON DROP EVENT FIRED');
    e.preventDefault();
    e.stopPropagation();
    
    const nodeId = e.dataTransfer.getData('nodeId') || e.dataTransfer.getData('text/plain');
    const nodeType = e.dataTransfer.getData('nodeType');
    const finalIndex = nativeDragOverIndex ?? undefined;

    console.log(`[DeskViewer] Drop data: nodeId=${nodeId}, nodeType=${nodeType}, index=${finalIndex}`);

    setIsNativeDragging(false);
    setNativeDragOverIndex(null);
    
    if (nodeType === 'dock-content' && pocketId) {
      const activeTab = dockTabs[activeDockTabIndex];
      if (!activeTab || !activeTab.content.trim()) return;

      const fileName = `Note ${new Date().toLocaleTimeString()}.md`;
      const file = await createFile(fileName, undefined, false, true);
      
      if (file) {
        await supabase.storage
          .from('vaults')
          .upload(file.storage_path, activeTab.content, {
            contentType: 'text/markdown',
            upsert: true
          });
        
        await addFileCard(
          pocketId, 
          file.id, 
          file.name, 
          'file', 
          'text/markdown', 
          new Blob([activeTab.content]).size, 
          activeTab.content,
          finalIndex
        );

        // Clear dock tab
        await updateTabContent(activeTab.id, '');
      }
      return;
    }

    if (nodeId && pocketId && nodeType !== 'pocket') {
      const desk = desks[pocketId];
      const items = desk?.feed_state?.items || [];
      
      const file = files.find(f => f.id === nodeId);
      if (!file) {
        console.error('[DeskViewer] File not found in vault state for id:', nodeId);
        return;
      }

      // Duplicate Check (Both ID and Name)
      const isDuplicateId = items.some(item => item.file_id === nodeId);
      const isDuplicateName = items.some(item => item.name.toLowerCase() === file.name.toLowerCase());

      if (isDuplicateId || isDuplicateName) {
        console.log(`[DeskViewer] Duplicate detected for file: ${file.name}`);
        setDuplicateError({ visible: true, name: file.name });
        return;
      }

      console.log(`[DeskViewer] Successfully dropping file: ${file.name}`);
      await addFileCard(pocketId, file.id, file.name, 'file', file.mime_type, file.size, undefined, finalIndex);
    } else {
      console.warn('[DeskViewer] Drop rejected or data missing:', { nodeId, pocketId, nodeType });
    }
  };

  const shelfItems = useMemo(() => {
    const shelfFiles = files.filter(f => f.is_on_shelf).map(f => ({
      id: f.id,
      name: f.name,
      type: 'file' as const,
      mime_type: f.mime_type,
      size: f.size,
      updated_at: f.updated_at
    }));

    const shelfPockets = pockets.filter(p => p.is_on_shelf).map(p => ({
      id: p.id,
      name: p.name + '.pocket',
      type: 'link' as const, // Treat pockets as links on the desk
      mime_type: 'application/x-pocket',
      updated_at: p.updated_at
    }));

    let combined = [...shelfFiles, ...shelfPockets];
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      combined = combined.filter(item => item.name.toLowerCase().includes(lowSearch));
    }
    return combined.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [files, pockets, searchTerm]);

  const vaultTree = useMemo(() => {
    const buildTree = (parentId: string | null = null): any[] => {
      const currentFolders = folders
        .filter((f) => (f.parent_id || null) === parentId)
        .map((f) => ({
          id: f.id, name: f.name, type: 'folder' as const, children: buildTree(f.id),
        }));
      const currentFiles = files
        .filter((f) => (f.folder_id || null) === parentId && !f.is_on_shelf && !f.is_on_desk)
        .map((f) => ({
          id: f.id, name: f.name, 
          type: f.name.toLowerCase().endsWith('.pocket') ? 'link' as const : 'file' as const, 
          mime_type: f.mime_type, size: f.size
        }));
      
      let combined = [...currentFolders, ...currentFiles];
      if (searchTerm && parentId === null) {
        // Simple flat search for library if searching
        const searchResults = files
          .filter(f => !f.is_on_shelf && !f.is_on_desk && f.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(f => ({
            id: f.id, name: f.name, type: 'file' as const, mime_type: f.mime_type, size: f.size
          }));
        return searchResults;
      }
      
      return combined;
    };
    return buildTree(null);
  }, [folders, files, searchTerm]);

  const desk = pocketId ? desks[pocketId] : null;
  const items = desk?.feed_state?.items || [];
  const activeCard = useMemo(() => items.find(item => item.id === activeId), [items, activeId]);

  const displayItems = useMemo(() => {
    if (!isNativeDragging || nativeDragOverIndex === null) return items;
    
    const newItems = [...items];
    newItems.splice(nativeDragOverIndex, 0, {
      id: 'native-placeholder',
      file_id: 'placeholder',
      name: nativeDragOverName || 'Adding file...',
      type: 'file',
      is_folded: true
    } as any);
    return newItems;
  }, [items, isNativeDragging, nativeDragOverIndex, nativeDragOverName]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const FileTreeNode = ({ node, level = 0 }: { node: any; level?: number }) => {
    const isFolder = node.type === 'folder';
    const isPocket = node.type === 'link';
    const isExpanded = expandedFolders[node.id];
    const { icon, colorClass } = isFolder ? { icon: <FolderOpenIcon />, colorClass: '' } : getFileIcon(node.name);
    
    return (
      <div key={node.id}>
        <div 
          className={`vault-tree-item ${isFolder ? 'clickable' : (isPocket ? 'disabled' : 'clickable')} ${colorClass}`} 
          style={{ paddingLeft: `${level * 12}px` }}
          onClick={() => isFolder ? toggleFolder(node.id) : (!isPocket && handleAddFile(node.id, node.name, node.type, node.mime_type, node.size))}
        >
          <div className="vault-tree-toggle">
            {isFolder ? (isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />) : <div className="vault-tree-spacer" />}
          </div>
          <div className="vault-tree-icon">{icon}</div>
          <span className="vault-tree-name">{isFolder ? node.name : stripExtension(node.name)}</span>
        </div>
        {isFolder && isExpanded && (
          <div className="vault-tree-children">
            {node.children?.map((child: any) => <FileTreeNode key={child.id} node={child} level={level + 1} />)}
          </div>
        )}
      </div>
    );
  };

  if (!pocketId) return <div className="viewer-fallback">No pocket selected</div>;
  if (isLoading && !desk) return <div className="viewer-loading">Loading desk...</div>;

  return (
    <div 
      className={`desk-workspace ${isNativeDragging ? 'native-drag-active' : ''}`}
      onDragOver={handleNativeDragOver}
      onDragEnter={handleNativeDragEnter}
      onDragLeave={handleNativeDragLeave}
      onDrop={handleNativeDrop}
    >
      <div className="desk-content">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="desk-list">
            <SortableContext 
              items={displayItems.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {displayItems.map((card) => (
                <DeskFileCard 
                  key={card.id} 
                  card={card} 
                  pocketId={pocketId}
                  isPlaceholder={card.id === 'native-placeholder'}
                />
              ))}
            </SortableContext>
            
            {displayItems.length === 0 && (
              <div className="desk-empty-state">
                <div className="empty-icon" style={{ fontSize: '2rem' }}>🗃️</div>
                <p>This desk is empty.<br/>Upload a file or link one from your vault.</p>
              </div>
            )}
          </div>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: '0.4',
                  },
                },
              }),
            }}
          >
            {activeId && activeCard ? (
              <DeskFileCard 
                card={activeCard} 
                pocketId={pocketId!} 
                isDragOverlay 
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {isAddPopupVisible && (
        <div className="dfc-move-overlay" onClick={() => setIsAddPopupVisible(false)}>
          <div className="dfc-move-popup" onClick={(e) => e.stopPropagation()}>
            <div className="dfc-move-header">
              <span>Add to Desk</span>
              <button className="dfc-move-close" onClick={() => setIsAddPopupVisible(false)}>✕</button>
            </div>

            <div className="desk-popup-tabs">
              <button 
                className={`desk-popup-tab ${activeTab === 'shelf' ? 'active' : ''}`}
                onClick={() => { setActiveTab('shelf'); setSearchTerm(''); }}
              >
                <ShelfIcon />
                <span>Shelf</span>
              </button>
              <button 
                className={`desk-popup-tab ${activeTab === 'library' ? 'active' : ''}`}
                onClick={() => { setActiveTab('library'); setSearchTerm(''); }}
              >
                <FolderOpenIcon />
                <span>Library</span>
              </button>
            </div>

            <div className="dfc-move-search">
              <div className="dfc-search-wrapper">
                <SearchIcon />
                <input 
                  type="text" 
                  className="dfc-search-input" 
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="dfc-move-list-container">
              <CustomScrollbar>
                <div className="vault-tree" style={{ padding: '8px 0' }}>
                  {activeTab === 'shelf' ? (
                    shelfItems.length > 0 ? (
                      shelfItems.map(item => {
                        const { icon, colorClass } = getFileIcon(item.name);
                        const isPocket = item.type === 'link';
                        return (
                          <div 
                            key={item.id} 
                            className={`vault-tree-item ${isPocket ? 'disabled' : 'clickable'} ${colorClass}`}
                            onClick={() => !isPocket && handleAddFile(item.id, item.name, item.type, item.mime_type, item.size)}
                          >
                            <div className="vault-tree-toggle"><div className="vault-tree-spacer" /></div>
                            <div className="vault-tree-icon">{icon}</div>
                            <span className="vault-tree-name">{stripExtension(item.name)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="vault-loading" style={{ opacity: 0.5 }}>Shelf is empty</div>
                    )
                  ) : (
                    vaultTree.length > 0 ? (
                      vaultTree.map((node) => <FileTreeNode key={node.id} node={node} />)
                    ) : (
                      <div className="vault-loading" style={{ opacity: 0.5 }}>Library is empty</div>
                    )
                  )}
                </div>
              </CustomScrollbar>
            </div>

            <div className="dfc-move-actions">
              <button 
                className="std-button small ghost"
                onClick={() => setIsAddPopupVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {duplicateError.visible && (
        <div className="dfc-move-overlay" onClick={() => setDuplicateError({ visible: false, name: '' })}>
          <div className="dfc-move-popup conflict" onClick={(e) => e.stopPropagation()}>
            <div className="dfc-move-header">
              <span>Duplicate File</span>
              <button className="dfc-move-close" onClick={() => setDuplicateError({ visible: false, name: '' })}>✕</button>
            </div>
            <div className="vault-conflict-body">
              <p>The file "<strong>{duplicateError.name}</strong>" is already on the desk.</p>
            </div>
            <div className="dfc-move-actions">
              <button 
                className="std-button small primary"
                onClick={() => setDuplicateError({ visible: false, name: '' })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};