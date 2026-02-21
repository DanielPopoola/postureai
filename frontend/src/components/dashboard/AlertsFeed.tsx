import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const defaultAlerts = [
  { type: "warning", message: "Neck tilted forward — adjust screen height", time: "2 min ago" },
  { type: "success", message: "Great posture maintained for 25 minutes!", time: "15 min ago" },
  { type: "warning", message: "Shoulders raised — try to relax", time: "32 min ago" },
  { type: "info", message: "Time for a stretch break", time: "1 hr ago" },
  { type: "success", message: "Spine alignment improved by 8%", time: "2 hr ago" },
];

const iconMap = {
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  info: <Info className="h-4 w-4 text-info" />,
};

interface AlertsFeedProps {
  liveIssues?: string[];
}

const AlertsFeed = ({ liveIssues = [] }: AlertsFeedProps) => {
  const liveAlerts = liveIssues.map((msg) => ({ type: "warning" as const, message: msg, time: "Now" }));
  const alerts = liveAlerts.length > 0
    ? [...liveAlerts, ...defaultAlerts.slice(0, 3)]
    : defaultAlerts;

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
            <div className="mt-0.5 shrink-0">{iconMap[alert.type as keyof typeof iconMap]}</div>
            <div className="min-w-0">
              <p className="text-sm text-foreground">{alert.message}</p>
              <p className="text-xs text-muted-foreground">{alert.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AlertsFeed;
