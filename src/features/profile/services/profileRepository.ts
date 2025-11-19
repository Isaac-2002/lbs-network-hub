// Profile Repository - Handles all profile data access
import { SupabaseClient } from '@supabase/supabase-js';
import { Profile, ProfileUpdate, MatchCriteria } from '@/lib/types';
import { RepositoryError, NotFoundError } from '@/lib/api/errors';

export interface IProfileRepository {
  findById(userId: string): Promise<Profile | null>;
  findByEmail(email: string): Promise<Profile | null>;
  findCandidates(criteria: MatchCriteria): Promise<Profile[]>;
  findUsersWithWeeklyUpdates(): Promise<Profile[]>;
  update(userId: string, data: ProfileUpdate): Promise<void>;
  create(profile: Partial<Profile>): Promise<Profile>;
}

export class SupabaseProfileRepository implements IProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new RepositoryError(error.message, error.code);
      }

      return data ? this.mapToProfile(data) : null;
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Failed to fetch profile');
    }
  }

  async findByEmail(email: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new RepositoryError(error.message, error.code);
      }

      return data ? this.mapToProfile(data) : null;
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Failed to fetch profile by email');
    }
  }

  async findCandidates(criteria: MatchCriteria): Promise<Profile[]> {
    try {
      let query = this.supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_completed', true);

      // Apply filters based on criteria
      if (criteria.industries && criteria.industries.length > 0) {
        query = query.overlaps('target_industries', criteria.industries);
      }

      if (criteria.userType) {
        query = query.eq('user_type', criteria.userType);
      }

      if (criteria.programs && criteria.programs.length > 0) {
        query = query.in('lbs_program', criteria.programs);
      }

      if (criteria.minExperience !== undefined) {
        query = query.gte('years_of_experience', criteria.minExperience);
      }

      if (criteria.maxExperience !== undefined) {
        query = query.lte('years_of_experience', criteria.maxExperience);
      }

      const { data, error } = await query;

      if (error) {
        throw new RepositoryError(error.message, error.code);
      }

      return data.map(this.mapToProfile);
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Failed to fetch candidate profiles');
    }
  }

  async findUsersWithWeeklyUpdates(): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('send_weekly_updates', true)
        .eq('onboarding_completed', true);

      if (error) {
        throw new RepositoryError(error.message, error.code);
      }

      return data.map(this.mapToProfile);
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Failed to fetch users with weekly updates');
    }
  }

  async update(userId: string, data: ProfileUpdate): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        throw new RepositoryError(error.message, error.code);
      }
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Failed to update profile');
    }
  }

  async create(profile: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        throw new RepositoryError(error.message, error.code);
      }

      return this.mapToProfile(data);
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError('Failed to create profile');
    }
  }

  private mapToProfile(row: any): Profile {
    // Transform database row to domain model
    return {
      ...row,
      created_at: row.created_at,
      updated_at: row.updated_at,
      cv_uploaded_at: row.cv_uploaded_at,
    };
  }
}

// Export a factory function to create repository instances
export const createProfileRepository = (supabase: SupabaseClient): IProfileRepository => {
  return new SupabaseProfileRepository(supabase);
};
