import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'
import { Canvas, CanvasCard, CanvasBlock } from '../../../../../shared/types/canvas'

interface CanvasState {
  canvases: Record<string, Canvas[]> // pocket_id -> canvases[]
  isLoading: boolean
  isInitialLoaded: Record<string, boolean>
  error: string | null
  fetchCanvases: (pocketId: string, silent?: boolean) => Promise<void>
  addCard: (canvasId: string, name: string) => Promise<CanvasCard | null>
  addBlock: (cardId: string, type: string, content: any) => Promise<void>
  addCardWithBlock: (canvasId: string, cardName: string, blockType: string, content: any) => Promise<void>
  updateBlock: (blockId: string, content: any) => Promise<void>
  deleteBlock: (blockId: string) => Promise<void>
  deleteCard: (cardId: string) => Promise<void>
  updateCard: (cardId: string, updates: Partial<CanvasCard>) => Promise<void>
  reorderCards: (canvasId: string, cardIds: string[]) => Promise<void>
  reorderBlocks: (cardId: string, blockIds: string[]) => Promise<void>
  moveBlock: (blockId: string, fromCardId: string, toCardId: string, newIndex: number) => Promise<void>
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvases: {},
  isLoading: false,
  isInitialLoaded: {},
  error: null,

  fetchCanvases: async (pocketId: string, silent = false) => {
    if (!silent) set({ isLoading: true, error: null })
    try {
      const { data: canvasesData, error: canvasesError } = await supabase
        .from('canvases')
        .select(`
          *,
          cards:canvas_cards(
            *,
            blocks:canvas_blocks(*)
          )
        `)
        .eq('pocket_id', pocketId)
        .order('created_at', { ascending: true })

      if (canvasesError) throw canvasesError

      const sortedCanvases = (canvasesData || []).map((canvas: any) => ({
        ...canvas,
        cards: (canvas.cards || [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((card: any) => ({
            ...card,
            blocks: (card.blocks || []).sort((a: any, b: any) => a.order - b.order)
          }))
      }))

      set(state => ({
        canvases: { ...state.canvases, [pocketId]: sortedCanvases },
        isLoading: false,
        isInitialLoaded: { ...state.isInitialLoaded, [pocketId]: true }
      }))
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  addCard: async (canvasId: string, name: string) => {
    const { data: lastCard } = await supabase
      .from('canvas_cards')
      .select('order')
      .eq('canvas_id', canvasId)
      .order('order', { ascending: false })
      .limit(1)
      .single()

    const newOrder = (lastCard?.order ?? -1) + 1
    const { data, error } = await supabase
      .from('canvas_cards')
      .insert([{ canvas_id: canvasId, name, order: newOrder }])
      .select()
      .single()

    if (error) throw error
    
    const pocketId = Object.keys(get().canvases).find(pid => 
      get().canvases[pid].some(c => c.id === canvasId)
    )
    if (pocketId) await get().fetchCanvases(pocketId, true)
    
    return data as CanvasCard;
  },

  addBlock: async (cardId: string, type: string, content: any) => {
    const { data: lastBlock } = await supabase
      .from('canvas_blocks')
      .select('order')
      .eq('card_id', cardId)
      .order('order', { ascending: false })
      .limit(1)
      .single()

    const newOrder = (lastBlock?.order ?? -1) + 1
    const { error } = await supabase
      .from('canvas_blocks')
      .insert([{ card_id: cardId, type, content, order: newOrder }])

    if (error) throw error
    const pocketId = Object.keys(get().canvases).find(pid => 
      get().canvases[pid].some(c => c.cards.some(card => card.id === cardId))
    )
    if (pocketId) get().fetchCanvases(pocketId, true)
  },

  addCardWithBlock: async (canvasId: string, cardName: string, blockType: string, content: any) => {
    const newCard = await get().addCard(canvasId, cardName);
    if (newCard) {
      await get().addBlock(newCard.id, blockType, content);
    }
  },

  updateBlock: async (blockId: string, content: any) => {
    // Optimistic local update
    const pocketId = Object.keys(get().canvases).find(pid => 
      get().canvases[pid].some(c => c.cards.some(card => card.blocks.some(b => b.id === blockId)))
    )
    
    if (pocketId) {
      const newCanvases = [...get().canvases[pocketId]];
      newCanvases.forEach(canvas => {
        canvas.cards.forEach(card => {
          card.blocks = card.blocks.map(b => b.id === blockId ? { ...b, content } : b);
        });
      });
      set(state => ({ canvases: { ...state.canvases, [pocketId]: newCanvases } }));
    }

    const { error } = await supabase
      .from('canvas_blocks')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', blockId)

    if (error) throw error
  },

  deleteBlock: async (blockId: string) => {
    const { error } = await supabase
      .from('canvas_blocks')
      .delete()
      .eq('id', blockId)

    if (error) throw error
    const pocketId = Object.keys(get().canvases).find(pid => 
      get().canvases[pid].some(c => c.cards.some(card => card.blocks.some(b => b.id === blockId)))
    )
    if (pocketId) get().fetchCanvases(pocketId, true)
  },

  deleteCard: async (cardId: string) => {
    const { error } = await supabase
      .from('canvas_cards')
      .delete()
      .eq('id', cardId)

    if (error) throw error
    const pocketId = Object.keys(get().canvases).find(pid => 
      get().canvases[pid].some(c => c.cards.some(card => card.id === cardId))
    )
    if (pocketId) get().fetchCanvases(pocketId, true)
  },

  updateCard: async (cardId: string, updates: Partial<CanvasCard>) => {
    // Optimistic update
    const pocketId = Object.keys(get().canvases).find(pid => 
      get().canvases[pid].some(c => c.cards.some(card => card.id === cardId))
    )
    
    if (pocketId) {
      const newCanvases = [...get().canvases[pocketId]];
      newCanvases.forEach(canvas => {
        canvas.cards = canvas.cards.map(c => c.id === cardId ? { ...c, ...updates } : c);
      });
      set(state => ({ canvases: { ...state.canvases, [pocketId]: newCanvases } }));
    }

    const { error } = await supabase
      .from('canvas_cards')
      .update(updates)
      .eq('id', cardId)

    if (error) throw error
  },

  reorderCards: async (canvasId: string, cardIds: string[]) => {
    const pocketId = Object.keys(get().canvases).find(pid => 
      get().canvases[pid].some(c => c.id === canvasId)
    )

    if (pocketId) {
      const newCanvases = get().canvases[pocketId].map(c => {
        if (c.id === canvasId) {
          const newCards = cardIds.map((id, index) => {
            const card = c.cards.find(card => card.id === id);
            return card ? { ...card, order: index } : null;
          }).filter(Boolean) as CanvasCard[];
          return { ...c, cards: newCards };
        }
        return c;
      });
      set(state => ({ canvases: { ...state.canvases, [pocketId]: newCanvases } }));
    }

    for (let i = 0; i < cardIds.length; i++) {
      await supabase
        .from('canvas_cards')
        .update({ order: i })
        .eq('id', cardIds[i])
    }
  },

  reorderBlocks: async (cardId: string, blockIds: string[]) => {
    const pocketId = Object.keys(get().canvases).find(pid => 
      get().canvases[pid].some(c => c.cards.some(card => card.id === cardId))
    )

    if (pocketId) {
      const newCanvases = get().canvases[pocketId].map(c => {
        const cardIndex = c.cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
          const newBlocks = blockIds.map((id, index) => {
            const block = c.cards[cardIndex].blocks.find(b => b.id === id);
            return block ? { ...block, order: index } : null;
          }).filter(Boolean) as CanvasBlock[];
          
          const newCards = [...c.cards];
          newCards[cardIndex] = { ...newCards[cardIndex], blocks: newBlocks };
          return { ...c, cards: newCards };
        }
        return c;
      });
      set(state => ({ canvases: { ...state.canvases, [pocketId]: newCanvases } }));
    }

    for (let i = 0; i < blockIds.length; i++) {
      await supabase
        .from('canvas_blocks')
        .update({ order: i })
        .eq('id', blockIds[i])
    }
  },

  moveBlock: async (blockId: string, fromCardId: string, toCardId: string, newIndex: number) => {
    const pocketId = Object.keys(get().canvases).find(pid => 
      get().canvases[pid].some(c => c.cards.some(card => card.id === fromCardId))
    )

    if (pocketId) {
      const newCanvases = get().canvases[pocketId].map(c => {
        const fromCardIndex = c.cards.findIndex(card => card.id === fromCardId);
        const toCardIndex = c.cards.findIndex(card => card.id === toCardId);
        
        if (fromCardIndex !== -1 && toCardIndex !== -1) {
          const newCards = [...c.cards];
          const block = newCards[fromCardIndex].blocks.find(b => b.id === blockId);
          
          if (block) {
            // Remove from old card and re-order
            const filteredBlocks = newCards[fromCardIndex].blocks.filter(b => b.id !== blockId);
            newCards[fromCardIndex] = {
              ...newCards[fromCardIndex],
              blocks: filteredBlocks.map((b, idx) => ({ ...b, order: idx }))
            };
            
            // Add to new card
            const newBlocks = [...newCards[toCardIndex].blocks];
            newBlocks.splice(newIndex, 0, { ...block, card_id: toCardId });
            
            // Re-order new card blocks
            newCards[toCardIndex] = {
              ...newCards[toCardIndex],
              blocks: newBlocks.map((b, idx) => ({ ...b, order: idx }))
            };
            
            return { ...c, cards: newCards };
          }
        }
        return c;
      });
      set(state => ({ canvases: { ...state.canvases, [pocketId]: newCanvases } }));

      // Persist to Supabase
      // 1. Update the moved block's card_id
      await supabase
        .from('canvas_blocks')
        .update({ card_id: toCardId })
        .eq('id', blockId);

      // 2. Get the updated cards from the local state we just set
      const updatedCanvases = get().canvases[pocketId];
      const fromCard = updatedCanvases.flatMap(c => c.cards).find(card => card.id === fromCardId);
      const toCard = updatedCanvases.flatMap(c => c.cards).find(card => card.id === toCardId);

      // 3. Batch update orders for source card
      if (fromCard) {
        for (let i = 0; i < fromCard.blocks.length; i++) {
          await supabase
            .from('canvas_blocks')
            .update({ order: i })
            .eq('id', fromCard.blocks[i].id);
        }
      }

      // 4. Batch update orders for target card
      if (toCard) {
        for (let i = 0; i < toCard.blocks.length; i++) {
          await supabase
            .from('canvas_blocks')
            .update({ order: i })
            .eq('id', toCard.blocks[i].id);
        }
      }
    }
  }
}))
