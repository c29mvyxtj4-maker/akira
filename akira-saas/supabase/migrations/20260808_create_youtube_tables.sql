-- YouTube Projects Table
CREATE TABLE youtube_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  template TEXT NOT NULL CHECK (template IN ('tutorial', 'short-film', 'documentary', 'review', 'podcast')),

  target_audience TEXT,
  duration_minutes INT DEFAULT 10,

  publishing_date DATE NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in-progress', 'completed', 'published')),

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_youtube_projects_org_id ON youtube_projects(org_id);
CREATE INDEX idx_youtube_projects_project_id ON youtube_projects(project_id);
CREATE INDEX idx_youtube_projects_publishing_date ON youtube_projects(publishing_date);

-- YouTube Phases Table
CREATE TABLE youtube_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_project_id UUID NOT NULL REFERENCES youtube_projects(id) ON DELETE CASCADE,

  phase_name TEXT NOT NULL,
  phase_order INT NOT NULL,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  description TEXT,
  deliverables TEXT,

  estimated_hours INT DEFAULT 0,
  actual_hours INT DEFAULT 0,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(youtube_project_id, phase_order)
);

CREATE INDEX idx_youtube_phases_project_id ON youtube_phases(youtube_project_id);
CREATE INDEX idx_youtube_phases_status ON youtube_phases(status);

-- YouTube Milestones Table
CREATE TABLE youtube_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_phase_id UUID NOT NULL REFERENCES youtube_phases(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  due_date DATE NOT NULL,
  due_time TIME,

  reminder_days INT[] DEFAULT '{3,1}',

  completed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_youtube_milestones_phase_id ON youtube_milestones(youtube_phase_id);
CREATE INDEX idx_youtube_milestones_due_date ON youtube_milestones(due_date);

-- RLS Policies
ALTER TABLE youtube_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_milestones ENABLE ROW LEVEL SECURITY;

-- Users can only see their org's YouTube projects
CREATE POLICY "youtube_projects_org_isolation"
  ON youtube_projects
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Phases inherit org isolation through project
CREATE POLICY "youtube_phases_org_isolation"
  ON youtube_phases
  FOR ALL
  USING (youtube_project_id IN (
    SELECT id FROM youtube_projects
    WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
  ));

-- Milestones inherit org isolation through phase
CREATE POLICY "youtube_milestones_org_isolation"
  ON youtube_milestones
  FOR ALL
  USING (youtube_phase_id IN (
    SELECT id FROM youtube_phases
    WHERE youtube_project_id IN (
      SELECT id FROM youtube_projects
      WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
    )
  ));
