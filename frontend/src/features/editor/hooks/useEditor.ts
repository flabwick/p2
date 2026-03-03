import { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView } from '@codemirror/view';
import { createEditorState, createEditorView } from '../lib/codemirror';

export interface UseEditorOptions {
  initialContent?: string;
  onUpdate?: (content: string) => void;
}

export const useEditor = ({ initialContent = '', onUpdate }: UseEditorOptions = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = createEditorState(initialContent);
    const editorView = createEditorView(containerRef.current, state);
    
    setView(editorView);

    return () => {
      editorView.destroy();
    };
  }, []); // Only run once on mount

  const setContent = useCallback((content: string) => {
    if (!view) return;
    
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: content
      }
    });
  }, [view]);

  const getContent = useCallback(() => {
    return view ? view.state.doc.toString() : '';
  }, [view]);

  return {
    containerRef,
    view,
    setContent,
    getContent
  };
};
