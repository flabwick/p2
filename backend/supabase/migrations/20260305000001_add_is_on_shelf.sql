-- Migration: Add is_on_shelf to files table
-- Date: 2026-03-05

ALTER TABLE files ADD COLUMN IF NOT EXISTS is_on_shelf BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_files_is_on_shelf ON files(is_on_shelf);
