// Custom hook for matching operations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import { createMatchRepository, MatchWithProfile } from '../services/matchRepository';
import { MatchingService } from '../services/matchingService';

const matchRepository = createMatchRepository(supabase);
const matchingService = new MatchingService(matchRepository);

export const useMatches = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['matches', userId],
    queryFn: async (): Promise<MatchWithProfile[]> => {
      if (!userId) return [];
      return await matchingService.getUserMatches(userId);
    },
    enabled: !!userId,
  });
};

export const useGenerateRecommendations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await matchingService.generateRecommendations(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useAcceptMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      // TODO: Implement accept match functionality
      console.log('Accepting match:', matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useDeclineMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      // TODO: Implement decline match functionality
      console.log('Declining match:', matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};
