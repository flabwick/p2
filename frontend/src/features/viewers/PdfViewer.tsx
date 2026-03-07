import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { countWords, estimateTokens } from '@shared/lib/counting';
import '../editor/styles/Editor.css';
import './BaseViewer.css';
import './PdfViewer.css';

interface PdfViewerProps {
  fileId: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
  onCountChange?: (counts: { words: number; tokens: number }) => void;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ fileId, title, className, style, onCountChange }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url: string | null = null;
    let isMounted = true;
    
    const fetchPdf = async () => {
      setLoading(true);
      try {
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select('storage_path')
          .eq('id', fileId)
          .maybeSingle();

        if (fileError) throw fileError;
        if (!fileData) return;

        const cleanPath = fileData.storage_path.startsWith('vaults/') 
          ? fileData.storage_path.replace('vaults/', '') 
          : fileData.storage_path;

        const { data, error: downloadError } = await supabase.storage
          .from('vaults')
          .download(cleanPath);

        if (downloadError) throw downloadError;

        if (!isMounted) return;

        url = URL.createObjectURL(data);
        setPdfUrl(url);

        // Extract text for word/token counting
        if (onCountChange) {
          try {
            // Load PDF.js from CDN if not already loaded
            if (!window.pdfjsLib) {
              await new Promise<void>((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load PDF.js'));
                document.head.appendChild(script);
              });
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }

            const arrayBuffer = await data.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += pageText + '\n';
            }

            if (isMounted) {
              onCountChange({
                words: countWords(fullText),
                tokens: estimateTokens(fullText)
              });
            }
          } catch (textErr) {
            console.error('Error extracting PDF text:', textErr);
          }
        }
      } catch (err) {
        console.error('Error fetching PDF:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPdf();
    
    return () => {
      isMounted = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileId, onCountChange]);

  const isMainView = className?.includes('main-panel-view');

  return (
    <div 
      className={`viewer-container pdf-viewer-root ${className || ''}`} 
      style={{ 
        ...style, 
        height: isMainView ? '100%' : 'auto',
        display: isMainView ? 'flex' : 'block',
        background: 'transparent',
        padding: 0,
        margin: 0
      }}
    >
      <div 
        className="viewer-workspace pdf-viewer-workspace"
        style={!isMainView ? { 
          aspectRatio: '1 / 1.265', 
          height: 'auto',
          border: 'none',
          boxShadow: 'none',
          background: 'transparent',
          margin: 0,
          flex: 'none'
        } : {}}
      >
        <div className="pdf-container" style={!isMainView ? { height: '100%', width: '100%', margin: 0, padding: 0 } : {}}>
          {loading ? (
            <div className="viewer-loading">Loading PDF...</div>
          ) : pdfUrl ? (
            <iframe 
              src={`${pdfUrl}#view=Fit`} 
              title={title} 
              className="pdf-iframe"
              style={!isMainView ? { display: 'block', margin: 0, padding: 0 } : {}}
            />
          ) : (
            <div className="viewer-error">Failed to load PDF</div>
          )}
        </div>
      </div>
    </div>
  );
};
