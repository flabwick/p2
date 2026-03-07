import React from 'react';
import { ImageViewer } from './ImageViewer';
import { PdfViewer } from './PdfViewer';
import { EpubViewer } from './EpubViewer';

export * from './ImageViewer';
export * from './PdfViewer';
export * from './EpubViewer';
export * from './EpubProcessor';

export interface FileViewerProps {
  fileId: string;
  title: string;
  fileExtension?: string;
  className?: string;
  style?: React.CSSProperties;
  isEmbedded?: boolean;
  onCountChange?: (counts: { words: number; tokens: number }) => void;
}

/**
 * Generic FileViewer that selects the appropriate viewer component 
 * based on the file extension.
 */
export const FileViewer: React.FC<FileViewerProps> = ({ 
  fileId, 
  title, 
  fileExtension, 
  className,
  style,
  isEmbedded,
  onCountChange
}) => {
  const extension = fileExtension?.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
    return <ImageViewer fileId={fileId} title={title} className={className} style={style} isEmbedded={isEmbedded} />;
  }

  if (extension === 'pdf') {
    return <PdfViewer fileId={fileId} title={title} className={className} style={style} onCountChange={onCountChange} />;
  }

  if (extension === 'epub') {
    return <EpubViewer fileId={fileId} title={title} className={className} style={style} isEmbedded={isEmbedded} onCountChange={onCountChange} />;
  }

  return (
    <div className={`viewer-container viewer-fallback ${className || ''}`} style={{ 
      background: 'var(--paper-cream)', 
      padding: '20px', 
      border: 'var(--border-medium)',
      fontFamily: 'var(--font-mono)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      ...style
    }}>
      <p><strong>Name:</strong> {title}</p>
      <p><strong>ID:</strong> {fileId}</p>
      <p><strong>Type:</strong> {fileExtension?.toUpperCase() || 'Unknown'}</p>
      <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>
        No specialized viewer for this file type yet.
      </p>
    </div>
  );
};
