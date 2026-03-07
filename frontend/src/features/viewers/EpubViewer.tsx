import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { supabase } from '@/lib/supabase';
import { EpubProcessor } from './EpubProcessor';
import { estimateTokens } from '@shared/lib/counting';
import '../editor/styles/Editor.css';
import './BaseViewer.css';
import './EpubViewer.css';

interface EpubViewerProps {
  fileId: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
  isEmbedded?: boolean;
  onCountChange?: (counts: { words: number; tokens: number }) => void;
}

// --- Sub-components for performance ---

const ChapterSection = React.memo(({ 
  chapter, 
  assetMap 
}: { 
  chapter: any; 
  assetMap: Record<string, string>;
}) => {
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
                  loading="lazy"
                />
              );
            }
            
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

  return (
    <section className="chapter-section" data-id={chapter.id} data-title={chapter.title}>
      <div className="chapter-markdown-container">
        {renderMarkdown(chapter.content_markdown)}
      </div>
    </section>
  );
});

ChapterSection.displayName = 'ChapterSection';

interface EpubTocModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: any[];
  selectedIds: Set<string>;
  onApply: (newSelectedIds: Set<string>) => void;
  onForceReprocess: () => void;
}

const EpubTocModal: React.FC<EpubTocModalProps> = ({
  isOpen,
  onClose,
  chapters,
  selectedIds,
  onApply,
  onForceReprocess
}) => {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set(selectedIds));

  // Update pending IDs if selectedIds change externally (e.g. initial load)
  useEffect(() => {
    if (isOpen) {
      setPendingIds(new Set(selectedIds));
    }
  }, [selectedIds, isOpen]);

  if (!isOpen) return null;

  const toggleChapter = (id: string) => {
    const newSet = new Set(pendingIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setPendingIds(newSet);
  };

  const modalContent = (
    <div className="dfc-move-overlay" onPointerDown={(e) => e.stopPropagation()} onClick={onClose}>
      <div className="dfc-move-popup epub-toc-popup" onClick={(e) => e.stopPropagation()}>
        <div className="dfc-move-header">
          <span>Manuscript Index</span>
          <button className="dfc-move-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="epub-toc-bulk-actions">
          <button className="text-action-btn" onClick={() => setPendingIds(new Set(chapters.map(c => c.id)))}>Select All</button>
          <button className="text-action-btn" onClick={() => setPendingIds(new Set())}>Deselect All</button>
          <div className="v-divider" />
          <button className="text-action-btn danger-reprocess" onClick={onForceReprocess}>Re-Deconstruct</button>
        </div>

        <div className="dfc-move-list-container epub-toc-list-container">
          <div className="epub-toc-list">
            {chapters.map((chapter) => (
              <div 
                key={chapter.id} 
                className={`epub-toc-row ${pendingIds.has(chapter.id) ? 'selected' : ''}`}
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="epub-toc-checkbox-wrapper">
                  <div className={`epub-custom-checkbox ${pendingIds.has(chapter.id) ? 'checked' : ''}`}>
                    {pendingIds.has(chapter.id) && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="chapter-name">{chapter.title}</span>
                <span className="word-count">{(chapter.word_count || 0).toLocaleString()} words</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dfc-move-actions">
          <button className="std-button small ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="std-button small primary" onClick={() => onApply(pendingIds)}>
            Apply Selection
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// --- Main Component ---

export const EpubViewer: React.FC<EpubViewerProps> = ({ 
  fileId, 
  title, 
  className, 
  style,
  isEmbedded,
  onCountChange
}) => {
  const [loading, setLoading] = useState(true);
  const [isProcessed, setIsProcessed] = useState(false);
  const [book, setBook] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [assetMap, setAssetMap] = useState<Record<string, string>>({}); 
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>('');
  
  const scrollerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoized calculations
  const filteredChapters = useMemo(() => 
    chapters.filter(c => selectedChapterIds.has(c.id)),
  [chapters, selectedChapterIds]);

  const stats = useMemo(() => {
    if (chapters.length === 0) return { words: 0, tokens: 0 };
    const selected = chapters.filter(c => selectedChapterIds.has(c.id));
    const words = selected.reduce((acc, c) => acc + (c.word_count || 0), 0);
    const tokens = selected.reduce((acc, c) => acc + (c.token_count || 0), 0);
    return { words, tokens };
  }, [chapters, selectedChapterIds]);

  useEffect(() => {
    if (onCountChange) {
      onCountChange(stats);
    }
  }, [stats, onCountChange]);

  // Scroll tracking with IntersectionObserver
  useEffect(() => {
    if (!scrollerRef.current) return;

    // Disconnect previous observer
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          const title = (visibleEntry.target as HTMLElement).dataset.title;
          if (title) setCurrentChapterTitle(title);
        }
      },
      {
        root: scrollerRef.current,
        threshold: 0.1,
        rootMargin: '-10% 0px -80% 0px' // Focus on the top area
      }
    );

    const sections = scrollerRef.current.querySelectorAll('.chapter-section');
    sections.forEach(section => observerRef.current?.observe(section));

    return () => observerRef.current?.disconnect();
  }, [filteredChapters]); // Re-observe when chapters change

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
      
      // Pre-calculate tokens for each chapter to avoid expensive regex matching during selection changes
      const chaptersWithTokens = chapterData.map(c => ({
        ...c,
        token_count: estimateTokens(c.content_markdown || '')
      }));
      
      setChapters(chaptersWithTokens);
      const initialSelected = new Set(chaptersWithTokens.map(c => c.id));
      setSelectedChapterIds(initialSelected);
      setCurrentChapterTitle(chaptersWithTokens[0]?.title || '');
    }

    if (assetData) {
      const map: Record<string, string> = {};
      assetData.forEach((a: any) => { if (a.content_base64) map[a.href] = a.content_base64; });
      setAssetMap(map);
    }
    
    setLoading(false);
    console.groupEnd();
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

  useEffect(() => { checkProcessed(); }, [fileId]);

  const handleNavClick = useCallback((chapterId: string) => {
    if (!selectedChapterIds.has(chapterId)) {
      setSelectedChapterIds(prev => {
        const next = new Set(prev);
        next.add(chapterId);
        return next;
      });
      
      // Allow render to complete before scrolling
      setTimeout(() => {
        const el = document.querySelector(`[data-id="${chapterId}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const el = document.querySelector(`[data-id="${chapterId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedChapterIds]);

  const handleApplySelection = (newSelectedIds: Set<string>) => {
    setSelectedChapterIds(newSelectedIds);
    setIsModalOpen(false);
  };

  const handleForceReprocess = async () => {
    if (!confirm('Re-deconstruct this book?')) return;
    setLoading(true);
    await supabase.from('epub_books').delete().eq('file_id', fileId);
    window.location.reload();
  };

  if (loading) return <div className="viewer-loading">SYNCING INDEX...</div>;
  if (!isProcessed) return (
    <EpubProcessor 
      fileId={fileId} 
      title={title} 
      onComplete={checkProcessed} 
      className={className}
      style={style}
      isEmbedded={isEmbedded}
    />
  );

  return (
    <div className={`viewer-container epub-viewer-root ${isEmbedded ? 'is-embedded' : ''} ${className || ''}`} style={style}>
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
          {isEmbedded && (
            <button className="epub-nav-toggle" onClick={() => setIsNavOpen(!isNavOpen)} title="Navigator">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          <div className="epub-header-info">
            <span className="current-section-label">{currentChapterTitle}</span>
            <span className="book-meta-label">{book?.author} · {title}</span>
          </div>
          <button className="epub-toc-trigger" onClick={() => setIsModalOpen(true)}>
            Sections · {selectedChapterIds.size}
          </button>
        </div>

        <div className="viewer-workspace epub-viewer-workspace scrolled" ref={scrollerRef}>
          <div className="epub-manuscript-content markdown-body">
            {filteredChapters.map((chapter) => (
              <ChapterSection 
                key={chapter.id} 
                chapter={chapter} 
                assetMap={assetMap} 
              />
            ))}
          </div>
        </div>

        <div className="epub-footer-info">
          <span className="footer-status">Manuscript Connected</span>
        </div>
      </div>

      {isEmbedded && isNavOpen && (
        <div className="epub-embedded-nav-overlay" onClick={() => setIsNavOpen(false)}>
          <div className="epub-embedded-nav-popup" onClick={e => e.stopPropagation()}>
            <div className="popup-header">CHAPTERS</div>
            <div className="sidebar-links">
              {chapters.map((c) => (
                <button 
                  key={c.id} 
                  className={`sidebar-nav-item ${currentChapterTitle === c.title ? 'active' : ''} ${selectedChapterIds.has(c.id) ? '' : 'unselected'}`}
                  onClick={() => { handleNavClick(c.id); setIsNavOpen(false); }}
                >
                  <div className="nav-label">{c.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <EpubTocModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chapters={chapters}
        selectedIds={selectedChapterIds}
        onApply={handleApplySelection}
        onForceReprocess={handleForceReprocess}
      />
    </div>
  );
};
