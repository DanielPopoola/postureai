import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Badge {
  id: string;
  badge_key: string;
  earned_at: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_sessions: number;
}

interface GamificationData {
  streak: Streak;
  badges: Badge[];
}

export const BADGE_DEFINITIONS: Record<string, { name: string; icon: string; description: string }> = {
  first_session: { name: "First Step",     icon: "🎯", description: "Complete your first session"  },
  streak_3:      { name: "On a Roll",      icon: "🔥", description: "3-day monitoring streak"       },
  streak_7:      { name: "Week Warrior",   icon: "⚡", description: "7-day monitoring streak"       },
  streak_30:     { name: "Monthly Master", icon: "👑", description: "30-day monitoring streak"      },
};

export function useGamification(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["gamification", userId],
    queryFn: async () => {
      const { data } = await api.get<GamificationData>("/gamification");
      return data;
    },
    enabled: !!userId,
  });

  return {
    streak: query.data?.streak ?? null,
    badges: query.data?.badges ?? [],
    isLoading: query.isLoading,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ["gamification"] }),
  };
}