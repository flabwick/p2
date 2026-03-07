-- Migration: Add updated_at to desks table
-- Date: 2026-03-06

ALTER TABLE desks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Update existing records to have a valid updated_at
UPDATE desks SET updated_at = created_at WHERE updated_at IS NULL;
