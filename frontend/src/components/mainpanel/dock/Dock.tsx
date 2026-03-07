import { useState, useRef, useEffect, useMemo } from 'react'
import { useDockStore } from '@/features/dock/store/dockStore'
import { useDeskStore } from '@/features/pockets/store/deskStore'
import { useVaultStore } from '@/features/vault/store/vaultStore'
import { DockEditor } from '@/features/dock/components/DockEditor'
import { supabase } from '@/lib/supabase'
import './Dock.css'

export type MainPanelView = 'pocket' | 'file' | 'role'
export type PocketSubView = 'desk' | 'feed' | 'log'

interface DockProps {
  activeView: MainPanelView
  pocketView: PocketSubView
  onPocketViewChange: (view: PocketSubView) => void
  pocketId?: string
}

const RefreshIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.0" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
)

const UndoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
)

const RedoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
  </svg>
)

const SkipBackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </svg>
)

const SkipForwardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const MicrophoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
)

const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
)

const ExportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const ConvertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

const PaperclipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
)

const EnterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
)

const CloseIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation = ({ onConfirm, onCancel }: DeleteConfirmationProps) => (
  <div className="dock-delete-confirm">
    <span className="confirm-text">Lose content?</span>
    <div className="confirm-actions">
      <button className="confirm-btn yes" onClick={onConfirm}>Yes</button>
      <button className="confirm-btn no" onClick={onCancel}>No</button>
    </div>
  </div>
);

export function Dock({ activeView, pocketView, onPocketViewChange, pocketId }: DockProps) {
  const { 
    tabs, 
    activeTabIndex, 
    fetchTabs, 
    addTab, 
    deleteTabById, 
    setActiveTabIndex,
    isInitialLoad
  } = useDockStore();

  const { addFileCard, setIsAddPopupVisible, desks } = useDeskStore();
  const { createFile, uploadFile } = useVaultStore();

  const desk = pocketId ? desks[pocketId] : null;
  const deskItems = desk?.feed_state?.items || [];
  
  const totalCounts = useMemo(() => {
    return deskItems
      .filter(item => !item.is_hidden)
      .reduce((acc, item) => ({
        words: acc.words + (item.word_count || 0),
        tokens: acc.tokens + (item.token_count || 0)
      }), { words: 0, tokens: 0 });
  }, [deskItems]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scrollState, setScrollState] = useState({ left: false, right: false });
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  // Keep track of which subview to render in the collapsible part to avoid jumps during animation
  const [renderedPocketView, setRenderedPocketView] = useState(pocketView);
  const showPanelPart = activeView === 'pocket' && (pocketView === 'feed' || pocketView === 'desk');

  useEffect(() => {
    // Only update the rendered content if we are expanded or becoming expanded
    if (showPanelPart) {
      setRenderedPocketView(pocketView);
    }
    // When showPanelPart becomes false, we DON'T update renderedPocketView immediately,
    // so the old content stays there while the grid-row animates to 0.
  }, [pocketView, showPanelPart]);

  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setScrollState({
        left: scrollLeft > 2,
        right: scrollLeft < scrollWidth - clientWidth - 2
      });
    }
  };

  useEffect(() => {
    fetchTabs();
  }, [fetchTabs]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      updateScrollState();
      el.addEventListener('scroll', updateScrollState);
      window.addEventListener('resize', updateScrollState);
      return () => {
        el.removeEventListener('scroll', updateScrollState);
        window.removeEventListener('resize', updateScrollState);
      };
    }
  }, [tabs]);

  const getMaskImage = () => {
    const { left, right } = scrollState;
    if (!left && !right) return 'none';
    const leftFade = left ? 'transparent, black 20px' : 'black 0px';
    const rightFade = right ? 'black calc(100% - 20px), transparent' : 'black 100%';
    return `linear-gradient(to right, ${leftFade}, ${rightFade})`;
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string, hasContent: boolean) => {
    e.stopPropagation();
    if (hasContent) {
      setConfirmingDelete(tabId);
    } else {
      deleteTabById(tabId);
    }
  };

  const confirmDelete = () => {
    if (confirmingDelete) {
      deleteTabById(confirmingDelete);
      setConfirmingDelete(null);
    }
  };

  const handleCreateMd = async () => {
    if (!pocketId) return;
    try {
      const fileName = 'New Document.md';
      // createFile(name, folderId, isOnShelf, isOnDesk)
      const file = await createFile(fileName, undefined, false, true);
      if (file) {
        // Initialize storage object immediately so Editor doesn't 404
        const defaultContent = '';
        const initialSize = 0;
        
        await supabase.storage
          .from('vaults')
          .upload(file.storage_path, defaultContent, {
            contentType: 'text/markdown',
            upsert: true
          });

        await addFileCard(pocketId, file.id, file.name, 'file', 'text/markdown', initialSize, defaultContent);
      }
    } catch (err) {
      console.error('Create MD failed:', err);
    }
  };

  const handleCreateFile = async () => {
    if (!pocketId) return;
    try {
      const fileName = 'New File';
      const file = await createFile(fileName, undefined, false, true);
      if (file) {
        const defaultContent = '';
        // Initialize storage object immediately
        await supabase.storage
          .from('vaults')
          .upload(file.storage_path, defaultContent, {
            contentType: 'application/octet-stream',
            upsert: true
          });

        await addFileCard(pocketId, file.id, file.name, 'file', 'application/octet-stream', 0, defaultContent);
      }
    } catch (err) {
      console.error('Create file failed:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pocketId) {
      try {
        const uploadedFile = await uploadFile(file, undefined, false, true);
        if (uploadedFile) {
          await addFileCard(
            pocketId, 
            uploadedFile.id, 
            uploadedFile.name, 
            'file', 
            uploadedFile.mime_type, 
            uploadedFile.size
          );
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isInitialLoad) {
    return null; // Or a skeleton loader
  }

  return (
    <footer className="main-panel-dock">
      <div className="dock-stack">
        {/* Top: Live Dock (Always Visible) */}
        <div className="dock-live-part">
          <div className="live-dock-container">
            <div className="live-editor-wrapper">
              <DockEditor />
              <button className="std-button ghost square small enter-btn" aria-label="Enter">
                <EnterIcon />
              </button>
            </div>

            <div className="live-dock-footer">
              <div className="live-dock-tabs">
                <div 
                  ref={scrollRef}
                  className="tab-list"
                  style={{ 
                    maskImage: getMaskImage(),
                    WebkitMaskImage: getMaskImage()
                  }}
                >
                  {tabs.map((tab, index) => {
                    const id = index + 1;
                    const hasContent = tab.content.trim().length > 0;
                    const isConfirming = confirmingDelete === tab.id;

                    return (
                      <div key={tab.id} className="dock-tab-wrapper">
                        <button 
                          className={`std-button square small tab-btn ${activeTabIndex === index ? 'active' : ''}`}
                          onClick={() => setActiveTabIndex(index)}
                        >
                          {id}
                          {tabs.length > 1 && (
                            <div 
                              className="dock-tab-close" 
                              onClick={(e) => handleCloseTab(e, tab.id, hasContent)}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <CloseIcon />
                            </div>
                          )}
                        </button>
                        {isConfirming && (
                          <DeleteConfirmation 
                            onConfirm={confirmDelete}
                            onCancel={() => setConfirmingDelete(null)}
                          />
                        )}
                      </div>
                    );
                  })}
                  <button 
                    className="std-button ghost square small add-tab-btn" 
                    aria-label="Add Tab"
                    onClick={addTab}
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>

              <div className="live-dock-actions-right">
                <button className="std-button ghost square small" aria-label="Attach" disabled>
                  <PaperclipIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Microphone" disabled>
                  <MicrophoneIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Clipboard" disabled>
                  <ClipboardIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Export" disabled>
                  <ExportIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Convert" disabled>
                  <ConvertIcon />
                </button>
                <button className="std-button ghost square small" aria-label="Expand" disabled>
                  <ChevronUpIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Panel-dependent controls (Collapsible) */}
        <div className={`dock-collapsible-section ${showPanelPart ? 'is-expanded' : ''}`}>
          <div className="dock-collapsible-content">
            <div className="dock-divider" />
            <div className="dock-panel-part">
              {renderedPocketView === 'feed' && (
                <div className="dock-panel-controls feed-controls">
                  <button className="std-button ghost square small" aria-label="Skip Back">
                    <SkipBackIcon />
                  </button>
                  <button className="std-button ghost square small" aria-label="Undo">
                    <UndoIcon />
                  </button>
                  
                  <button className="std-button primary square refresh-button" aria-label="Refresh Feed">
                    <RefreshIcon />
                  </button>
                  
                  <button className="std-button ghost square small" aria-label="Redo">
                    <RedoIcon />
                  </button>
                  <button className="std-button ghost square small" aria-label="Skip Forward">
                    <SkipForwardIcon />
                  </button>
                </div>
              )}

              {renderedPocketView === 'desk' && (
                <div className="dock-panel-controls desk-controls">
                  <div className="dock-total-counts">
                    <div className="total-count-item">
                      <span className="total-count-value">{totalCounts.words.toLocaleString()}</span>
                      <span className="total-count-label">words</span>
                    </div>
                    <div className="total-count-divider" />
                    <div className="total-count-item">
                      <span className="total-count-value">{totalCounts.tokens.toLocaleString()}</span>
                      <span className="total-count-label">tokens</span>
                    </div>
                  </div>
                  
                  <div className="dock-divider-vertical" />
                  
                  <button 
                    className="std-button ghost square small" 
                    aria-label="Create MD"
                    onClick={handleCreateMd}
                    title="Create Markdown Document"
                  >
                    <FileTextIcon />
                  </button>
                  <button 
                    className="std-button ghost square small" 
                    aria-label="Create File"
                    onClick={handleCreateFile}
                    title="Create Empty File"
                  >
                    <PlusIcon />
                  </button>
                  
                  <div className="dock-divider-vertical" />
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    style={{ display: 'none' }} 
                  />
                  <button 
                    className="std-button ghost square small" 
                    aria-label="Upload"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload File"
                  >
                    <UploadIcon />
                  </button>
                  <button 
                    className="std-button ghost square small" 
                    aria-label="Add from Vault"
                    onClick={() => setIsAddPopupVisible(true)}
                    title="Add from Vault"
                  >
                    <SearchIcon />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

