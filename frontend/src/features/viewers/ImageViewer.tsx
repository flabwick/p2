import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import '../editor/styles/Editor.css';
import './BaseViewer.css';
import './ImageViewer.css';

interface ImageViewerProps {
  fileId: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
  isEmbedded?: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  fileId, 
  title, 
  className, 
  style,
  isEmbedded 
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    let url: string | null = null;
    
    const fetchImage = async () => {
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
        setImageUrl(url);

        const img = new Image();
        img.onload = () => {
          setAspectRatio(img.naturalWidth / img.naturalHeight);
          setLoading(false);
        };
        img.src = url;
      } catch (err) {
        console.error('Error fetching image:', err);
        setLoading(false);
      }
    };

    fetchImage();
    
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileId]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.25));
  const handleResetZoom = () => setScale(1);

  return (
    <div 
      className={`viewer-container image-viewer-root ${isEmbedded ? 'desk-embedded' : ''} ${className || ''}`} 
      style={style}
    >
      {!loading && imageUrl && (
        <div className="image-zoom-controls">
          <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">−</button>
          <div className="zoom-divider" />
          <div 
            className="zoom-percentage" 
            onClick={handleResetZoom} 
            style={{ cursor: 'pointer' }}
            title="Reset Zoom"
          >
            {Math.round(scale * 100)}%
          </div>
          <div className="zoom-divider" />
          <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">+</button>
        </div>
      )}

      <div 
        className="viewer-workspace image-viewer-workspace"
        style={aspectRatio ? { 
          aspectRatio: `${aspectRatio}`, 
          height: 'auto',
          maxWidth: isEmbedded ? '75%' : '100%',
          margin: isEmbedded ? '0 auto' : '0'
        } : {
          width: isEmbedded ? '75%' : '100%',
          margin: isEmbedded ? '0 auto' : '0',
          height: isEmbedded ? '200px' : '400px'
        }}
      >
        <div className="image-container">
          {loading ? (
            <div className="viewer-loading">Loading image...</div>
          ) : imageUrl ? (
            <div 
              className="image-scroll-wrapper"
              onWheel={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  if (e.deltaY < 0) handleZoomIn();
                  else handleZoomOut();
                }
              }}
            >
              <img 
                src={imageUrl} 
                alt={title} 
                className={scale > 1 ? 'zoomed' : ''}
                style={{ 
                  transform: `scale(${scale})`, 
                  transformOrigin: 'center center',
                }}
                onClick={(e) => {
                  if (scale !== 1) handleResetZoom();
                }}
              />
            </div>
          ) : (
            <div className="viewer-error">Failed to load image</div>
          )}
        </div>
      </div>
    </div>
  );
};
