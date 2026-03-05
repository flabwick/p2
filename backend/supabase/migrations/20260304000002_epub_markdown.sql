-- Update EPUB Schema for Markdown support
ALTER TABLE epub_chapters ADD COLUMN content_markdown TEXT;
ALTER TABLE epub_books ADD COLUMN is_fully_processed BOOLEAN DEFAULT FALSE;
