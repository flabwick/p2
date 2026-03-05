import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import '../editor/styles/Editor.css';
import './BaseViewer.css';
import './PdfViewer.css';

interface PdfViewerProps {
  fileId: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ fileId, title, className, style }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url: string | null = null;
    
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

        url = URL.createObjectURL(data);
        setPdfUrl(url);
      } catch (err) {
        console.error('Error fetching PDF:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();
    
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileId]);

  return (
    <div className={`viewer-container pdf-viewer-root ${className || ''}`} style={style}>
      <div className="viewer-workspace pdf-viewer-workspace">
        <div className="pdf-container">
          {loading ? (
            <div className="viewer-loading">Loading PDF...</div>
          ) : pdfUrl ? (
            <iframe 
              src={`${pdfUrl}#view=Fit`} 
              title={title} 
              className="pdf-iframe"
            />
          ) : (
            <div className="viewer-error">Failed to load PDF</div>
          )}
        </div>
      </div>
    </div>
  );
};
