import { create } from 'zustand';

// Types
interface Pocket {
  id: string;
  name: string;
  items?: number;
}

interface LayoutState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  
  pockets: Pocket[];
  addPocket: (pocket: Pocket) => void;
  removePocket: (id: string) => void;
  updatePocket: (id: string, updates: Partial<Pocket>) => void;
  
  activePocket: string;
  setActivePocket: (id: string) => void;
  
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Default state
const DEFAULT_POCKETS: Pocket[] = [
  { id: 'p1', name: 'Main Context', items: 3 },
  { id: 'p2', name: 'Design Review', items: 5 },
];

// Zustand store
export const useLayoutState = create<LayoutState>((set) => ({
  isSidebarOpen: true,
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  
  pockets: DEFAULT_POCKETS,
  
  addPocket: (pocket) => set((state) => ({
    pockets: [...state.pockets, pocket]
  })),
  
  removePocket: (id) => set((state) => {
    const remainingPockets = state.pockets.filter(p => p.id !== id);
    const newActivePocket = remainingPockets.length > 0 
      ? (remainingPockets[0]?.id || '') 
      : '';
    return {
      pockets: remainingPockets,
      activePocket: state.activePocket === id ? newActivePocket : state.activePocket
    };
  }),
  
  updatePocket: (id, updates) => set((state) => ({
    pockets: state.pockets.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  activePocket: DEFAULT_POCKETS[0]?.id ?? '',
  
  setActivePocket: (id) => set({ activePocket: id }),
  
  theme: 'light',
  
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }))
}));
