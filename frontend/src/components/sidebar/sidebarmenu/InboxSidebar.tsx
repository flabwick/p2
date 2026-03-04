import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import { SearchIcon, FilterIcon, SelectorIcon } from './SidebarCommon';
import { useVaultStore } from '@/features/vault/store/vaultStore';
import { useShallow } from 'zustand/shallow';
import './SidebarCommon.css';
import './SidebarContent.css';

interface InboxSidebarProps {
  onOpenFile: (fileId: string, title: string, forceNewTab?: boolean) => void;
}

export function InboxSidebar({ onOpenFile }: InboxSidebarProps) {
  const [isVaultSelectorOpen, setIsVaultSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const { activeVaultId, vaults, setActiveVaultId } = useVaultStore(useShallow(state => ({
    activeVaultId: state.activeVaultId,
    vaults: state.vaults,
    setActiveVaultId: state.setActiveVaultId
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

  return (
    <div className="vault-sidebar inbox-sidebar">
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
              { id: 'i1', name: 'Daily News Brief', lastEdited: 'today', itemCount: 1 },
              { id: 'i2', name: 'Weekly Summary', lastEdited: '2d ago', itemCount: 1 },
            ].map(item => (
              <div key={item.id} className="pocket-mini-item">
                <div className="pocket-mini-name" title={item.name}>{item.name}</div>
                <div className="pocket-mini-meta">
                  <span className="pocket-mini-date">{item.lastEdited}</span>
                </div>
              </div>
            ))}
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
