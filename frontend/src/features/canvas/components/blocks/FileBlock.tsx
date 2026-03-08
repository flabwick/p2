import React from 'react';

interface FileBlockProps {
  content: string | { name: string };
  isEditing: boolean;
  onChange: (content: any) => void;
  onBlur: () => void;
}

export const FileBlock: React.FC<FileBlockProps> = ({ content, isEditing, onChange, onBlur }) => {
  if (isEditing) {
    return (
      <textarea 
        className="block-editor"
        value={typeof content === 'string' ? content : JSON.stringify(content)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoFocus
      />
    );
  }

  return (
    <div className="block-file-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="file-icon-mini">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <polyline points="13 2 13 9 20 9"/>
      </svg>
      <span>{typeof content === 'string' ? content : content.name || 'Unknown File'}</span>
    </div>
  );
};
