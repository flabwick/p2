import React from 'react';

interface ToolbarProps {
  title?: string;
  onSave?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  title, 
  onSave 
}) => {
  return (
    <div className="editor-toolbar">
      <div className="toolbar-left">
        <span className="editor-file-title">{title || 'untitled.md'}</span>
      </div>
      <div className="toolbar-center">
        {/* View switching removed as per request */}
      </div>
      <div className="toolbar-right">
        <button className="save-btn" onClick={onSave}>Save</button>
      </div>
    </div>
  );
};
