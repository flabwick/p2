import React, { useState } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import './PocketSidebar.css';

// Icons from version 1 sidebar
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export function PocketSidebar() {
  const [activePocketTab, setActivePocketTab] = useState('recents');

  return (
    <div className="pocket-sidebar">
      <CustomScrollbar className="sidebar-content">
        <div className="sidebar-section">
          {/* Create New Pocket */}
          <button 
            className="pocket-create-btn"
            onClick={() => console.log('Create new pocket')}
            title="Create new pocket"
          >
            <PlusIcon />
            <span>New Pocket</span>
          </button>

          {/* Pocket Sub-Tabs */}
          <div className="pocket-subtabs">
            <button
              className={`pocket-subtab ${activePocketTab === 'recents' ? 'active' : ''}`}
              onClick={() => setActivePocketTab('recents')}
            >
              Recents
            </button>
            <button
              className={`pocket-subtab ${activePocketTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActivePocketTab('inbox')}
            >
              Inbox
              <span className="pocket-subtab-badge">2</span>
            </button>
            <button
              className={`pocket-subtab ${activePocketTab === 'folders' ? 'active' : ''}`}
              onClick={() => setActivePocketTab('folders')}
            >
              Folders
            </button>
          </div>

          {/* Recents Tab Content */}
          {activePocketTab === 'recents' && (
            <div className="pocket-subtab-content">
              <div className="pocket-list">
                <div className="pocket-item">
                  <div className="pocket-item-header">
                    <span className="pocket-item-name">Main Context</span>
                    <span className="pocket-item-count">3</span>
                  </div>
                  <span className="pocket-item-date">2h ago</span>
                </div>
                <div className="pocket-item">
                  <div className="pocket-item-header">
                    <span className="pocket-item-name">Design Review</span>
                    <span className="pocket-item-count">5</span>
                  </div>
                  <span className="pocket-item-date">1d ago</span>
                </div>
                <div className="pocket-item">
                  <div className="pocket-item-header">
                    <span className="pocket-item-name">Research Notes</span>
                    <span className="pocket-item-count">12</span>
                  </div>
                  <span className="pocket-item-date">3d ago</span>
                </div>
                <div className="pocket-item">
                  <div className="pocket-item-header">
                    <span className="pocket-item-name">Archive 2025</span>
                    <span className="pocket-item-count">8</span>
                  </div>
                  <span className="pocket-item-date">10d ago</span>
                </div>
                <div className="pocket-item">
                  <div className="pocket-item-header">
                    <span className="pocket-item-name">Quick Notes</span>
                    <span className="pocket-item-count">2</span>
                  </div>
                  <span className="pocket-item-date">1w ago</span>
                </div>
              </div>
            </div>
          )}

          {/* Inbox Tab Content */}
          {activePocketTab === 'inbox' && (
            <div className="pocket-subtab-content">
              <div className="pocket-list">
                <div className="pocket-item inbox-item">
                  <div className="pocket-item-header">
                    <span className="pocket-item-name">Daily News Brief</span>
                  </div>
                  <span className="pocket-item-date">today</span>
                </div>
                <div className="pocket-item inbox-item">
                  <div className="pocket-item-header">
                    <span className="pocket-item-name">Weekly Summary</span>
                  </div>
                  <span className="pocket-item-date">2d ago</span>
                </div>
                <div className="pocket-item inbox-item">
                  <div className="pocket-item-header">
                    <span className="pocket-item-name">Generated Digest</span>
                  </div>
                  <span className="pocket-item-date">5d ago</span>
                </div>
              </div>
            </div>
          )}

          {/* Folders Tab Content */}
          {activePocketTab === 'folders' && (
            <div className="pocket-subtab-content">
              <div className="pocket-folders-header">
                <h4 className="pocket-subsection-title">Folders</h4>
                <button 
                  className="pocket-add-folder-icon"
                  onClick={() => console.log('Add folder')}
                  title="Add new folder"
                >
                  <PlusIcon />
                </button>
              </div>
              <div className="pocket-list">
                <div className="pocket-folder">
                  <div className="pocket-folder-header">
                    <span className="pocket-folder-name">Work Projects</span>
                    <span className="pocket-folder-count">4</span>
                  </div>
                </div>
                <div className="pocket-folder">
                  <div className="pocket-folder-header">
                    <span className="pocket-folder-name">Personal</span>
                    <span className="pocket-folder-count">2</span>
                  </div>
                </div>
                <div className="pocket-folder">
                  <div className="pocket-folder-header">
                    <span className="pocket-folder-name">Archives</span>
                    <span className="pocket-folder-count">8</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CustomScrollbar>
    </div>
  );
}
