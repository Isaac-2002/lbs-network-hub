-- Create profiles table
-- This table extends Supabase Auth users with additional profile information

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Basic information
  name TEXT,
  email TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'alumni')),
  program TEXT,
  
  -- CV storage reference
  cv_path TEXT,
  
  -- Student-specific fields
  post_graduation_goal TEXT CHECK (post_graduation_goal IN ('exploring', 'venture', 'figuring-out')),
  specific_interests TEXT,
  connect_with_students BOOLEAN DEFAULT true,
  connect_with_alumni BOOLEAN DEFAULT true,
  
  -- Alumni-specific fields
  goal TEXT CHECK (goal IN ('expand', 'pivot', 'give-back')),
  reach_out_about TEXT,
  allow_students BOOLEAN DEFAULT true,
  allow_alumni BOOLEAN DEFAULT true,
  
  -- Common fields
  selected_industries TEXT[] DEFAULT '{}',
  send_matches BOOLEAN DEFAULT true,
  linkedin_url TEXT,
  summary TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on user_type for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can view other profiles (for matching purposes)
-- You may want to restrict this further based on your matching logic
CREATE POLICY "Users can view other profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

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

-- Note: Profile creation is handled during onboarding, not via trigger
-- This is because user_type is required and is set during onboarding
-- Profiles are created/updated in the onboarding flow with all required fields

