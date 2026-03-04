import React, { useEffect } from 'react';
import { useEditor } from '../hooks/useEditor';
import './MarkdownEditor.css';

export interface MarkdownEditorProps {
  content: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

/**
 * MarkdownEditor is the packaged version of the markdown editor component.
 * It is a controlled component that uses CodeMirror internally.
 * It does not have any complex layout, headers, or persistence logic.
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  className = '',
  autoFocus = false
}) => {
  const { containerRef, setContent, view } = useEditor({
    initialContent: content,
    onUpdate: (newContent) => {
      if (onChange) {
        onChange(newContent);
      }
    }
  });

  // Sync external content changes back into the editor
  useEffect(() => {
    if (view && content !== view.state.doc.toString()) {
      setContent(content);
    }
  }, [content, view, setContent]);

  // Handle auto-focus
  useEffect(() => {
    if (autoFocus && view) {
      view.focus();
    }
  }, [autoFocus, view]);

  return (
    <div 
      className={`markdown-editor ${className}`} 
      ref={containerRef}
    />
  );
};
