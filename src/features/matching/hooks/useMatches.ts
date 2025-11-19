// Custom hook for matching operations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Match } from '@/lib/types';

// Placeholder for now - will be implemented when matching backend is ready
export const useMatches = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['matches', userId],
    queryFn: async (): Promise<Match[]> => {
      // TODO: Implement actual API call when backend is ready
      // For now, return empty array
      return [];
    },
    enabled: !!userId,
  });
};

export const useAcceptMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      // TODO: Implement actual API call
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
      // TODO: Implement actual API call
      console.log('Declining match:', matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};
