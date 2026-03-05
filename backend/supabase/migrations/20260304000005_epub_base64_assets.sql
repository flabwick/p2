-- Store image data directly in the database to avoid Storage/RLS issues
ALTER TABLE epub_assets ADD COLUMN content_base64 TEXT;
