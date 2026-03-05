import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { supabase } from '@/lib/supabase';
import { EpubProcessor } from './EpubProcessor';
import '../editor/styles/Editor.css';
import './BaseViewer.css';
import './EpubViewer.css';

interface EpubViewerProps {
  fileId: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
}

export const EpubViewer: React.FC<EpubViewerProps> = ({ fileId, title, className, style }) => {
  const [loading, setLoading] = useState(true);
  const [isProcessed, setIsProcessed] = useState(false);
  const [book, setBook] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [assetMap, setAssetMap] = useState<Record<string, string>>({}); 
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [pendingChapterIds, setPendingChapterIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>('');
  
  const scrollerRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = async (bookId: string) => {
    console.group('%c [VIEWER] Data Sync ', 'background: #cb9e4a; color: black; font-weight: bold; padding: 4px;');
    
    const { data: chapterData } = await supabase
      .from('epub_chapters')
      .select('id, title, content_markdown, word_count, sequence_order')
      .eq('book_id', bookId)
      .order('sequence_order', { ascending: true });

    const { data: assetData } = await supabase
      .from('epub_assets')
      .select('href, content_base64')
      .eq('book_id', bookId);

    if (chapterData) {
      console.log(`Chapters Loaded: ${chapterData.length}`);
      setChapters(chapterData);
      const initialSelected = new Set(chapterData.map(c => c.id));
      setSelectedChapterIds(initialSelected);
      setPendingChapterIds(new Set(initialSelected));
      setCurrentChapterTitle(chapterData[0]?.title || '');
    }

    if (assetData) {
      const map: Record<string, string> = {};
      assetData.forEach((a: any) => { if (a.content_base64) map[a.href] = a.content_base64; });
      setAssetMap(map);
    }
    
    setLoading(false);
  };

  const handleNavClick = (chapterId: string) => {
    if (!selectedChapterIds.has(chapterId)) {
      const newSelected = new Set(selectedChapterIds);
      newSelected.add(chapterId);
      setSelectedChapterIds(newSelected);
      
      setTimeout(() => {
        const el = document.querySelector(`[data-id="${chapterId}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const el = document.querySelector(`[data-id="${chapterId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const checkProcessed = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('epub_books')
      .select('id, title, author, is_fully_processed')
      .eq('file_id', fileId)
      .maybeSingle();

    if (data?.is_fully_processed) {
      setBook(data);
      setIsProcessed(true);
      await fetchInitialData(data.id);
    } else {
      setIsProcessed(false);
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setPendingChapterIds(new Set(selectedChapterIds));
    setIsModalOpen(true);
  };

  const handleForceReprocess = async () => {
    if (!confirm('Re-deconstruct this book?')) return;
    setLoading(true);
    await supabase.from('epub_books').delete().eq('file_id', fileId);
    window.location.reload();
  };

  useEffect(() => { checkProcessed(); }, [fileId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPos = target.scrollTop + 200;
    const sections = target.querySelectorAll('.chapter-section');
    for (const section of sections) {
      const htmlEl = section as HTMLElement;
      if (htmlEl.offsetTop <= scrollPos && htmlEl.offsetTop + htmlEl.offsetHeight > scrollPos) {
        setCurrentChapterTitle(htmlEl.dataset.title || '');
        break;
      }
    }
  };

  const renderMarkdown = (content: string) => {
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ node, href, children, ...props }) => {
            const handleClick = (e: React.MouseEvent) => {
              if (href && !href.startsWith('http')) {
                e.preventDefault();
                const targetId = href.replace('#', '');
                const target = document.getElementById(targetId) || document.getElementsByName(targetId)[0];
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              }
            };
            return <a {...props} href={href} onClick={handleClick}>{children}</a>;
          },
          img: ({ node, src, ...props }) => {
            if (!src) return null;
            
            // Comprehensive lookup:
            // 1. Exact match (OEBPS/images/img.jpg)
            // 2. Decoded match
            // 3. Filename only match (img.jpg)
            // 4. Filename only decoded
            const decodedSrc = decodeURIComponent(src);
            const filename = src.split('/').pop() || '';
            const decodedFilename = decodedSrc.split('/').pop() || '';
            
            const b64 = assetMap[src] || 
                        assetMap[decodedSrc] || 
                        assetMap[filename] || 
                        assetMap[decodedFilename];
            
            if (b64 || src.startsWith('data:image')) {
              const finalSrc = b64 || src;
              return (
                <img 
                  {...props} 
                  src={finalSrc} 
                  className="epub-embedded-image" 
                />
              );
            }
            
            console.warn(`[VIEWER] Missing Asset: ${src} (Tried variants: ${filename}, ${decodedFilename})`);
            return (
              <span className="epub-img-error">
                Image Missing: {src}
              </span>
            );
          },
          h1: ({ node, ...props }) => <h1 {...props} />,
          h2: ({ node, ...props }) => <h2 {...props} />,
          p: ({ node, ...props }) => <p {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  if (loading) return <div className="viewer-loading">SYNCING INDEX...</div>;
  if (!isProcessed) return (
    <EpubProcessor 
      fileId={fileId} 
      title={title} 
      onComplete={checkProcessed} 
      className={className}
      style={style}
    />
  );

  const filteredChapters = chapters.filter(c => selectedChapterIds.has(c.id));

  return (
    <div className={`viewer-container epub-viewer-root ${className || ''}`} style={style}>
      <div className="epub-reader-layout">
        <div className="epub-sidebar-navigator">
          <div className="sidebar-header">NAVIGATOR</div>
          <div className="sidebar-links">
            {chapters.map((c) => (
              <button 
                key={c.id} 
                className={`sidebar-nav-item ${currentChapterTitle === c.title ? 'active' : ''} ${selectedChapterIds.has(c.id) ? '' : 'unselected'}`}
                onClick={() => handleNavClick(c.id)}
              >
                <div className="nav-label">{c.title}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="epub-header-controls">
          <div className="epub-header-info">
            <span className="current-section-label">{currentChapterTitle}</span>
            <span className="book-meta-label">{book?.author} · {title}</span>
          </div>
          <button className="epub-toc-trigger" onClick={handleOpenModal}>
            Sections · {selectedChapterIds.size}
          </button>
        </div>

        <div className="viewer-workspace epub-viewer-workspace scrolled" onScroll={handleScroll} ref={scrollerRef}>
          <div className="epub-manuscript-content markdown-body">
            {filteredChapters.map((chapter) => (
              <section key={chapter.id} className="chapter-section" data-id={chapter.id} data-title={chapter.title}>
                <div className="chapter-markdown-container">
                  {renderMarkdown(chapter.content_markdown)}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="epub-footer-info">
          <span className="footer-status">Manuscript Connected</span>
        </div>
      </div>

      {isModalOpen && (
        <div className="epub-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="epub-modal-content" onClick={e => e.stopPropagation()}>
            <div className="epub-modal-header">
              <h2>Manuscript Index</h2>
              <div className="modal-header-actions">
                <button className="text-action-btn" onClick={() => setPendingChapterIds(new Set(chapters.map(c => c.id)))}>Select All</button>
                <button className="text-action-btn" onClick={() => setPendingChapterIds(new Set())}>Deselect All</button>
                <div className="v-divider" />
                <button className="text-action-btn danger-reprocess" onClick={handleForceReprocess}>Re-Deconstruct</button>
                <button className="close-x" onClick={() => setIsModalOpen(false)}>✕</button>
              </div>
            </div>
            <div className="epub-modal-body">
              {chapters.map((chapter) => (
                <div 
                  key={chapter.id} 
                  className={`epub-toc-row ${pendingChapterIds.has(chapter.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const newSet = new Set(pendingChapterIds);
                    if (newSet.has(chapter.id)) newSet.delete(chapter.id);
                    else newSet.add(chapter.id);
                    setPendingChapterIds(newSet);
                  }}
                >
                  <label className="epub-checkbox-container" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={pendingChapterIds.has(chapter.id)} readOnly />
                    <span className="checkmark"></span>
                    <span className="chapter-name">{chapter.title}</span>
                  </label>
                  <span className="word-count">{chapter.word_count.toLocaleString()} words</span>
                </div>
              ))}
            </div>
            <div className="epub-modal-footer">
              <button className="apply-selection-btn" onClick={() => {
                setSelectedChapterIds(new Set(pendingChapterIds));
                setIsModalOpen(false);
              }}>
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
