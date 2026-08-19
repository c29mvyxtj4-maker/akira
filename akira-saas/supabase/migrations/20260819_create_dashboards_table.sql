-- Dashboards table
CREATE TABLE IF NOT EXISTS public.dashboards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  widgets jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Dashboard shares table
CREATE TABLE IF NOT EXISTS public.dashboard_shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id uuid NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_shares_token ON public.dashboard_shares(token);
CREATE INDEX IF NOT EXISTS idx_dashboard_shares_dashboard ON public.dashboard_shares(dashboard_id);

-- Enable RLS
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_shares ENABLE ROW LEVEL SECURITY;

-- Policies for dashboards
CREATE POLICY "Users can view own dashboards"
  ON public.dashboards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create dashboards"
  ON public.dashboards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboards"
  ON public.dashboards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dashboards"
  ON public.dashboards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for dashboard_shares
CREATE POLICY "Users can view own dashboard shares"
  ON public.dashboard_shares
  FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create dashboard shares"
  ON public.dashboard_shares
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.dashboards d
      WHERE d.id = dashboard_shares.dashboard_id
      AND d.user_id = auth.uid()
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_shares;
