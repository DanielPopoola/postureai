import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Insight {
  type: "success" | "warning" | "tip";
  title: string;
  message: string;
}

interface AIInsightsPanelProps {
  userId: string | undefined;
}

const AIInsightsPanel = ({ userId }: AIInsightsPanelProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInsights = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await api.post<{ insights: Insight[] }>("/insights");
      setInsights(data.insights ?? []);
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.detail ?? err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const iconColor = (type: Insight["type"]) => ({
    success: "text-green-500",
    warning: "text-yellow-500",
    tip: "text-primary",
  }[type]);

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
            <Button variant="outline" size="sm" onClick={fetchInsights}>
              Generate Insights
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="rounded-lg bg-secondary p-3">
                <p className={`text-xs font-semibold mb-1 ${iconColor(insight.type)}`}>
                  {insight.title}
                </p>
                <p className="text-sm text-foreground">{insight.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;