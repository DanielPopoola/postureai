import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PostureMetrics } from "@/lib/postureAnalysis";

interface Props {
  liveMetrics?: PostureMetrics | null;
}

const PostureScoreRing = ({ liveMetrics }: Props) => {
  const score = liveMetrics?.overallScore ?? 82;
  const neckVal = liveMetrics ? Math.min(100, Math.round((liveMetrics.neckAngle / 180) * 100)) : 75;
  const shoulderVal = liveMetrics?.shoulderAlignment ?? 82;
  const spineVal = liveMetrics ? Math.max(0, 100 - liveMetrics.spineAngle * 3) : 88;
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Current Posture Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
          <div className="relative">
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="60" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <motion.circle
                cx="75"
                cy="75"
                r="60"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                transform="rotate(-90 75 75)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{score}</span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </div>

          <div className="space-y-3">
            <ScoreItem label="Spine Alignment" value={spineVal} />
            <ScoreItem label="Neck Angle" value={neckVal} />
            <ScoreItem label="Shoulder Position" value={shoulderVal} />
            <ScoreItem label="Sitting Balance" value={Math.round((score + spineVal) / 2)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ScoreItem = ({ label, value }: { label: string; value: number }) => (
  <div className="w-48">
    <div className="mb-1 flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}%</span>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      />
    </div>
  </div>
);

export default PostureScoreRing;
