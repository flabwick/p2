-- Ensure assets can hold large Base64 strings
ALTER TABLE epub_assets ALTER COLUMN content_base64 TYPE TEXT;
-- Ensure chapters can hold segmented markdown
ALTER TABLE epub_chapters ALTER COLUMN content_markdown TYPE TEXT;
