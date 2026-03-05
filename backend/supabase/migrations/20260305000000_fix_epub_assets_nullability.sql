-- Fix epub_assets schema to allow base64 storage without mandatory storage_path
ALTER TABLE epub_assets ALTER COLUMN storage_path DROP NOT NULL;
