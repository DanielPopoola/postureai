import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SessionRow {
  id: string;
  started_at: string;
  ended_at: string | null;
  average_score: number | null;
  total_alerts: number | null;
}

export interface SnapshotRow {
  id: string;
  session_id: string;
  captured_at: string;
  overall_score: number;
  neck_angle: number | null;
  shoulder_alignment: number | null;
  spine_angle: number | null;
  status: string;
}

export interface AlertRow {
  id: string;
  session_id: string;
  created_at: string;
  message: string;
}

export function usePostureHistory(userId: string | undefined) {
  const sessions = useQuery({
    queryKey: ["posture_sessions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posture_sessions")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as SessionRow[];
    },
    enabled: !!userId,
  });

  const snapshots = useQuery({
    queryKey: ["posture_snapshots", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posture_snapshots")
        .select("*")
        .order("captured_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data as SnapshotRow[];
    },
    enabled: !!userId,
  });

  const alerts = useQuery({
    queryKey: ["posture_alerts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posture_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AlertRow[];
    },
    enabled: !!userId,
  });

  return { sessions, snapshots, alerts };
}
