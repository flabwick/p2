-- Migration: Rename Feed to Canvas and update schema
-- Date: 2026-03-07

-- 1. Rename feed_operations to canvas_operations
ALTER TABLE IF EXISTS feed_operations RENAME TO canvas_operations;
ALTER TABLE canvas_operations RENAME COLUMN feed_id TO canvas_id;

-- 2. Rename feeds to canvases
-- Remove unique constraint from pocket_id first
ALTER TABLE IF EXISTS feeds DROP CONSTRAINT IF EXISTS feeds_pocket_id_key;
ALTER TABLE IF EXISTS feeds RENAME TO canvases;

-- 3. Update canvases table structure
ALTER TABLE canvases ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Main Canvas';
ALTER TABLE canvases DROP COLUMN IF EXISTS cards;

-- 4. Create canvas_cards table
CREATE TABLE IF NOT EXISTS canvas_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  name TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_collapsed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_canvas_cards_canvas_id ON canvas_cards(canvas_id);

-- 5. Create canvas_blocks table
CREATE TABLE IF NOT EXISTS canvas_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES canvas_cards(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'text',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_canvas_blocks_card_id ON canvas_blocks(card_id);

-- 6. Rename feed_state in desks to canvas_state
ALTER TABLE desks RENAME COLUMN feed_state TO canvas_state;

-- 7. Update handle_new_pocket trigger to create an initial canvas
CREATE OR REPLACE FUNCTION public.handle_new_pocket()
RETURNS TRIGGER AS $$
DECLARE
    new_canvas_id UUID;
BEGIN
    -- Create the initial desk (existing logic)
    INSERT INTO public.desks (pocket_id, name, canvas_state)
    VALUES (NEW.id, 'Main Desk', '{"items": []}'::jsonb);
    
    -- Create the initial canvas
    INSERT INTO public.canvases (pocket_id, name)
    VALUES (NEW.id, 'Main Canvas')
    RETURNING id INTO new_canvas_id;

    -- Optionally add an initial card to the canvas
    INSERT INTO public.canvas_cards (canvas_id, name, "order")
    VALUES (new_canvas_id, 'Welcome Card', 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger (should already exist from previous migrations)
DROP TRIGGER IF EXISTS on_pocket_created ON public.pockets;
CREATE TRIGGER on_pocket_created
  AFTER INSERT ON public.pockets
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_pocket();
