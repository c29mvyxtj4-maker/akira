# AKIRA Documents System — Implementation Guide

**This guide shows exactly how to build the Notion-like document system.**

---

## Phase 1: Foundation Setup (Week 1-2)

### Step 1: Create Database Tables

Create `supabase/migrations/20260814_create_documents_system.sql`:

```sql
-- 1. Documents table (metadata)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_edited_by UUID REFERENCES public.profiles(id),
  
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  folder_id UUID REFERENCES public.document_folders(id),
  
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  CONSTRAINT documents_unique_per_org UNIQUE(org_id, id)
);

CREATE INDEX idx_documents_org_id ON public.documents(org_id);
CREATE INDEX idx_documents_created_by ON public.documents(created_by);
CREATE INDEX idx_documents_updated_at ON public.documents(updated_at DESC);
CREATE INDEX idx_documents_is_archived ON public.documents(is_archived);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 2. Document Blocks table (the content)
CREATE TABLE public.document_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,
  position INTEGER NOT NULL,
  
  content JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  
  version INTEGER DEFAULT 1,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}',
  
  CONSTRAINT blocks_unique_position UNIQUE(doc_id, position)
);

CREATE INDEX idx_document_blocks_doc_id ON public.document_blocks(doc_id, position);
CREATE INDEX idx_document_blocks_type ON public.document_blocks(type);

ALTER TABLE public.document_blocks ENABLE ROW LEVEL SECURITY;

-- 3. Permissions table (who has access)
CREATE TABLE public.document_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  role VARCHAR(20) NOT NULL DEFAULT 'viewer',
  expires_at TIMESTAMP WITH TIME ZONE,
  
  share_link_id VARCHAR(36) UNIQUE,
  share_link_password VARCHAR(255),
  
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT document_permissions_unique UNIQUE(doc_id, user_id)
);

CREATE INDEX idx_document_permissions_doc_id ON public.document_permissions(doc_id);
CREATE INDEX idx_document_permissions_user_id ON public.document_permissions(user_id);

ALTER TABLE public.document_permissions ENABLE ROW LEVEL SECURITY;

-- 4. Collaborators table (presence tracking)
CREATE TABLE public.document_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  is_active BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  cursor_position INTEGER,
  selection_start INTEGER,
  selection_end INTEGER,
  
  is_editing_block_id UUID,
  
  CONSTRAINT collaborators_unique UNIQUE(doc_id, user_id)
);

CREATE INDEX idx_document_collaborators_doc_id ON public.document_collaborators(doc_id);

ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;

-- 5. Block locking (prevent conflicts)
CREATE TABLE public.document_block_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.document_blocks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '5 minutes',
  
  CONSTRAINT block_locks_unique UNIQUE(block_id)
);

-- 6. Comments table
CREATE TABLE public.document_block_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.document_blocks(id) ON DELETE CASCADE,
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  
  text_start INTEGER,
  text_end INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  parent_comment_id UUID REFERENCES public.document_block_comments(id) ON DELETE CASCADE,
  
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id),
  
  metadata JSONB DEFAULT '{}'
);

-- 7. Version history
CREATE TABLE public.document_block_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.document_blocks(id) ON DELETE CASCADE,
  
  version_number INTEGER NOT NULL,
  content_snapshot JSONB NOT NULL,
  
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  change_description VARCHAR(255),
  
  CONSTRAINT versions_unique UNIQUE(block_id, version_number)
);

-- 8. Document folders
CREATE TABLE public.document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  parent_folder_id UUID REFERENCES public.document_folders(id) ON DELETE CASCADE,
  
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT folders_unique UNIQUE(org_id, name, parent_folder_id)
);

-- 9. Activity log
CREATE TABLE public.document_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  
  details JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_activity_log_doc_id ON public.document_activity_log(doc_id, created_at DESC);

-- Deploy with: supabase db push
```

### Step 2: Create RLS Policies

```sql
-- Document visibility
CREATE POLICY document_select_policy ON public.documents
  FOR SELECT
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM document_permissions
        WHERE doc_id = documents.id
          AND user_id = auth.uid()
          AND (role IN ('viewer', 'editor', 'admin') OR share_link_id IS NOT NULL)
      )
    )
  );

-- Document creation
CREATE POLICY document_insert_policy ON public.documents
  FOR INSERT
  WITH CHECK (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND created_by = auth.uid()
  );

-- Document updates (creator or admin)
CREATE POLICY document_update_policy ON public.documents
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM document_permissions
      WHERE doc_id = documents.id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Block access (inherit from document)
CREATE POLICY block_select_policy ON public.document_blocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_blocks.doc_id
        AND d.org_id = (auth.jwt() ->> 'org_id')::uuid
        AND (
          d.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM document_permissions
            WHERE doc_id = d.id
              AND user_id = auth.uid()
          )
        )
    )
  );

-- Block editing (must have editor+ role)
CREATE POLICY block_update_policy ON public.document_blocks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_blocks.doc_id
        AND EXISTS (
          SELECT 1 FROM document_permissions
          WHERE doc_id = d.id
            AND user_id = auth.uid()
            AND role IN ('editor', 'admin')
        )
    )
  );
```

---

## Phase 2: Service Layer (Week 2-3)

### Create `src/services/documents.service.js`

```javascript
import { supabase } from '@/lib/supabase'

// Get user's organization
async function getUserOrg() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const orgId = user.user_metadata?.org_id || user.org_id
  if (!orgId) throw new Error('No organization')
  
  return orgId
}

// Fetch all documents in organization
export async function fetchDocuments(filters = {}) {
  const orgId = await getUserOrg()
  
  let query = supabase
    .from('documents')
    .select(`
      id,
      title,
      description,
      created_at,
      updated_at,
      created_by,
      is_archived,
      is_pinned,
      tags,
      creator:created_by(id, email, user_metadata)
    `)
    .eq('org_id', orgId)
  
  if (filters.archived === false) {
    query = query.eq('is_archived', false)
  }
  
  if (filters.sort_by === 'updated_at') {
    query = query.order('updated_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  if (error) throw error
  
  return data
}

// Create new document
export async function createDocument(doc) {
  const { data: { user } } = await supabase.auth.getUser()
  const orgId = await getUserOrg()
  
  const { data, error } = await supabase
    .from('documents')
    .insert({
      org_id: orgId,
      created_by: user.id,
      title: doc.title || 'Untitled Document',
      description: doc.description || '',
      tags: doc.tags || [],
      metadata: doc.metadata || {},
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Auto-grant creator admin permission
  await supabase
    .from('document_permissions')
    .insert({
      doc_id: data.id,
      user_id: user.id,
      role: 'admin',
    })
  
  return data
}

// Fetch document with blocks and permissions
export async function fetchDocument(docId) {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get document
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', docId)
    .single()
  
  if (docError) throw new Error('Document not found')
  
  // Check permission
  const { data: perm, error: permError } = await supabase
    .from('document_permissions')
    .select('role')
    .eq('doc_id', docId)
    .eq('user_id', user.id)
    .single()
  
  if (permError || !perm) {
    throw new Error('No access to this document')
  }
  
  // Get blocks
  const { data: blocks, error: blocksError } = await supabase
    .from('document_blocks')
    .select('*')
    .eq('doc_id', docId)
    .eq('is_deleted', false)
    .order('position', { ascending: true })
  
  if (blocksError) throw blocksError
  
  // Get collaborators
  const { data: collaborators } = await supabase
    .from('document_collaborators')
    .select(`
      user_id,
      is_active,
      last_seen_at,
      user:profiles(id, email, user_metadata)
    `)
    .eq('doc_id', docId)
  
  return {
    ...doc,
    blocks: blocks || [],
    permissions: {
      current_user_role: perm.role,
      can_edit: ['editor', 'admin'].includes(perm.role),
      can_delete: perm.role === 'admin',
    },
    collaborators: collaborators || [],
  }
}

// Update document
export async function updateDocument(docId, updates) {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Verify user has admin permission
  const { data: perm } = await supabase
    .from('document_permissions')
    .select('role')
    .eq('doc_id', docId)
    .eq('user_id', user.id)
    .single()
  
  if (perm?.role !== 'admin') {
    throw new Error('Only admin can update document metadata')
  }
  
  const { data, error } = await supabase
    .from('documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      last_edited_by: user.id,
    })
    .eq('id', docId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Delete document (soft delete)
export async function deleteDocument(docId) {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: perm } = await supabase
    .from('document_permissions')
    .select('role')
    .eq('doc_id', docId)
    .eq('user_id', user.id)
    .single()
  
  if (perm?.role !== 'admin') {
    throw new Error('Only admin can delete')
  }
  
  return updateDocument(docId, { is_archived: true })
}

// Export for use
export default {
  fetchDocuments,
  fetchDocument,
  createDocument,
  updateDocument,
  deleteDocument,
}
```

### Create `src/services/documentBlocks.service.js`

```javascript
import { supabase } from '@/lib/supabase'

// Get next position in document
async function getNextBlockPosition(docId) {
  const { data } = await supabase
    .from('document_blocks')
    .select('position')
    .eq('doc_id', docId)
    .eq('is_deleted', false)
    .order('position', { ascending: false })
    .limit(1)
  
  return data?.[0]?.position ?? -1 + 1
}

// Create new block
export async function createBlock(docId, block) {
  const { data: { user } } = await supabase.auth.getUser()
  
  const position = block.position ?? await getNextBlockPosition(docId)
  
  const { data, error } = await supabase
    .from('document_blocks')
    .insert({
      doc_id: docId,
      type: block.type,
      position: position,
      content: block.content || {},
      created_by: user.id,
      updated_by: user.id,
      metadata: block.metadata || {},
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Create initial version
  await supabase.from('document_block_versions').insert({
    block_id: data.id,
    version_number: 1,
    content_snapshot: data.content,
    changed_by: user.id,
    change_description: 'Block created',
  })
  
  return data
}

// Update block
export async function updateBlock(docId, blockId, updates) {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get current block for versioning
  const { data: oldBlock } = await supabase
    .from('document_blocks')
    .select('content, version')
    .eq('id', blockId)
    .single()
  
  const newVersion = (oldBlock?.version || 0) + 1
  
  const { data, error } = await supabase
    .from('document_blocks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
      version: newVersion,
    })
    .eq('id', blockId)
    .select()
    .single()
  
  if (error) throw error
  
  // Create version record
  await supabase.from('document_block_versions').insert({
    block_id: blockId,
    version_number: newVersion,
    content_snapshot: updates.content || oldBlock?.content,
    changed_by: user.id,
    change_description: updates.change_description || 'Block updated',
  })
  
  // Log activity
  await supabase.from('document_activity_log').insert({
    doc_id: docId,
    user_id: user.id,
    action: 'block_updated',
    resource_type: 'block',
    resource_id: blockId,
    details: { type: data.type, version: newVersion },
  })
  
  return data
}

// Delete block (soft delete)
export async function deleteBlock(blockId) {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('document_blocks')
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', blockId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Reorder blocks
export async function reorderBlocks(docId, moves) {
  const { data: { user } } = await supabase.auth.getUser()
  
  for (const move of moves) {
    await supabase
      .from('document_blocks')
      .update({
        position: move.new_position,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', move.block_id)
  }
  
  // Fetch updated blocks
  const { data } = await supabase
    .from('document_blocks')
    .select('*')
    .eq('doc_id', docId)
    .eq('is_deleted', false)
    .order('position')
  
  return data
}

// Get block versions
export async function getBlockVersions(blockId) {
  const { data, error } = await supabase
    .from('document_block_versions')
    .select(`
      *,
      changed_by_user:changed_by(id, email)
    `)
    .eq('block_id', blockId)
    .order('version_number', { ascending: false })
  
  if (error) throw error
  return data
}

// Restore block to previous version
export async function restoreBlockVersion(blockId, versionNumber) {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: version } = await supabase
    .from('document_block_versions')
    .select('*')
    .eq('block_id', blockId)
    .eq('version_number', versionNumber)
    .single()
  
  if (!version) throw new Error('Version not found')
  
  return updateBlock(null, blockId, {
    content: version.content_snapshot,
    change_description: `Restored to version ${versionNumber}`,
  })
}

export default {
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
  getBlockVersions,
  restoreBlockVersion,
}
```

---

## Phase 3: React Components (Week 3-4)

### Create `src/hooks/useDocumentRealtime.js`

```javascript
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useDocumentRealtime(docId) {
  const [blocks, setBlocks] = useState([])
  const [collaborators, setCollaborators] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!docId) return
    
    // Subscribe to block changes
    const blockChannel = supabase
      .channel(`docs:${docId}:blocks`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_blocks',
          filter: `doc_id=eq.${docId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBlocks(prev => [...prev, payload.new].sort((a, b) => a.position - b.position))
          } else if (payload.eventType === 'UPDATE') {
            setBlocks(prev =>
              prev.map(b => b.id === payload.new.id ? payload.new : b)
                .sort((a, b) => a.position - b.position)
            )
          } else if (payload.eventType === 'DELETE') {
            setBlocks(prev => prev.filter(b => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()
    
    // Subscribe to presence
    const presenceChannel = supabase
      .channel(`docs:${docId}:presence`, {
        config: { broadcast: { self: true } }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const active = Object.entries(state)
          .flatMap(([_, users]) => users)
          .filter(u => u.is_active)
        setCollaborators(active)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser()
          await presenceChannel.track({
            user_id: user.id,
            cursor_position: null,
            is_editing: false,
            last_seen: new Date(),
          })
        }
      })
    
    setLoading(false)
    
    return () => {
      blockChannel.unsubscribe()
      presenceChannel.unsubscribe()
    }
  }, [docId])
  
  const updateCursor = useCallback((blockId, position) => {
    supabase
      .channel(`docs:${docId}:presence`)
      .send('broadcast', {
        event: 'cursor',
        data: {
          block_id: blockId,
          position,
          updated_at: new Date(),
        },
      })
  }, [docId])
  
  return {
    blocks,
    collaborators,
    loading,
    updateCursor,
  }
}
```

### Create `src/pages/Documents.jsx`

```javascript
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { fetchDocument } from '@/services/documents.service'
import { useDocumentRealtime } from '@/hooks/useDocumentRealtime'
import DocumentEditor from '@/components/documents/DocumentEditor'
import { Spinner } from '@/components/ui/Spinner'

export default function DocumentPage() {
  const { docId } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { blocks, collaborators, updateCursor } = useDocumentRealtime(docId)
  
  useEffect(() => {
    fetchDocument(docId)
      .then(doc => {
        setDocument(doc)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [docId])
  
  if (loading) return <AppShell><Spinner /></AppShell>
  if (error) return <AppShell><div className="text-red-600">Error: {error}</div></AppShell>
  if (!document) return <AppShell><div>Document not found</div></AppShell>
  
  return (
    <AppShell>
      <DocumentEditor
        document={document}
        blocks={blocks}
        collaborators={collaborators}
        onUpdateCursor={updateCursor}
        canEdit={document.permissions.can_edit}
      />
    </AppShell>
  )
}
```

### Create `src/components/documents/DocumentEditor.jsx`

```javascript
import { useState } from 'react'
import { createBlock, updateBlock, deleteBlock } from '@/services/documentBlocks.service'
import BlockRenderer from './BlockRenderer'
import BlockToolbar from './BlockToolbar'
import CollaboratorsPanel from './CollaboratorsPanel'

export default function DocumentEditor({
  document,
  blocks,
  collaborators,
  canEdit,
  onUpdateCursor,
}) {
  const [selectedBlock, setSelectedBlock] = useState(null)
  
  const handleAddBlock = async (type, afterBlockId) => {
    if (!canEdit) return
    
    const position = afterBlockId
      ? blocks.findIndex(b => b.id === afterBlockId) + 1
      : blocks.length
    
    try {
      await createBlock(document.id, {
        type,
        position,
        content: getDefaultContent(type),
      })
    } catch (err) {
      console.error('Error adding block:', err)
    }
  }
  
  const handleUpdateBlock = async (blockId, updates) => {
    if (!canEdit) return
    
    try {
      await updateBlock(document.id, blockId, updates)
    } catch (err) {
      console.error('Error updating block:', err)
    }
  }
  
  const handleDeleteBlock = async (blockId) => {
    if (!canEdit) return
    
    try {
      await deleteBlock(blockId)
      setSelectedBlock(null)
    } catch (err) {
      console.error('Error deleting block:', err)
    }
  }
  
  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{document.title}</h1>
          {document.description && (
            <p className="text-gray-500 mt-2">{document.description}</p>
          )}
        </div>
        
        <div className="space-y-4">
          {blocks.map((block, idx) => (
            <div key={block.id}>
              <BlockRenderer
                block={block}
                isSelected={selectedBlock === block.id}
                onSelect={() => setSelectedBlock(block.id)}
                onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                onDelete={() => handleDeleteBlock(block.id)}
                canEdit={canEdit}
              />
              
              {canEdit && (
                <BlockToolbar
                  onAddBlock={(type) => handleAddBlock(type, block.id)}
                />
              )}
            </div>
          ))}
        </div>
        
        {canEdit && (
          <BlockToolbar
            onAddBlock={(type) => handleAddBlock(type)}
          />
        )}
      </div>
      
      <aside className="w-64">
        <CollaboratorsPanel collaborators={collaborators} />
      </aside>
    </div>
  )
}

function getDefaultContent(type) {
  const defaults = {
    paragraph: { text: '', formatting: [] },
    heading1: { text: '' },
    heading2: { text: '' },
    heading3: { text: '' },
    table: { columns: [], rows: [] },
    chart: { chart_type: 'bar', data_source: { type: 'manual', data: [] } },
    image: { url: '' },
    callout: { text: '', icon: '💡', color: 'blue' },
  }
  return defaults[type] || {}
}
```

---

## Phase 4: Real-time & Permissions (Week 4-5)

### Create `src/services/documentPermissions.service.js`

```javascript
import { supabase } from '@/lib/supabase'
import { v4 as uuid } from 'uuid'

// Grant permission to user
export async function grantPermission(docId, userId, role) {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Verify grantor is admin
  const { data: perm } = await supabase
    .from('document_permissions')
    .select('role')
    .eq('doc_id', docId)
    .eq('user_id', user.id)
    .single()
  
  if (perm?.role !== 'admin') {
    throw new Error('Only admin can grant permissions')
  }
  
  const { data, error } = await supabase
    .from('document_permissions')
    .upsert({
      doc_id: docId,
      user_id: userId,
      role,
      granted_by: user.id,
      granted_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Create share link
export async function createShareLink(docId, options = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Verify admin
  const { data: perm } = await supabase
    .from('document_permissions')
    .select('role')
    .eq('doc_id', docId)
    .eq('user_id', user.id)
    .single()
  
  if (perm?.role !== 'admin') {
    throw new Error('Only admin can create share links')
  }
  
  const linkId = uuid().slice(0, 12)
  
  const { data, error } = await supabase
    .from('document_permissions')
    .insert({
      doc_id: docId,
      user_id: user.id, // Use grantor's ID temporarily
      role: options.role || 'viewer',
      share_link_id: linkId,
      share_link_password: options.password || null,
      expires_at: options.expires_at || null,
      granted_by: user.id,
    })
    .select()
    .single()
  
  if (error) throw error
  
  return {
    share_link: `${window.location.origin}/docs/share/${linkId}`,
    share_link_id: linkId,
    expires_at: options.expires_at,
  }
}

// Revoke permission
export async function revokePermission(docId, userId) {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: perm } = await supabase
    .from('document_permissions')
    .select('role')
    .eq('doc_id', docId)
    .eq('user_id', user.id)
    .single()
  
  if (perm?.role !== 'admin') {
    throw new Error('Only admin can revoke permissions')
  }
  
  const { error } = await supabase
    .from('document_permissions')
    .delete()
    .eq('doc_id', docId)
    .eq('user_id', userId)
  
  if (error) throw error
}

export default {
  grantPermission,
  createShareLink,
  revokePermission,
}
```

---

## Testing Checklist

### Unit Tests

```javascript
// src/services/__tests__/documents.service.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createDocument, fetchDocument } from '../documents.service'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase')

describe('Documents Service', () => {
  it('should create a document', async () => {
    // Mock auth
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } }
    })
    
    // Mock insert
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'doc-1',
              title: 'Test Doc',
              org_id: 'org-1',
            }
          })
        })
      })
    })
    
    const result = await createDocument({ title: 'Test Doc' })
    expect(result.title).toBe('Test Doc')
  })
})
```

### E2E Tests (Playwright)

```javascript
// e2e/documents.spec.js
import { test, expect } from '@playwright/test'

test('should create and edit document', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button:has-text("Sign In")')
  
  // Create document
  await page.goto('/documents')
  await page.click('button:has-text("New Document")')
  await page.fill('[name="title"]', 'Test Document')
  await page.click('button:has-text("Create")')
  
  // Add block
  await page.click('button[data-test="add-block"]')
  await page.click('text="Paragraph"')
  
  // Edit block
  const editor = page.locator('[data-test="block-editor"] >> first')
  await editor.click()
  await editor.fill('Hello World')
  
  // Verify saved
  await page.waitForTimeout(1000)
  await expect(editor).toHaveValue('Hello World')
})
```

---

## Deployment Checklist

- [ ] Run database migrations: `supabase db push`
- [ ] Deploy RLS policies
- [ ] Test authentication flow
- [ ] Test real-time subscriptions
- [ ] Test permission enforcement
- [ ] Load test with multiple concurrent users
- [ ] Monitor Supabase dashboard for errors
- [ ] Set up Sentry monitoring
- [ ] Document API in README
- [ ] Create user documentation

---

## Quick Start Commands

```bash
# Setup
cd akira-saas
npm install

# Create migration
supabase migration new create_documents_system

# Push to local DB
supabase db push

# Deploy to production
git push origin main
# Vercel auto-deploys

# Test real-time locally
npm run dev
# Open in two browser windows
```

---

**Implementation Guide — End**

For questions or clarifications, refer to `DOCUMENTS_ARCHITECTURE.md` and `DOCUMENTS_ARCHITECTURE_DIAGRAMS.md`.
