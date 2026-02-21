import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy, Target } from "lucide-react";
import { Badge as BadgeType, BADGE_DEFINITIONS } from "@/hooks/useGamification";

interface GamificationPanelProps {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  badges: BadgeType[];
}

const GamificationPanel = ({ currentStreak, longestStreak, totalSessions, badges }: GamificationPanelProps) => (
  <Card className="shadow-soft">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <Trophy className="h-4 w-4 text-primary" />
        Achievements
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
          <Flame className="h-5 w-5 text-warning" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{currentStreak} day streak</p>
          <p className="text-xs text-muted-foreground">Best: {longestStreak} days</p>
        </div>
      </div>

      <div className="rounded-lg bg-secondary p-2.5 text-center">
        <Target className="mx-auto mb-1 h-4 w-4 text-primary" />
        <p className="text-lg font-bold text-foreground">{totalSessions}</p>
        <p className="text-[10px] text-muted-foreground">Total Sessions</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Badges ({badges.length}/{Object.keys(BADGE_DEFINITIONS).length})
        </p>
        {badges.length === 0 ? (
          <p className="text-xs text-muted-foreground">Complete sessions to earn badges!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => {
              const def = BADGE_DEFINITIONS[badge.badge_key] ?? { name: badge.badge_key, icon: "🏅", description: "" };
              return (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1"
                  title={def.description}
                >
                  <span className="text-sm">{def.icon}</span>
                  <span className="text-xs font-medium text-accent-foreground">{def.name}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default GamificationPanel;