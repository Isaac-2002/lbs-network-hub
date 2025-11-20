-- Add work_history column to profiles table
-- This will store an array of work experience from CV extraction

ALTER TABLE public.profiles
ADD COLUMN work_history JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the column structure
COMMENT ON COLUMN public.profiles.work_history IS
'Array of work history objects with structure: [{"role": "Job Title", "company": "Company Name", "years": "2020-2023"}]';
