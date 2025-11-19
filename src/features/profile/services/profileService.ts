// Profile Service - Business logic for profile operations
import { Profile, ProfileUpdate } from '@/lib/types';
import { IProfileRepository } from './profileRepository';

export class ProfileService {
  constructor(private profileRepository: IProfileRepository) {}

  async getProfile(userId: string): Promise<Profile | null> {
    return this.profileRepository.findById(userId);
  }

  async updateProfile(userId: string, data: ProfileUpdate): Promise<void> {
    // Add any business logic validation here
    if (data.target_industries && data.target_industries.length === 0) {
      throw new Error('At least one target industry is required');
    }

    await this.profileRepository.update(userId, data);
  }

  async isOnboardingComplete(userId: string): Promise<boolean> {
    const profile = await this.profileRepository.findById(userId);
    return profile?.onboarding_completed ?? false;
  }

  async completeOnboarding(userId: string): Promise<void> {
    await this.profileRepository.update(userId, {
      onboarding_completed: true,
    });
  }

  formatNetworkingGoal(goal: string): string {
    const goalMap: Record<string, string> = {
      exploring: 'Exploring specific industries',
      venture: 'Starting my own venture',
      'figuring-out': 'Still figuring it out',
      expand: 'Expand my network in my current industry',
      pivot: "I'm pivoting to a new industry",
      'give-back': 'I want to give back to the LBS community',
    };
    return goalMap[goal] || goal;
  }
}
