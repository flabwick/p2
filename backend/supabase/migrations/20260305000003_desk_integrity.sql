-- Migration: Ensure Desk Integrity
-- Date: 2026-03-05

-- 1. Add UNIQUE constraint to pocket_id in desks
-- First, clean up any existing duplicate desks if they somehow exist
DELETE FROM desks a USING desks b 
WHERE a.created_at < b.created_at 
AND a.pocket_id = b.pocket_id;

ALTER TABLE desks ADD CONSTRAINT desks_pocket_id_key UNIQUE (pocket_id);

-- 2. Create a function to automatically create a desk for a new pocket
CREATE OR REPLACE FUNCTION public.handle_new_pocket()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.desks (pocket_id, name, feed_state)
  VALUES (NEW.id, 'Main Desk', '{"items": []}'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS on_pocket_created ON public.pockets;
CREATE TRIGGER on_pocket_created
  AFTER INSERT ON public.pockets
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_pocket();
