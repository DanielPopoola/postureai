import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Gamification } from "@/lib/api";

export interface Badge {
  id: string;
  badge_key: string;
  earned_at: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export function useGamification(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["gamification", userId],
    queryFn: async () => {
      const { data } = await api.get<Gamification>("/gamification");
      return data;
    },
    enabled: !!userId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
  };

  return {
    streak: query.data?.streak ?? null,
    badges: query.data?.badges ?? [],
    isLoading: query.isLoading,
    invalidate,
  };
}