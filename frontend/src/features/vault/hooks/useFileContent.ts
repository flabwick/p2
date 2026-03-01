import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useFileContent() {
  const uploadFile = useCallback(async (file: File, vaultId: string, folderId?: string) => {
    // 1. Upload to Supabase Storage
    const storagePath = `vaults/${vaultId}/${Date.now()}_${file.name}`
    const { error: storageError } = await supabase.storage
      .from('vaults')
      .upload(storagePath, file)

    if (storageError) throw storageError

    // 2. Create database record
    const { data, error: dbError } = await supabase
      .from('files')
      .insert([{
        name: file.name,
        vault_id: vaultId,
        folder_id: folderId,
        storage_path: storagePath,
        mime_type: file.type,
        size: file.size
      }])
      .select()
      .single()

    if (dbError) throw dbError
    return data
  }, [])

  const downloadFile = useCallback(async (storagePath: string) => {
    const { data, error } = await supabase.storage
      .from('vaults')
      .download(storagePath)

    if (error) throw error
    return data
  }, [])

  const deleteFile = useCallback(async (id: string, storagePath: string) => {
    // 1. Delete from storage
    const { error: storageError } = await supabase.storage
      .from('vaults')
      .remove([storagePath])

    if (storageError) throw storageError

    // 2. Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', id)

    if (dbError) throw dbError
  }, [])

  return {
    uploadFile,
    downloadFile,
    deleteFile
  }
}
