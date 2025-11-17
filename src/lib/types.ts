// Database types for Supabase tables

export type UserType = 'student' | 'alumni';

export type PostGraduationGoal = 'exploring' | 'venture' | 'figuring-out';

export type AlumniGoal = 'expand' | 'pivot' | 'give-back';

export interface Profile {
  id: string; // UUID, references auth.users(id)
  // Basic information
  name: string | null;
  email: string | null;
  user_type: UserType;
  program: string | null;
  
  // CV storage reference
  cv_path: string | null;
  
  // Student-specific fields
  post_graduation_goal: PostGraduationGoal | null;
  specific_interests: string | null;
  connect_with_students: boolean;
  connect_with_alumni: boolean;
  
  // Alumni-specific fields
  goal: AlumniGoal | null;
  reach_out_about: string | null;
  allow_students: boolean;
  allow_alumni: boolean;
  
  // Common fields
  selected_industries: string[];
  send_matches: boolean;
  linkedin_url: string | null;
  summary: string | null;
  
  // Timestamps
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Helper type for creating/updating profiles (all fields optional except user_type)
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

