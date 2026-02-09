
-- Fix 1: Convert RESTRICTIVE policies to PERMISSIVE for all three tables

DROP POLICY "Users manage own sessions" ON public.posture_sessions;
CREATE POLICY "Users manage own sessions" ON public.posture_sessions
  AS PERMISSIVE
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY "Users manage own snapshots" ON public.posture_snapshots;
CREATE POLICY "Users manage own snapshots" ON public.posture_snapshots
  AS PERMISSIVE
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND public.owns_session(session_id));

DROP POLICY "Users manage own alerts" ON public.posture_alerts;
CREATE POLICY "Users manage own alerts" ON public.posture_alerts
  AS PERMISSIVE
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND public.owns_session(session_id));

-- Fix 2: Change owns_session to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.owns_session(_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.posture_sessions
    WHERE id = _session_id AND user_id = auth.uid()
  )
$$;
