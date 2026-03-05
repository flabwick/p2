-- EPUB Processing & Deconstruction Schema

-- Books: Metadata and reference to the original file
CREATE TABLE epub_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE UNIQUE,
  title TEXT,
  author TEXT,
  publisher TEXT,
  description TEXT,
  language TEXT,
  cover_url TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Chapters: Individual text sections
CREATE TABLE epub_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES epub_books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  href TEXT NOT NULL, -- original href from OPF/NCX
  content_html TEXT NOT NULL, -- cleaned HTML content
  word_count INTEGER DEFAULT 0,
  sequence_order INTEGER NOT NULL,
  chapter_metadata JSONB DEFAULT '{}'
);

-- Assets: Images, CSS, etc. linked to the book
CREATE TABLE epub_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES epub_books(id) ON DELETE CASCADE,
  href TEXT NOT NULL, -- original path in EPUB
  storage_path TEXT NOT NULL, -- path in Supabase Storage
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_epub_chapters_book_id ON epub_chapters(book_id);
CREATE INDEX idx_epub_chapters_order ON epub_chapters(book_id, sequence_order);
CREATE INDEX idx_epub_assets_book_id ON epub_assets(book_id);
CREATE INDEX idx_epub_assets_href ON epub_assets(book_id, href);
