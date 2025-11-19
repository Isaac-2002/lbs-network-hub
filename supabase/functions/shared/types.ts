// Shared types for Supabase edge functions

export type UserType = 'student' | 'alumni';
export type LBSProgram = 'MAM' | 'MIM' | 'MBA' | 'MFA';
export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  linkedin_url: string | null;
  years_of_experience: number | null;
  undergraduate_university: string | null;
  languages: string[];
  current_location: string | null;
  current_role: string | null;
  current_company: string | null;
  user_type: UserType;
  lbs_program: LBSProgram | null;
  graduation_year: number | null;
  networking_goal: string;
  target_industries: string[];
  specific_interests: string | null;
  connect_with_students: boolean;
  connect_with_alumni: boolean;
  send_weekly_updates: boolean;
  cv_path: string | null;
  cv_uploaded_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user_id: string;
  matched_user_id: string;
  score: number;
  reason: string;
  status: MatchStatus;
  created_at: string;
  expires_at: string | null;
}

export interface ProfileSummary {
  id: string;
  user_id: string;
  summary_json: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CVExtractionResult {
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

export interface MatchingCriteria {
  industries?: string[];
  userType?: UserType;
  programs?: LBSProgram[];
  minExperience?: number;
  maxExperience?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
