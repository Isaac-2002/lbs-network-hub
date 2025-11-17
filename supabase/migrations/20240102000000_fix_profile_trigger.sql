-- Fix the handle_new_user trigger issue
-- The trigger was trying to create a profile without user_type, which is NOT NULL
-- Since profiles are created during onboarding with all required fields,
-- we'll remove the auto-creation trigger to prevent errors

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

