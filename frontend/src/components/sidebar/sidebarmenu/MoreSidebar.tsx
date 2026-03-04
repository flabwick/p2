import React from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import './MoreSidebar.css';

export function MoreSidebar() {
  const options = [
    { id: 'archive', label: 'Archive' },
    { id: 'events', label: 'Events' },
    { id: 'roles', label: 'Roles' },
    { id: 'generators', label: 'Generators' },
    { id: 'models', label: 'Models' },
    { id: 'billing', label: 'Billing' },
    { id: 'account', label: 'Account' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="more-sidebar">
      <CustomScrollbar className="sidebar-content">
        <div className="more-list-extended">
          {options.map((opt) => (
            <button key={opt.id} className="more-item-button">
              {opt.label}
            </button>
          ))}
        </div>
      </CustomScrollbar>
    </div>
  );
}
