// Matching Service - Business logic for matching operations
import { Match, MatchCriteria, Profile } from '@/lib/types';
import { IProfileRepository } from '@/features/profile/services/profileRepository';

export interface IMatchRepository {
  findMatchesForUser(userId: string): Promise<Match[]>;
  createMatch(match: Omit<Match, 'id' | 'createdAt'>): Promise<Match>;
  updateMatchStatus(matchId: string, status: string): Promise<void>;
}

export class MatchingService {
  constructor(
    private profileRepository: IProfileRepository,
    private matchRepository: IMatchRepository
  ) {}

  async getUserMatches(userId: string): Promise<Match[]> {
    // Get matches for the user
    const matches = await this.matchRepository.findMatchesForUser(userId);

    // Filter out expired matches
    const activeMatches = matches.filter(match => {
      if (match.expiresAt) {
        return new Date(match.expiresAt) > new Date();
      }
      return true;
    });

    return activeMatches;
  }

  async filterCandidates(userProfile: Profile): Promise<Profile[]> {
    // Build matching criteria based on user preferences
    const criteria: MatchCriteria = {
      userType: userProfile.connect_with_students && userProfile.connect_with_alumni
        ? undefined
        : userProfile.connect_with_students
        ? 'student'
        : 'alumni',
      industries: userProfile.target_industries,
    };

    // Get candidate profiles
    const candidates = await this.profileRepository.findCandidates(criteria);

    // Filter out the user themselves
    return candidates.filter(c => c.user_id !== userProfile.user_id);
  }

  async acceptMatch(matchId: string): Promise<void> {
    await this.matchRepository.updateMatchStatus(matchId, 'accepted');
  }

  async declineMatch(matchId: string): Promise<void> {
    await this.matchRepository.updateMatchStatus(matchId, 'declined');
  }
}
