-- Document collaborators table
CREATE TABLE IF NOT EXISTS public.document_collaborators (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'edit')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(document_id, user_id)
);

-- Document changes log for version history
CREATE TABLE IF NOT EXISTS public.document_changes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type text NOT NULL CHECK (change_type IN ('insert', 'update', 'delete', 'format')),
  old_value jsonb,
  new_value jsonb,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_collaborators_document ON public.document_collaborators(document_id);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_user ON public.document_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_document_changes_document ON public.document_changes(document_id);
CREATE INDEX IF NOT EXISTS idx_document_changes_user ON public.document_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_document_changes_created ON public.document_changes(created_at);

-- Enable RLS
ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_changes ENABLE ROW LEVEL SECURITY;

-- Policies for document_collaborators
CREATE POLICY "Users can view document collaborators"
  ON public.document_collaborators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.document_collaborators dc
      WHERE dc.document_id = document_collaborators.document_id
      AND dc.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_collaborators.document_id
      AND d.owner_id = auth.uid()
    )
  );

CREATE POLICY "Document owner can manage collaborators"
  ON public.document_collaborators
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_collaborators.document_id
      AND d.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_collaborators.document_id
      AND d.owner_id = auth.uid()
    )
  );

-- Policies for document_changes
CREATE POLICY "Users can view changes of shared documents"
  ON public.document_changes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.document_collaborators dc
      WHERE dc.document_id = document_changes.document_id
      AND dc.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_changes.document_id
      AND d.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can log changes"
  ON public.document_changes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.document_collaborators dc
      WHERE dc.document_id = document_changes.document_id
      AND dc.user_id = auth.uid()
      AND dc.permission IN ('edit')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_changes.document_id
      AND d.owner_id = auth.uid()
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_changes;
