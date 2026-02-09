import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Bell, Camera, CameraOff, TrendingUp, Clock, Gauge, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import PostureMonitor from "@/components/dashboard/PostureMonitor";
import PostureScoreRing from "@/components/dashboard/PostureScoreRing";
import SessionHistory from "@/components/dashboard/SessionHistory";
import AlertsFeed from "@/components/dashboard/AlertsFeed";
import ErgonomicTips from "@/components/dashboard/ErgonomicTips";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useAuth } from "@/hooks/useAuth";
import { usePostureSession } from "@/hooks/usePostureSession";
import { useBreakReminder } from "@/hooks/useBreakReminder";
import { PostureMetrics } from "@/lib/postureAnalysis";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [liveMetrics, setLiveMetrics] = useState<PostureMetrics | null>(null);
  const prevIssuesRef = useRef<string[]>([]);

  const { startSession, endSession, updateMetrics, saveAlert } = usePostureSession(user?.id);
  const { startReminders, stopReminders } = useBreakReminder();

  const handleMetricsUpdate = useCallback((m: PostureMetrics) => {
    setLiveMetrics(m);
    updateMetrics(m);

    // Save new alerts that weren't in previous frame
    const newIssues = m.issues.filter(i => !prevIssuesRef.current.includes(i));
    newIssues.forEach(issue => saveAlert(issue));
    prevIssuesRef.current = m.issues;
  }, [updateMetrics, saveAlert]);

  const { videoRef, landmarks, metrics, isLoading, isRunning, error, start, stop } =
    usePoseDetection({ onMetricsUpdate: handleMetricsUpdate });

  const handleToggle = async () => {
    if (isRunning) {
      stop();
      stopReminders();
      await endSession();
      setLiveMetrics(null);
      prevIssuesRef.current = [];
    } else {
      await startSession();
      start();
      startReminders();
    }
  };

  const handleSignOut = async () => {
    if (isRunning) {
      stop();
      stopReminders();
      await endSession();
    }
    await signOut();
    navigate("/auth");
  };

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const displayScore = liveMetrics?.overallScore ?? 82;
  const displayStatus = liveMetrics ? (liveMetrics.status === "good" ? "Healthy" : liveMetrics.status === "fair" ? "Needs adjustment" : "Correct now") : "Start monitoring";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">PostureAI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/history">
              <Button variant="outline" size="sm" className="gap-2">
                <TrendingUp className="h-4 w-4" /> History
              </Button>
            </Link>
            <Button
              variant={isRunning ? "destructive" : "default"}
              size="sm"
              className="gap-2"
              onClick={handleToggle}
              disabled={isLoading}
            >
              {isRunning ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              {isLoading ? "Loading..." : isRunning ? "Stop" : "Start Monitoring"}
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor your posture and track improvements</p>
        </motion.div>

        {isRunning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3"
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span className="text-sm font-medium text-foreground">
              Posture monitoring active — AI is analyzing your position in real time
            </span>
          </motion.div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Gauge} label="Posture Score" value={`${displayScore}/100`} trend={displayStatus} positive={liveMetrics?.status === "good"} />
          <StatCard icon={Clock} label="Today's Session" value="Active" trend={isRunning ? "Recording" : "Not started"} />
          <StatCard icon={Bell} label="Alerts Today" value={liveMetrics ? `${liveMetrics.issues.length}` : "0"} trend={liveMetrics ? "Live" : "Start to track"} positive={liveMetrics ? liveMetrics.issues.length === 0 : true} />
          <StatCard icon={TrendingUp} label="Status" value={user ? "Connected" : "—"} trend="Data is being saved" positive />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PostureMonitor videoRef={videoRef} landmarks={landmarks} metrics={metrics} isRunning={isRunning} isLoading={isLoading} error={error} />
            <PostureScoreRing liveMetrics={liveMetrics} />
            <SessionHistory />
          </div>
          <div className="space-y-6">
            <AlertsFeed liveIssues={isRunning ? liveMetrics?.issues ?? [] : []} />
            <ErgonomicTips />
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, positive }: {
  icon: React.ElementType; label: string; value: string; trend: string; positive?: boolean;
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Card className="shadow-soft">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className={`text-xs ${positive ? "text-success" : "text-muted-foreground"}`}>{trend}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default Dashboard;
