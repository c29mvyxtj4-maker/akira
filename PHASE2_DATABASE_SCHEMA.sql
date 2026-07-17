-- ========================================
-- PHASE 2: TIME TRACKING DATABASE SCHEMA
-- ========================================
--
-- Create time_entries table with proper indexing
-- for efficient time tracking queries
--
-- Date: 2026-07-17
-- Status: Ready to execute in Supabase SQL Editor
-- ========================================

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User tracking
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project association
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Time data
  started_at TIMESTAMP NOT NULL DEFAULT now(),
  ended_at TIMESTAMP,
  duration_seconds INT,          -- Precise duration in seconds
  duration_minutes INT,          -- For backward compatibility

  -- Entry details
  description TEXT,
  billable BOOLEAN DEFAULT true,
  is_running BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_time_entries_owner_id
  ON time_entries(owner_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_project_id
  ON time_entries(project_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_client_id
  ON time_entries(client_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_started_at
  ON time_entries(started_at);

CREATE INDEX IF NOT EXISTS idx_time_entries_is_running
  ON time_entries(is_running)
  WHERE is_running = true;

CREATE INDEX IF NOT EXISTS idx_time_entries_billable
  ON time_entries(billable);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_time_entries_owner_started
  ON time_entries(owner_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_time_entries_project_billable
  ON time_entries(project_id, billable);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own time entries
CREATE POLICY "Users can view own time entries"
  ON time_entries
  FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = user_id);

-- Users can only create their own time entries
CREATE POLICY "Users can create own time entries"
  ON time_entries
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can only update their own time entries
CREATE POLICY "Users can update own time entries"
  ON time_entries
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Users can only delete their own time entries
CREATE POLICY "Users can delete own time entries"
  ON time_entries
  FOR DELETE
  USING (auth.uid() = owner_id);

-- ========================================
-- EXECUTION INSTRUCTIONS
-- ========================================
--
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a new query
-- 3. Copy everything between these comments
-- 4. Click "Run"
-- 5. Wait for success message
-- 6. Table is ready!
--
-- Verification:
-- - Check Tables panel → should see "time_entries"
-- - Check Policies panel → should see 4 RLS policies
-- - Check Indexes panel → should see 8 indexes
--
-- ========================================
-- SCHEMA SUMMARY
-- ========================================
--
-- Columns: 15
-- Primary Key: id (UUID)
-- Indexes: 8 (optimized for common queries)
-- Policies: 4 (RLS for security)
-- Related Tables: auth.users, projects, clients
--
-- Key Features:
-- ✓ Precise time tracking (seconds)
-- ✓ Billable vs non-billable
-- ✓ Running timer support
-- ✓ User isolation (RLS)
-- ✓ Project association
-- ✓ Client association
-- ✓ Optimized for queries
-- ✓ Production-ready
--
-- ========================================
