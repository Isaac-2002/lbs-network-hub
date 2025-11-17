-- Create storage bucket for CV uploads
-- This migration creates the bucket and sets up storage policies

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for CV bucket
-- Files should be stored with path: {user_id}/{filename}
-- Example: 123e4567-e89b-12d3-a456-426614174000/cv.pdf

-- Users can upload their own CV
CREATE POLICY "Users can upload own CV"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'cvs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own CV
CREATE POLICY "Users can view own CV"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'cvs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own CV
CREATE POLICY "Users can update own CV"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'cvs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own CV
CREATE POLICY "Users can delete own CV"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'cvs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Optional: Allow authenticated users to view CVs (for matching purposes)
-- Uncomment if you want other users to be able to view CVs
-- CREATE POLICY "Authenticated users can view CVs"
--   ON storage.objects
--   FOR SELECT
--   USING (
--     bucket_id = 'cvs' AND
--     auth.role() = 'authenticated'
--   );

