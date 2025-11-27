// Matching Service - Business logic for matching operations
import { IMatchRepository, MatchWithProfile } from './matchRepository';

export class MatchingService {
  constructor(private matchRepository: IMatchRepository) {}

  async getUserMatches(userId: string): Promise<MatchWithProfile[]> {
    // Get pending matches for the user
    const matches = await this.matchRepository.findMatchesForUser(userId, 'pending');

    // Filter out expired matches
    const activeMatches = matches.filter(match => {
      if (match.expires_at) {
        return new Date(match.expires_at) > new Date();
      }
      return true;
    });

    return activeMatches;
  }

  async generateRecommendations(userId: string): Promise<MatchWithProfile[]> {
    // Call the edge function to generate recommendations
    return await this.matchRepository.generateRecommendations(userId);
  }

  async generateRecommendationsAndSendEmail(userId: string): Promise<MatchWithProfile[]> {
    // Step 1: Generate recommendations
    const matches = await this.matchRepository.generateRecommendations(userId);

    // Step 2: Send email with the matches (only if matches exist)
    if (matches.length > 0) {
      await this.matchRepository.sendMatchEmail(userId, matches);
    }

    return matches;
  }
}
