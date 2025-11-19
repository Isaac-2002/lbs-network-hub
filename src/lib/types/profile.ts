// Database types for Supabase tables

export type UserType = 'student' | 'alumni';

export type LBSProgram = 'MAM' | 'MIM' | 'MBA' | 'MFA';

// Complete Profile interface matching the 26-column database schema
export interface Profile {
  // System fields
  id: string; // UUID
  user_id: string; // UUID, references auth.users(id)
  
  // From Auth System
  email: string;
  
  // From CV (LLM Extraction)
  first_name: string | null;
  last_name: string | null;
  linkedin_url: string | null;
  years_of_experience: number | null;
  undergraduate_university: string | null;
  languages: string[]; // Array of languages
  current_location: string | null;
  current_role: string | null;
  current_company: string | null;
  
  // From User Input (Onboarding)
  user_type: UserType;
  lbs_program: LBSProgram | null;
  graduation_year: number | null;
  networking_goal: string; // Required - describes user's networking objective
  target_industries: string[]; // Required - array of industries
  specific_interests: string | null;
  connect_with_students: boolean;
  connect_with_alumni: boolean;
  send_weekly_updates: boolean;
  
  // System/Storage
  cv_path: string | null;
  cv_uploaded_at: string | null; // ISO timestamp
  onboarding_completed: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Helper types for creating/updating profiles
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at'>>;

// Types for CV extraction
export interface CVExtractionData {
  first_name: string | null;
  last_name: string | null;
  linkedin_url: string | null;
  years_of_experience: number | null;
  undergraduate_university: string | null;
  languages: string[];
  current_location: string | null;
  current_role: string | null;
  current_company: string | null;
  lbs_program: LBSProgram | null;
  graduation_year: number | null;
}
