CREATE POLICY "Users can update own badges"
ON public.user_badges
FOR UPDATE
USING (user_id = auth.uid());