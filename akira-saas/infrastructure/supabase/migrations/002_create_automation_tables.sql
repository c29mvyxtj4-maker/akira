-- Create workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  template_id TEXT,
  status TEXT DEFAULT 'draft',
  steps JSONB NOT NULL DEFAULT '[]',
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create workflow_executions table
CREATE TABLE workflow_executions (
  id TEXT PRIMARY KEY,
  workflow_id UUID NOT NULL,
  org_id UUID NOT NULL,
  status TEXT DEFAULT 'running',
  progress INT DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  error TEXT,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create agent_logs table
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  input TEXT,
  output TEXT,
  status TEXT NOT NULL,
  duration INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflows
CREATE POLICY "users_can_view_workflows" ON workflows
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "users_can_create_workflows" ON workflows
  FOR INSERT WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "users_can_update_workflows" ON workflows
  FOR UPDATE USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "users_can_delete_workflows" ON workflows
  FOR DELETE USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- RLS Policies for workflow_executions
CREATE POLICY "users_can_view_executions" ON workflow_executions
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "users_can_manage_executions" ON workflow_executions
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- RLS Policies for agent_logs (inherit from execution)
CREATE POLICY "users_can_view_agent_logs" ON agent_logs
  FOR SELECT USING (
    execution_id IN (
      SELECT id FROM workflow_executions WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
    )
  );

-- Indexes
CREATE INDEX idx_workflows_org_id ON workflows(org_id);
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_executions_org_id ON workflow_executions(org_id);
CREATE INDEX idx_executions_status ON workflow_executions(status);
CREATE INDEX idx_agent_logs_execution_id ON agent_logs(execution_id);

-- Triggers
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
