// Custom hook for profile operations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Profile, ProfileUpdate } from '@/lib/types';
import { supabase } from '@/lib/api/supabase';
import { createProfileRepository } from '../services/profileRepository';
import { ProfileService } from '../services/profileService';

// Create service instance
const profileRepository = createProfileRepository(supabase);
const profileService = new ProfileService(profileRepository);

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return profileService.getProfile(userId);
    },
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ProfileUpdate }) =>
      profileService.updateProfile(userId, data),
    onSuccess: (_, variables) => {
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
    },
  });
};

export const useProfileService = () => {
  return profileService;
};
