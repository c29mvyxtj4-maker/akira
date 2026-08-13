-- Feature Gating: plan tiers + per-tier limits + per-org usage tracking
-- Part of Phase 1 (Feature Gating) from AGENT_PROMPTS_MASTER_PLAN.md
-- Scaffolding only: no Stripe wiring yet, nothing here changes existing behavior
-- (default tier below is deliberately generous so no current org gets locked out).

-- ============================================================================
-- ORGANIZATIONS.PLAN — reuse the existing column as the tier field
-- ============================================================================
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'starter';

-- Normalize the historic 'pro' value (used by createOrg() to date) onto the
-- new tier vocabulary. Everyone already on 'pro' keeps full access.
UPDATE organizations SET plan = 'professional' WHERE plan = 'pro';

-- ============================================================================
-- FEATURE_LIMITS — per-tier configuration (global, not org-scoped)
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_limits (
  tier         TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  limit_value  INTEGER,           -- NULL = unlimited (or n/a for boolean features)
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (tier, feature_name)
);

CREATE INDEX IF NOT EXISTS idx_feature_limits_tier ON feature_limits(tier);

ALTER TABLE feature_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_limits_read_authenticated"
  ON feature_limits FOR SELECT
  USING (auth.role() = 'authenticated');

INSERT INTO feature_limits (tier, feature_name, limit_value, enabled) VALUES
  ('starter',      'max_projects',       3,    TRUE),
  ('starter',      'max_users',          1,    TRUE),
  ('starter',      'max_storage_gb',     5,    TRUE),
  ('starter',      'ai_operatives',      NULL, FALSE),
  ('starter',      'advanced_analytics', NULL, FALSE),
  ('starter',      'integrations',       NULL, FALSE),

  ('professional', 'max_projects',       NULL, TRUE),
  ('professional', 'max_users',          5,    TRUE),
  ('professional', 'max_storage_gb',     100,  TRUE),
  ('professional', 'ai_operatives',      NULL, TRUE),
  ('professional', 'advanced_analytics', NULL, TRUE),
  ('professional', 'integrations',       NULL, TRUE),

  ('enterprise',   'max_projects',       NULL, TRUE),
  ('enterprise',   'max_users',          NULL, TRUE),
  ('enterprise',   'max_storage_gb',     NULL, TRUE),
  ('enterprise',   'ai_operatives',      NULL, TRUE),
  ('enterprise',   'advanced_analytics', NULL, TRUE),
  ('enterprise',   'integrations',       NULL, TRUE)
ON CONFLICT (tier, feature_name) DO NOTHING;

-- ============================================================================
-- FEATURE_USAGE — per-org usage counters (org-scoped)
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_usage (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_name    TEXT NOT NULL,
  usage_count     INTEGER NOT NULL DEFAULT 0,
  last_checked_at TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_org ON feature_usage(org_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_usage_unique ON feature_usage(org_id, feature_name);

ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_usage_select_org_members"
  ON feature_usage FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = feature_usage.org_id
    )
  );

CREATE POLICY "feature_usage_insert_org_members"
  ON feature_usage FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = feature_usage.org_id
    )
  );

CREATE POLICY "feature_usage_update_org_members"
  ON feature_usage FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = feature_usage.org_id
    )
  );
