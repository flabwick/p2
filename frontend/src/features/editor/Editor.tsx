import React, { useState, useEffect, useRef } from 'react';
import { Toolbar, SaveStatus } from './components/Toolbar';
import { MarkdownEditor } from './components/MarkdownEditor';
import { supabase } from '@/lib/supabase';
import './styles/Editor.css';

export interface EditorProps {
  fileId?: string;
  initialContent?: string;
  title?: string;
  languageType?: 'markdown' | 'plain';
}

/**
 * The Editor component is specifically designed for the Main Panel File Viewer.
 * It handles Supabase persistence and the specialized "Main Panel" layout.
 * For a generic markdown editor without persistence, use MarkdownEditor.
 */
export const Editor: React.FC<EditorProps> = ({ 
  fileId,
  initialContent: propInitialContent = '', 
  title,
  languageType = 'markdown'
}) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [content, setContent] = useState(propInitialContent);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const lastSavedAt = useRef<number>(0);
  const isInitialLoad = useRef(true);
  const isSyncing = useRef(false);

  // Helper to detect if content is actually a Supabase error message
  const isErrorJSON = (text: string) => {
    return text.includes('"statusCode"') && text.includes('"error"');
  };

  // 1. Fetch metadata and content on mount/fileId change
  useEffect(() => {
    if (!fileId) return;

    const loadFile = async () => {
      setIsLoaded(false); 
      setSaveStatus('idle');
      
      try {
        isSyncing.current = true;
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select('storage_path')
          .eq('id', fileId)
          .maybeSingle();

        if (fileError) throw fileError;
        
        if (!fileData) {
          console.warn(`File with ID ${fileId} not found in database.`);
          setSaveStatus('error');
          return;
        }
        
        const cleanPath = fileData.storage_path.startsWith('vaults/') 
          ? fileData.storage_path.replace('vaults/', '') 
          : fileData.storage_path;
        
        setStoragePath(cleanPath);

        const { data, error: downloadError } = await supabase.storage
          .from('vaults')
          .download(cleanPath);

        if (downloadError) {
          console.log('New file detected, using default content');
          const defaultContent = languageType === 'markdown' ? `# ${title || 'Untitled'}\n\n` : '';
          setContent(defaultContent);
          setIsLoaded(true);
          return;
        }

        const text = await data.text();

        if (isErrorJSON(text)) {
          console.warn('Detected error JSON in file content, clearing');
          const recoveredContent = languageType === 'markdown' ? `# ${title || 'Untitled'}\n\n` : '';
          setContent(recoveredContent);
        } else {
          setContent(text);
        }
        
        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading file:', err);
        setSaveStatus('error');
      } finally {
        isSyncing.current = false;
        setTimeout(() => { isInitialLoad.current = false; }, 100);
      }
    };

    loadFile();
  }, [fileId, title, languageType]);

  // 2. Realtime Sync: Listen for changes from other instances
  useEffect(() => {
    if (!fileId) return;

    const channel = supabase
      .channel(`file-changes-${fileId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'files',
          filter: `id=eq.${fileId}`
        },
        async (payload) => {
          const remoteUpdatedAt = new Date(payload.new.updated_at).getTime();
          if (remoteUpdatedAt > lastSavedAt.current + 1000) { 
            try {
              isSyncing.current = true;
              const { data, error } = await supabase.storage
                .from('vaults')
                .download(payload.new.storage_path);
              
              if (error) throw error;
              const text = await data.text();
              
              if (text !== content) {
                setContent(text);
                setSaveStatus('saved');
                
                setTimeout(() => {
                  setSaveStatus((prev) => prev === 'saved' ? 'idle' : prev);
                }, 3000);
              }
            } catch (err) {
              console.error('Error syncing remote changes:', err);
            } finally {
              isSyncing.current = false;
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fileId, content]);

  // 3. Debounced Autosave
  useEffect(() => {
    if (!isLoaded || !fileId || !storagePath) return;
    if (content.includes('Loading content...')) return;
    if (isErrorJSON(content)) return;
    if (isInitialLoad.current) return;

    const saveTimeout = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const { error: uploadError } = await supabase.storage
          .from('vaults')
          .upload(storagePath, content, {
            upsert: true,
            contentType: languageType === 'markdown' ? 'text/markdown' : 'text/plain',
            cacheControl: '0'
          });

        if (uploadError) throw uploadError;

        const now = new Date();
        const { error: dbError } = await supabase
          .from('files')
          .update({ updated_at: now.toISOString() })
          .eq('id', fileId);

        if (dbError) throw dbError;

        lastSavedAt.current = now.getTime();
        setSaveStatus('saved');
        
        setTimeout(() => {
          setSaveStatus((prev) => prev === 'saved' ? 'idle' : prev);
        }, 3000);
        
      } catch (err) {
        console.error('Error autosaving:', err);
        setSaveStatus('error');
      }
    }, 2000); 

    return () => clearTimeout(saveTimeout);
  }, [content, fileId, storagePath, isLoaded, languageType]);

  const handleUpdate = (newContent: string) => {
    if (!isSyncing.current && isLoaded) {
      setContent(newContent);
    }
  };

  return (
    <div className="markdown-editor-container">
      <div className="editor-spacer" />
      <div className="editor-workspace">
        <MarkdownEditor 
          content={content} 
          onChange={handleUpdate}
          className="main-panel-editor"
          languageType={languageType}
        />
      </div>
    </div>
  );
};
