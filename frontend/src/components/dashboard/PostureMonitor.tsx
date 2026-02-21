import { useEffect, useRef } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POSE_CONNECTIONS, LANDMARK, PostureMetrics } from "@/lib/postureAnalysis";
import { Camera, Loader2, AlertCircle, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface PostureMonitorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  landmarks: NormalizedLandmark[] | null;
  metrics: PostureMetrics | null;
  isRunning: boolean;
  isLoading: boolean;
  error: string | null;
}

const UPPER_BODY_INDICES = new Set([
  LANDMARK.NOSE, LANDMARK.LEFT_EYE, LANDMARK.RIGHT_EYE,
  LANDMARK.LEFT_EAR, LANDMARK.RIGHT_EAR,
  LANDMARK.LEFT_SHOULDER, LANDMARK.RIGHT_SHOULDER,
  LANDMARK.LEFT_ELBOW, LANDMARK.RIGHT_ELBOW,
  LANDMARK.LEFT_WRIST, LANDMARK.RIGHT_WRIST,
  LANDMARK.LEFT_HIP, LANDMARK.RIGHT_HIP,
]);

const PostureMonitor = ({ videoRef, landmarks, metrics, isRunning, isLoading, error }: PostureMonitorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !landmarks) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const statusColor = metrics?.status === "good" ? "#10b981" : metrics?.status === "fair" ? "#f59e0b" : "#ef4444";

    // Draw connections
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (const [start, end] of POSE_CONNECTIONS) {
      const a = landmarks[start];
      const b = landmarks[end];
      if ((a.visibility ?? 0) > 0.5 && (b.visibility ?? 0) > 0.5) {
        ctx.beginPath();
        ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
        ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
        ctx.stroke();
      }
    }

    // Draw keypoints
    for (const idx of UPPER_BODY_INDICES) {
      const lm = landmarks[idx];
      if ((lm.visibility ?? 0) > 0.5) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = statusColor;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [landmarks, metrics, videoRef]);

  const StatusIcon = metrics?.status === "good" ? CheckCircle2 : metrics?.status === "fair" ? AlertTriangle : XCircle;
  const statusLabel = metrics?.status === "good" ? "Good Posture" : metrics?.status === "fair" ? "Fair — Adjust" : "Poor — Correct Now";
  const statusColorClass = metrics?.status === "good" ? "text-success" : metrics?.status === "fair" ? "text-warning" : "text-destructive";

  return (
    <Card className="shadow-soft overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            Live Posture Monitor
          </span>
          {isRunning && metrics && (
            <span className={`flex items-center gap-1.5 text-sm font-medium ${statusColorClass}`}>
              <StatusIcon className="h-4 w-4" />
              {statusLabel}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {/* Video */}
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
            playsInline
            muted
          />
          {/* Canvas overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* States */}
          {!isRunning && !isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
              <Camera className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Click "Start Monitoring" to begin</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading AI model...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
              <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
              <p className="max-w-xs text-center text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Live metrics overlay */}
          <AnimatePresence>
            {isRunning && metrics && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-3 left-3 right-3 flex gap-2"
              >
                <MetricBadge label="Score" value={`${metrics.overallScore}`} />
                <MetricBadge label="Neck" value={`${metrics.neckAngle}°`} />
                <MetricBadge label="Spine" value={`${metrics.spineAngle}°`} />
                <MetricBadge label="Shoulders" value={`${metrics.shoulderAlignment}%`} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Issues list */}
        <AnimatePresence>
          {isRunning && metrics && metrics.issues.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border"
            >
              <div className="space-y-1 p-4">
                {metrics.issues.map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                    <span className="text-foreground">{issue}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

const MetricBadge = ({ label, value }: { label: string; value: string }) => (
  <div className="flex-1 rounded-lg bg-foreground/70 px-2 py-1.5 text-center backdrop-blur-sm">
    <p className="text-[10px] text-primary-foreground/70">{label}</p>
    <p className="text-sm font-bold text-primary-foreground">{value}</p>
  </div>
);

export default PostureMonitor;
