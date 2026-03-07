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
  const contentRef = useRef(propInitialContent);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const lastSavedAt = useRef<number>(0);
  const lastKnownUpdate = useRef<string | null>(null);
  const isInitialLoad = useRef(true);
  const isSyncing = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { updateFileCard } = useDeskStore();

  const calculateCounts = (text: string) => {
    return { 
      words: countWords(text), 
      tokens: estimateTokens(text) 
    };
  };

  const syncWithStorage = async (remoteUpdatedAt?: string, remoteTs?: number) => {
    if (!fileId || !storagePath) return;
    
    try {
      isSyncing.current = true;
      setSaveStatus('loading');
      console.log(`[Editor:${fileId}] Syncing with storage...`);
      
      // Clear any pending autosave to avoid overwriting the incoming change
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      const { data, error } = await supabase.storage
        .from('vaults')
        .download(`${storagePath}?t=${Date.now()}`);
      
      if (error) throw error;
      const text = await data.text();
      
      if (text !== contentRef.current) {
        console.log(`[Editor:${fileId}] Applying content update (length: ${text.length}).`);
        setContent(text);
        contentRef.current = text;
        if (remoteUpdatedAt) lastKnownUpdate.current = remoteUpdatedAt;
        setSaveStatus('saved');
        
        if (onCountChange) {
          onCountChange(calculateCounts(text));
        }

        setTimeout(() => {
          setSaveStatus((prev) => prev === 'saved' ? 'idle' : prev);
        }, 3000);
      } else {
        console.log(`[Editor:${fileId}] Content matches local, skipping state update.`);
        setSaveStatus('idle');
      }
    } catch (err) {
      console.error(`[Editor:${fileId}] Sync error:`, err);
      setSaveStatus('error');
    } finally {
      isSyncing.current = false;
    }
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
          .select('storage_path, updated_at')
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
        lastKnownUpdate.current = fileData.updated_at;

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
            contentRef.current = recoveredContent;
            if (onCountChange) {
              onCountChange(calculateCounts(recoveredContent));
            }
          }
        } else {
          // IMPORTANT: Only overwrite if storage is DIFFERENT from what we have
          // This prevents overwriting fresh prop data with potentially stale cached storage data
          if (text !== contentRef.current) {
            console.log(`[Editor:${fileId}] Content updated from storage.`);
            setContent(text);
            contentRef.current = text;
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
          const remoteUpdatedAt = payload.new.updated_at;
          const remoteTs = new Date(remoteUpdatedAt).getTime();
          const localTs = lastSavedAt.current;
          
          console.log(`[Editor:${fileId}] Received Realtime Update:`, {
            remote: remoteUpdatedAt,
            localLastKnown: lastKnownUpdate.current,
            remoteTs,
            localLastSavedTs: localTs
          });

          const isNewUpdate = remoteUpdatedAt !== lastKnownUpdate.current;
          const isNotStale = remoteTs >= localTs;

          if (isNewUpdate && isNotStale) { 
            await syncWithStorage(remoteUpdatedAt, remoteTs);
          } else {
            console.log(`[Editor:${fileId}] Sync ignored. isNewUpdate: ${isNewUpdate}, isNotStale: ${isNotStale}`);
          }
        }
      )
      .subscribe();

    const handleManualSync = (e: any) => {
      if (e.detail.fileId === fileId) {
        console.log(`[Editor:${fileId}] Manual sync triggered by custom event.`);
        syncWithStorage(new Date().toISOString(), Date.now());
      }
    };

    window.addEventListener('file-content-updated', handleManualSync);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('file-content-updated', handleManualSync);
    };
  }, [fileId, storagePath]); // storagePath is needed for syncWithStorage

  // 3. Debounced Autosave
  useEffect(() => {
    if (!isLoaded || !fileId || !storagePath) return;
    if (content.includes('Loading content...')) return;
    if (isErrorJSON(content)) return;
    if (isInitialLoad.current) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
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
        const { data: dbData, error: dbError } = await supabase
          .from('files')
          .update({ 
            updated_at: now.toISOString(),
            size: fileSize
          })
          .eq('id', fileId)
          .select('updated_at')
          .single();

        if (dbError) throw dbError;

        // Update local tracking to avoid sync loops
        lastKnownUpdate.current = dbData.updated_at;
        lastSavedAt.current = now.getTime();
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

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [content, fileId, storagePath, isLoaded, languageType, isDeskOnly, pocketId, cardId, updateFileCard]);

  const handleUpdate = (newContent: string) => {
    if (!isSyncing.current && isLoaded) {
      setContent(newContent);
      contentRef.current = newContent;
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
