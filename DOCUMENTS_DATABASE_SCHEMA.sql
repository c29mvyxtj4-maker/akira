-- ============================================================================
-- AKIRA Documents System - Complete SQL Schema
-- Notion-like collaborative document system with granular permissions
-- ============================================================================

-- ============================================================================
-- CORE TABLES
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
  content_preview TEXT, -- First 200 chars of content for search
  metadata JSONB DEFAULT '{}'::jsonb -- Custom metadata
);

-- document_blocks: Individual blocks (paragraphs, tables, charts, etc)
CREATE TABLE IF NOT EXISTS public.document_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'paragraph', 'heading1', 'heading2', 'heading3', 'table', 'chart', 'calendar', 'kanban', 'image', 'embed', 'callout', 'code', 'quote', 'divider', 'checklist'
  content JSONB NOT NULL, -- Flexible content based on type
  metadata JSONB DEFAULT '{}'::jsonb, -- type-specific metadata
  position INTEGER NOT NULL, -- Order in document (allows gaps for insertion)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  linked_to_table VARCHAR(50), -- e.g., 'clients', 'projects', 'invoices', 'events'
  linked_to_id UUID, -- ID of linked record (if applicable)
  is_deleted BOOLEAN DEFAULT FALSE -- Soft delete for undo functionality
);

-- document_permissions: Granular access control
CREATE TABLE IF NOT EXISTS public.document_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')), -- 'viewer' (read-only), 'editor' (read+write blocks), 'admin' (full control)
  granted_by UUID NOT NULL REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration for temporary access
  UNIQUE(document_id, user_id)
);

-- document_collaborators: Track active editors and cursor positions
CREATE TABLE IF NOT EXISTS public.document_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cursor_block_id UUID, -- Block ID they're currently editing
  cursor_offset INTEGER, -- Character offset in block
  is_online BOOLEAN DEFAULT TRUE,
  color VARCHAR(7) DEFAULT '#000000', -- Cursor/selection color for collaboration UI
  UNIQUE(document_id, user_id)
);

-- document_comments: Inline comments and discussions per block
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

-- document_versions: Version history for undo/rollback
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  blocks_snapshot JSONB NOT NULL, -- Full snapshot of all blocks at this version
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version_number INTEGER NOT NULL,
  change_description TEXT, -- E.g., "Updated block 123", "Deleted 3 blocks"
  UNIQUE(document_id, version_number)
);

-- document_folders: Optional folder structure for organization
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

-- document_shares: Shareable links with unique tokens (for public/guest access)
CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  share_token VARCHAR(32) UNIQUE NOT NULL, -- Random token for URL
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('public_view', 'public_edit', 'password_protected', 'client_only')), -- Type of sharing
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
  password_hash TEXT, -- If password_protected
  access_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- document_activities: Audit log for all changes
CREATE TABLE IF NOT EXISTS public.document_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action VARCHAR(50) NOT NULL, -- 'create', 'update_block', 'delete_block', 'add_permission', 'comment', 'share'
  details JSONB DEFAULT '{}'::jsonb, -- Action-specific details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_documents_org_id ON public.documents(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON public.documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON public.documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_archived ON public.documents(is_archived);
CREATE INDEX IF NOT EXISTS idx_documents_is_pinned ON public.documents(is_pinned);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.documents USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_document_blocks_document_id ON public.document_blocks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_blocks_created_by ON public.document_blocks(created_by);
CREATE INDEX IF NOT EXISTS idx_document_blocks_type ON public.document_blocks(type);
CREATE INDEX IF NOT EXISTS idx_document_blocks_linked ON public.document_blocks(linked_to_table, linked_to_id);
CREATE INDEX IF NOT EXISTS idx_document_blocks_position ON public.document_blocks(document_id, position);

CREATE INDEX IF NOT EXISTS idx_document_permissions_document_id ON public.document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_permissions_user_id ON public.document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_permissions_role ON public.document_permissions(role);

CREATE INDEX IF NOT EXISTS idx_document_collaborators_document_id ON public.document_collaborators(document_id);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_is_online ON public.document_collaborators(is_online);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_user_id ON public.document_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_block_id ON public.document_comments(block_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_user_id ON public.document_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_resolved ON public.document_comments(resolved);

CREATE INDEX IF NOT EXISTS idx_document_comment_replies_comment_id ON public.document_comment_replies(comment_id);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_version_number ON public.document_versions(document_id, version_number);

CREATE INDEX IF NOT EXISTS idx_document_folders_org_id ON public.document_folders(org_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_parent ON public.document_folders(parent_folder_id);

CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON public.document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_token ON public.document_shares(share_token);

CREATE INDEX IF NOT EXISTS idx_document_activities_document_id ON public.document_activities(document_id);
CREATE INDEX IF NOT EXISTS idx_document_activities_user_id ON public.document_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_document_activities_created_at ON public.document_activities(created_at);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
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

-- === DOCUMENTS POLICIES ===

-- Policy: Users can view documents in their org where they have permission or are the creator
CREATE POLICY "users_can_view_permitted_documents"
  ON public.documents
  FOR SELECT
  USING (
    -- User is in the same organization
    org_id IN (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
    )
    AND (
      -- User is the creator
      created_by = auth.uid()
      OR
      -- User has explicit permission
      EXISTS (
        SELECT 1 FROM public.document_permissions
        WHERE document_id = documents.id
        AND user_id = auth.uid()
        AND (expires_at IS NULL OR expires_at > NOW())
      )
    )
  );

-- Policy: Users can create documents in their org
CREATE POLICY "users_can_create_documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Policy: Users can update documents they created or have admin permission
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

-- Policy: Users can delete documents they created or have admin permission
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

-- === DOCUMENT_BLOCKS POLICIES ===

-- Policy: Users can view blocks in documents they have access to
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

-- Policy: Users with editor/admin role can insert blocks
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

-- Policy: Users with editor/admin role can update blocks
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

-- Policy: Users with editor/admin role can delete blocks
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

-- === DOCUMENT_PERMISSIONS POLICIES ===

-- Policy: Users can view permissions for documents they have access to
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

-- Policy: Admins can grant/revoke permissions
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

-- === DOCUMENT_COLLABORATORS POLICIES ===

-- Policy: Users can view collaborators for documents they have access to
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

-- Policy: Users can update their own collaborator record
CREATE POLICY "users_can_update_own_collaborator"
  ON public.document_collaborators
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- === DOCUMENT_COMMENTS POLICIES ===

-- Policy: Users can view comments on documents they have access to
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

-- Policy: Users with editor/admin role can create comments
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

-- Policy: Users can update/delete their own comments
CREATE POLICY "users_can_manage_own_comments"
  ON public.document_comments
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- === DOCUMENT_COMMENT_REPLIES POLICIES ===

-- Policy: Users can view replies on comments they can see
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

-- Policy: Users with editor/admin role can reply
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

-- === DOCUMENT_VERSIONS POLICIES ===

-- Policy: Users can view version history for documents they have access to
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

-- Policy: Admins can manage versions
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

-- === DOCUMENT_FOLDERS POLICIES ===

-- Policy: Users can view folders in their org
CREATE POLICY "users_can_view_folders"
  ON public.document_folders
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can create folders in their org
CREATE POLICY "users_can_create_folders"
  ON public.document_folders
  FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Policy: Users can update/delete folders they created
CREATE POLICY "users_can_manage_own_folders"
  ON public.document_folders
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- === DOCUMENT_SHARES POLICIES ===

-- Policy: Users can view shares for documents they have access to
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

-- Policy: Admins can create/manage shares
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

-- === DOCUMENT_ACTIVITIES POLICIES ===

-- Policy: Users can view activities for documents they have access to
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

-- Policy: System can insert activities
CREATE POLICY "system_can_insert_activities"
  ON public.document_activities
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-increment version numbers
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

-- Function to generate a random share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS VARCHAR(32) AS $$
BEGIN
  RETURN SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 32);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-update document.updated_at when blocks change
CREATE TRIGGER tr_update_document_timestamp_on_block_change
AFTER INSERT OR UPDATE ON public.document_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update document.updated_at when document changes
CREATE TRIGGER tr_update_document_timestamp
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update document_folders.updated_at
CREATE TRIGGER tr_update_folder_timestamp
BEFORE UPDATE ON public.document_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-increment version number
CREATE TRIGGER tr_auto_increment_version
BEFORE INSERT ON public.document_versions
FOR EACH ROW
EXECUTE FUNCTION public.auto_increment_document_version();

-- Trigger: Auto-update comment timestamp
CREATE TRIGGER tr_update_comment_timestamp
BEFORE UPDATE ON public.document_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update reply timestamp
CREATE TRIGGER tr_update_reply_timestamp
BEFORE UPDATE ON public.document_comment_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

-- Ensure document blocks don't have duplicate positions within a document
ALTER TABLE public.document_blocks
ADD CONSTRAINT unique_block_position_per_doc
UNIQUE (document_id, position);

-- Ensure version numbers are positive
ALTER TABLE public.document_versions
ADD CONSTRAINT positive_version_number
CHECK (version_number > 0);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.documents IS 'Main document container. Each document belongs to an organization and is created by a user.';
COMMENT ON COLUMN public.documents.content_preview IS 'First 200 chars of content for search and preview purposes.';
COMMENT ON COLUMN public.documents.metadata IS 'Custom metadata JSON (can store integrations, custom fields, etc).';

COMMENT ON TABLE public.document_blocks IS 'Individual blocks within a document. Supports multiple types: paragraph, heading, table, chart, calendar, kanban, etc.';
COMMENT ON COLUMN public.document_blocks.type IS 'Type of block: paragraph, heading1-3, table, chart, calendar, kanban, image, embed, callout, code, quote, divider, checklist';
COMMENT ON COLUMN public.document_blocks.content IS 'Flexible JSONB content structure depends on type.';
COMMENT ON COLUMN public.document_blocks.linked_to_table IS 'If block is linked to a CRM record (client, project, invoice), store table name here.';
COMMENT ON COLUMN public.document_blocks.linked_to_id IS 'If block is linked to a CRM record, store the record ID here.';
COMMENT ON COLUMN public.document_blocks.is_deleted IS 'Soft delete flag for undo/recovery functionality.';

COMMENT ON TABLE public.document_permissions IS 'Granular access control for documents. Supports viewer (read-only), editor (read+write), and admin (full control) roles.';

COMMENT ON TABLE public.document_collaborators IS 'Real-time tracking of active editors and their cursor positions for collaborative editing.';

COMMENT ON TABLE public.document_comments IS 'Inline comments and discussions anchored to specific blocks.';

COMMENT ON TABLE public.document_versions IS 'Version history snapshots for undo/rollback and audit trail.';

COMMENT ON TABLE public.document_folders IS 'Optional folder structure for organizing documents within an organization.';

COMMENT ON TABLE public.document_shares IS 'Shareable links with unique tokens for public/guest access. Supports public view, public edit, password-protected, and client-only sharing.';

COMMENT ON TABLE public.document_activities IS 'Comprehensive audit log tracking all changes, comments, permissions, and sharing actions.';
