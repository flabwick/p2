-- Migration: Add vault_folders and update files for hierarchical organization
-- Date: 2026-03-01

-- 1. Create vault_folders table
CREATE TABLE IF NOT EXISTS vault_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES vault_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add folder_id to files table
ALTER TABLE files ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES vault_folders(id) ON DELETE SET NULL;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vault_folders_vault_id ON vault_folders(vault_id);
CREATE INDEX IF NOT EXISTS idx_vault_folders_parent_id ON vault_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);

-- 4. Enable RLS
ALTER TABLE vault_folders ENABLE ROW LEVEL SECURITY;

-- 5. Basic RLS Policies (assuming auth.uid() matches vault owner)
-- These are templates and might need adjustment based on specific auth logic
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'vault_folders' AND policyname = 'Users can manage their own vault folders'
  ) THEN
    CREATE POLICY "Users can manage their own vault folders" ON vault_folders
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM vaults 
          WHERE vaults.id = vault_folders.vault_id 
          AND vaults.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
