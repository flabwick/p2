import React, { useState } from 'react';
import { CustomScrollbar } from '../../ui/CustomScrollbar';
import './MoreSidebar.css';

// Simple Chevron Icon for the accordion
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export function MoreSidebar() {
  const [expandedSection, setExpandedSection] = useState<string | null>('settings');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="more-sidebar">
      <CustomScrollbar className="sidebar-content">
        <div className="more-accordion">
          
          {/* EVENTS SECTION */}
          <div className="accordion-section">
            <button 
              className={`accordion-header ${expandedSection === 'events' ? 'active' : ''}`}
              onClick={() => toggleSection('events')}
            >
              <span>EVENTS</span>
              <ChevronIcon isOpen={expandedSection === 'events'} />
            </button>
            {expandedSection === 'events' && (
              <div className="accordion-content">
                <div className="more-list">
                  <div className="more-item">System Events</div>
                  <div className="more-item">User Actions</div>
                  <div className="more-item">Sync Logs</div>
                  <div className="more-item">Error Reports</div>
                </div>
              </div>
            )}
          </div>

          {/* MODELS SECTION */}
          <div className="accordion-section">
            <button 
              className={`accordion-header ${expandedSection === 'models' ? 'active' : ''}`}
              onClick={() => toggleSection('models')}
            >
              <span>MODELS</span>
              <ChevronIcon isOpen={expandedSection === 'models'} />
            </button>
            {expandedSection === 'models' && (
              <div className="accordion-content">
                <div className="more-list">
                  <div className="more-item">GPT-4 (Active)</div>
                  <div className="more-item">Claude 3.5</div>
                  <div className="more-item">Local Llama</div>
                  <div className="more-item">Model Settings</div>
                </div>
              </div>
            )}
          </div>

          {/* SETTINGS SECTION */}
          <div className="accordion-section">
            <button 
              className={`accordion-header ${expandedSection === 'settings' ? 'active' : ''}`}
              onClick={() => toggleSection('settings')}
            >
              <span>SETTINGS</span>
              <ChevronIcon isOpen={expandedSection === 'settings'} />
            </button>
            {expandedSection === 'settings' && (
              <div className="accordion-content">
                <div className="more-list">
                  <div className="more-item">Preferences</div>
                  <div className="more-item">Appearance</div>
                  <div className="more-item">Shortcuts</div>
                  <div className="more-item">API Configuration</div>
                  <div className="more-item">About System</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </CustomScrollbar>
    </div>
  );
}
