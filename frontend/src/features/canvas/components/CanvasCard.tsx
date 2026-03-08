import React, { useState, useEffect, useRef } from 'react';
import { CanvasCard as ICanvasCard, CanvasBlock as ICanvasBlock } from '../../../../../shared/types/canvas';
import { CanvasBlock } from './CanvasBlock';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface CardProps {
  card: ICanvasCard;
  blocks: ICanvasBlock[];
  onDeleteCard: () => void;
  onUpdateCard: (updates: Partial<ICanvasCard>) => void;
  onAddBlock: (cardId: string, type: string) => void;
  onUpdateBlock: (blockId: string, content: any) => void;
  onDeleteBlock: (blockId: string) => void;
}

const RefreshIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const CanvasCard: React.FC<CardProps> = ({ card, blocks = [], onDeleteCard, onUpdateCard, onAddBlock, onUpdateBlock, onDeleteBlock }) => {
  const [localName, setLocalName] = useState(card.name);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef } = useDroppable({
    id: card.id,
  });

  useEffect(() => {
    setLocalName(card.name);
  }, [card.name]);

  const handleTitleBlur = () => {
    if (localName !== card.name) {
      onUpdateCard({ name: localName });
    }
  };

  const toggleFold = () => {
    onUpdateCard({ is_collapsed: !card.is_collapsed });
  };

  return (
    <div className={`canvas-card ${card.is_collapsed ? 'folded' : ''}`}>
      <div className="canvas-card-header">
        <div className="card-header-left">
          <button className="icon-btn small fold-toggle" onClick={toggleFold}>
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              className={`chevron-icon ${card.is_collapsed ? '' : 'expanded'}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className="card-title-container">
            <div className="card-title-wrapper">
              <input 
                ref={titleInputRef}
                className="card-title-input" 
                value={localName} 
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && titleInputRef.current?.blur()}
                spellCheck={false}
              />
              <span className="card-title-measure">{localName || ' '}</span>
            </div>
          </div>
        </div>
        <div className="card-actions">
          <button className="icon-btn small danger" onClick={onDeleteCard} title="Delete Card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      
      {!card.is_collapsed && (
        <>
          <div ref={setNodeRef} className="canvas-card-body">
            <SortableContext
              id={card.id}
              items={blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="blocks-container" style={{ minHeight: '40px' }}>
                {blocks.map((block) => (
                  <CanvasBlock 
                    key={block.id} 
                    block={block} 
                    onUpdate={(content) => onUpdateBlock(block.id, content)}
                    onDelete={() => onDeleteBlock(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
          <div className="canvas-card-footer">
            <button className="std-button primary square small refresh-btn" title="Refresh Card">
              <RefreshIcon />
            </button>
            <div className="card-footer-right">
              <button className="std-button ghost small add-block-btn" onClick={() => onAddBlock(card.id, 'markdown')}>
                <PlusIcon />
                <span>Add Block</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
