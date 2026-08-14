-- Migration: 20260814_create_documents_system.sql
-- Description: Create complete documents system with Notion-like features
-- Author: AKIRA
-- Date: 2026-08-14

-- ============================================================================
-- UP: CREATE TABLES AND INFRASTRUCTURE
-- ============================================================================

-- documents: Main document container
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  folder_id UUID REFERENCES public.document_folders(id),
  thumbnail_url TEXT,
  content_preview TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- document_blocks: Individual blocks within documents
CREATE TABLE IF NOT EXISTS public.document_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  linked_to_table VARCHAR(50),
  linked_to_id UUID,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- document_permissions: Granular access control
CREATE TABLE IF NOT EXISTS public.document_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
  granted_by UUID NOT NULL REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(document_id, user_id)
);

-- document_collaborators: Real-time tracking of active editors
CREATE TABLE IF NOT EXISTS public.document_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cursor_block_id UUID,
  cursor_offset INTEGER,
  is_online BOOLEAN DEFAULT TRUE,
  color VARCHAR(7) DEFAULT '#000000',
  UNIQUE(document_id, user_id)
);

-- document_comments: Inline comments per block
CREATE TABLE IF NOT EXISTS public.document_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  block_id UUID NOT NULL REFERENCES public.document_blocks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  text TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- document_comment_replies: Threaded replies to comments
CREATE TABLE IF NOT EXISTS public.document_comment_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES public.document_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- document_versions: Version history snapshots
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  blocks_snapshot JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version_number INTEGER NOT NULL,
  change_description TEXT,
  UNIQUE(document_id, version_number)
);

-- document_folders: Folder structure for organization
CREATE TABLE IF NOT EXISTS public.document_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.document_folders(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- document_shares: Shareable links for public/guest access
CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  share_token VARCHAR(32) UNIQUE NOT NULL,
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('public_view', 'public_edit', 'password_protected', 'client_only')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  password_hash TEXT,
  access_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- document_activities: Audit log for all changes
CREATE TABLE IF NOT EXISTS public.document_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_documents_org_id ON public.documents(org_id);
CREATE INDEX idx_documents_created_by ON public.documents(created_by);
CREATE INDEX idx_documents_folder_id ON public.documents(folder_id);
CREATE INDEX idx_documents_is_archived ON public.documents(is_archived);
CREATE INDEX idx_documents_is_pinned ON public.documents(is_pinned);
CREATE INDEX idx_documents_tags ON public.documents USING GIN(tags);

CREATE INDEX idx_document_blocks_document_id ON public.document_blocks(document_id);
CREATE INDEX idx_document_blocks_created_by ON public.document_blocks(created_by);
CREATE INDEX idx_document_blocks_type ON public.document_blocks(type);
CREATE INDEX idx_document_blocks_linked ON public.document_blocks(linked_to_table, linked_to_id);
CREATE INDEX idx_document_blocks_position ON public.document_blocks(document_id, position);

CREATE INDEX idx_document_permissions_document_id ON public.document_permissions(document_id);
CREATE INDEX idx_document_permissions_user_id ON public.document_permissions(user_id);
CREATE INDEX idx_document_permissions_role ON public.document_permissions(role);

CREATE INDEX idx_document_collaborators_document_id ON public.document_collaborators(document_id);
CREATE INDEX idx_document_collaborators_is_online ON public.document_collaborators(is_online);
CREATE INDEX idx_document_collaborators_user_id ON public.document_collaborators(user_id);

CREATE INDEX idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX idx_document_comments_block_id ON public.document_comments(block_id);
CREATE INDEX idx_document_comments_user_id ON public.document_comments(user_id);
CREATE INDEX idx_document_comments_resolved ON public.document_comments(resolved);

CREATE INDEX idx_document_comment_replies_comment_id ON public.document_comment_replies(comment_id);

CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_version_number ON public.document_versions(document_id, version_number);

CREATE INDEX idx_document_folders_org_id ON public.document_folders(org_id);
CREATE INDEX idx_document_folders_parent ON public.document_folders(parent_folder_id);

CREATE INDEX idx_document_shares_document_id ON public.document_shares(document_id);
CREATE INDEX idx_document_shares_token ON public.document_shares(share_token);

CREATE INDEX idx_document_activities_document_id ON public.document_activities(document_id);
CREATE INDEX idx_document_activities_user_id ON public.document_activities(user_id);
CREATE INDEX idx_document_activities_created_at ON public.document_activities(created_at);

-- ============================================================================
-- ENABLE ROW-LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_activities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.auto_increment_document_version()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO NEW.version_number
  FROM public.document_versions
  WHERE document_id = NEW.document_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS VARCHAR(32) AS $$
BEGIN
  RETURN SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 32);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

CREATE TRIGGER tr_update_document_timestamp_on_block_change
AFTER INSERT OR UPDATE ON public.document_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_update_document_timestamp
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_update_folder_timestamp
BEFORE UPDATE ON public.document_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_auto_increment_version
BEFORE INSERT ON public.document_versions
FOR EACH ROW
EXECUTE FUNCTION public.auto_increment_document_version();

CREATE TRIGGER tr_update_comment_timestamp
BEFORE UPDATE ON public.document_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tr_update_reply_timestamp
BEFORE UPDATE ON public.document_comment_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RLS POLICIES: DOCUMENTS
-- ============================================================================

CREATE POLICY "users_can_view_permitted_documents"
  ON public.documents
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
    )
    AND (
      created_by = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM public.document_permissions
        WHERE document_id = documents.id
        AND user_id = auth.uid()
        AND (expires_at IS NULL OR expires_at > NOW())
      )
    )
  );

CREATE POLICY "users_can_create_documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "users_can_update_documents"
  ON public.documents
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.document_permissions
      WHERE document_id = documents.id
      AND user_id = auth.uid()
      AND role = 'admin'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.document_permissions
      WHERE document_id = documents.id
      AND user_id = auth.uid()
      AND role = 'admin'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

CREATE POLICY "users_can_delete_documents"
  ON public.documents
  FOR DELETE
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.document_permissions
      WHERE document_id = documents.id
      AND user_id = auth.uid()
      AND role = 'admin'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- ============================================================================
-- RLS POLICIES: DOCUMENT_BLOCKS
-- ============================================================================

CREATE POLICY "users_can_view_blocks"
  ON public.document_blocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_blocks.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = documents.id
          AND user_id = auth.uid()
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      )
    )
  );

CREATE POLICY "editors_can_insert_blocks"
  ON public.document_blocks
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_blocks.document_id
      AND (
        d.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = d.id
          AND user_id = auth.uid()
          AND role IN ('editor', 'admin')
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      )
    )
  );

CREATE POLICY "editors_can_update_blocks"
  ON public.document_blocks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_blocks.document_id
      AND (
        d.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = d.id
          AND user_id = auth.uid()
          AND role IN ('editor', 'admin')
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_blocks.document_id
      AND (
        d.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = d.id
          AND user_id = auth.uid()
          AND role IN ('editor', 'admin')
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      )
    )
  );

CREATE POLICY "editors_can_delete_blocks"
  ON public.document_blocks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_blocks.document_id
      AND (
        d.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = d.id
          AND user_id = auth.uid()
          AND role IN ('editor', 'admin')
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      )
    )
  );

-- ============================================================================
-- RLS POLICIES: DOCUMENT_PERMISSIONS
-- ============================================================================

CREATE POLICY "users_can_view_permissions"
  ON public.document_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_permissions.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions dp
          WHERE dp.document_id = documents.id
          AND dp.user_id = auth.uid()
          AND dp.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "admins_can_manage_permissions"
  ON public.document_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_permissions.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions dp
          WHERE dp.document_id = documents.id
          AND dp.user_id = auth.uid()
          AND dp.role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_permissions.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions dp
          WHERE dp.document_id = documents.id
          AND dp.user_id = auth.uid()
          AND dp.role = 'admin'
        )
      )
    )
  );

-- ============================================================================
-- RLS POLICIES: DOCUMENT_COLLABORATORS
-- ============================================================================

CREATE POLICY "users_can_view_collaborators"
  ON public.document_collaborators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_collaborators.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = documents.id
          AND user_id = auth.uid()
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      )
    )
  );

CREATE POLICY "users_can_update_own_collaborator"
  ON public.document_collaborators
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: DOCUMENT_COMMENTS
-- ============================================================================

CREATE POLICY "users_can_view_comments"
  ON public.document_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_comments.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = documents.id
          AND user_id = auth.uid()
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      )
    )
  );

CREATE POLICY "editors_can_create_comments"
  ON public.document_comments
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_comments.document_id
      AND (
        d.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = d.id
          AND user_id = auth.uid()
          AND role IN ('editor', 'admin')
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      )
    )
  );

CREATE POLICY "users_can_manage_own_comments"
  ON public.document_comments
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: DOCUMENT_COMMENT_REPLIES
-- ============================================================================

CREATE POLICY "users_can_view_replies"
  ON public.document_comment_replies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.document_comments
      WHERE id = document_comment_replies.comment_id
      AND EXISTS (
        SELECT 1 FROM public.documents
        WHERE id = document_comments.document_id
        AND (
          created_by = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM public.document_permissions
            WHERE document_id = documents.id
            AND user_id = auth.uid()
            AND (expires_at IS NULL OR expires_at > NOW())
          )
        )
      )
    )
  );

CREATE POLICY "editors_can_reply_to_comments"
  ON public.document_comment_replies
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM public.document_comments dc
      WHERE dc.id = document_comment_replies.comment_id
      AND EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.id = dc.document_id
        AND (
          d.created_by = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM public.document_permissions
            WHERE document_id = d.id
            AND user_id = auth.uid()
            AND role IN ('editor', 'admin')
            AND (expires_at IS NULL OR expires_at > NOW())
          )
        )
      )
    )
  );

-- ============================================================================
-- RLS POLICIES: DOCUMENT_VERSIONS
-- ============================================================================

CREATE POLICY "users_can_view_versions"
  ON public.document_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_versions.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = documents.id
          AND user_id = auth.uid()
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      )
    )
  );

CREATE POLICY "admins_can_manage_versions"
  ON public.document_versions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_versions.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = documents.id
          AND user_id = auth.uid()
          AND role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_versions.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = documents.id
          AND user_id = auth.uid()
          AND role = 'admin'
        )
      )
    )
  );

-- ============================================================================
-- RLS POLICIES: DOCUMENT_FOLDERS
-- ============================================================================

CREATE POLICY "users_can_view_folders"
  ON public.document_folders
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "users_can_create_folders"
  ON public.document_folders
  FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "users_can_manage_own_folders"
  ON public.document_folders
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- RLS POLICIES: DOCUMENT_SHARES
-- ============================================================================

CREATE POLICY "users_can_view_shares"
  ON public.document_shares
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_shares.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = documents.id
          AND user_id = auth.uid()
          AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "admins_can_manage_shares"
  ON public.document_shares
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_shares.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = documents.id
          AND user_id = auth.uid()
          AND role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_shares.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = documents.id
          AND user_id = auth.uid()
          AND role = 'admin'
        )
      )
    )
  );

-- ============================================================================
-- RLS POLICIES: DOCUMENT_ACTIVITIES
-- ============================================================================

CREATE POLICY "users_can_view_activities"
  ON public.document_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_activities.document_id
      AND (
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.document_permissions
          WHERE document_id = documents.id
          AND user_id = auth.uid()
          AND (expires_at IS NULL OR expires_at > NOW())
        )
      )
    )
  );

CREATE POLICY "system_can_insert_activities"
  ON public.document_activities
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- DOWN: Drop all objects (for rollback)
-- ============================================================================
--
-- Comment out or remove this section for production deployment
-- Uncomment only when rolling back the migration
--
-- DROP TRIGGER IF EXISTS tr_update_reply_timestamp ON public.document_comment_replies;
-- DROP TRIGGER IF EXISTS tr_update_comment_timestamp ON public.document_comments;
-- DROP TRIGGER IF EXISTS tr_auto_increment_version ON public.document_versions;
-- DROP TRIGGER IF EXISTS tr_update_folder_timestamp ON public.document_folders;
-- DROP TRIGGER IF EXISTS tr_update_document_timestamp ON public.documents;
-- DROP TRIGGER IF EXISTS tr_update_document_timestamp_on_block_change ON public.document_blocks;
--
-- DROP FUNCTION IF EXISTS public.generate_share_token();
-- DROP FUNCTION IF EXISTS public.auto_increment_document_version();
-- DROP FUNCTION IF EXISTS public.update_updated_at_column();
--
-- DROP TABLE IF EXISTS public.document_activities;
-- DROP TABLE IF EXISTS public.document_shares;
-- DROP TABLE IF EXISTS public.document_folders;
-- DROP TABLE IF EXISTS public.document_versions;
-- DROP TABLE IF EXISTS public.document_comment_replies;
-- DROP TABLE IF EXISTS public.document_comments;
-- DROP TABLE IF EXISTS public.document_collaborators;
-- DROP TABLE IF EXISTS public.document_permissions;
-- DROP TABLE IF EXISTS public.document_blocks;
-- DROP TABLE IF EXISTS public.documents;
