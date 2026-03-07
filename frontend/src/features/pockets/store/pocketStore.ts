import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useTabStore } from '../../tabs/store/tabStore';

export interface Pocket {
  id: string;
  name: string;
  description?: string;
  owner_id?: string;
  folder_id?: string;
  is_inbox: boolean;
  is_on_shelf: boolean;
  is_on_desk: boolean;
  color?: string;
  icon?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface PocketState {
  pockets: Pocket[];
  isLoading: boolean;
  error: string | null;

  fetchPockets: () => Promise<void>;
  createPocket: (name: string, description?: string, isOnShelf?: boolean, isOnDesk?: boolean, isInbox?: boolean) => Promise<Pocket | null>;
  deletePocket: (id: string) => Promise<void>;
}

export const usePocketStore = create<PocketState>((set, get) => ({
  pockets: [],
  isLoading: false,
  error: null,

  fetchPockets: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('pockets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ pockets: data as Pocket[], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createPocket: async (name: string, description?: string, isOnShelf: boolean = false, isOnDesk: boolean = false, isInbox: boolean = true) => {
    set({ isLoading: true, error: null });
    console.log(`[PocketStore] createPocket called with name: ${name}, isOnShelf: ${isOnShelf}, isOnDesk: ${isOnDesk}, isInbox: ${isInbox}`);
    try {
      const { data, error } = await supabase
        .from('pockets')
        .insert([{ 
          name, 
          description,
          is_on_shelf: isOnShelf,
          is_on_desk: isOnDesk,
          is_inbox: isInbox
        }])
        .select();

      if (error) {
        console.error('[PocketStore] Error inserting pocket:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error('[PocketStore] Pocket creation returned NO DATA');
        throw new Error('Pocket creation returned no data');
      }

      const newPocket = data[0] as Pocket;
      console.log(`[PocketStore] Pocket created successfully: ${newPocket.id}`, newPocket);
      
      set(state => ({ 
        pockets: [newPocket, ...state.pockets],
        isLoading: false 
      }));
      return newPocket;
    } catch (err: any) {
      console.error('[PocketStore] createPocket failed:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  deletePocket: async (id: string) => {
    try {
      const { error } = await supabase
        .from('pockets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({ 
        pockets: state.pockets.filter(p => p.id !== id) 
      }));
      // Close any tabs associated with this pocket
      useTabStore.getState().closeTabsByFileId(id);
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
