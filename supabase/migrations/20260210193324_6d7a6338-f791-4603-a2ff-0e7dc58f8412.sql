CREATE POLICY "Users can delete own streaks"
ON public.user_streaks
FOR DELETE
USING (user_id = auth.uid());