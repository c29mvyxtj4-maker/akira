-- Create dashboards table
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  layout TEXT DEFAULT 'grid',
  grid_cols INT DEFAULT 4,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create dashboard_widgets table
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL,
  widget_type TEXT NOT NULL,
  position INT NOT NULL,
  size TEXT DEFAULT 'md',
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboards
CREATE POLICY "users_can_view_own_dashboards" ON dashboards
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "users_can_create_dashboards" ON dashboards
  FOR INSERT WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "users_can_update_own_dashboards" ON dashboards
  FOR UPDATE USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "users_can_delete_own_dashboards" ON dashboards
  FOR DELETE USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- RLS Policies for dashboard_widgets (inherit from dashboard)
CREATE POLICY "users_can_view_dashboard_widgets" ON dashboard_widgets
  FOR SELECT USING (
    dashboard_id IN (
      SELECT id FROM dashboards WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
    )
  );

CREATE POLICY "users_can_manage_dashboard_widgets" ON dashboard_widgets
  FOR ALL USING (
    dashboard_id IN (
      SELECT id FROM dashboards WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
    )
  );

-- Indexes
CREATE INDEX idx_dashboards_org_id ON dashboards(org_id);
CREATE INDEX idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX idx_dashboards_is_default ON dashboards(is_default);
CREATE INDEX idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);

-- Triggers for updated_at
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
