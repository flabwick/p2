-- Add direct public URL to assets for instant rendering
ALTER TABLE epub_assets ADD COLUMN public_url TEXT;
