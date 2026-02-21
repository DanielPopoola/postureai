import { useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { PostureMetrics } from "@/lib/postureAnalysis";

const SNAPSHOT_INTERVAL_MS = 5000;

export function usePostureSession(userId: string | undefined) {
  const sessionIdRef = useRef<string | null>(null);
  const snapshotTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoresRef = useRef<number[]>([]);
  const alertCountRef = useRef(0);
  const lastMetricsRef = useRef<PostureMetrics | null>(null);

  const startSession = useCallback(async () => {
    if (!userId) return;
    const { data } = await api.post<{ id: string }>("/sessions/start");
    sessionIdRef.current = data.id;
    scoresRef.current = [];
    alertCountRef.current = 0;

    snapshotTimerRef.current = setInterval(() => {
      const m = lastMetricsRef.current;
      if (m && sessionIdRef.current) saveSnapshot(m);
    }, SNAPSHOT_INTERVAL_MS);
  }, [userId]);

  const saveSnapshot = useCallback(async (metrics: PostureMetrics) => {
    if (!sessionIdRef.current) return;
    scoresRef.current.push(metrics.overallScore);

    await api.post(`/sessions/${sessionIdRef.current}/snapshots`, {
      posture_score: metrics.overallScore,
      posture_state: metrics.status,
      neck_angle: metrics.neckAngle,
      shoulder_tilt: metrics.shoulderAlignment,
      spine_angle: metrics.spineAngle,
    });
  }, []);

  const saveAlert = useCallback(async (message: string) => {
    if (!sessionIdRef.current) return;
    alertCountRef.current += 1;

    await api.post(`/sessions/${sessionIdRef.current}/alerts`, { message });
  }, []);

  const updateMetrics = useCallback((metrics: PostureMetrics) => {
    lastMetricsRef.current = metrics;
  }, []);

  const endSession = useCallback(async () => {
    if (snapshotTimerRef.current) {
      clearInterval(snapshotTimerRef.current);
      snapshotTimerRef.current = null;
    }
    if (!sessionIdRef.current) return;

    const avg_posture_score = scoresRef.current.length > 0
      ? Math.round(scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length)
      : null;

    await api.post(`/sessions/${sessionIdRef.current}/end`, {
      avg_posture_score,
      total_alerts: alertCountRef.current,
    });

    sessionIdRef.current = null;
    lastMetricsRef.current = null;
  }, []);

  return { startSession, endSession, updateMetrics, saveAlert, sessionIdRef };
}