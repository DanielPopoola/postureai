import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export interface User {
  id: string;
  email: string;
  full_name: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  avg_posture_score: number | null;
  good_posture_percent: number | null;
  total_alerts: number;
  status: "active" | "completed";
}

export interface Snapshot {
  id: string;
  session_id: string;
  user_id: string;
  captured_at: string;
  posture_score: number;
  posture_state: "good" | "bad" | "risky";
  neck_angle: number | null;
  shoulder_tilt: number | null;
  spine_angle: number | null;
}

export interface Alert {
  id: string;
  session_id: string;
  user_id: string;
  triggered_at: string;
  alert_type: "neck" | "shoulder" | "spine" | "break_reminder";
  message: string;
  acknowledged: boolean;
}

export interface Gamification {
  streak: {
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
  };
  badges: {
    id: string;
    badge_key: string;
    earned_at: string;
  }[];
}

export interface Insight {
  type: "success" | "warning" | "tip";
  title: string;
  message: string;
}

// 401 refresh interceptor
let _refreshing: Promise<unknown> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    const original = err.config!;
    if (
      err.response?.status !== 401 ||
      (original as any)._retry ||
      original.url === "/auth/refresh" ||
      original.url === "/auth/me"
    ) {
      return Promise.reject(err);
    }

    (original as any)._retry = true;
    _refreshing ??= api.post("/auth/refresh").finally(() => { _refreshing = null; });

    try {
      await _refreshing;
      return api(original);
    } catch {
      window.location.href = "/auth";
      return Promise.reject(err);
    }
  }
);