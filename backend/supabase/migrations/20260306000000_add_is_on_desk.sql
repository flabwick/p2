-- Migration: Add is_on_desk to files table
-- Date: 2026-03-06

ALTER TABLE files ADD COLUMN IF NOT EXISTS is_on_desk BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_files_is_on_desk ON files(is_on_desk);
