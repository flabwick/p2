import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useCanvasStore } from '../../../../features/pockets/store/canvasStore';
import { CanvasCard } from '../../../../features/canvas/components/CanvasCard';
import { CanvasBlock } from '../../../../features/canvas/components/CanvasBlock';
import { CanvasBlock as ICanvasBlock } from '../../../../../../shared/types/canvas';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import './CanvasViewer.css';

interface CanvasViewerProps {
  pocketId: string;
}

export const CanvasViewer: React.FC<CanvasViewerProps> = ({ pocketId }) => {
  const { 
    canvases, 
    fetchCanvases, 
    isLoading, 
    isInitialLoaded, 
    addBlock, 
    updateBlock, 
    deleteBlock, 
    deleteCard, 
    updateCard,
    reorderBlocks,
    moveBlock
  } = useCanvasStore();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [clonedBlocks, setClonedBlocks] = useState<Record<string, ICanvasBlock[]>>({});
  const initialContainerRef = useRef<string | null>(null);

  useEffect(() => {
    if (pocketId && !isInitialLoaded[pocketId]) {
      fetchCanvases(pocketId);
    }
  }, [pocketId, fetchCanvases, isInitialLoaded]);

  const activeCanvas = pocketId ? canvases[pocketId]?.[0] : null;

  // Sync local state when activeCanvas changes or when not dragging
  useEffect(() => {
    if (activeCanvas && !activeId) {
      const blocksMap: Record<string, ICanvasBlock[]> = {};
      activeCanvas.cards.forEach(card => {
        blocksMap[card.id] = card.blocks || [];
      });
      setClonedBlocks(blocksMap);
    }
  }, [activeCanvas, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string) => {
    if (clonedBlocks[id]) return id;
    return Object.keys(clonedBlocks).find((key) => 
      clonedBlocks[key].some((item) => item.id === id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    initialContainerRef.current = findContainer(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer) {
      setClonedBlocks((prev) => {
        const activeItems = prev[activeContainer] || [];
        const overItems = prev[overContainer] || [];

        const activeIndex = activeItems.findIndex((item) => item.id === active.id);
        const overIndex = overItems.findIndex((item) => item.id === overId);

        let newIndex;
        if (overId in prev) {
          // Dragging over an empty container
          newIndex = overItems.length;
        } else {
          const isBelowLastItem = over && overIndex === overItems.length - 1;
          const modifier = isBelowLastItem ? 1 : 0;
          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
        }

        return {
          ...prev,
          [activeContainer]: activeItems.filter((item) => item.id !== active.id),
          [overContainer]: [
            ...overItems.slice(0, newIndex),
            activeItems[activeIndex],
            ...overItems.slice(newIndex)
          ]
        };
      });
    } else {
      // Reorder within the same container during dragOver for smooth visual updates
      setClonedBlocks((prev) => {
        const items = prev[activeContainer];
        const activeIndex = items.findIndex((i) => i.id === active.id);
        const overIndex = items.findIndex((i) => i.id === overId);
        
        if (activeIndex !== overIndex && overIndex !== -1) {
          return {
            ...prev,
            [activeContainer]: arrayMove(items, activeIndex, overIndex)
          };
        }
        return prev;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId) {
      setActiveId(null);
      initialContainerRef.current = null;
      return;
    }

    const initialContainer = initialContainerRef.current;
    const overContainer = findContainer(active.id as string);

    if (initialContainer && overContainer) {
      const finalItems = clonedBlocks[overContainer];
      const finalIndex = finalItems.findIndex((item) => item.id === active.id);

      if (initialContainer !== overContainer) {
        await moveBlock(active.id as string, initialContainer, overContainer, finalIndex);
      } else {
        const sourceCard = activeCanvas?.cards.find(c => c.id === initialContainer);
        const oldIndex = sourceCard?.blocks.findIndex(b => b.id === active.id);
        
        if (oldIndex !== finalIndex && oldIndex !== undefined) {
          await reorderBlocks(overContainer, finalItems.map(i => i.id));
        }
      }
    }

    setActiveId(null);
    initialContainerRef.current = null;
  };

  const handleDragCancel = () => {
    if (activeCanvas) {
      const blocksMap: Record<string, ICanvasBlock[]> = {};
      activeCanvas.cards.forEach(card => {
        blocksMap[card.id] = card.blocks || [];
      });
      setClonedBlocks(blocksMap);
    }
    setActiveId(null);
    initialContainerRef.current = null;
  };

  const handleAddBlock = async (cardId: string, type: string) => {
    const content = type === 'markdown' ? '# New Markdown Block\n\n' : (type === 'text' ? '' : {});
    await addBlock(cardId, type, content);
  };

  const activeBlock = useMemo(() => {
    if (!activeId) return null;
    for (const cardId in clonedBlocks) {
      const block = clonedBlocks[cardId].find(b => b.id === activeId);
      if (block) return block;
    }
    return null;
  }, [activeId, clonedBlocks]);

  if (isLoading && (!pocketId || !isInitialLoaded[pocketId])) {
    return <div className="canvas-loading">Loading Canvas...</div>;
  }
  
  if (!activeCanvas) return <div className="canvas-empty">No canvas found for this pocket.</div>;

  return (
    <div className="canvas-workspace">
      <div className="canvas-content">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
        >
          <div className="canvas-list">
            {activeCanvas.cards.map((card) => (
              <CanvasCard 
                key={card.id} 
                card={card} 
                blocks={clonedBlocks[card.id] || []}
                onDeleteCard={() => deleteCard(card.id)}
                onUpdateCard={(updates) => updateCard(card.id, updates)}
                onAddBlock={handleAddBlock}
                onUpdateBlock={updateBlock}
                onDeleteBlock={deleteBlock}
              />
            ))}
          </div>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: '0.4',
                  },
                },
              }),
            }}
          >
            {activeId && activeBlock ? (
              <CanvasBlock
                block={activeBlock}
                onUpdate={() => {}}
                onDelete={() => {}}
                isDragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
