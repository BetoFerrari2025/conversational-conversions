
CREATE POLICY "Public can view funnels by slug"
ON public.funnels
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public can view funnel blocks"
ON public.funnel_blocks
FOR SELECT
TO anon
USING (true);
