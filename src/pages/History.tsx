import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Calendar, TrendingUp, Clock, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { usePostureHistory } from "@/hooks/usePostureHistory";
import { format, parseISO, startOfDay, differenceInMinutes, subDays } from "date-fns";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

const History = () => {
  const [tab, setTab] = useState("daily");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sessions, snapshots, alerts } = usePostureHistory(user?.id);

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const today = useMemo(() => startOfDay(new Date()), []);

  // Derive daily data from snapshots captured today
  const dailyData = useMemo(() => {
    if (!snapshots.data) return [];
    const todaySnaps = snapshots.data.filter(s => startOfDay(parseISO(s.captured_at)).getTime() === today.getTime());
    const hourly: Record<string, { scores: number[]; neck: number[]; spine: number[]; shoulders: number[] }> = {};
    todaySnaps.forEach(s => {
      const hour = format(parseISO(s.captured_at), "h a");
      if (!hourly[hour]) hourly[hour] = { scores: [], neck: [], spine: [], shoulders: [] };
      hourly[hour].scores.push(s.posture_score);
      if (s.neck_angle != null) hourly[hour].neck.push(s.neck_angle);
      if (s.spine_angle != null) hourly[hour].spine.push(s.spine_angle);
      if (s.shoulder_tilt != null) hourly[hour].shoulders.push(s.shoulder_tilt);
    });
    return Object.entries(hourly).map(([time, v]) => ({
      time,
      score: Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
      neck: v.neck.length ? Math.round(v.neck.reduce((a, b) => a + b, 0) / v.neck.length) : 0,
      spine: v.spine.length ? Math.round(v.spine.reduce((a, b) => a + b, 0) / v.spine.length) : 0,
      shoulders: v.shoulders.length ? Math.round(v.shoulders.reduce((a, b) => a + b, 0) / v.shoulders.length) : 0,
    }));
  }, [snapshots.data, today]);

  // Weekly data from sessions
  const weeklyData = useMemo(() => {
    if (!sessions.data) return [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekAgo = subDays(new Date(), 7);
    const recentSessions = sessions.data.filter(s => parseISO(s.started_at) >= weekAgo);
    const byDay: Record<string, { scores: number[]; durations: number[] }> = {};
    recentSessions.forEach(s => {
      const day = days[parseISO(s.started_at).getDay()];
      if (!byDay[day]) byDay[day] = { scores: [], durations: [] };
      if (s.avg_posture_score != null) byDay[day].scores.push(s.avg_posture_score);
      if (s.ended_at) byDay[day].durations.push(differenceInMinutes(parseISO(s.ended_at), parseISO(s.started_at)) / 60);
    });
    return Object.entries(byDay).map(([day, v]) => ({
      day,
      score: v.scores.length ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : 0,
      duration: v.durations.length ? +(v.durations.reduce((a, b) => a + b, 0)).toFixed(1) : 0,
      sessions: v.scores.length,
    }));
  }, [sessions.data]);

  // Session log
  const sessionLog = useMemo(() => {
    if (!sessions.data) return [];
    return sessions.data.slice(0, 10).map(s => {
      const start = parseISO(s.started_at);
      const end = s.ended_at ? parseISO(s.ended_at) : null;
      const duration = end ? differenceInMinutes(end, start) : null;
      const hrs = duration ? Math.floor(duration / 60) : 0;
      const mins = duration ? duration % 60 : 0;
      const score = s.avg_posture_score ?? 0;
      return {
        date: format(start, "MMM d"),
        time: `${format(start, "h:mm a")}${end ? ` – ${format(end, "h:mm a")}` : " – ongoing"}`,
        duration: duration ? `${hrs}h ${mins}m` : "In progress",
        avgScore: score,
        alerts: s.total_alerts ?? 0,
        posture_state: (score >= 80 ? "good" : score >= 60 ? "fair" : "poor") as "good" | "fair" | "poor",
      };
    });
  }, [sessions.data]);

  // Summary stats
  const avgScore = useMemo(() => {
    if (!sessions.data || sessions.data.length === 0) return 0;
    const scores = sessions.data.filter(s => s.avg_posture_score != null).map(s => s.avg_posture_score!);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [sessions.data]);

  const totalHours = useMemo(() => {
    if (!sessions.data) return "0h";
    let totalMins = 0;
    sessions.data.forEach(s => {
      if (s.ended_at) totalMins += differenceInMinutes(parseISO(s.ended_at), parseISO(s.started_at));
    });
    return `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
  }, [sessions.data]);

  const isLoading = sessions.isLoading || snapshots.isLoading;
  const noData = !isLoading && (!sessions.data || sessions.data.length === 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">PostureAI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Posture History</h1>
          <p className="text-sm text-muted-foreground">Track your posture trends and improvement over time</p>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading your posture data...</p>
          </div>
        )}

        {noData && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Activity className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No posture sessions yet. Start monitoring from the dashboard!</p>
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        )}

        {!isLoading && !noData && (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard icon={Target} label="Avg. Score" value={`${avgScore}`} change="All sessions" positive={avgScore >= 70} />
              <SummaryCard icon={TrendingUp} label="Total Sessions" value={`${sessions.data?.length ?? 0}`} change="Recorded" positive />
              <SummaryCard icon={Clock} label="Total Monitored" value={totalHours} change="Across all sessions" />
              <SummaryCard icon={Award} label="Total Alerts" value={`${alerts.data?.length ?? 0}`} change="Posture corrections" />
            </div>

            <Tabs value={tab} onValueChange={setTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="daily">Today</TabsTrigger>
                <TabsTrigger value="weekly">This Week</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-6">
                {dailyData.length === 0 ? (
                  <Card className="shadow-soft"><CardContent className="py-12 text-center text-muted-foreground">No data for today yet.</CardContent></Card>
                ) : (
                  <Card className="shadow-soft">
                    <CardHeader><CardTitle className="text-base">Today's Posture Score</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={dailyData}>
                          <defs>
                            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#scoreGrad)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="weekly" className="space-y-6">
                {weeklyData.length === 0 ? (
                  <Card className="shadow-soft"><CardContent className="py-12 text-center text-muted-foreground">No data this week yet.</CardContent></Card>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="shadow-soft">
                      <CardHeader><CardTitle className="text-base">Weekly Score Trend</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={weeklyData} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Score" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="shadow-soft">
                      <CardHeader><CardTitle className="text-base">Session Duration (hours)</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={weeklyData} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="duration" fill="hsl(var(--info))" radius={[6, 6, 0, 0]} name="Hours" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Session Log */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-primary" />
                    Session Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sessionLog.map((s, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-4">
                        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          s.posture_state === "good" ? "bg-success" : s.posture_state === "fair" ? "bg-warning" : "bg-destructive"
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{s.date} · {s.time}</p>
                          <p className="text-xs text-muted-foreground">Duration: {s.duration} · {s.alerts} alerts</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">{s.avgScore}</p>
                          <p className="text-xs text-muted-foreground">avg score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, change, positive }: {
  icon: React.ElementType; label: string; value: string; change: string; positive?: boolean;
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
          <p className={`text-xs ${positive ? "text-success" : "text-muted-foreground"}`}>{change}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default History;
