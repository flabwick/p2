import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import { SearchIcon, FilterIcon, NewFileIcon, NewPocketIcon, UploadIcon, SortIcon, SelectorIcon, MarkdownIcon } from './SidebarCommon';
import { useVaultStore } from '@/features/vault/store/vaultStore';
import { useShallow } from 'zustand/shallow';
import './SidebarCommon.css';
import './SidebarContent.css';

interface ShelfSidebarProps {
  onOpenFile: (fileId: string, title: string, forceNewTab?: boolean) => void;
}

export function ShelfSidebar({ onOpenFile }: ShelfSidebarProps) {
  const [isVaultSelectorOpen, setIsVaultSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeVaultId, vaults, setActiveVaultId, createFile, uploadFile } = useVaultStore(useShallow(state => ({
    activeVaultId: state.activeVaultId,
    vaults: state.vaults,
    setActiveVaultId: state.setActiveVaultId,
    createFile: state.createFile,
    uploadFile: state.uploadFile
  })));

  const selectedVault = useMemo(() => 
    vaults.find(v => v.id === activeVaultId)?.name || 'Select Vault',
    [vaults, activeVaultId]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsVaultSelectorOpen(false);
      }
    };
    if (isVaultSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVaultSelectorOpen]);

  const handleCreateFile = async () => {
    // For now, simplified creation or triggering a global state
    // In VaultSidebar it sets isCreating
    // Let's just use the store directly if we want, but VaultSidebar had specific inline input logic.
    // For Shelf, maybe we just want to trigger the same logic?
    // The prompt says "Refactor so the vault sidebar isn't the core component anymore."
    // I'll keep it simple for Shelf/Inbox for now as they seem to have placeholder content in the original.
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i]);
    }
    e.target.value = '';
  };

  return (
    <div className="vault-sidebar shelf-sidebar">
      <div className="vault-sidebar-top">
        <div className="vault-search-container">
          <div className="vault-search-input-wrapper">
            <SearchIcon />
            <input type="text" placeholder="Search..." className="vault-search-input" />
          </div>
          <button className="vault-filter-btn" disabled>
            <FilterIcon />
          </button>
        </div>
      </div>

      <div className="pocket-tab-flex-layout">
        <CustomScrollbar className="pocket-content-scroll">
          <div className="pocket-list-skinnier">
            {[
              { id: 'p1', name: 'Main Context', lastEdited: '2h ago', itemCount: 3 },
              { id: 'p2', name: 'Design Review', lastEdited: '1d ago', itemCount: 5 },
              { id: 'p3', name: 'Research Notes', lastEdited: '3d ago', itemCount: 12 },
            ].map(p => (
              <div key={p.id} className="pocket-mini-item">
                <div className="pocket-mini-name" title={p.name}>{p.name}</div>
                <div className="pocket-mini-meta">
                  <span className="pocket-mini-date">{p.lastEdited}</span>
                </div>
              </div>
            ))}
          </div>
        </CustomScrollbar>
      </div>

      <div className="vault-sidebar-bottom" ref={selectorRef}>
        <div className="vault-action-bar">
          <button className="std-button small square" title="New Markdown" onClick={() => {}}>
            <MarkdownIcon />
          </button>
          <button className="std-button small square" title="New File" onClick={() => {}}>
            <NewFileIcon />
          </button>
          <button className="std-button small square" title="Add Pocket" onClick={() => {}}>
            <NewPocketIcon />
          </button>
          <button className="std-button small square" title="Upload" onClick={handleUploadClick}>
            <UploadIcon />
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} multiple />
          <button className="std-button small square" disabled title="Sort">
            <SortIcon />
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
            <button className="vault-selector-item disabled" disabled>Manage Vaults</button>
          </div>
        )}
      </div>
    </div>
  );
}
