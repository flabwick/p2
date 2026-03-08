import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { CanvasBlock as ICanvasBlock } from '../../../../../shared/types/canvas';
import { TextBlock } from './blocks/TextBlock';
import { MarkdownBlock } from './blocks/MarkdownBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { ListBlock } from './blocks/ListBlock';
import { FileBlock } from './blocks/FileBlock';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CanvasBlockProps {
  block: ICanvasBlock;
  onUpdate: (content: any) => void;
  onDelete: () => void;
  isDragOverlay?: boolean;
}

const DragHandleIcon = () => (
  <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" style={{ opacity: 0.6 }}>
    <circle cx="2" cy="2" r="1.2" />
    <circle cx="2" cy="8" r="1.2" />
    <circle cx="2" cy="14" r="1.2" />
    <circle cx="8" cy="2" r="1.2" />
    <circle cx="8" cy="8" r="1.2" />
    <circle cx="8" cy="14" r="1.2" />
  </svg>
);

export const CanvasBlock: React.FC<CanvasBlockProps> = memo(({ block, onUpdate, onDelete, isDragOverlay }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(block.content);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: block.id, 
    disabled: isEditing || isDragOverlay 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  useEffect(() => {
    if (!isEditing) {
      setLocalContent(block.content);
    }
  }, [block.content, isEditing]);

  const debouncedUpdate = useCallback((content: any) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate(content);
    }, 1000);
  }, [onUpdate]);

  const handleChange = (newContent: any) => {
    setLocalContent(newContent);
    debouncedUpdate(newContent);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    onUpdate(localContent);
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'markdown':
        return <MarkdownBlock content={localContent} onChange={handleChange} />;
      case 'heading':
        return <HeadingBlock content={localContent} isEditing={isEditing} onChange={handleChange} onBlur={handleBlur} />;
      case 'image':
        return <ImageBlock content={localContent} isEditing={isEditing} onChange={handleChange} onBlur={handleBlur} />;
      case 'list':
        return <ListBlock content={localContent} isEditing={isEditing} onChange={handleChange} onBlur={handleBlur} />;
      case 'file':
      case 'file_path':
        return <FileBlock content={localContent} isEditing={isEditing} onChange={handleChange} onBlur={handleBlur} />;
      default:
        return <TextBlock content={localContent} isEditing={isEditing} onChange={handleChange} onBlur={handleBlur} />;
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`canvas-block type-${block.type} ${isDragging ? 'is-dragging' : ''} ${isDragOverlay ? 'is-drag-overlay' : ''} ${isEditing ? 'is-editing' : ''}`} 
      onClick={() => !isEditing && setIsEditing(true)}
    >
      <div 
        className="block-drag-handle" 
        {...attributes} 
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <DragHandleIcon />
      </div>
      <div className="block-content-wrapper">
        {renderBlockContent()}
      </div>
      {!isDragOverlay && (
        <button 
          className="block-delete-btn" 
          onClick={(e) => { e.stopPropagation(); onDelete(); }} 
          title="Delete Block"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      )}
    </div>
  );
});

CanvasBlock.displayName = 'CanvasBlock';
