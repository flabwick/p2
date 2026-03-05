-- Fix EPUB Constraints for Upsert
ALTER TABLE epub_chapters ADD CONSTRAINT unique_book_chapter_href UNIQUE (book_id, href);
ALTER TABLE epub_assets ADD CONSTRAINT unique_book_asset_href UNIQUE (book_id, href);
