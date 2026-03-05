-- Relax constraints to support Markdown-first storage
ALTER TABLE epub_chapters ALTER COLUMN content_html DROP NOT NULL;
ALTER TABLE epub_chapters ADD COLUMN IF NOT EXISTS content_markdown TEXT;
