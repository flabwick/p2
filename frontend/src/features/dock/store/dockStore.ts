import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface DockTab {
  id: string;
  index: number;
  content: string;
}

interface DockState {
  tabs: DockTab[];
  activeTabIndex: number;
  isLoading: boolean;
  isInitialLoad: boolean;
  
  fetchTabs: () => Promise<void>;
  addTab: () => Promise<void>;
  deleteTab: () => Promise<void>;
  deleteTabById: (id: string) => Promise<void>;
  updateTabContent: (id: string, content: string) => Promise<void>;
  setActiveTabIndex: (index: number) => void;
}

// Simple internal debounce helper for content updates
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const useDockStore = create<DockState>((set, get) => ({
  tabs: [],
  activeTabIndex: 0,
  isLoading: false,
  isInitialLoad: true,
  
  fetchTabs: async () => {
    // Only fetch if we haven't loaded yet or are forced to
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('dock_tabs')
        .select('*')
        .order('index', { ascending: true });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        const initialTabsData = [
          { index: 0, content: '' },
          { index: 1, content: '' },
          { index: 2, content: '' }
        ];
        
        const { data: insertedData, error: insertError } = await supabase
          .from('dock_tabs')
          .insert(initialTabsData)
          .select();
        
        if (insertError) throw insertError;
        
        if (insertedData) {
          set({ 
            tabs: insertedData.map(t => ({ id: t.id, index: t.index, content: t.content })),
            isInitialLoad: false
          });
        }
      } else {
        // Ensure indices are consistent (0, 1, 2...)
        const sortedData = data.map((t, i) => ({ id: t.id, index: i, content: t.content }));
        set({ 
          tabs: sortedData,
          isInitialLoad: false
        });
      }
    } catch (err) {
      console.error('Error fetching dock tabs:', err);
    } finally {
      set({ isLoading: false });
    }
  },
  
  addTab: async () => {
    const { tabs } = get();
    const newIndex = tabs.length;
    try {
      const { data, error } = await supabase
        .from('dock_tabs')
        .insert({ index: newIndex, content: '' })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        set({ 
          tabs: [...tabs, { id: data.id, index: data.index, content: data.content }],
          activeTabIndex: newIndex 
        });
      }
    } catch (err) {
      console.error('Error adding dock tab:', err);
    }
  },
  
  deleteTab: async () => {
    const { tabs, activeTabIndex, deleteTabById } = get();
    if (tabs.length <= 1) return;
    const tabToDelete = tabs[activeTabIndex];
    await deleteTabById(tabToDelete.id);
  },

  deleteTabById: async (id: string) => {
    const { tabs, activeTabIndex } = get();
    if (tabs.length <= 1) return;
    
    const tabToDelete = tabs.find(t => t.id === id);
    if (!tabToDelete) return;
    
    try {
      // 1. Delete the tab
      const { error: deleteError } = await supabase
        .from('dock_tabs')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // 2. Identify remaining tabs and their new indices
      const remainingTabs = tabs.filter(t => t.id !== id);
      const updatedTabs = remainingTabs.map((tab, i) => ({ ...tab, index: i }));
      
      // 3. Batch update indices in the background
      for (const tab of updatedTabs) {
        supabase
          .from('dock_tabs')
          .update({ index: tab.index })
          .eq('id', tab.id)
          .then(({ error }) => {
            if (error) console.error('Error re-indexing tab:', error);
          });
      }
      
      // 4. Update local state and active index
      let nextIndex = activeTabIndex;
      if (tabToDelete.index === activeTabIndex) {
        // If we deleted the active tab, move to previous or stay at 0
        nextIndex = activeTabIndex >= updatedTabs.length ? updatedTabs.length - 1 : activeTabIndex;
      } else if (tabToDelete.index < activeTabIndex) {
        // If we deleted a tab before the active one, decrement active index
        nextIndex = activeTabIndex - 1;
      }

      set({ 
        tabs: updatedTabs,
        activeTabIndex: Math.max(0, nextIndex)
      });
      
    } catch (err) {
      console.error('Error deleting dock tab:', err);
    }
  },
  
  updateTabContent: async (id, content) => {
    const { tabs } = get();
    const tab = tabs.find(t => t.id === id);
    if (!tab) return;
    
    // Optimistic local update
    set({
      tabs: tabs.map(t => t.id === id ? { ...t, content } : t)
    });
    
    // Debounced DB update
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('dock_tabs')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', id);
        
        if (error) throw error;
      } catch (err) {
        console.error('Error updating dock tab content:', err);
      }
    }, 1000);
  },
  
  setActiveTabIndex: (index) => set({ activeTabIndex: index })
}));
