export interface Vault {
  id: string
  owner_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface VaultFolder {
  id: string
  vault_id: string
  name: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface VaultFile {
  id: string
  vault_id: string
  folder_id?: string
  name: string
  storage_path: string
  mime_type?: string
  size?: number
  metadata?: any
  created_at: string
  updated_at: string
}

export type FileNodeType = 'folder' | 'file'

export interface FileNode {
  id: string
  name: string
  type: FileNodeType
  extension?: string
  parentId?: string
  children?: FileNode[]
}
