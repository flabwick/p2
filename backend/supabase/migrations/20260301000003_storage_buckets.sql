-- Migration: Create Vaults Storage Bucket
-- Date: 2026-03-01

-- 1. Create the 'vaults' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'vaults', 'vaults', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'vaults'
);

-- 2. Storage Policies (simplified for local development, matching the 'disable rls' theme)
-- Allow all operations for now since RLS is globally relaxed in this project
CREATE POLICY "Allow all operations on vaults bucket" 
ON storage.objects 
FOR ALL 
TO public 
USING (bucket_id = 'vaults') 
WITH CHECK (bucket_id = 'vaults');
