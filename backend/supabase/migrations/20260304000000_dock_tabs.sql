-- ============================================
-- Dock Tabs (persistent state for the dock)
-- ============================================

CREATE TABLE IF NOT EXISTS dock_tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "index" INTEGER NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster retrieval
CREATE INDEX IF NOT EXISTS idx_dock_tabs_owner ON dock_tabs(owner_id);

-- Disable RLS for local dev as per previous migrations
ALTER TABLE dock_tabs DISABLE ROW LEVEL SECURITY;
