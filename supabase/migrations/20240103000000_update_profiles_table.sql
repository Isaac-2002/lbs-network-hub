-- Drop the old profiles table and recreate with the complete schema
-- This migration updates the profiles table to include all 26 columns

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON public.profiles;

-- Drop the table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create the new profiles table with all 26 columns
CREATE TABLE public.profiles (
  -- System fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- From Auth System
  email TEXT NOT NULL,
  
  -- From CV (LLM Extraction)
  first_name TEXT,
  last_name TEXT,
  linkedin_url TEXT,
  years_of_experience INTEGER,
  undergraduate_university TEXT,
  languages TEXT[] DEFAULT '{}',
  current_location TEXT,
  "current_role" TEXT,
  current_company TEXT,
  
  -- From User Input (Onboarding)
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'alumni')),
  lbs_program TEXT CHECK (lbs_program IN ('MAM', 'MIM', 'MBA', 'MFA')),
  graduation_year INTEGER,
  networking_goal TEXT NOT NULL,
  target_industries TEXT[] NOT NULL DEFAULT '{}',
  specific_interests TEXT,
  connect_with_students BOOLEAN DEFAULT true,
  connect_with_alumni BOOLEAN DEFAULT true,
  send_weekly_updates BOOLEAN DEFAULT true,
  
  -- System/Storage fields
  cv_path TEXT,
  cv_uploaded_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_profiles_target_industries ON public.profiles USING GIN(target_industries);
CREATE INDEX idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view other profiles (for matching purposes)
CREATE POLICY "Users can view other profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    onboarding_completed = true
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile updates
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

