import React, { useState, useEffect } from 'react';

interface TextBlockProps {
  content: string;
  onChange: (content: string) => void;
  isEditing: boolean;
  onBlur: () => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({ content, onChange, isEditing, onBlur }) => {
  if (isEditing) {
    return (
      <textarea 
        className="block-editor"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoFocus
      />
    );
  }

  return (
    <div className="block-text">
      {content || <span className="placeholder-text">Empty text block</span>}
    </div>
  );
};
