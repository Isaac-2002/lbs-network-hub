// Match Repository - Handles all match data access
import { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/lib/api/errors';

export interface MatchWithProfile {
  id: string;
  user_id: string;
  matched_user_id: string;
  score: number;
  reason: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  matched_profile: {
    first_name: string;
    last_name: string;
    email: string;
    linkedin_url: string | null;
    current_role: string | null;
    lbs_program: string | null;
    graduation_year: number | null;
  };
}

export interface IMatchRepository {
  findMatchesForUser(userId: string, status?: string): Promise<MatchWithProfile[]>;
  generateRecommendations(userId: string): Promise<MatchWithProfile[]>;
}

export class SupabaseMatchRepository implements IMatchRepository {
  constructor(private supabase: SupabaseClient) {}

  async findMatchesForUser(userId: string, status: string = 'pending'): Promise<MatchWithProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('matches')
        .select(`
          *,
          matched_profile:profiles!matches_matched_user_id_fkey(
            first_name,
            last_name,
            email,
            linkedin_url,
            current_role,
            lbs_program,
            graduation_year
          )
        `)
        .eq('user_id', userId)
        .eq('status', status)
        .order('score', { ascending: false });

      if (error) {
        throw new RepositoryError(error.message, error.code);
      }

      return data as MatchWithProfile[];
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Failed to fetch matches');
    }
  }

  async generateRecommendations(userId: string): Promise<MatchWithProfile[]> {
    try {
      const { data, error } = await this.supabase.functions.invoke('generate-recommendations', {
        body: { userId },
      });

      if (error) {
        throw new RepositoryError(error.message);
      }

      if (!data.success) {
        throw new RepositoryError(data.error || 'Failed to generate recommendations');
      }

      return data.data as MatchWithProfile[];
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Failed to generate recommendations');
    }
  }
}

// Export a factory function to create repository instances
export const createMatchRepository = (supabase: SupabaseClient): IMatchRepository => {
  return new SupabaseMatchRepository(supabase);
};
