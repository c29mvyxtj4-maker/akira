-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('financial', 'clients', 'projects', 'revenue', 'forecast', 'performance')),
  format text DEFAULT 'PDF' CHECK (format IN ('PDF', 'Excel', 'CSV', 'Email')),
  date_range text DEFAULT 'last_30_days',
  schedule jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Scheduled reports table
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  format text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  recipients text[] NOT NULL DEFAULT ARRAY[]::text[],
  enabled boolean DEFAULT true,
  next_send_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Report templates table
CREATE TABLE IF NOT EXISTS public.report_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  template_config jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Report execution logs
CREATE TABLE IF NOT EXISTS public.report_executions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  scheduled_report_id uuid REFERENCES public.scheduled_reports(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  download_url text,
  error_message text,
  executed_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_user_id ON public.scheduled_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_enabled ON public.scheduled_reports(enabled);
CREATE INDEX IF NOT EXISTS idx_report_executions_report_id ON public.report_executions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_executed_at ON public.report_executions(executed_at DESC);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_executions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own reports"
  ON public.reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON public.reports
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scheduled reports"
  ON public.scheduled_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own scheduled reports"
  ON public.scheduled_reports
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own report executions"
  ON public.report_executions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.id = report_executions.report_id
      AND r.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.scheduled_reports sr
      WHERE sr.id = report_executions.scheduled_report_id
      AND sr.user_id = auth.uid()
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_reports;
