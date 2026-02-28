import React from 'react';
import './ToggleMenu.css';

export type MenuState = 'pocket' | 'vault' | 'role' | 'more';

interface ToggleMenuProps {
  onMenuChange: (state: MenuState) => void;
  activeMenu: MenuState;
}

export function ToggleMenu({ onMenuChange, activeMenu }: ToggleMenuProps) {
  return (
    <div className="toggle-menu">
      <button
        className={`toggle-button ${activeMenu === 'pocket' ? 'active' : ''}`}
        onClick={() => onMenuChange('pocket')}
        title="Pocket Menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="20" height="20">
          <path d="M 15 58 L 15 92 Q 15 118 60 125 Q 105 118 105 92 L 105 58"
                fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round"/>
          <path d="M 15 58 Q 15 34 60 47 Q 105 34 105 58 Q 82 73 60 79 Q 38 73 15 58 Z"
                fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round"/>
          <circle cx="60" cy="79" r="12" fill="white"/>
          <circle cx="60" cy="79" r="10" fill="none" stroke="currentColor" strokeWidth="6"/>
        </svg>
      </button>
      
      <button
        className={`toggle-button ${activeMenu === 'vault' ? 'active' : ''}`}
        onClick={() => onMenuChange('vault')}
        title="Vault Menu"
      >
        <svg width="20" height="20" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="10" strokeLinecap="square" strokeLinejoin="miter" fill="none">
          <rect x="18" y="20" width="64" height="60" />
          <circle cx="72" cy="50" r="10" />
        </svg>
      </button>

      <button
        className={`toggle-button ${activeMenu === 'role' ? 'active' : ''}`}
        onClick={() => onMenuChange('role')}
        title="Role Menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
      
      <button
        className={`toggle-button ${activeMenu === 'more' ? 'active' : ''}`}
        onClick={() => onMenuChange('more')}
        title="More Menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
        </svg>
      </button>
    </div>
  );
}
