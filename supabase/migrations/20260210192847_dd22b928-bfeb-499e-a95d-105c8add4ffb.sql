CREATE POLICY "Users can delete own badges"
ON public.user_badges
FOR DELETE
USING (user_id = auth.uid());