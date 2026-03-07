import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import { SearchIcon, FilterIcon, SelectorIcon, getFileIcon, stripExtension } from './SidebarCommon';
import { useVaultStore } from '@/features/vault/store/vaultStore';
import { usePocketStore } from '@/features/pockets/store/pocketStore';
import { useShallow } from 'zustand/shallow';
import './SidebarCommon.css';
import './SidebarContent.css';

interface InboxSidebarProps {
  onOpenFile: (fileId: string, title: string, forceNewTab?: boolean) => void;
}

export function InboxSidebar({ onOpenFile }: InboxSidebarProps) {
  const [isVaultSelectorOpen, setIsVaultSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectorRef = useRef<HTMLDivElement>(null);

  const { activeVaultId, vaults, setActiveVaultId } = useVaultStore(useShallow(state => ({
    activeVaultId: state.activeVaultId,
    vaults: state.vaults,
    setActiveVaultId: state.setActiveVaultId
  })));

  const { pockets, fetchPockets, isLoading } = usePocketStore();

  useEffect(() => {
    fetchPockets();
  }, [fetchPockets]);

  const inboxItems = useMemo(() => {
    let filtered = pockets.filter(p => p.is_inbox);
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(lowSearch));
    }
    return filtered.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [pockets, searchTerm]);

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

  return (
    <div className="vault-sidebar inbox-sidebar">
      <div className="vault-sidebar-top">
        <div className="vault-search-container">
          <div className="vault-search-input-wrapper">
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search inbox..." 
              className="vault-search-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="vault-filter-btn" disabled>
            <FilterIcon />
          </button>
        </div>
      </div>

      <div className="pocket-tab-flex-layout">
        <CustomScrollbar className="pocket-content-scroll">
          <div className="pocket-list-skinnier">
            {inboxItems.map(item => {
              const { icon, colorClass } = getFileIcon(`${item.name}.pocket`);
              return (
                <div 
                  key={item.id} 
                  className={`pocket-mini-item ${colorClass}`}
                  onClick={() => onOpenFile(item.id, `${item.name}.pocket`)}
                >
                  <div className="pocket-mini-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    {icon}
                  </div>
                  <div className="pocket-mini-name" title={item.name}>{item.name}</div>
                  <div className="pocket-mini-meta">
                    <span className="pocket-mini-date">
                      {new Date(item.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
            {!isLoading && inboxItems.length === 0 && (
              <div className="vault-loading" style={{ opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>
                Inbox is empty
              </div>
            )}
            {isLoading && <div className="vault-loading">Loading...</div>}
          </div>
        </CustomScrollbar>
      </div>

      <div className="vault-sidebar-bottom" ref={selectorRef}>
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

