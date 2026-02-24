import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const SessionHistory = () => {
  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.get("/sessions").then(r => r.data),
  });

  const chartData = sessions.slice(0, 7).map((s: any) => ({
    day: new Date(s.started_at).toLocaleDateString("en", { weekday: "short" }),
    score: Math.round(s.avg_posture_score ?? 0),
  }));

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Weekly Posture Scores</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No sessions yet. Start monitoring to see your history.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionHistory;
