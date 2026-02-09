import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIInsightsPanelProps {
  userId: string | undefined;
}

const AIInsightsPanel = ({ userId }: AIInsightsPanelProps) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInsights = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Fetch recent sessions and snapshots
      const [sessionsRes, snapshotsRes] = await Promise.all([
        supabase.from("posture_sessions").select("*").order("started_at", { ascending: false }).limit(20),
        supabase.from("posture_snapshots").select("*").order("captured_at", { ascending: false }).limit(200),
      ]);

      const { data, error } = await supabase.functions.invoke("ai-posture-insights", {
        body: {
          sessions: sessionsRes.data ?? [],
          snapshots: snapshotsRes.data ?? [],
        },
      });

      if (error) throw error;
      setInsights(data.insights ?? []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Insights
          </span>
          <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 && !loading ? (
          <div className="text-center py-4">
            <Sparkles className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-3">Get personalized posture insights powered by AI</p>
            <Button variant="outline" size="sm" onClick={fetchInsights} disabled={loading}>
              {loading ? "Analyzing..." : "Generate Insights"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-2 rounded-lg bg-secondary p-3">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-sm text-foreground">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
