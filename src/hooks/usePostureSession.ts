import { useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostureMetrics } from "@/lib/postureAnalysis";

const SNAPSHOT_INTERVAL_MS = 5000; // Save a snapshot every 5 seconds

export function usePostureSession(userId: string | undefined) {
  const sessionIdRef = useRef<string | null>(null);
  const snapshotTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoresRef = useRef<number[]>([]);
  const alertCountRef = useRef(0);
  const lastMetricsRef = useRef<PostureMetrics | null>(null);

  const startSession = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("posture_sessions")
      .insert({ user_id: userId })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Failed to create session:", error);
      return;
    }
    sessionIdRef.current = data.id;
    scoresRef.current = [];
    alertCountRef.current = 0;

    // Start periodic snapshot saving
    snapshotTimerRef.current = setInterval(() => {
      const m = lastMetricsRef.current;
      if (m && sessionIdRef.current) {
        saveSnapshot(m);
      }
    }, SNAPSHOT_INTERVAL_MS);
  }, [userId]);

  const saveSnapshot = useCallback(async (metrics: PostureMetrics) => {
    if (!userId || !sessionIdRef.current) return;
    scoresRef.current.push(metrics.overallScore);

    await supabase.from("posture_snapshots").insert({
      session_id: sessionIdRef.current,
      user_id: userId,
      overall_score: metrics.overallScore,
      neck_angle: metrics.neckAngle,
      shoulder_alignment: metrics.shoulderAlignment,
      spine_angle: metrics.spineAngle,
      status: metrics.status,
    });
  }, [userId]);

  const saveAlert = useCallback(async (message: string) => {
    if (!userId || !sessionIdRef.current) return;
    alertCountRef.current += 1;

    await supabase.from("posture_alerts").insert({
      session_id: sessionIdRef.current,
      user_id: userId,
      message,
    });
  }, [userId]);

  const updateMetrics = useCallback((metrics: PostureMetrics) => {
    lastMetricsRef.current = metrics;
  }, []);

  const endSession = useCallback(async () => {
    if (snapshotTimerRef.current) {
      clearInterval(snapshotTimerRef.current);
      snapshotTimerRef.current = null;
    }

    if (!sessionIdRef.current) return;

    const avgScore = scoresRef.current.length > 0
      ? Math.round(scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length)
      : null;

    await supabase
      .from("posture_sessions")
      .update({
        ended_at: new Date().toISOString(),
        average_score: avgScore,
        total_alerts: alertCountRef.current,
      })
      .eq("id", sessionIdRef.current);

    sessionIdRef.current = null;
    lastMetricsRef.current = null;
  }, []);

  return { startSession, endSession, updateMetrics, saveAlert, sessionIdRef };
}
