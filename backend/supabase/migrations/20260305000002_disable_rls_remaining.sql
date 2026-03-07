-- Migration: Disable RLS on remaining tables for local development
-- Date: 2026-03-05

ALTER TABLE pockets DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE feeds DISABLE ROW LEVEL SECURITY;
ALTER TABLE desks DISABLE ROW LEVEL SECURITY;
ALTER TABLE generators DISABLE ROW LEVEL SECURITY;
ALTER TABLE feed_operations DISABLE ROW LEVEL SECURITY;

-- Also ensure owner_id is nullable on pockets for easier local creation
ALTER TABLE pockets ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE pockets DROP CONSTRAINT IF EXISTS pockets_owner_id_fkey;
