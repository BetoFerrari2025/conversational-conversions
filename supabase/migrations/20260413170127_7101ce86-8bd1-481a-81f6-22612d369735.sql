
INSERT INTO storage.buckets (id, name, public)
VALUES ('funnel-media', 'funnel-media', true);

CREATE POLICY "Public read access for funnel media"
ON storage.objects FOR SELECT
USING (bucket_id = 'funnel-media');

CREATE POLICY "Authenticated users can upload funnel media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'funnel-media');

CREATE POLICY "Users can update their own funnel media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'funnel-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own funnel media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'funnel-media' AND auth.uid()::text = (storage.foldername(name))[1]);
