import { create } from 'zustand'
import { Tab, TabType } from '../../../types/tabs'
import { supabase } from '@/lib/supabase'

interface TabState {
  tabs: Tab[]
  activeTabId: string
  
  // Actions
  setTabs: (tabs: Tab[]) => void
  setActiveTabId: (id: string) => void
  addTab: (tab?: Partial<Tab>) => void
  closeTab: (id: string) => void
  closeTabsByFileId: (fileId: string) => void
  duplicateTab: (id: string) => void
  reorderTabs: (newTabs: Tab[]) => void
  updateTabType: (id: string, type: TabType, fileId?: string, title?: string) => void
  updateTabTitle: (id: string, title: string) => void
  openFile: (fileId: string, title: string, forceNewTab?: boolean) => void
  validateTabs: () => Promise<void>
}

const DEFAULT_TAB: Tab = { id: '1', type: 'welcome', title: 'New Tab' }

export const useTabStore = create<TabState>((set, get) => ({
  tabs: (() => {
    const savedTabs = localStorage.getItem('sidebar-tabs')
    if (savedTabs) {
      try {
        return JSON.parse(savedTabs)
      } catch (e) {
        console.error('Failed to parse saved tabs', e)
      }
    }
    return [DEFAULT_TAB]
  })(),
  
  activeTabId: (() => {
    const savedActiveId = localStorage.getItem('active-tab-id')
    const savedTabs = localStorage.getItem('sidebar-tabs')
    if (savedActiveId && savedTabs) {
      try {
        const tabs = JSON.parse(savedTabs) as Tab[]
        if (tabs.some(t => t.id === savedActiveId)) {
          return savedActiveId
        }
      } catch (e) {}
    }
    return '1'
  })(),

  setTabs: (tabs) => {
    set({ tabs })
    localStorage.setItem('sidebar-tabs', JSON.stringify(tabs))
  },

  setActiveTabId: (activeTabId) => {
    set({ activeTabId })
    localStorage.setItem('active-tab-id', activeTabId)
  },

  addTab: (tabData) => {
    const { tabs } = get()
    const newId = Date.now().toString()
    const newTab: Tab = { 
      id: newId, 
      type: 'welcome', 
      title: 'New Tab',
      ...tabData 
    }
    
    // If the only tab is a welcome tab and we're adding a "real" tab (not another welcome tab), replace it
    let newTabs: Tab[]
    if (tabs.length === 1 && tabs[0]?.type === 'welcome' && newTab.type !== 'welcome') {
      newTabs = [newTab]
    } else {
      newTabs = [...tabs, newTab]
    }
    
    set({ tabs: newTabs, activeTabId: newId })
    localStorage.setItem('sidebar-tabs', JSON.stringify(newTabs))
    localStorage.setItem('active-tab-id', newId)
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get()
    const newTabs = tabs.filter(tab => tab.id !== id)
    
    if (newTabs.length === 0) {
      const newId = Date.now().toString()
      const newTab = { ...DEFAULT_TAB, id: newId }
      set({ tabs: [newTab], activeTabId: newId })
      localStorage.setItem('sidebar-tabs', JSON.stringify([newTab]))
      localStorage.setItem('active-tab-id', newId)
      return
    }

    let nextActiveId = activeTabId
    if (activeTabId === id) {
      const activeIndex = tabs.findIndex(t => t.id === id)
      const nextTab = newTabs[activeIndex] || newTabs[activeIndex - 1]
      if (nextTab) {
        nextActiveId = nextTab.id
      }
    }
    
    set({ tabs: newTabs, activeTabId: nextActiveId })
    localStorage.setItem('sidebar-tabs', JSON.stringify(newTabs))
    localStorage.setItem('active-tab-id', nextActiveId)
  },

  closeTabsByFileId: (fileId) => {
    const { tabs } = get()
    const tabsToClose = tabs.filter(t => t.fileId === fileId)
    tabsToClose.forEach(t => get().closeTab(t.id))
  },

  duplicateTab: (id) => {
    const { tabs } = get()
    const tabToDuplicate = tabs.find(tab => tab.id === id)
    if (tabToDuplicate) {
      const newId = Date.now().toString()
      const newTabs = [...tabs, { ...tabToDuplicate, id: newId }]
      set({ tabs: newTabs, activeTabId: newId })
      localStorage.setItem('sidebar-tabs', JSON.stringify(newTabs))
      localStorage.setItem('active-tab-id', newId)
    }
  },

  reorderTabs: (newTabs) => {
    set({ tabs: newTabs })
    localStorage.setItem('sidebar-tabs', JSON.stringify(newTabs))
  },

  updateTabType: (id, type, fileId, title) => {
    const { tabs } = get()
    const newTabs = tabs.map(tab => {
      if (tab.id === id) {
        return { ...tab, type, fileId: fileId || tab.fileId, title: title || tab.title }
      }
      return tab
    })
    set({ tabs: newTabs })
    localStorage.setItem('sidebar-tabs', JSON.stringify(newTabs))
  },

  updateTabTitle: (id, title) => {
    const { tabs } = get()
    const newTabs = tabs.map(tab => {
      if (tab.id === id) {
        const fileExtension = tab.type === 'file' ? title.split('.').pop() : tab.fileExtension
        return { ...tab, title, fileExtension }
      }
      return tab
    })
    set({ tabs: newTabs })
    localStorage.setItem('sidebar-tabs', JSON.stringify(newTabs))
  },

  openFile: (fileId, title, forceNewTab = false) => {
    const { tabs } = get()
    if (!forceNewTab) {
      const existingTab = tabs.find(tab => tab.fileId === fileId)
      if (existingTab) {
        set({ activeTabId: existingTab.id })
        localStorage.setItem('active-tab-id', existingTab.id)
        return
      }
    }
    const fileExtension = title.split('.').pop()
    const newId = Date.now().toString()
    const newTab: Tab = { 
      id: newId, 
      type: fileExtension?.toLowerCase() === 'pocket' ? 'pocket' : 'file', 
      title, 
      fileId,
      fileExtension 
    }
    
    // If the only tab is a welcome tab, replace it
    let newTabs: Tab[]
    if (tabs.length === 1 && tabs[0]?.type === 'welcome') {
      newTabs = [newTab]
    } else {
      newTabs = [...tabs, newTab]
    }
    
    set({ tabs: newTabs, activeTabId: newId })
    localStorage.setItem('sidebar-tabs', JSON.stringify(newTabs))
    localStorage.setItem('active-tab-id', newId)
  },

  validateTabs: async () => {
    const { tabs } = get()
    const fileTabs = tabs.filter(t => t.fileId)
    if (fileTabs.length === 0) return

    console.log(`[TabStore] Validating ${fileTabs.length} tabs against database...`)
    const fileIds = fileTabs.filter(t => t.type === 'file').map(t => t.fileId!)
    const pocketIds = fileTabs.filter(t => t.type === 'pocket').map(t => t.fileId!)

    const [existingFilesRes, existingPocketsRes] = await Promise.all([
      fileIds.length > 0 ? supabase.from('files').select('id').in('id', fileIds) : Promise.resolve({ data: [] }),
      pocketIds.length > 0 ? supabase.from('pockets').select('id').in('id', pocketIds) : Promise.resolve({ data: [] })
    ])

    const existingFileIds = new Set(existingFilesRes.data?.map(f => f.id) || [])
    const existingPocketIds = new Set(existingPocketsRes.data?.map(p => p.id) || [])

    let changed = false
    const validatedTabs = [...tabs]

    for (let i = 0; i < validatedTabs.length; i++) {
      const tab = validatedTabs[i]
      if (!tab.fileId) continue

      if (tab.type === 'file' && !existingFileIds.has(tab.fileId)) {
        console.warn(`[TabStore] File ID ${tab.fileId} not found. Closing tab: ${tab.title}`)
        validatedTabs.splice(i, 1)
        i--
        changed = true
      } else if (tab.type === 'pocket' && !existingPocketIds.has(tab.fileId)) {
        console.warn(`[TabStore] Pocket ID ${tab.fileId} not found. Closing tab: ${tab.title}`)
        validatedTabs.splice(i, 1)
        i--
        changed = true
      }
    }

    if (changed) {
      if (validatedTabs.length === 0) {
        validatedTabs.push({ ...DEFAULT_TAB, id: Date.now().toString() })
      }
      
      const { activeTabId } = get()
      let newActiveId = activeTabId
      if (!validatedTabs.some(t => t.id === activeTabId)) {
        newActiveId = validatedTabs[0].id
      }
      
      set({ tabs: validatedTabs, activeTabId: newActiveId })
      localStorage.setItem('sidebar-tabs', JSON.stringify(validatedTabs))
      localStorage.setItem('active-tab-id', newActiveId)
    }
  }
}))
