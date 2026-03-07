-- Migration: Add is_on_shelf and is_on_desk to pockets table
-- Date: 2026-03-06

ALTER TABLE pockets ADD COLUMN IF NOT EXISTS is_on_shelf BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE pockets ADD COLUMN IF NOT EXISTS is_on_desk BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_pockets_is_on_shelf ON pockets(is_on_shelf);
CREATE INDEX IF NOT EXISTS idx_pockets_is_on_desk ON pockets(is_on_desk);
