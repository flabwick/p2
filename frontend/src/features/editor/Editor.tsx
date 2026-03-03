import React, { useState, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { StatusBar } from './components/StatusBar';
import { useEditor } from './hooks/useEditor';
import './styles/Editor.css';

export interface EditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  title?: string;
}

export const Editor: React.FC<EditorProps> = ({ 
  initialContent = '', 
  onSave,
  title
}) => {
  const { containerRef, getContent } = useEditor({
    initialContent
  });

  const handleSave = () => {
    if (onSave) {
      onSave(getContent());
    }
  };

  return (
    <div className="markdown-editor-container">
      <Toolbar 
        title={title} 
        onSave={handleSave} 
      />
      
      <div className="editor-workspace">
        <div className="editor-pane source-editor" ref={containerRef}>
          {/* CodeMirror will be injected here */}
        </div>
      </div>
      
      <StatusBar content={initialContent} /> 
    </div>
  );
};
