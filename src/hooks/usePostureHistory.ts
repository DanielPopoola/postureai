import { useQuery } from "@tanstack/react-query";
import { api, Session, Snapshot, Alert } from "@/lib/api";

export type SessionRow = Session;
export type SnapshotRow = Snapshot;
export type AlertRow = Alert;

export function usePostureHistory(userId: string | undefined) {
  const sessions = useQuery({
    queryKey: ["posture_sessions", userId],
    queryFn: async () => {
      const { data } = await api.get<Session[]>("/sessions?limit=50");
      return data;
    },
    enabled: !!userId,
  });

  const snapshots = useQuery({
    queryKey: ["posture_snapshots", userId],
    queryFn: async () => {
      const { data } = await api.get<Snapshot[]>("/snapshots?limit=500");
      return data;
    },
    enabled: !!userId,
  });

  const alerts = useQuery({
    queryKey: ["posture_alerts", userId],
    queryFn: async () => {
      const { data } = await api.get<Alert[]>("/alerts?limit=100");
      return data;
    },
    enabled: !!userId,
  });

  return { sessions, snapshots, alerts };
}