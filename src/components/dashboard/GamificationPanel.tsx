import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy, Target, Star } from "lucide-react";
import { Badge as BadgeType } from "@/hooks/useGamification";

interface GamificationPanelProps {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  goodPostureMinutes: number;
  badges: BadgeType[];
  allBadgeCount: number;
}

const GamificationPanel = ({
  currentStreak,
  longestStreak,
  totalSessions,
  goodPostureMinutes,
  badges,
  allBadgeCount,
}: GamificationPanelProps) => {
  const hours = Math.floor(goodPostureMinutes / 60);
  const mins = goodPostureMinutes % 60;

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak display */}
        <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
            <Flame className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{currentStreak} day streak</p>
            <p className="text-xs text-muted-foreground">Best: {longestStreak} days</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-secondary p-2.5 text-center">
            <Target className="mx-auto mb-1 h-4 w-4 text-primary" />
            <p className="text-lg font-bold text-foreground">{totalSessions}</p>
            <p className="text-[10px] text-muted-foreground">Sessions</p>
          </div>
          <div className="rounded-lg bg-secondary p-2.5 text-center">
            <Star className="mx-auto mb-1 h-4 w-4 text-primary" />
            <p className="text-lg font-bold text-foreground">{hours}h {mins}m</p>
            <p className="text-[10px] text-muted-foreground">Good Posture</p>
          </div>
        </div>

        {/* Badges */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Badges ({badges.length}/{allBadgeCount})
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.length === 0 ? (
              <p className="text-xs text-muted-foreground">Complete sessions to earn badges!</p>
            ) : (
              badges.map((badge) => (
                <motion.div
                  key={badge.badge_id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1"
                  title={badge.badge_description}
                >
                  <span className="text-sm">{badge.badge_icon}</span>
                  <span className="text-xs font-medium text-accent-foreground">{badge.badge_name}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GamificationPanel;
