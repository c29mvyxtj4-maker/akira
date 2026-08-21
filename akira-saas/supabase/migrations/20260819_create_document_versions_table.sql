-- Document versions table for version history
CREATE TABLE IF NOT EXISTS public.document_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  title text,
  content text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_versions_document ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_by ON public.document_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON public.document_versions(created_at DESC);

-- Enable RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view versions of documents they have access to
CREATE POLICY "Users can view document versions"
  ON public.document_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_versions.document_id
      AND (d.owner_id = auth.uid() OR d.is_public = true)
    )
    OR
    EXISTS (
      SELECT 1 FROM public.document_collaborators dc
      WHERE dc.document_id = document_versions.document_id
      AND dc.user_id = auth.uid()
    )
  );

-- Policy: Users can create versions
CREATE POLICY "Users can create document versions"
  ON public.document_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_versions.document_id
      AND (d.owner_id = auth.uid() OR created_by = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.document_collaborators dc
      WHERE dc.document_id = document_versions.document_id
      AND dc.user_id = auth.uid()
      AND dc.permission IN ('edit')
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_versions;
