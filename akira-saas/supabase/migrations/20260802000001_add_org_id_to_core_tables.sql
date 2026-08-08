-- AKIRA: Add org_id column to critical tables for multi-tenant security
-- Timeline: Semana 3-5
-- Strategy: Add org_id, backfill from relationships, set NOT NULL, add FK

-- ============================================================================
-- 1. INVOICES TABLE
-- ============================================================================
-- Problem: invoices currently only scoped by owner_id (user), not org_id
-- Solution: Add org_id, backfill from organizations table via company_settings

ALTER TABLE invoices ADD COLUMN org_id UUID;

-- Backfill: Get org_id from company_settings where owner_id = invoices.owner_id
UPDATE invoices
SET org_id = (
  SELECT org_id FROM company_settings WHERE company_settings.owner_id = invoices.owner_id
)
WHERE org_id IS NULL;

-- Make NOT NULL
ALTER TABLE invoices ALTER COLUMN org_id SET NOT NULL;

-- Add foreign key
ALTER TABLE invoices ADD CONSTRAINT invoices_org_id_fk
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_invoices_org_id ON invoices(org_id);

-- ============================================================================
-- 2. CLIENTS TABLE
-- ============================================================================
ALTER TABLE clients ADD COLUMN org_id UUID;

-- Backfill: Clients belong to a user (owner_id), get org from company_settings
UPDATE clients
SET org_id = (
  SELECT org_id FROM company_settings WHERE company_settings.owner_id = clients.owner_id
)
WHERE org_id IS NULL;

ALTER TABLE clients ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE clients ADD CONSTRAINT clients_org_id_fk
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX idx_clients_org_id ON clients(org_id);

-- ============================================================================
-- 3. PROJECTS TABLE
-- ============================================================================
ALTER TABLE projects ADD COLUMN org_id UUID;

-- Backfill: Projects have a client_id, clients have org_id
UPDATE projects
SET org_id = (
  SELECT org_id FROM clients WHERE clients.id = projects.client_id
)
WHERE org_id IS NULL AND client_id IS NOT NULL;

-- For projects without client_id, try to get from creator's org
UPDATE projects
SET org_id = (
  SELECT org_id FROM company_settings WHERE company_settings.owner_id = projects.owner_id
)
WHERE org_id IS NULL;

ALTER TABLE projects ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE projects ADD CONSTRAINT projects_org_id_fk
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX idx_projects_org_id ON projects(org_id);

-- ============================================================================
-- 4. PORTAL_USERS TABLE (client portal access)
-- ============================================================================
ALTER TABLE portal_users ADD COLUMN org_id UUID;

-- Backfill: portal_users are tied to a client, get org from clients
UPDATE portal_users
SET org_id = (
  SELECT org_id FROM clients WHERE clients.id = portal_users.client_id
)
WHERE org_id IS NULL;

ALTER TABLE portal_users ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE portal_users ADD CONSTRAINT portal_users_org_id_fk
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX idx_portal_users_org_id ON portal_users(org_id);

-- ============================================================================
-- 5. PORTAL_MESSAGES TABLE (client portal messages)
-- ============================================================================
ALTER TABLE portal_messages ADD COLUMN org_id UUID;

-- Backfill: portal_messages are from portal_users, get org from portal_users
UPDATE portal_messages
SET org_id = (
  SELECT org_id FROM portal_users WHERE portal_users.id = portal_messages.portal_user_id
)
WHERE org_id IS NULL;

ALTER TABLE portal_messages ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE portal_messages ADD CONSTRAINT portal_messages_org_id_fk
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX idx_portal_messages_org_id ON portal_messages(org_id);

-- ============================================================================
-- 6. COMPANY_SETTINGS TABLE (1:1 with org)
-- ============================================================================
-- NOTE: company_settings should already have 'owner_id' pointing to the org founder
-- Verify structure and consider renaming in a future migration if needed
-- For now, we'll add org_id as a direct reference for clarity

ALTER TABLE company_settings ADD COLUMN org_id_explicit UUID UNIQUE;

-- Backfill: company_settings.owner_id is the org founder, map to organizations
UPDATE company_settings
SET org_id_explicit = (
  SELECT id FROM organizations WHERE organizations.owner_id = company_settings.owner_id
)
WHERE org_id_explicit IS NULL;

-- Make NOT NULL
ALTER TABLE company_settings ALTER COLUMN org_id_explicit SET NOT NULL;

-- Add FK
ALTER TABLE company_settings ADD CONSTRAINT company_settings_org_id_fk
  FOREIGN KEY (org_id_explicit) REFERENCES organizations(id) ON DELETE CASCADE;

-- ============================================================================
-- 7. UPDATE RLS POLICIES
-- ============================================================================
-- Disable old policies that relied only on owner_id
-- New policies will check org_id membership + owner_id

-- Drop old policies (they'll be too permissive now)
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Create new RLS policies that use org_id + org_members membership check
-- These policies will be deployed in a separate safer transaction

-- ============================================================================
-- 8. SUMMARY
-- ============================================================================
-- Tables updated: invoices, clients, projects, portal_users, portal_messages, company_settings
-- New indexes: idx_*_org_id on each table for performance
-- Next step: Deploy new RLS policies in 20260802000002_rls_org_policies.sql
