-- Migration: Relax constraints for Local Development
-- Date: 2026-03-01

-- 1. Disable RLS on core vault tables to avoid "new row violates RLS" in dev
ALTER TABLE vaults DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE vault_folders DISABLE ROW LEVEL SECURITY;

-- 2. Make owner_id nullable so we don't need a valid auth user to create a vault locally
ALTER TABLE vaults ALTER COLUMN owner_id DROP NOT NULL;

-- 3. (Optional) Remove FK constraint if it's still blocking despite being null
-- This ensures that even if a dummy ID is passed, it won't fail the FK check
ALTER TABLE vaults DROP CONSTRAINT IF EXISTS vaults_owner_id_fkey;
