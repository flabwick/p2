import { useState, ReactNode } from 'react';
import Button from '../ui/Button';

// Block types for interactive form elements
type BlockType = 'text' | 'text-input' | 'select' | 'multi-select' | 'date' | 'checkbox' | 'code' | 'chart' | 'custom';

interface Block {
  id: string;
  type: BlockType;
  label?: string;
  value?: string | string[] | boolean | number;
  placeholder?: string;
  options?: { label: string; value: string }[];
  isEditable: boolean;
  isPending?: boolean; // For operations from AI
}

// A Card contains blocks and can be nested
interface Card {
  id: string;
  blocks: Block[];
  subCards?: Card[];
  metadata?: Record<string, any>;
}

// Feed state
interface FeedState {
  cards: Card[];
  role: string; // Instructions for how feed behaves
  isDirty: boolean; // Whether changes haven't been synced
}

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// Block component - renders different types of interactive form elements
const BlockComponent = ({ block, onChange }: { block: Block; onChange: (block: Block) => void }) => {
  const renderBlock = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="feed-block-text">
            {block.value}
          </div>
        );
      case 'text-input':
        return (
          <input
            type="text"
            value={block.value as string}
            onChange={(e) => onChange({ ...block, value: e.target.value })}
            placeholder={block.placeholder}
            className="feed-block-input"
            disabled={block.isPending}
          />
        );
      case 'select':
        return (
          <select
            value={block.value as string}
            onChange={(e) => onChange({ ...block, value: e.target.value })}
            className="feed-block-select"
            disabled={block.isPending}
          >
            {block.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'multi-select':
        return (
          <div className="feed-block-checkbox-group">
            {block.options?.map((opt) => (
              <label key={opt.value} className="feed-block-checkbox-label">
                <input
                  type="checkbox"
                  checked={(block.value as string[])?.includes(opt.value)}
                  onChange={(e) => {
                    const values = block.value as string[] || [];
                    const newValues = e.target.checked
                      ? [...values, opt.value]
                      : values.filter(v => v !== opt.value);
                    onChange({ ...block, value: newValues });
                  }}
                  disabled={block.isPending}
                />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={block.value as boolean}
            onChange={(e) => onChange({ ...block, value: e.target.checked })}
            className="feed-block-checkbox"
            disabled={block.isPending}
          />
        );
      case 'code':
        return (
          <pre className="feed-block-code">
            <code>{block.value}</code>
          </pre>
        );
      default:
        return <div className="feed-block-unsupported">Block type '{block.type}' not supported</div>;
    }
  };

  return (
    <div className={`feed-block feed-block-${block.type} ${block.isPending ? 'pending' : ''}`}>
      {block.label && <label className="feed-block-label">{block.label}</label>}
      {renderBlock()}
      {block.isPending && <div className="feed-block-spinner" />}
    </div>
  );
};

// Card component - contains blocks and can have sub-cards
const CardComponent = ({ card, onCardChange, depth = 0 }: { card: Card; onCardChange: (card: Card) => void; depth?: number }) => {
  const handleBlockChange = (updatedBlock: Block) => {
    const newBlocks = card.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b);
    onCardChange({ ...card, blocks: newBlocks });
  };

  const handleDeleteCard = () => {
    onCardChange({ ...card, blocks: [] }); // Mark for deletion
  };

  return (
    <div className={`feed-card depth-${depth}`}>
      <div className="feed-card-blocks">
        {card.blocks.map((block) => (
          <BlockComponent key={block.id} block={block} onChange={handleBlockChange} />
        ))}
      </div>

      {card.subCards && card.subCards.length > 0 && depth < 2 && (
        <div className="feed-card-nested">
          {card.subCards.map((subCard) => (
            <CardComponent
              key={subCard.id}
              card={subCard}
              onCardChange={(updated) => {
                const newSubCards = card.subCards!.map(c => c.id === subCard.id ? updated : c);
                onCardChange({ ...card, subCards: newSubCards });
              }}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {depth === 0 && (
        <div className="feed-card-delete">
          <Button
            className="square small danger"
            title="Delete card"
            onClick={handleDeleteCard}
          >
            <DeleteIcon />
          </Button>
        </div>
      )}
    </div>
  );
};

// Mock initial feed state with form-like content
const mockFeedState: FeedState = {
  role: 'default',
  isDirty: false,
  cards: [
    {
      id: 'card-1',
      blocks: [
        {
          id: 'block-1-1',
          type: 'text',
          value: 'What topic would you like to explore?',
          isEditable: false,
        },
        {
          id: 'block-1-2',
          type: 'text-input',
          label: 'Topic',
          placeholder: 'Enter a topic...',
          value: '',
          isEditable: true,
        },
        {
          id: 'block-1-3',
          type: 'text',
          value: 'Select difficulty level:',
          isEditable: false,
        },
        {
          id: 'block-1-4',
          type: 'select',
          label: 'Difficulty',
          value: 'intermediate',
          options: [
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
          ],
          isEditable: true,
        },
      ],
    },
    {
      id: 'card-2',
      blocks: [
        {
          id: 'block-2-1',
          type: 'text',
          value: 'Margin Enforcement Test Card',
          isEditable: false,
        },
        {
          id: 'block-2-2',
          type: 'code',
          label: 'Current CSS State',
          value: '.main-panel-body-wrapper {\n  padding: 0 var(--space-xl);\n}',
          isEditable: false,
        },
      ],
    },
    {
      id: 'card-3',
      blocks: [
        {
          id: 'block-3-1',
          type: 'text',
          value: 'Please confirm your preferences:',
          isEditable: false,
        },
        {
          id: 'block-3-2',
          type: 'multi-select',
          label: 'Preferences',
          value: ['dark-mode'],
          options: [
            { label: 'Dark Mode', value: 'dark-mode' },
            { label: 'Notifications', value: 'notifications' },
            { label: 'Auto-save', value: 'auto-save' },
          ],
          isEditable: true,
        },
      ],
    },
    {
      id: 'card-4',
      blocks: [
        {
          id: 'block-4-1',
          type: 'text',
          value: 'This is a long card to test scrolling and margin enforcement. The horizontal padding var(--space-xl) should be clearly visible on the sides of this card.',
          isEditable: false,
        },
      ],
    },
  ],
};

export interface FeedViewerHandle {
  feedState: FeedState;
  isDirty: boolean;
  onRefresh: () => Promise<void>;
}

const FeedViewer = ({ pocketId, pocketName, onFeedStateChange }: { pocketId: string; pocketName: string; onFeedStateChange: (state: FeedState, isDirty: boolean) => void }) => {
  const [feedState, setFeedState] = useState<FeedState>(mockFeedState);
  const [isDirty, setIsDirty] = useState(false);

  const handleCardChange = (updatedCard: Card, cardIndex: number) => {
    const newCards = feedState.cards.map((c, i) => i === cardIndex ? updatedCard : c);
    const newState = { ...feedState, cards: newCards };
    setFeedState(newState);
    setIsDirty(true);
    onFeedStateChange(newState, true);
  };

  return (
    <div className="feed-viewer">
      <div className="feed-cards-container">
        {feedState.cards.map((card, index) => (
          <CardComponent
            key={card.id}
            card={card}
            onCardChange={(updated) => handleCardChange(updated, index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FeedViewer;
