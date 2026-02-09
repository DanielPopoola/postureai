
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users manage own sessions" ON public.posture_sessions;
DROP POLICY IF EXISTS "Users manage own snapshots" ON public.posture_snapshots;
DROP POLICY IF EXISTS "Users manage own alerts" ON public.posture_alerts;

-- Create proper PERMISSIVE policies for posture_sessions
CREATE POLICY "Users can select own sessions" ON public.posture_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own sessions" ON public.posture_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own sessions" ON public.posture_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own sessions" ON public.posture_sessions FOR DELETE USING (user_id = auth.uid());

-- Create proper PERMISSIVE policies for posture_snapshots
CREATE POLICY "Users can select own snapshots" ON public.posture_snapshots FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own snapshots" ON public.posture_snapshots FOR INSERT WITH CHECK (user_id = auth.uid() AND owns_session(session_id));
CREATE POLICY "Users can update own snapshots" ON public.posture_snapshots FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own snapshots" ON public.posture_snapshots FOR DELETE USING (user_id = auth.uid());

-- Create proper PERMISSIVE policies for posture_alerts
CREATE POLICY "Users can select own alerts" ON public.posture_alerts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own alerts" ON public.posture_alerts FOR INSERT WITH CHECK (user_id = auth.uid() AND owns_session(session_id));
CREATE POLICY "Users can update own alerts" ON public.posture_alerts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own alerts" ON public.posture_alerts FOR DELETE USING (user_id = auth.uid());
