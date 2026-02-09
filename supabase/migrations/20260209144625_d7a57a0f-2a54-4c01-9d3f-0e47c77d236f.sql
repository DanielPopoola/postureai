
-- Posture sessions table
CREATE TABLE public.posture_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  average_score INTEGER,
  total_alerts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Posture snapshots (sampled metrics per session)
CREATE TABLE public.posture_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.posture_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  overall_score INTEGER NOT NULL,
  neck_angle INTEGER,
  shoulder_alignment INTEGER,
  spine_angle INTEGER,
  status TEXT NOT NULL DEFAULT 'good'
);

-- Posture alerts
CREATE TABLE public.posture_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.posture_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.posture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posture_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posture_alerts ENABLE ROW LEVEL SECURITY;

-- Helper: check session ownership
CREATE OR REPLACE FUNCTION public.owns_session(_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.posture_sessions
    WHERE id = _session_id AND user_id = auth.uid()
  )
$$;

-- RLS: posture_sessions
CREATE POLICY "Users manage own sessions" ON public.posture_sessions
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- RLS: posture_snapshots
CREATE POLICY "Users manage own snapshots" ON public.posture_snapshots
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.owns_session(session_id));

-- RLS: posture_alerts
CREATE POLICY "Users manage own alerts" ON public.posture_alerts
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.owns_session(session_id));

-- Indexes
CREATE INDEX idx_sessions_user ON public.posture_sessions(user_id);
CREATE INDEX idx_snapshots_session ON public.posture_snapshots(session_id);
CREATE INDEX idx_snapshots_user ON public.posture_snapshots(user_id);
CREATE INDEX idx_alerts_session ON public.posture_alerts(session_id);
CREATE INDEX idx_alerts_user ON public.posture_alerts(user_id);
