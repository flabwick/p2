import React, { useState, useEffect, useRef } from 'react';
import ePub from 'epubjs';
import TurndownService from 'turndown';
import { supabase } from '@/lib/supabase';
import './EpubProcessor.css';

interface EpubProcessorProps {
  fileId: string;
  title: string;
  onComplete: () => void;
  className?: string;
  style?: React.CSSProperties;
  isEmbedded?: boolean;
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
});

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

// Helper to resolve paths in EPUB archive
const resolvePath = (base: string, relative: string) => {
  if (relative.startsWith('http') || relative.startsWith('data:')) return relative;
  
  // Clean up relative path (remove hash/query)
  const cleanRelative = relative.split(/[?#]/)[0];
  if (!cleanRelative) return '';

  const stack = base.split('/').filter(Boolean);
  stack.pop(); // Remove the filename to get the directory

  const parts = cleanRelative.split('/').filter(Boolean);
  for (const part of parts) {
    if (part === '..') stack.pop();
    else if (part !== '.') stack.push(part);
  }
  return stack.join('/');
};

export const EpubProcessor: React.FC<EpubProcessorProps> = ({ 
  fileId, 
  title, 
  onComplete,
  className,
  style,
  isEmbedded
}) => {
  const [status, setStatus] = useState<string>('Initializing...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (processingRef.current) return;
    processingRef.current = true;

    const process = async () => {
      try {
        // 1. Fetch Binary
        setStatus('Downloading manuscript binary...');
        const { data: fileData } = await supabase.from('files').select('storage_path').eq('id', fileId).maybeSingle();
        if (!fileData) throw new Error('File metadata not found.');

        const { data: bookBlob, error: downloadErr } = await supabase.storage.from('vaults').download(fileData.storage_path.replace('vaults/', ''));
        if (downloadErr) throw new Error(`Storage error: ${downloadErr.message}`);

        const book = ePub(await (bookBlob as any).arrayBuffer());
        await book.opened;
        const navigation = await book.loaded.navigation;
        
        // Find OPF directory for absolute path resolution
        const opfPath = (book as any).container.packagePath || '';
        const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/')) : '';

        // 2. Clear previous attempts
        const { data: old } = await supabase.from('epub_books').select('id').eq('file_id', fileId).maybeSingle();
        if (old) {
          await supabase.from('epub_books').delete().eq('id', old.id);
        }

        // 3. Register Book
        const { data: bookRecord, error: bookError } = await supabase
          .from('epub_books')
          .insert({ file_id: fileId, title: title, is_fully_processed: false })
          .select().single();

        if (bookError) throw new Error(`DB Error (Book): ${bookError.message}`);

        // 4. Asset Capture (Archive Crawl)
        setStatus('Scanning archive for images...');
        const archive = (book as any).archive;
        if (!archive || !archive.zip) {
          throw new Error('CRITICAL: Archive or ZIP object is missing from book instance!');
        }

        const allPaths = Object.keys(archive.zip.files);
        const imagePaths = allPaths.filter(f => f.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));

        const assetsToInsert: any[] = [];
        for (let i = 0; i < imagePaths.length; i++) {
          const path = imagePaths[i];
          try {
            // Try getting blob via archive helper, fallback to direct JSZip access
            let blob = null;
            if (typeof archive.getBlob === 'function') {
              blob = await archive.getBlob(path);
            }
            
            if (!blob && archive.zip && archive.zip.file) {
              const file = archive.zip.file(path);
              if (file) blob = await file.async('blob');
            }

            if (blob) {
              const base64 = await blobToBase64(blob);
              assetsToInsert.push({
                book_id: bookRecord.id,
                href: path,
                content_base64: base64,
                mime_type: blob.type
              });
            }
          } catch (e) { 
            console.warn(`Extraction Failed for ${path}:`, e); 
          }
          setProgress(Math.round((i / imagePaths.length) * 30));
        }

        if (assetsToInsert.length > 0) {
          const { error: assetErr } = await supabase.from('epub_assets').insert(assetsToInsert);
          if (assetErr) {
            console.error('DB Error (Assets):', assetErr.message);
          }
        }

        // 5. Segment Content
        const flattenedToc: any[] = [];
        const walk = (items: any[]) => items.forEach(i => { flattenedToc.push(i); if (i.subitems) walk(i.subitems); });
        walk(navigation.toc);

        const docCache = new Map<string, Document>();
        for (let i = 0; i < flattenedToc.length; i++) {
          const item = flattenedToc[i];
          const [baseHref, anchor] = item.href.split('#');
          setStatus(`Slicing Section: ${item.label}`);

          if (!docCache.has(baseHref)) {
            const d = await book.load(baseHref) as Document;
            docCache.set(baseHref, d);
          }
          const doc = docCache.get(baseHref)!;
          
          let fragmentHtml = '';
          if (anchor) {
            const startNode = doc.getElementById(anchor) || doc.querySelector(`[name="${anchor}"]`);
            if (startNode) {
              const range = doc.createRange();
              range.setStartBefore(startNode);
              const nextItem = flattenedToc[i + 1];
              const [nextBase, nextAnchor] = nextItem?.href.split('#') || [];
              const endNode = (nextBase === baseHref && nextAnchor) 
                ? (doc.getElementById(nextAnchor) || doc.querySelector(`[name="${nextAnchor}"]`)) 
                : null;

              if (endNode) range.setEndBefore(endNode);
              else range.setEndAfter(doc.body.lastChild || doc.body);
              
              const container = doc.createElement('div');
              container.appendChild(range.cloneContents());
              fragmentHtml = container.innerHTML;
            } else { fragmentHtml = doc.body.innerHTML; }
          } else { fragmentHtml = doc.body.innerHTML; }

          // Resolve image paths relative to the OPF directory
          const chapterZipPath = opfDir ? `${opfDir}/${baseHref}` : baseHref;
          const tmpDiv = document.createElement('div');
          tmpDiv.innerHTML = fragmentHtml;
          
          // 1. Recursive Normalization: Collapse internal newlines in text nodes
          // while preserving the structural integrity of the HTML tags.
          const walkAndClean = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              node.textContent = (node.textContent || '').replace(/\s+/g, ' ');
            } else {
              node.childNodes.forEach(child => walkAndClean(child));
            }
          };
          walkAndClean(tmpDiv);

          // 2. Clear out <br> tags which are often used for artificial line-wrapping
          tmpDiv.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode(' ')));

          // 3. Recursive Semantic Healer: Join blocks that don't end in terminal punctuation.
          let current = tmpDiv.firstElementChild;
          
          // Structural Elevation: 
          // 1. If the first element is our TOC anchor
          // 2. OR if its text matches our TOC label exactly
          if (current) {
            const isHeading = /^H[1-6]$/.test(current.tagName);
            const text = current.textContent?.trim() || '';
            const isTocLabel = item.label && text.toLowerCase() === item.label.trim().toLowerCase();
            
            if (!isHeading && (anchor || isTocLabel)) {
              const h2 = document.createElement('h2');
              h2.innerHTML = current.innerHTML;
              h2.setAttribute('data-structural-header', 'true');
              current.replaceWith(h2);
              current = h2;
            }
          }

          while (current) {
            const next = current.nextElementSibling;
            if (next && 
                ['P', 'DIV', 'LI'].includes(current.tagName) && 
                ['P', 'DIV', 'LI', 'SPAN'].includes(next.tagName)) {
              
              // NEVER merge if either block is a structural header
              const isHeader = /^H[1-6]$/.test(current.tagName) || current.hasAttribute('data-structural-header');
              const nextIsHeader = /^H[1-6]$/.test(next.tagName) || next.hasAttribute('data-structural-header');
              
              if (isHeader || nextIsHeader) {
                current = next;
                continue;
              }

              const text = current.textContent?.trim() || '';
              // Terminal punctuation check (including quotes and brackets)
              const isTerminal = /[.!?…:;"”'’»\)\}\]]$/.test(text);
              
              if (text && !isTerminal) {
                current.appendChild(document.createTextNode(' '));
                while (next.firstChild) {
                  current.appendChild(next.firstChild);
                }
                next.remove();
                continue; // Re-check the same 'current' with its NEW next sibling
              }
            }
            current = current.nextElementSibling;
          }

          // 4. Resolve Image Paths
          Array.from(tmpDiv.querySelectorAll('img, image')).forEach((el: any) => {
            const src = el.getAttribute('src') || el.getAttribute('xlink:href') || '';
            if (src && !src.startsWith('data:')) {
              const resolved = resolvePath(chapterZipPath, src);
              el.setAttribute('src', resolved);
            }
          });

          const markdown = turndownService.turndown(tmpDiv.innerHTML);
          const words = tmpDiv.textContent?.trim().split(/\s+/).filter(w => w.length > 0).length || 0;

          const { error: chapErr } = await supabase.from('epub_chapters').insert({
            book_id: bookRecord.id,
            title: item.label.trim(),
            href: item.href,
            content_markdown: markdown,
            word_count: words,
            sequence_order: i
          });
          if (chapErr) console.error(`DB Error (Section ${i}):`, chapErr.message);
          
          setProgress(30 + Math.round((i / flattenedToc.length) * 70));
        }

        await supabase.from('epub_books').update({ is_fully_processed: true }).eq('id', bookRecord.id);
        console.log('Manuscript Deconstruction Complete.');
        console.groupEnd();
        onComplete();
      } catch (err: any) {
        console.error('[EpubProcessor] FATAL FAILURE:', err);
        console.groupEnd();
        setError(err.message);
        processingRef.current = false;
      }
    };

    process();
  }, [fileId]);

  if (error) {
    return (
      <div className={`epub-processor-container error ${isEmbedded ? 'is-embedded' : ''} ${className || ''}`} style={style}>
        <div className="processor-card">
          <h2 style={{ color: 'red' }}>Deconstruction Fault</h2>
          <p style={{ fontSize: '12px', margin: '10px 0' }}>{error}</p>
          <button className="apply-selection-btn" onClick={() => window.location.reload()}>Retry Extraction</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`epub-processor-container ${isEmbedded ? 'is-embedded' : ''} ${className || ''}`} style={style}>
      <div className="processor-card">
        <div className="manuscript-icon">⚒️</div>
        <h2>Segmenting Manuscript</h2>
        <p className="status-text">{status}</p>
        <div className="processor-progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="percentage">{progress}%</p>
      </div>
    </div>
  );
};
