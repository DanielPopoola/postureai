import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostureMetrics } from "@/lib/postureAnalysis";
import { Activity } from "lucide-react";

interface PostureHeatmapProps {
  metrics: PostureMetrics | null;
}

const PostureHeatmap = ({ metrics }: PostureHeatmapProps) => {
  const bodyParts = useMemo(() => {
    if (!metrics) {
      return [
        { name: "Head", severity: 0, x: 50, y: 8, r: 14 },
        { name: "Neck", severity: 0, x: 50, y: 22, r: 8 },
        { name: "L. Shoulder", severity: 0, x: 30, y: 30, r: 10 },
        { name: "R. Shoulder", severity: 0, x: 70, y: 30, r: 10 },
        { name: "Upper Back", severity: 0, x: 50, y: 38, r: 12 },
        { name: "Lower Back", severity: 0, x: 50, y: 55, r: 12 },
      ];
    }

    const neckSeverity = metrics.neckAngle < 150 ? Math.min(1, (150 - metrics.neckAngle) / 50) : 0;
    const spineSeverity = metrics.spineAngle > 15 ? Math.min(1, (metrics.spineAngle - 15) / 30) : 0;
    const shoulderSeverity = metrics.shoulderAlignment < 80 ? Math.min(1, (80 - metrics.shoulderAlignment) / 40) : 0;
    const headSeverity = metrics.issues.some(i => i.includes("Head")) ? 0.7 : neckSeverity * 0.5;

    return [
      { name: "Head", severity: headSeverity, x: 50, y: 8, r: 14 },
      { name: "Neck", severity: neckSeverity, x: 50, y: 22, r: 8 },
      { name: "L. Shoulder", severity: shoulderSeverity, x: 30, y: 30, r: 10 },
      { name: "R. Shoulder", severity: shoulderSeverity, x: 70, y: 30, r: 10 },
      { name: "Upper Back", severity: spineSeverity * 0.7, x: 50, y: 38, r: 12 },
      { name: "Lower Back", severity: spineSeverity, x: 50, y: 55, r: 12 },
    ];
  }, [metrics]);

  const getColor = (severity: number) => {
    if (severity === 0) return "hsl(var(--success))";
    if (severity < 0.3) return "hsl(var(--success))";
    if (severity < 0.6) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getOpacity = (severity: number) => {
    if (severity === 0) return 0.2;
    return 0.3 + severity * 0.5;
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Body Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto" style={{ width: "160px", height: "180px" }}>
          {/* Simple body outline */}
          <svg viewBox="0 0 100 80" className="h-full w-full">
            {/* Body outline */}
            <line x1="50" y1="16" x2="50" y2="22" stroke="hsl(var(--border))" strokeWidth="2" />
            <line x1="50" y1="22" x2="30" y2="32" stroke="hsl(var(--border))" strokeWidth="2" />
            <line x1="50" y1="22" x2="70" y2="32" stroke="hsl(var(--border))" strokeWidth="2" />
            <line x1="50" y1="22" x2="50" y2="55" stroke="hsl(var(--border))" strokeWidth="2" />
            <line x1="30" y1="32" x2="20" y2="48" stroke="hsl(var(--border))" strokeWidth="2" />
            <line x1="70" y1="32" x2="80" y2="48" stroke="hsl(var(--border))" strokeWidth="2" />
            <line x1="50" y1="55" x2="35" y2="75" stroke="hsl(var(--border))" strokeWidth="2" />
            <line x1="50" y1="55" x2="65" y2="75" stroke="hsl(var(--border))" strokeWidth="2" />

            {/* Heatmap circles */}
            {bodyParts.map((part) => (
              <circle
                key={part.name}
                cx={part.x}
                cy={part.y}
                r={part.r}
                fill={getColor(part.severity)}
                opacity={getOpacity(part.severity)}
                className="transition-all duration-500"
              />
            ))}

            {/* Keypoints */}
            {bodyParts.map((part) => (
              <circle
                key={`dot-${part.name}`}
                cx={part.x}
                cy={part.y}
                r="2.5"
                fill={getColor(part.severity)}
                className="transition-all duration-300"
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-success" />
            Good
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-warning" />
            Fair
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            Poor
          </div>
        </div>

        {/* Active issues */}
        {metrics && metrics.issues.length > 0 && (
          <div className="mt-3 space-y-1 rounded-lg bg-destructive/10 p-2">
            {metrics.issues.map((issue, i) => (
              <p key={i} className="text-[11px] text-destructive">• {issue}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostureHeatmap;
