-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Vaults & Files
-- ============================================

-- Vaults: top-level containers for files
CREATE TABLE vaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Files: individual items within a vault
-- (Actual binary data stored in Supabase Storage bucket "vaults")
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,          -- path within storage bucket
  mime_type TEXT,
  size BIGINT,                         -- in bytes
  metadata JSONB,                      -- e.g., {dimensions, duration, etc.}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_vault_id ON files(vault_id);
CREATE INDEX idx_files_owner_via_vault ON files USING BTREE (vault_id); -- covered by vault join

-- ============================================
-- Pocket Organization
-- ============================================

-- Folders for organizing pockets (hierarchical)
CREATE TABLE pocket_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES pocket_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pocket_folders_owner ON pocket_folders(owner_id);
CREATE INDEX idx_pocket_folders_parent ON pocket_folders(parent_id);

-- Pockets: the central work unit
CREATE TABLE pockets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  folder_id UUID REFERENCES pocket_folders(id) ON DELETE SET NULL,
  is_inbox BOOLEAN NOT NULL DEFAULT FALSE,   -- true if this pocket lives in the Inbox
  color TEXT,                                -- for UI distinction
  icon TEXT,
  tags TEXT[],                               -- simple array for tagging
  generator_id UUID,                          -- will be added after generators table
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ
);

CREATE INDEX idx_pockets_owner ON pockets(owner_id);
CREATE INDEX idx_pockets_folder ON pockets(folder_id);
CREATE INDEX idx_pockets_inbox ON pockets(is_inbox) WHERE is_inbox = TRUE;
CREATE INDEX idx_pockets_last_accessed ON pockets(last_accessed_at DESC);

-- ============================================
-- Roles (prompting & behavior profiles)
-- ============================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'local')),
  pocket_id UUID REFERENCES pockets(id) ON DELETE CASCADE,  -- only if scope='local'
  system_prompt TEXT,                      -- main instructions
  executive_instructions TEXT,              -- weak model guidance
  logging_instructions TEXT,                 -- how to use the Log
  preset JSONB,                              -- predefined cards/blocks (array of objects)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_scope CHECK (
    (scope = 'global' AND pocket_id IS NULL) OR
    (scope = 'local' AND pocket_id IS NOT NULL)
  )
);

CREATE INDEX idx_roles_owner ON roles(owner_id);
CREATE INDEX idx_roles_pocket ON roles(pocket_id) WHERE scope = 'local';

-- ============================================
-- Feeds (active state of a pocket)
-- ============================================

CREATE TABLE feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pocket_id UUID NOT NULL REFERENCES pockets(id) ON DELETE CASCADE UNIQUE,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  cards JSONB NOT NULL,                     -- array of Card objects (see spec)
  dsl_version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feeds_pocket ON feeds(pocket_id);
CREATE INDEX idx_feeds_role ON feeds(role_id);

-- ============================================
-- Desks (saved feed snapshots)
-- ============================================

CREATE TABLE desks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pocket_id UUID NOT NULL REFERENCES pockets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  feed_state JSONB NOT NULL,                 -- snapshot of cards at save time
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_desks_pocket ON desks(pocket_id);

-- ============================================
-- Generators (automated pocket creation)
-- ============================================

CREATE TABLE generators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('cron', 'event', 'manual')),
  trigger_config JSONB,                      -- e.g., cron schedule or event name
  executive_prompt TEXT,                      -- high-level planning prompt
  target_folder_id UUID REFERENCES pocket_folders(id) ON DELETE SET NULL, -- where to put generated pockets (e.g., inbox)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generators_owner ON generators(owner_id);
CREATE INDEX idx_generators_active ON generators(is_active) WHERE is_active = TRUE;

-- Add generator_id foreign key to pockets (after generators table exists)
ALTER TABLE pockets ADD CONSTRAINT fk_pockets_generator
  FOREIGN KEY (generator_id) REFERENCES generators(id) ON DELETE SET NULL;

-- ============================================
-- Feed Operations Log (audit trail & undo)
-- ============================================

CREATE TABLE feed_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  operation_batch JSONB NOT NULL,            -- the batch as received
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_feed_operations_feed ON feed_operations(feed_id);
CREATE INDEX idx_feed_operations_applied_at ON feed_operations(applied_at DESC);

-- ============================================
-- Optional: System Events (for future extensibility)
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Enable Row Level Security (RLS) – to be configured per table
-- ============================================
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE pocket_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE desks ENABLE ROW LEVEL SECURITY;
ALTER TABLE generators ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_operations ENABLE ROW LEVEL SECURITY;
-- events may not need RLS initially