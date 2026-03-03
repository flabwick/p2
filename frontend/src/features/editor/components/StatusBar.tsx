import React from 'react';

interface StatusBarProps {
  content: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ content }) => {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="editor-status-bar">
      <span>Words: {words}</span>
      <span>Characters: {chars}</span>
    </div>
  );
};
