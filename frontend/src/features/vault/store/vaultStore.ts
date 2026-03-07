import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Vault, VaultFolder, VaultFile, FileNode } from '@/shared/types/vault'
import { useTabStore } from '../../tabs/store/tabStore'

interface VaultState {
  vaults: Vault[]
  activeVaultId: string | null
  folders: VaultFolder[]
  files: VaultFile[]
  isLoading: boolean
  error: string | null
  isCreating: { type: 'file' | 'folder', parentId?: string, initialValue?: string, defaultExtension?: string } | null
  isEditing: { id: string, type: 'file' | 'folder', name: string } | null

  // Basic Actions
  setVaults: (vaults: Vault[]) => void
  setActiveVaultId: (id: string | null) => void
  setFolders: (folders: VaultFolder[]) => void
  setFiles: (files: VaultFile[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setIsCreating: (config: { type: 'file' | 'folder', parentId?: string, initialValue?: string, defaultExtension?: string } | null) => void
  setIsEditing: (config: { id: string, type: 'file' | 'folder', name: string } | null) => void

  // Complex Actions (Business Logic)
  fetchVaults: () => Promise<void>
  fetchVaultContent: (vaultId: string) => Promise<void>
  createFolder: (name: string, parentId?: string) => Promise<any>
  createFile: (name: string, folderId?: string, isOnShelf?: boolean, isOnDesk?: boolean) => Promise<any>
  renameNode: (id: string, type: 'folder' | 'file', newName: string) => Promise<void>
  moveNode: (id: string, type: 'folder' | 'file', targetFolderId: string | null, isOnShelf?: boolean, isOnDesk?: boolean) => Promise<void>
  deleteNode: (id: string, type: 'folder' | 'file') => Promise<void>
  uploadFile: (file: File, folderId?: string, isOnShelf?: boolean, isOnDesk?: boolean) => Promise<any>
  checkDuplicate: (name: string, type: 'folder' | 'file', parentId: string | null, excludeId?: string, isOnShelf?: boolean, isOnDesk?: boolean) => boolean
}

export const useVaultStore = create<VaultState>((set, get) => ({
  vaults: [],
  activeVaultId: null,
  folders: [],
  files: [],
  isLoading: false,
  error: null,
  isCreating: null,
  isEditing: null,

  setVaults: (vaults) => set({ vaults }),
  setActiveVaultId: (activeVaultId) => set({ activeVaultId }),
  setFolders: (folders) => set({ folders }),
  setFiles: (files) => set({ files }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setIsCreating: (isCreating) => set({ isCreating }),
  setIsEditing: (isEditing) => set({ isEditing }),

  checkDuplicate: (name, type, parentId, excludeId, isOnShelf = false, isOnDesk = false) => {
    const trimmedName = name.trim().toLowerCase();
    if (type === 'folder') {
      return get().folders.some(f => 
        f.id !== excludeId &&
        (f.name || '').trim().toLowerCase() === trimmedName && 
        (f.parent_id || null) === (parentId || null)
      );
    } else {
      // If it's on the shelf or desk, we allow duplicates or handle naming separately
      if (isOnShelf || isOnDesk) return false;

      return get().files.some(f => 
        f.id !== excludeId &&
        !f.is_on_shelf &&
        !f.is_on_desk &&
        (f.name || '').trim().toLowerCase() === trimmedName && 
        (f.folder_id || null) === (parentId || null)
      );
    }
  },

  fetchVaults: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('vaults').select('*')
      if (error) throw error
      const vaults = data || []
      set({ vaults })
      if (vaults.length > 0 && !get().activeVaultId) {
        set({ activeVaultId: vaults[0].id })
      }
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchVaultContent: async (vaultId: string) => {
    set({ isLoading: true, error: null })
    try {
      const [foldersRes, filesRes] = await Promise.all([
        supabase.from('vault_folders').select('*').eq('vault_id', vaultId),
        supabase.from('files').select('*').eq('vault_id', vaultId)
      ])
      if (foldersRes.error) throw foldersRes.error
      if (filesRes.error) throw filesRes.error
      set({ 
        folders: foldersRes.data as VaultFolder[], 
        files: filesRes.data as VaultFile[] 
      })
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoading: false })
    }
  },

  createFolder: async (name: string, parentId?: string) => {
    try {
      let vaultId = get().activeVaultId
      if (!vaultId) {
        const { data: authData } = await supabase.auth.getUser()
        const { data: vaults, error: vError } = await supabase
          .from('vaults')
          .insert([{ name: 'Main Vault', owner_id: authData.user?.id }])
          .select()
        
        if (vError) throw vError
        if (!vaults || vaults.length === 0) throw new Error('Vault creation failed')
        const vault = vaults[0]
        vaultId = vault.id
        set(state => ({ vaults: [...state.vaults, vault], activeVaultId: vault.id }))
      }

      const { data: folders, error } = await supabase
        .from('vault_folders')
        .insert([{ name, vault_id: vaultId, parent_id: parentId }])
        .select()
      if (error) throw error
      if (!folders || folders.length === 0) throw new Error('Folder creation failed')
      const data = folders[0]
      set(state => ({ folders: [...state.folders, data as VaultFolder] }))
      return data
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  createFile: async (name: string, folderId?: string, isOnShelf: boolean = false, isOnDesk: boolean = false) => {
    try {
      let vaultId = get().activeVaultId
      if (!vaultId) {
        const { data: authData } = await supabase.auth.getUser()
        const { data: vaults, error: vError } = await supabase
          .from('vaults')
          .insert([{ name: 'Main Vault', owner_id: authData.user?.id }])
          .select()
        if (vError) throw vError
        if (!vaults || vaults.length === 0) throw new Error('Vault creation failed')
        const vault = vaults[0]
        vaultId = vault.id
        set(state => ({ vaults: [...state.vaults, vault], activeVaultId: vault.id }))
      }

      let finalName = name;
      if (isOnShelf || isOnDesk) {
        const existingNames = get().files
          .filter(f => (isOnShelf && f.is_on_shelf) || (isOnDesk && f.is_on_desk))
          .map(f => f.name.toLowerCase());
        
        let counter = 0;
        const parts = name.split('.');
        const extension = parts.length > 1 ? `.${parts.pop()}` : '';
        const baseName = parts.join('.');
        
        while (existingNames.includes(finalName.toLowerCase())) {
          counter++;
          finalName = `${baseName} (${counter})${extension}`;
        }
      }

      const { data: files, error } = await supabase
        .from('files')
        .insert([{ 
          name: finalName, 
          vault_id: vaultId, 
          folder_id: folderId,
          is_on_shelf: isOnShelf,
          is_on_desk: isOnDesk,
          storage_path: `${vaultId}/${Date.now()}_${finalName}`
        }])
        .select()
      if (error) throw error
      if (!files || files.length === 0) throw new Error('File creation failed')
      const data = files[0]
      set(state => ({ files: [...state.files, data as VaultFile] }))
      return data
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  renameNode: async (id: string, type: 'folder' | 'file', newName: string) => {
    try {
      const table = type === 'folder' ? 'vault_folders' : 'files'
      const { error } = await supabase.from(table).update({ name: newName }).eq('id', id)
      if (error) throw error
      if (type === 'folder') {
        set(state => ({ folders: state.folders.map(f => f.id === id ? { ...f, name: newName } : f) }))
      } else {
        set(state => ({ files: state.files.map(f => f.id === id ? { ...f, name: newName } : f) }))
      }
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  moveNode: async (id: string, type: 'folder' | 'file', targetFolderId: string | null, isOnShelf: boolean = false, isOnDesk: boolean = false) => {
    try {
      const table = type === 'folder' ? 'vault_folders' : 'files'
      const updates: any = {}
      const now = new Date().toISOString()
      
      if (type === 'folder') {
        updates.parent_id = targetFolderId
        updates.updated_at = now
      } else {
        updates.folder_id = targetFolderId
        updates.is_on_shelf = isOnShelf
        updates.is_on_desk = isOnDesk
        updates.updated_at = now
      }

      const { error } = await supabase.from(table).update(updates).eq('id', id)
      if (error) throw error
      if (type === 'folder') {
        set(state => ({ folders: state.folders.map(f => f.id === id ? { ...f, parent_id: targetFolderId || undefined, updated_at: now } : f) }))
      } else {
        set(state => ({ files: state.files.map(f => f.id === id ? { ...f, folder_id: targetFolderId || undefined, is_on_shelf: isOnShelf, is_on_desk: isOnDesk, updated_at: now } : f) }))
      }
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  deleteNode: async (id: string, type: 'folder' | 'file') => {
    try {
      // If it's a file, delete from storage too
      if (type === 'file') {
        const file = get().files.find(f => f.id === id)
        if (file) {
          await supabase.storage.from('vaults').remove([file.storage_path])
        }
      }

      const table = type === 'folder' ? 'vault_folders' : 'files'
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      if (type === 'folder') {
        set(state => ({ folders: state.folders.filter(f => f.id !== id) }))
      } else {
        set(state => ({ files: state.files.filter(f => f.id !== id) }))
        // Close any tabs associated with this file
        useTabStore.getState().closeTabsByFileId(id)
      }
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  uploadFile: async (file: File, folderId?: string, isOnShelf: boolean = false, isOnDesk: boolean = false) => {
    try {
      let vaultId = get().activeVaultId
      if (!vaultId) {
        const { data: authData } = await supabase.auth.getUser()
        const { data: vaults, error: vError } = await supabase
          .from('vaults')
          .insert([{ name: 'Main Vault', owner_id: authData.user?.id }])
          .select()
        if (vError) throw vError
        if (!vaults || vaults.length === 0) throw new Error('Vault creation failed')
        const vault = vaults[0]
        vaultId = vault.id
        set(state => ({ vaults: [...state.vaults, vault], activeVaultId: vault.id }))
      }

      let finalName = file.name;
      if (isOnShelf || isOnDesk) {
        const existingNames = get().files
          .filter(f => (isOnShelf && f.is_on_shelf) || (isOnDesk && f.is_on_desk))
          .map(f => f.name.toLowerCase());
        
        let counter = 0;
        const parts = file.name.split('.');
        const extension = parts.length > 1 ? `.${parts.pop()}` : '';
        const baseName = parts.join('.');
        
        while (existingNames.includes(finalName.toLowerCase())) {
          counter++;
          finalName = `${baseName} (${counter})${extension}`;
        }
      }

      const timestamp = Date.now()
      const storagePath = `${vaultId}/${timestamp}_${finalName}`

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('vaults')
        .upload(storagePath, file, {
          cacheControl: '0',
          upsert: true
        })
      
      if (uploadError) throw uploadError

      // Insert record in DB
      const { data: dbData, error: dbError } = await supabase
        .from('files')
        .insert([{
          name: finalName,
          vault_id: vaultId,
          folder_id: folderId,
          is_on_shelf: isOnShelf,
          is_on_desk: isOnDesk,
          storage_path: storagePath,
          mime_type: file.type,
          size: file.size,
          metadata: {}
        }])
        .select()

      if (dbError) throw dbError
      if (!dbData || dbData.length === 0) throw new Error('File record creation failed')

      const data = dbData[0] as VaultFile;
      set(state => ({ files: [...state.files, data] }))
      return data
    } catch (err: any) {
      set({ error: err.message })
      throw err
    }
  },
}))
