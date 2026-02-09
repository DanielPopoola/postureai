import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Badge {
  id: string;
  badge_id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  earned_at: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
  total_sessions: number;
  total_good_posture_minutes: number;
}

const BADGE_DEFINITIONS = [
  { id: "first_session", name: "First Steps", description: "Complete your first posture session", icon: "🎯", check: (s: Streak) => s.total_sessions >= 1 },
  { id: "streak_3", name: "On a Roll", description: "3-day monitoring streak", icon: "🔥", check: (s: Streak) => s.current_streak >= 3 },
  { id: "streak_7", name: "Week Warrior", description: "7-day monitoring streak", icon: "⚡", check: (s: Streak) => s.current_streak >= 7 },
  { id: "streak_30", name: "Monthly Master", description: "30-day monitoring streak", icon: "👑", check: (s: Streak) => s.current_streak >= 30 },
  { id: "sessions_10", name: "Dedicated", description: "Complete 10 sessions", icon: "💪", check: (s: Streak) => s.total_sessions >= 10 },
  { id: "sessions_50", name: "Posture Pro", description: "Complete 50 sessions", icon: "🏆", check: (s: Streak) => s.total_sessions >= 50 },
  { id: "good_hour", name: "Good Hour", description: "60 minutes of good posture", icon: "⏰", check: (s: Streak) => s.total_good_posture_minutes >= 60 },
  { id: "good_10h", name: "Posture Champion", description: "10 hours of good posture", icon: "🥇", check: (s: Streak) => s.total_good_posture_minutes >= 600 },
];

export function useGamification(userId: string | undefined) {
  const queryClient = useQueryClient();

  const streakQuery = useQuery({
    queryKey: ["user_streaks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data as Streak | null;
    },
    enabled: !!userId,
  });

  const badgesQuery = useQuery({
    queryKey: ["user_badges", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return data as Badge[];
    },
    enabled: !!userId,
  });

  const updateStreakOnSessionEnd = useCallback(async (avgScore: number | null, durationMinutes: number) => {
    if (!userId) return;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Get or create streak record
    let { data: streak } = await supabase
      .from("user_streaks")
      .select("*")
      .maybeSingle();

    const goodMinutes = avgScore && avgScore >= 70 ? durationMinutes : 0;

    if (!streak) {
      await supabase.from("user_streaks").insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_session_date: today,
        total_sessions: 1,
        total_good_posture_minutes: goodMinutes,
      });
    } else {
      const lastDate = streak.last_session_date;
      let newStreak = streak.current_streak;

      if (lastDate === today) {
        // Already counted today
      } else if (lastDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(streak.longest_streak, newStreak),
          last_session_date: today,
          total_sessions: streak.total_sessions + 1,
          total_good_posture_minutes: streak.total_good_posture_minutes + goodMinutes,
        })
        .eq("user_id", userId);
    }

    // Check and award badges
    const { data: updatedStreak } = await supabase
      .from("user_streaks")
      .select("*")
      .maybeSingle();

    if (updatedStreak) {
      const { data: existingBadges } = await supabase
        .from("user_badges")
        .select("badge_id");

      const earnedIds = new Set((existingBadges ?? []).map((b: any) => b.badge_id));

      for (const badge of BADGE_DEFINITIONS) {
        if (!earnedIds.has(badge.id) && badge.check(updatedStreak as Streak)) {
          await supabase.from("user_badges").insert({
            user_id: userId,
            badge_id: badge.id,
            badge_name: badge.name,
            badge_description: badge.description,
            badge_icon: badge.icon,
          });
        }
      }
    }

    queryClient.invalidateQueries({ queryKey: ["user_streaks"] });
    queryClient.invalidateQueries({ queryKey: ["user_badges"] });
  }, [userId, queryClient]);

  return {
    streak: streakQuery.data,
    badges: badgesQuery.data ?? [],
    allBadges: BADGE_DEFINITIONS,
    isLoading: streakQuery.isLoading || badgesQuery.isLoading,
    updateStreakOnSessionEnd,
  };
}
