import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Desk, FileCard, DeskState as IDeskState } from '@/shared/types/desk';
import { arrayMove } from '@dnd-kit/sortable';
import { useVaultStore } from '@/features/vault/store/vaultStore';

interface DeskStore {
  desks: Record<string, Desk>; // pocketId -> Desk
  isLoading: boolean;
  error: string | null;
  isAddPopupVisible: boolean;

  fetchDesk: (pocketId: string) => Promise<Desk | null>;
  subscribeToDesk: (pocketId: string) => () => void;
  addFileCard: (pocketId: string, fileId: string, name: string, type: 'file' | 'link', mime_type?: string, size?: number, content?: string, index?: number) => Promise<void>;
  removeFileCard: (pocketId: string, cardId: string) => Promise<void>;
  updateFileCard: (pocketId: string, cardId: string, updates: Partial<FileCard>) => Promise<void>;
  reorderCards: (pocketId: string, activeId: string, overId: string) => Promise<void>;
  moveCard: (pocketId: string, cardId: string, direction: 'up' | 'down') => Promise<void>;
  toggleCard: (pocketId: string, cardId: string, field: 'is_folded' | 'is_in_context' | 'is_liked' | 'is_hidden') => Promise<void>;
  setIsAddPopupVisible: (visible: boolean) => void;
}

// Track timestamps to avoid race conditions with realtime payloads
const lastUpdatedAt: Record<string, number> = {};

export const useDeskStore = create<DeskStore>((set, get) => ({
  desks: {},
  isLoading: false,
  error: null,
  isAddPopupVisible: false,

  fetchDesk: async (pocketId: string) => {
    console.log(`[DeskStore] fetchDesk called for pocket: ${pocketId}`);
    set({ isLoading: true, error: null });
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('desks')
        .select('*')
        .eq('pocket_id', pocketId)
        .maybeSingle();

      if (fetchError) {
        console.error(`[DeskStore] fetchDesk error for pocket ${pocketId}:`, fetchError);
        throw fetchError;
      }
      
      if (existing) {
        const desk = existing as Desk;
        console.log(`[DeskStore] Found existing desk for pocket ${pocketId}:`, desk.id);
        if (!desk.feed_state || typeof desk.feed_state !== 'object' || !('items' in (desk.feed_state as any))) {
          console.warn(`[DeskStore] Desk ${desk.id} had invalid feed_state, initializing...`);
          desk.feed_state = { items: [] };
        }
        set(state => ({ desks: { ...state.desks, [pocketId]: desk }, isLoading: false }));
        return desk;
      }

      console.log(`[DeskStore] No desk found for pocket ${pocketId}, checking if pocket exists...`);
      const { data: pocket, error: pocketError } = await supabase
        .from('pockets')
        .select('id')
        .eq('id', pocketId)
        .maybeSingle();

      if (pocketError) {
        console.error(`[DeskStore] Pocket check error for ${pocketId}:`, pocketError);
        throw pocketError;
      }

      if (!pocket) {
        console.warn(`[DeskStore] Pocket ${pocketId} DOES NOT EXIST. Creating virtual desk.`);
        const virtualDesk: Desk = {
          id: 'virtual-' + pocketId,
          pocket_id: pocketId,
          name: 'Virtual Desk',
          feed_state: { items: [] },
          created_at: new Date().toISOString()
        };
        set(state => ({ desks: { ...state.desks, [pocketId]: virtualDesk }, isLoading: false }));
        return virtualDesk;
      }

      console.log(`[DeskStore] Pocket ${pocketId} exists, creating new desk record...`);
      const { data: created, error: createError } = await supabase
        .from('desks')
        .insert([{ pocket_id: pocketId, name: 'Main Desk', feed_state: { items: [] } }])
        .select()
        .maybeSingle();

      if (createError) {
        if (createError.code === '23505') {
          console.log(`[DeskStore] Desk for pocket ${pocketId} was just created by another process, retrying fetch...`);
          const { data: retryData, error: retryError } = await supabase
            .from('desks')
            .select('*')
            .eq('pocket_id', pocketId)
            .maybeSingle();
          if (retryError) throw retryError;
          if (retryData) {
            const desk = retryData as Desk;
            set(state => ({ desks: { ...state.desks, [pocketId]: desk }, isLoading: false }));
            return desk;
          }
        }
        console.error(`[DeskStore] Desk creation failed for pocket ${pocketId}:`, createError);
        throw createError;
      }

      const desk = created as Desk;
      console.log(`[DeskStore] Successfully created desk ${desk.id} for pocket ${pocketId}`);
      set(state => ({ desks: { ...state.desks, [pocketId]: desk }, isLoading: false }));
      return desk;

    } catch (err: any) {
      console.error('[DeskStore] fetchDesk failed:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  subscribeToDesk: (pocketId: string) => {
    console.log(`[DeskStore] Subscribing to desk changes for pocket: ${pocketId}`);
    const channel = supabase
      .channel(`desk-changes-${pocketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'desks',
          filter: `pocket_id=eq.${pocketId}`
        },
        (payload) => {
          const remoteTs = new Date(payload.new.updated_at || Date.now()).getTime();
          const localTs = lastUpdatedAt[pocketId] || 0;

          console.log(`[DeskStore] Realtime update received for pocket ${pocketId}. Remote TS: ${remoteTs}, Local TS: ${localTs}`);

          // Only update if remote change is fresher than our last local action
          if (remoteTs > localTs + 500) {
            const updatedDesk = payload.new as Desk;
            console.log(`[DeskStore] Applying remote update for desk ${updatedDesk.id}`);
            set(state => ({
              desks: { ...state.desks, [pocketId]: updatedDesk }
            }));
          } else {
            console.log(`[DeskStore] Skipping stale or local realtime update for pocket ${pocketId}`);
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`[DeskStore] Unsubscribing from desk changes for pocket: ${pocketId}`);
      supabase.removeChannel(channel);
    };
  },

  addFileCard: async (pocketId, fileId, name, type, mime_type, size, content, index) => {
    console.log(`[DeskStore] addFileCard: ${name} to pocket ${pocketId}. Has content: ${!!content}, Index: ${index}`);
    const newCardId = crypto.randomUUID();
    let updatedFeedState: IDeskState | null = null;
    let deskId: string | null = null;

    const currentDesk = get().desks[pocketId];
    
    // 1. Ensure a real pocket and desk exist (Promotion logic)
    if (!currentDesk || currentDesk.id.startsWith('virtual-')) {
      console.warn(`[DeskStore] Promoting virtual/missing desk for ${pocketId} to real...`);
      
      const { data: pocket } = await supabase
        .from('pockets')
        .select('id')
        .eq('id', pocketId)
        .maybeSingle();
      
      let realPocketId = pocketId;
      
      if (!pocket) {
        console.log(`[DeskStore] Pocket ${pocketId} not found. Creating it...`);
        const { data: newPocket } = await supabase
          .from('pockets')
          .insert([{ id: pocketId, name: 'Recovered Pocket', is_inbox: true }])
          .select()
          .maybeSingle();
        if (newPocket) realPocketId = newPocket.id;
      }

      const { data: existingDesk } = await supabase
        .from('desks')
        .select('*')
        .eq('pocket_id', realPocketId)
        .maybeSingle();
      
      let finalDesk: Desk | null = existingDesk as Desk;

      if (!existingDesk) {
        const { data: createdDesk } = await supabase
          .from('desks')
          .insert([{ pocket_id: realPocketId, name: 'Main Desk', feed_state: { items: [] } }])
          .select()
          .maybeSingle();
        finalDesk = createdDesk as Desk;
      }

      if (finalDesk) {
        console.log(`[DeskStore] Desk promoted to real ID: ${finalDesk.id}`);
        set(state => ({
          desks: { ...state.desks, [pocketId]: finalDesk! }
        }));
      }
    }

    // 2. Standard Addition Logic
    const vaultFiles = (useVaultStore as any).getState().files;
    const file = vaultFiles.find((f: any) => f.id === fileId);
    const isOnShelf = file?.is_on_shelf || false;
    const isInLibrary = file ? (!!file.folder_id || !file.is_on_desk) : false;

    set(state => {
      const desk = state.desks[pocketId];
      if (!desk) {
        console.error(`[DeskStore] No desk found in state for pocket ${pocketId} even after promotion!`);
        return state;
      }
      deskId = desk.id;
      
      const newCard: FileCard = {
        id: newCardId, 
        file_id: fileId, 
        name, 
        type, 
        mime_type, 
        size,
        content,
        is_liked: isOnShelf || isInLibrary, // Sync with vault status
        order: index !== undefined ? index : desk.feed_state.items.length
      };

      const newItems = [...desk.feed_state.items];
      if (index !== undefined) {
        newItems.splice(index, 0, newCard);
      } else {
        newItems.push(newCard);
      }

      // Normalize order
      const normalizedItems = newItems.map((item, idx) => ({ ...item, order: idx }));
      
      updatedFeedState = { items: normalizedItems };
      lastUpdatedAt[pocketId] = Date.now();
      console.log(`[DeskStore] Local state updated with new card. Desk ID: ${deskId}`);
      return {
        desks: { ...state.desks, [pocketId]: { ...desk, feed_state: updatedFeedState } }
      };
    });

    // 3. Persist to DB
    if (deskId && !deskId.startsWith('virtual-') && updatedFeedState) {
      console.log(`[DeskStore] Persisting new card to DB for desk ${deskId}...`);
      const { error } = await supabase.from('desks').update({ 
        feed_state: updatedFeedState,
        updated_at: new Date().toISOString()
      }).eq('id', deskId);
      
      if (error) {
        console.error(`[DeskStore] DB update failed for desk ${deskId}:`, error);
      } else {
        console.log(`[DeskStore] DB update successful for desk ${deskId}`);
      }
    }
  },

  removeFileCard: async (pocketId, cardId) => {
    let updatedFeedState: IDeskState | null = null;
    let deskId: string | null = null;

    set(state => {
      const desk = state.desks[pocketId];
      if (!desk) return state;
      deskId = desk.id;
      const newItems = desk.feed_state.items
        .filter(item => item.id !== cardId)
        .map((item, index) => ({ ...item, order: index }));
      updatedFeedState = { items: newItems };
      lastUpdatedAt[pocketId] = Date.now();
      return {
        desks: { ...state.desks, [pocketId]: { ...desk, feed_state: updatedFeedState } }
      };
    });

    if (deskId && !deskId.startsWith('virtual-') && updatedFeedState) {
      await supabase.from('desks').update({ 
        feed_state: updatedFeedState,
        updated_at: new Date().toISOString()
      }).eq('id', deskId);
    }
  },

  updateFileCard: async (pocketId, cardId, updates) => {
    console.log(`[DeskStore] updateFileCard for pocket ${pocketId}, card ${cardId}. Updates:`, updates);
    let updatedFeedState: IDeskState | null = null;
    let deskId: string | null = null;

    set(state => {
      const desk = state.desks[pocketId];
      if (!desk) {
        console.error(`[DeskStore] updateFileCard: No desk found in state for pocket ${pocketId}`);
        return state;
      }
      deskId = desk.id;
      const newItems = desk.feed_state.items.map(item => 
        item.id === cardId ? { ...item, ...updates } : item
      );
      updatedFeedState = { items: newItems };
      lastUpdatedAt[pocketId] = Date.now();
      console.log(`[DeskStore] Local state updated for desk ${deskId}.`);
      return {
        desks: { ...state.desks, [pocketId]: { ...desk, feed_state: updatedFeedState } }
      };
    });

    if (deskId && !deskId.startsWith('virtual-') && updatedFeedState) {
      console.log(`[DeskStore] Persisting updated feed_state to DB for desk ${deskId}...`);
      const { error } = await supabase.from('desks').update({ 
        feed_state: updatedFeedState,
        updated_at: new Date().toISOString()
      }).eq('id', deskId);
      
      if (error) {
        console.error(`[DeskStore] DB update failed for desk ${deskId}:`, error);
      } else {
        console.log(`[DeskStore] DB update successful for desk ${deskId}`);
      }
    }
  },

  reorderCards: async (pocketId, activeId, overId) => {
    let updatedFeedState: IDeskState | null = null;
    let deskId: string | null = null;

    set(state => {
      const desk = state.desks[pocketId];
      if (!desk) return state;
      deskId = desk.id;
      const items = desk.feed_state.items;
      const oldIndex = items.findIndex(item => item.id === activeId);
      const newIndex = items.findIndex(item => item.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      const reorderedItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index
      }));
      updatedFeedState = { items: reorderedItems };
      lastUpdatedAt[pocketId] = Date.now();
      return {
        desks: { ...state.desks, [pocketId]: { ...desk, feed_state: updatedFeedState } }
      };
    });

    if (deskId && !deskId.startsWith('virtual-') && updatedFeedState) {
      await supabase.from('desks').update({ 
        feed_state: updatedFeedState,
        updated_at: new Date().toISOString()
      }).eq('id', deskId);
    }
  },

  moveCard: async (pocketId, cardId, direction) => {
    let updatedFeedState: IDeskState | null = null;
    let deskId: string | null = null;

    set(state => {
      const desk = state.desks[pocketId];
      if (!desk) return state;
      deskId = desk.id;
      const items = [...desk.feed_state.items];
      const index = items.findIndex(item => item.id === cardId);
      if (index === -1) return state;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return state;

      const reorderedItems = arrayMove(items, index, targetIndex).map((item, idx) => ({
        ...item,
        order: idx
      }));
      updatedFeedState = { items: reorderedItems };
      lastUpdatedAt[pocketId] = Date.now();
      return {
        desks: { ...state.desks, [pocketId]: { ...desk, feed_state: updatedFeedState } }
      };
    });

    if (deskId && !deskId.startsWith('virtual-') && updatedFeedState) {
      await supabase.from('desks').update({ 
        feed_state: updatedFeedState,
        updated_at: new Date().toISOString()
      }).eq('id', deskId);
    }
  },

  toggleCard: async (pocketId, cardId, field) => {
    let updatedFeedState: IDeskState | null = null;
    let deskId: string | null = null;

    set(state => {
      const desk = state.desks[pocketId];
      if (!desk) return state;
      deskId = desk.id;
      const newItems = desk.feed_state.items.map(item => 
        item.id === cardId ? { ...item, [field]: !item[field] } : item
      );
      updatedFeedState = { items: newItems };
      lastUpdatedAt[pocketId] = Date.now();
      return {
        desks: { ...state.desks, [pocketId]: { ...desk, feed_state: updatedFeedState } }
      };
    });

    if (deskId && !deskId.startsWith('virtual-') && updatedFeedState) {
      await supabase.from('desks').update({ 
        feed_state: updatedFeedState,
        updated_at: new Date().toISOString()
      }).eq('id', deskId);
    }
  },

  setIsAddPopupVisible: (visible: boolean) => {
    set({ isAddPopupVisible: visible });
  }
}));
