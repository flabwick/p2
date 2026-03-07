import React, { useState, useEffect, useRef } from 'react';
import { Toolbar, SaveStatus } from './components/Toolbar';
import { MarkdownEditor } from './components/MarkdownEditor';
import { supabase } from '@/lib/supabase';
import { useDeskStore } from '@/features/pockets/store/deskStore';
import { countWords, estimateTokens } from '@shared/lib/counting';
import './styles/Editor.css';

export interface EditorProps {
  fileId?: string;
  initialContent?: string;
  title?: string;
  languageType?: 'markdown' | 'plain';
  pocketId?: string;
  cardId?: string;
  isDeskOnly?: boolean;
  onCountChange?: (counts: { words: number; tokens: number }) => void;
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
  languageType = 'markdown',
  pocketId,
  cardId,
  isDeskOnly = false,
  onCountChange
}) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [content, setContent] = useState(propInitialContent);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const lastSavedAt = useRef<number>(0);
  const isInitialLoad = useRef(true);
  const isSyncing = useRef(false);

  const { updateFileCard } = useDeskStore();

  const calculateCounts = (text: string) => {
    return { 
      words: countWords(text), 
      tokens: estimateTokens(text) 
    };
  };

  // Helper to detect if content is actually a Supabase error message
  const isErrorJSON = (text: string) => {
    return text.includes('"statusCode"') && text.includes('"error"');
  };

  // 1. Fetch metadata and content on mount/fileId change
  useEffect(() => {
    if (!fileId) return;

    const loadFile = async () => {
      console.log(`[Editor:${fileId}] Starting load cycle...`);
      setIsLoaded(false); 
      setSaveStatus('idle');
      
      try {
        isSyncing.current = true;
        
        // Use prop content immediately if available to avoid flash/race
        if (propInitialContent && propInitialContent !== content) {
          console.log(`[Editor:${fileId}] Using provided initialContent.`);
          setContent(propInitialContent);
          if (onCountChange) {
            onCountChange(calculateCounts(propInitialContent));
          }
        }

        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select('storage_path')
          .eq('id', fileId)
          .maybeSingle();

        if (fileError) {
          console.error(`[Editor:${fileId}] Failed to fetch metadata:`, fileError);
          throw fileError;
        }
        
        if (!fileData) {
          console.warn(`[Editor:${fileId}] File not found in database.`);
          setSaveStatus('error');
          return;
        }
        
        const cleanPath = fileData.storage_path.startsWith('vaults/') 
          ? fileData.storage_path.replace('vaults/', '') 
          : fileData.storage_path;
        
        setStoragePath(cleanPath);

        // If we already have content from props, we can skip the initial download
        // or just do it in background. For now, let's download to ensure latest.
        console.log(`[Editor:${fileId}] Downloading from storage: ${cleanPath}`);
        
        // Cache busting: Append timestamp to ensure fresh fetch from server
        const { data, error: downloadError } = await supabase.storage
          .from('vaults')
          .download(`${cleanPath}?t=${Date.now()}`);

        if (downloadError) {
          console.log(`[Editor:${fileId}] Download failed or file new.`, downloadError);
          if (!propInitialContent) {
            const defaultContent = languageType === 'markdown' ? `# ${title || 'Untitled'}\n\n` : '';
            setContent(defaultContent);
          }
          setIsLoaded(true);
          return;
        }

        const text = await data.text();
        console.log(`[Editor:${fileId}] Downloaded ${text.length} bytes.`);

        if (isErrorJSON(text)) {
          console.warn(`[Editor:${fileId}] Detected error JSON in content.`);
          if (!propInitialContent) {
            const recoveredContent = languageType === 'markdown' ? `# ${title || 'Untitled'}\n\n` : '';
            setContent(recoveredContent);
            if (onCountChange) {
              onCountChange(calculateCounts(recoveredContent));
            }
          }
        } else {
          // IMPORTANT: Only overwrite if storage is DIFFERENT from what we have
          // This prevents overwriting fresh prop data with potentially stale cached storage data
          if (text !== content) {
            console.log(`[Editor:${fileId}] Content updated from storage.`);
            setContent(text);
            if (onCountChange) {
              onCountChange(calculateCounts(text));
            }
          }
        }
        
        setIsLoaded(true);
      } catch (err) {
        console.error(`[Editor:${fileId}] Load cycle error:`, err);
        setSaveStatus('error');
      } finally {
        isSyncing.current = false;
        setTimeout(() => { 
          isInitialLoad.current = false; 
          console.log(`[Editor:${fileId}] Load complete.`);
        }, 100);
      }
    };

    loadFile();
  }, [fileId]); // Only trigger on ID change, props change handled by setContent in effect if needed

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
              console.log(`[Editor:${fileId}] Realtime change detected.`);
              const { data, error } = await supabase.storage
                .from('vaults')
                .download(`${payload.new.storage_path}?t=${Date.now()}`);
              
              if (error) throw error;
              const text = await data.text();
              
              if (text !== content) {
                console.log(`[Editor:${fileId}] Applying remote change.`);
                setContent(text);
                setSaveStatus('saved');
                
                setTimeout(() => {
                  setSaveStatus((prev) => prev === 'saved' ? 'idle' : prev);
                }, 3000);
              }
            } catch (err) {
              console.error(`[Editor:${fileId}] Realtime sync error:`, err);
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
      console.log(`[Editor:${fileId}] Autosaving...`);
      setSaveStatus('saving');
      try {
        // 1. Save to Storage
        const { error: uploadError } = await supabase.storage
          .from('vaults')
          .upload(storagePath, content, {
            upsert: true,
            contentType: languageType === 'markdown' ? 'text/markdown' : 'text/plain',
            cacheControl: '0'
          });

        if (uploadError) throw uploadError;

        // 2. Update File Metadata
        const now = new Date();
        const fileSize = new Blob([content]).size;
        const { error: dbError } = await supabase
          .from('files')
          .update({ 
            updated_at: now.toISOString(),
            size: fileSize
          })
          .eq('id', fileId);

        if (dbError) throw dbError;

        // 3. Sync with Desk State if applicable
        if (pocketId && cardId) {
          console.log(`[Editor:${fileId}] Updating desk state.`);
          const { words, tokens } = calculateCounts(content);
          const updates: any = { 
            size: fileSize,
            word_count: words,
            token_count: tokens
          };
          if (isDeskOnly) {
            updates.content = content;
          }
          await updateFileCard(pocketId, cardId, updates);
        }

        lastSavedAt.current = now.getTime();
        setSaveStatus('saved');
        console.log(`[Editor:${fileId}] Save successful.`);
        
        setTimeout(() => {
          setSaveStatus((prev) => prev === 'saved' ? 'idle' : prev);
        }, 3000);
        
      } catch (err) {
        console.error(`[Editor:${fileId}] Autosave failed:`, err);
        setSaveStatus('error');
      }
    }, 2000); 

    return () => clearTimeout(saveTimeout);
  }, [content, fileId, storagePath, isLoaded, languageType, isDeskOnly, pocketId, cardId, updateFileCard]);

  const handleUpdate = (newContent: string) => {
    if (!isSyncing.current && isLoaded) {
      setContent(newContent);
      if (onCountChange) {
        onCountChange(calculateCounts(newContent));
      }
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
