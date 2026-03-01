-- Migration: Force Disable RLS and relax constraints
-- Date: 2026-03-01_v2

-- 1. Explicitly disable RLS on all vault-related tables
ALTER TABLE vaults DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE vault_folders DISABLE ROW LEVEL SECURITY;

-- 2. Make owner_id nullable for easier local dev
ALTER TABLE vaults ALTER COLUMN owner_id DROP NOT NULL;

-- 3. Drop the FK constraint so dummy IDs don't cause errors
ALTER TABLE vaults DROP CONSTRAINT IF EXISTS vaults_owner_id_fkey;
