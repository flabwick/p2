import React from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ToolbarProps {
  title?: string;
  saveStatus?: SaveStatus;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  title,
  saveStatus = 'idle'
}) => {
  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'All changes saved';
      case 'error': return 'Error saving';
      default: return '';
    }
  };

  return (
    <div className="editor-toolbar">
      <div className="toolbar-left">
        <span className="editor-file-title">{title || 'untitled.md'}</span>
        {saveStatus !== 'idle' && (
          <span className={`save-status ${saveStatus}`}>
            {getStatusText()}
          </span>
        )}
      </div>
      <div className="toolbar-center">
        {/* View switching removed as per request */}
      </div>
      <div className="toolbar-right">
        {/* Save button removed as per request */}
      </div>
    </div>
  );
};
