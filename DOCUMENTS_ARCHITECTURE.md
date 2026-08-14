# AKIRA Documents Architecture
## Notion-Style Collaborative Document System

**Version:** 1.0  
**Date:** 2026-08-14  
**Author:** Marc  
**Status:** Design Phase

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Model](#data-model)
3. [Real-time Sync Strategy](#real-time-sync-strategy)
4. [Permission System](#permission-system)
5. [Block Architecture](#block-architecture)
6. [Block Linking Strategy](#block-linking-strategy)
7. [Collaboration Features](#collaboration-features)
8. [Search & Organization](#search--organization)
9. [Security & RLS](#security--rls)
10. [API Routes](#api-routes)
11. [Implementation Strategy](#implementation-strategy)
12. [Migration & Database](#migration--database)

---

## System Overview

AKIRA's document system enables teams and clients to:
- Create rich, structured documents with Notion-style blocks
- Share documents with granular permissions (view/edit/admin)
- Collaborate in real-time with cursor tracking and presence
- Link blocks to live data (clients, projects, finance)
- Track activity and version history
- Search across all documents

**Key Principles:**
- **Real-time first:** All changes sync instantly via Supabase Realtime
- **Granular permissions:** Row-level security at document and block level
- **Block-based:** Modular architecture allows rich content types
- **Data-linked:** Blocks can reference and display live data from other tables
- **Collaborative:** Multi-user editing with presence, cursors, and locking
- **Auditable:** Complete activity log and version history

---

## Data Model

### Core Tables

#### 1. `documents` table

Stores document metadata and belongs to an organization.

```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- emoji or icon name
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_edited_by UUID REFERENCES public.profiles(id),
  
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  folder_id UUID REFERENCES public.document_folders(id), -- optional folder
  
  tags TEXT[] DEFAULT '{}', -- ["client-work", "proposal", etc]
  metadata JSONB DEFAULT '{}', -- store custom metadata
  
  CONSTRAINT documents_org_id_index UNIQUE(org_id, id)
);

CREATE INDEX idx_documents_org_id ON public.documents(org_id);
CREATE INDEX idx_documents_created_by ON public.documents(created_by);
CREATE INDEX idx_documents_folder_id ON public.documents(folder_id);
CREATE INDEX idx_documents_is_archived ON public.documents(is_archived);
```

#### 2. `document_blocks` table

Individual blocks that make up a document.

```sql
CREATE TABLE public.document_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, -- "paragraph", "heading1", "table", "chart", etc
  position INTEGER NOT NULL, -- order within document (0-based)
  
  -- Content storage (depends on block type)
  content JSONB NOT NULL DEFAULT '{}', -- structured content
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  
  -- Versioning
  version INTEGER DEFAULT 1,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}', -- type-specific metadata
  
  CONSTRAINT blocks_unique_position UNIQUE(doc_id, position)
);

CREATE INDEX idx_document_blocks_doc_id ON public.document_blocks(doc_id, position);
CREATE INDEX idx_document_blocks_type ON public.document_blocks(type);
CREATE INDEX idx_document_blocks_created_by ON public.document_blocks(created_by);
```

#### 3. `document_permissions` table

Granular access control per user per document.

```sql
CREATE TABLE public.document_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Role determines access level
  role VARCHAR(20) NOT NULL DEFAULT 'viewer', -- "viewer", "editor", "admin"
  
  -- Optional: temporary share expiration
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Share link metadata
  share_link_id VARCHAR(36) UNIQUE, -- for public/guest links
  share_link_password VARCHAR(255), -- optional password protection
  
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT document_permissions_unique UNIQUE(doc_id, user_id)
);

CREATE INDEX idx_document_permissions_doc_id ON public.document_permissions(doc_id);
CREATE INDEX idx_document_permissions_user_id ON public.document_permissions(user_id);
CREATE INDEX idx_document_permissions_share_link ON public.document_permissions(share_link_id);
```

#### 4. `document_collaborators` table

Tracks active collaborators and cursor positions (for presence tracking).

```sql
CREATE TABLE public.document_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Presence tracking
  is_active BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Cursor position (for real-time tracking)
  cursor_position INTEGER, -- block ID
  selection_start INTEGER,
  selection_end INTEGER,
  
  -- Editing state
  is_editing_block_id UUID, -- which block is being edited
  
  CONSTRAINT collaborators_unique UNIQUE(doc_id, user_id)
);

CREATE INDEX idx_document_collaborators_doc_id ON public.document_collaborators(doc_id);
CREATE INDEX idx_document_collaborators_is_active ON public.document_collaborators(is_active);
```

#### 5. `document_block_locks` table

Prevents concurrent editing conflicts on the same block.

```sql
CREATE TABLE public.document_block_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.document_blocks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Auto-release if no activity for 5 minutes
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '5 minutes',
  
  CONSTRAINT block_locks_unique UNIQUE(block_id)
);

CREATE INDEX idx_block_locks_block_id ON public.document_block_locks(block_id);
```

#### 6. `document_block_comments` table

Comments on specific blocks or inline text ranges.

```sql
CREATE TABLE public.document_block_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.document_blocks(id) ON DELETE CASCADE,
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  
  -- Optional: comment on specific text range
  text_start INTEGER,
  text_end INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Replies
  parent_comment_id UUID REFERENCES public.document_block_comments(id) ON DELETE CASCADE,
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id),
  
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_block_comments_block_id ON public.document_block_comments(block_id);
CREATE INDEX idx_block_comments_doc_id ON public.document_block_comments(doc_id);
CREATE INDEX idx_block_comments_author_id ON public.document_block_comments(author_id);
```

#### 7. `document_block_versions` table

Version history for audit trail and restore functionality.

```sql
CREATE TABLE public.document_block_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.document_blocks(id) ON DELETE CASCADE,
  
  version_number INTEGER NOT NULL,
  content_snapshot JSONB NOT NULL,
  
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  change_description VARCHAR(255), -- "text edited", "table cell updated", etc
  
  CONSTRAINT versions_unique UNIQUE(block_id, version_number)
);

CREATE INDEX idx_block_versions_block_id ON public.document_block_versions(block_id);
```

#### 8. `document_folders` table

Optional: Organize documents into folders.

```sql
CREATE TABLE public.document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  parent_folder_id UUID REFERENCES public.document_folders(id) ON DELETE CASCADE,
  
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT folders_unique UNIQUE(org_id, name, parent_folder_id)
);

CREATE INDEX idx_document_folders_org_id ON public.document_folders(org_id);
CREATE INDEX idx_document_folders_parent ON public.document_folders(parent_folder_id);
```

---

## Real-time Sync Strategy

### Supabase Realtime Channels

All document changes sync via Postgres Changes (Realtime).

#### Channel Structure

```
docs:{document_id}:blocks       → Block content changes
docs:{document_id}:permissions  → Permission changes
docs:{document_id}:presence     → User presence/cursors
docs:{document_id}:comments     → New comments
```

#### Sync Flow

```
User edits block
    ↓
Client updates local state (optimistic)
    ↓
Send update to Supabase via RPC
    ↓
PostgreSQL trigger fires
    ↓
Realtime channel broadcasts to all subscribers
    ↓
Other clients receive update and merge
    ↓
UI updates with confirmed server state
```

#### Real-time Listener Setup (React Hook Example)

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useDocumentRealtime(docId) {
  const [blocks, setBlocks] = useState([])
  const [collaborators, setCollaborators] = useState([])

  useEffect(() => {
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
            setBlocks(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setBlocks(prev =>
              prev.map(b => b.id === payload.new.id ? payload.new : b)
            )
          } else if (payload.eventType === 'DELETE') {
            setBlocks(prev => prev.filter(b => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Subscribe to presence (cursor tracking)
    const presenceChannel = supabase
      .channel(`docs:${docId}:presence`, { config: { broadcast: { self: true } } })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const active = Object.entries(state)
          .flatMap(([_, users]) => users)
          .filter(u => u.is_active)
        setCollaborators(active)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: currentUserId,
            cursor_position: null,
            is_editing: false,
            last_seen: new Date(),
          })
        }
      })

    return () => {
      blockChannel.unsubscribe()
      presenceChannel.unsubscribe()
    }
  }, [docId])

  return { blocks, collaborators }
}
```

### Conflict Resolution Strategy

**Last-Write-Wins (LWW) with Timestamps:**

1. Each block update includes server-side timestamp (`updated_at`)
2. If two users edit simultaneously, server accepts the one with later timestamp
3. Client-side optimistic update is immediately reverted if server rejects
4. Users see toast notification: "Another user updated this block"

**Alternative for Rich Text:** Use Operational Transformation (OT) or CRDT library (e.g., Yjs) for paragraph text with character-level conflict resolution. For MVP, LWW is sufficient.

---

## Permission System

### Roles & Capabilities

| Role | View | Edit Blocks | Delete Blocks | Manage Doc | Change Perms | Delete Doc |
|------|------|-------------|---------------|-----------|--------------|-----------|
| **Viewer** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Editor** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Admin** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Creator** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Permission Inheritance

```
Organization
  └─ Document
       ├─ Permissions (user-specific overrides)
       └─ Blocks (inherit document permissions)
```

### Share Links (Public/Guest Access)

```typescript
// Generate shareable link
POST /api/documents/{id}/share-link
Body: {
  role: "viewer" | "editor",
  password: "optional-password",
  expires_at: "2026-09-14T00:00:00Z" // optional
}

Response: {
  share_link: "https://akira.app/docs/share/abc123def456",
  share_link_id: "abc123def456"
}
```

---

## Block Architecture

### Base Block Interface

All blocks follow this structure:

```typescript
interface Block {
  id: string // UUID
  doc_id: string // parent document
  type: BlockType // discriminated union type
  position: number // 0-based order
  content: BlockContent // type-specific content
  metadata: Record<string, any> // extensibility
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
  created_by: string // user ID
  updated_by: string // user ID
  version: number // for versioning
}

type BlockType = 
  | 'paragraph'
  | 'heading1' | 'heading2' | 'heading3'
  | 'table'
  | 'chart'
  | 'calendar'
  | 'kanban'
  | 'image'
  | 'embed'
  | 'callout'
  | 'divider'
  | 'code'
```

### Specific Block Types

#### 1. Paragraph Block

```typescript
interface ParagraphBlock extends Block {
  type: 'paragraph'
  content: {
    text: string
    // Rich text formatting
    formatting?: Array<{
      start: number
      end: number
      type: 'bold' | 'italic' | 'underline' | 'strikethrough'
      color?: string
      backgroundColor?: string
    }>
    // Mentions
    mentions?: Array<{
      start: number
      end: number
      user_id: string // or doc_id, client_id, project_id
      type: 'user' | 'document' | 'client' | 'project'
    }>
  }
}
```

#### 2. Heading Blocks

```typescript
interface HeadingBlock extends Block {
  type: 'heading1' | 'heading2' | 'heading3'
  content: {
    text: string
    formatting?: FormattingRange[]
  }
}
```

#### 3. Table Block

```typescript
interface TableBlock extends Block {
  type: 'table'
  content: {
    columns: Array<{
      id: string
      name: string
      type: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'linked'
      width?: number
      linked_to?: {
        type: 'clients' | 'projects' | 'finance' // link to external table
        field: string // which field to display
      }
    }>
    rows: Array<{
      id: string
      cells: Record<string, any> // column_id -> cell value
    }>
    metadata: {
      linked_sync: 'manual' | 'auto' // auto-refresh from source
      last_synced: string // ISO timestamp
    }
  }
}

// Example: Table linked to Clients
{
  columns: [
    { id: 'col1', name: 'Client Name', type: 'text', linked_to: { type: 'clients', field: 'name' } },
    { id: 'col2', name: 'Contact', type: 'text', linked_to: { type: 'clients', field: 'primary_contact_email' } },
    { id: 'col3', name: 'Status', type: 'select', options: ['Active', 'Inactive'] }
  ]
}
```

#### 4. Chart Block

```typescript
interface ChartBlock extends Block {
  type: 'chart'
  content: {
    chart_type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
    
    data_source: {
      type: 'manual' | 'linked'
      // If manual:
      data?: Array<{ label: string, value: number }>
      // If linked:
      linked_to?: {
        type: 'projects' | 'clients' | 'finance'
        metric: string // e.g., "total_revenue", "project_count"
        group_by?: string // e.g., "month", "status"
        filters?: Record<string, any>
      }
    }
    
    title?: string
    description?: string
    x_axis?: { label: string }
    y_axis?: { label: string }
  }
}

// Example: Revenue by Project
{
  chart_type: 'bar',
  data_source: {
    type: 'linked',
    linked_to: {
      type: 'projects',
      metric: 'total_revenue',
      group_by: 'month'
    }
  }
}
```

#### 5. Calendar Block

```typescript
interface CalendarBlock extends Block {
  type: 'calendar'
  content: {
    sync_with: 'calendar_section' | 'none' // sync with main calendar
    
    display_mode: 'month' | 'week' | 'day'
    
    events: Array<{
      id: string
      title: string
      start_date: string // ISO
      end_date: string // ISO
      linked_event_id?: string // reference to calendar_events table
      color?: string
    }>
  }
}
```

#### 6. Kanban Block

```typescript
interface KanbanBlock extends Block {
  type: 'kanban'
  content: {
    title: string
    
    columns: Array<{
      id: string
      name: string
      color?: string
      cards: Array<{
        id: string
        title: string
        description?: string
        linked_project_id?: string // reference to projects
        linked_task_id?: string // reference to project_tasks
        metadata?: Record<string, any>
      }>
    }>
  }
}
```

#### 7. Image Block

```typescript
interface ImageBlock extends Block {
  type: 'image'
  content: {
    url: string // storage URL from Supabase
    alt_text?: string
    caption?: string
    width?: number
    height?: number
  }
}
```

#### 8. Embed Block

```typescript
interface EmbedBlock extends Block {
  type: 'embed'
  content: {
    provider: 'youtube' | 'vimeo' | 'figma' | 'loom' | 'custom'
    url: string
    embed_html?: string // cached embed HTML
    width?: number
    height?: number
    title?: string
  }
}
```

#### 9. Callout Block

```typescript
interface CalloutBlock extends Block {
  type: 'callout'
  content: {
    icon: string // emoji
    text: string
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  }
}
```

---

## Block Linking Strategy

### Data Linking Architecture

Blocks can create **live references** to other tables:

#### Linked Table Block Example

```typescript
// Table block linked to clients
const clientsTable = {
  type: 'table',
  content: {
    linked_to: {
      source_table: 'clients',
      org_id: 'current-org',
      filters: [{ field: 'status', operator: 'eq', value: 'active' }]
    },
    columns: [
      {
        name: 'Name',
        type: 'text',
        source_field: 'name',
        editable: false // synced from source
      },
      {
        name: 'Contact Email',
        type: 'text',
        source_field: 'primary_contact_email',
        editable: false
      },
      {
        name: 'Notes',
        type: 'text',
        source_field: null, // manual column
        editable: true // user-entered data
      }
    ]
  }
}
```

#### Linking Rules

1. **Read-only fields** — synced from source, cannot be edited in document
2. **Custom fields** — editable, stored in document block (not source)
3. **Sync toggle** — `auto_sync: true` fetches fresh data on document load
4. **Stale data warning** — show if linked data is older than 1 hour

#### Link Types

| Link | Source | Display | Editable | Sync |
|------|--------|---------|----------|------|
| Clients table | `clients` table | specific columns | custom cols only | optional |
| Projects table | `projects` table | name, status, deadline | custom cols only | optional |
| Finance data | `finance_categories` | category, amount | custom cols only | optional |
| Calendar events | `calendar_events` | title, date, attendees | read-only | auto |

### Chart Data Linking

```typescript
// Chart linked to finance data
const revenueChart = {
  type: 'chart',
  content: {
    chart_type: 'line',
    linked_to: {
      source_table: 'invoices',
      aggregate: 'sum(amount)',
      group_by: 'DATE_TRUNC('month', issued_date)',
      filters: [
        { field: 'org_id', operator: 'eq', value: 'current-org' },
        { field: 'status', operator: 'eq', value: 'paid' }
      ]
    }
  }
}
```

---

## Collaboration Features

### 1. Real-time Cursor Tracking

Users see each other's cursor positions in real-time:

```typescript
interface CursorUpdate {
  user_id: string
  user_name: string
  user_avatar: string
  cursor_block_id: string // which block
  cursor_position: number // character position (if paragraph)
  color: string // color for this user
}

// Broadcast cursor position every 300ms
const broadcastCursor = (blockId, position) => {
  presenceChannel.track({
    cursor_block_id: blockId,
    cursor_position: position,
    updated_at: new Date(),
  })
}
```

### 2. Block-Level Locking

Prevent simultaneous editing of the same block:

```sql
-- Acquire lock when user starts editing
INSERT INTO document_block_locks (block_id, user_id, expires_at)
VALUES ($1, $2, now() + INTERVAL '5 minutes')
ON CONFLICT (block_id) DO UPDATE SET expires_at = now() + INTERVAL '5 minutes'
WHERE document_block_locks.user_id = $2;

-- Check if block is locked before allowing edit
SELECT user_id FROM document_block_locks
WHERE block_id = $1 AND expires_at > now();
```

### 3. Comment System

Threaded comments on blocks or inline text:

```typescript
interface BlockComment {
  id: string
  block_id: string
  author_id: string
  author_name: string
  author_avatar: string
  
  text: string
  created_at: string
  
  // Inline comment on text range
  text_start?: number
  text_end?: number
  
  // Threading
  parent_comment_id?: string
  replies?: BlockComment[]
  
  // Resolution
  is_resolved: boolean
  resolved_at?: string
  resolved_by?: string
}

// Real-time subscription to comments
const commentChannel = supabase
  .channel(`docs:${docId}:comments`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'document_block_comments',
    filter: `doc_id=eq.${docId}`,
  }, (payload) => {
    // Handle new/updated comments
  })
  .subscribe()
```

### 4. Activity Log

Track all document changes for audit trail:

```sql
CREATE TABLE public.document_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  
  action VARCHAR(50) NOT NULL, -- 'block_created', 'block_updated', 'block_deleted', 'permission_changed'
  resource_type VARCHAR(50), -- 'block', 'permission', 'document'
  resource_id UUID,
  
  details JSONB, -- { before: {...}, after: {...} }
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 5. Version History

Restore previous versions of blocks:

```typescript
// Get version history for a block
GET /api/documents/:docId/blocks/:blockId/versions

Response: {
  current_version: 5,
  versions: [
    {
      version_number: 5,
      content: {...},
      changed_by: "user_name",
      changed_at: "2026-08-14T15:30:00Z",
      change_description: "Updated table formatting"
    },
    {
      version_number: 4,
      content: {...},
      changed_by: "other_user",
      changed_at: "2026-08-14T15:25:00Z",
      change_description: "Added new row"
    }
  ]
}

// Restore a previous version
POST /api/documents/:docId/blocks/:blockId/restore
Body: {
  version_number: 3
}
```

---

## Search & Organization

### Full-Text Search

Search across document titles, content, and comments:

```typescript
// Query endpoint
GET /api/documents/search?q=revenue%20report&org_id=...

// Powered by PostgreSQL full-text search
SELECT 
  d.id,
  d.title,
  db.type,
  db.content ->> 'text' as preview,
  ts_rank(to_tsvector(d.title || ' ' || db.content ->> 'text'), 
          plainto_tsquery($1)) as relevance
FROM documents d
JOIN document_blocks db ON d.id = db.doc_id
WHERE d.org_id = $2
  AND to_tsvector(d.title || ' ' || db.content ->> 'text') @@ plainto_tsquery($1)
ORDER BY relevance DESC;
```

### Organization Features

1. **Folders** — Organize documents into nested folders
2. **Tags** — Label documents with searchable tags
3. **Favorites** — Star documents for quick access
4. **Pinned** — Pin to top of sidebar
5. **Recently Edited** — Sort by `updated_at`

```typescript
// Document list endpoint
GET /api/documents?
  org_id=...
  &sort_by=updated_at|name|created_at
  &folder_id=...
  &tags=proposal,client
  &favorites_only=true
  &archived=false
```

---

## Security & RLS

### Row-Level Security Policies

#### Document Access Policy

```sql
-- Users can view documents they have explicit permission for
CREATE POLICY document_view_policy ON public.documents
  FOR SELECT
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM document_permissions
        WHERE doc_id = documents.id
          AND user_id = auth.uid()
          AND role IN ('viewer', 'editor', 'admin')
      )
    )
  );

-- Users can insert documents to their org
CREATE POLICY document_insert_policy ON public.documents
  FOR INSERT
  WITH CHECK (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND created_by = auth.uid()
  );

-- Users can update their own documents or have admin permission
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

-- Only creator or admin can delete
CREATE POLICY document_delete_policy ON public.documents
  FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM document_permissions
      WHERE doc_id = documents.id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );
```

#### Block Access Policy

```sql
-- Users can view blocks in documents they have access to
CREATE POLICY block_view_policy ON public.document_blocks
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
              AND role IN ('viewer', 'editor', 'admin')
          )
        )
    )
  );

-- Users can edit blocks only if they have 'editor' or 'admin' permission
CREATE POLICY block_edit_policy ON public.document_blocks
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

### Permission Verification

All API endpoints must verify user permission before operating:

```typescript
// Middleware to check document permission
async function checkDocumentPermission(docId, userId, requiredRole) {
  const { data: perm, error } = await supabase
    .from('document_permissions')
    .select('role')
    .eq('doc_id', docId)
    .eq('user_id', userId)
    .single()

  if (error || !perm) {
    throw new Error('No access to this document')
  }

  const roleHierarchy = { 'viewer': 1, 'editor': 2, 'admin': 3 }
  if (roleHierarchy[perm.role] < roleHierarchy[requiredRole]) {
    throw new Error('Insufficient permissions')
  }

  return perm
}
```

---

## API Routes

### Document Management

#### Create Document
```
POST /api/documents
Content-Type: application/json

{
  "title": "Q3 Revenue Report",
  "description": "...",
  "folder_id": "...",
  "tags": ["finance", "report"]
}

Response 201:
{
  "id": "doc-uuid",
  "title": "Q3 Revenue Report",
  "org_id": "...",
  "created_by": "...",
  "created_at": "...",
  "blocks": []
}
```

#### Get Document with Blocks
```
GET /api/documents/:docId

Response 200:
{
  "id": "doc-uuid",
  "title": "Q3 Revenue Report",
  "blocks": [
    { "id": "...", "type": "heading1", "content": {...} },
    { "id": "...", "type": "paragraph", "content": {...} }
  ],
  "permissions": {
    "current_user_role": "editor",
    "can_edit": true,
    "can_delete": false,
    "collaborators": [...]
  }
}
```

#### Update Document Metadata
```
PUT /api/documents/:docId
Body: {
  "title": "Updated Title",
  "description": "...",
  "tags": ["updated"],
  "is_pinned": true
}

Response 200: Updated document
```

#### Delete/Archive Document
```
DELETE /api/documents/:docId

Response 204 (soft delete, sets is_archived=true)
```

#### List Documents
```
GET /api/documents?
  org_id=...
  &sort_by=updated_at
  &folder_id=optional
  &favorites_only=false
  &archived=false

Response 200:
{
  "data": [...],
  "pagination": { "total": 42, "page": 1, "limit": 20 }
}
```

### Block Management

#### Create Block
```
POST /api/documents/:docId/blocks
Body: {
  "type": "paragraph",
  "position": 0,
  "content": {
    "text": "Hello world",
    "formatting": []
  }
}

Response 201: Block object
```

#### Update Block
```
PUT /api/documents/:docId/blocks/:blockId
Body: {
  "content": {
    "text": "Updated text",
    "formatting": [...]
  }
}

Response 200: Updated block
```

#### Reorder Blocks
```
PUT /api/documents/:docId/blocks/reorder
Body: {
  "moves": [
    { "block_id": "...", "new_position": 1 },
    { "block_id": "...", "new_position": 0 }
  ]
}

Response 200: All blocks with updated positions
```

#### Delete Block
```
DELETE /api/documents/:docId/blocks/:blockId

Response 204
```

### Permissions & Sharing

#### Grant Permission
```
POST /api/documents/:docId/permissions
Body: {
  "user_id": "...",
  "role": "editor" | "viewer" | "admin"
}

Response 201: Permission record
```

#### Update Permission
```
PUT /api/documents/:docId/permissions/:permissionId
Body: {
  "role": "admin"
}

Response 200: Updated permission
```

#### Revoke Permission
```
DELETE /api/documents/:docId/permissions/:permissionId

Response 204
```

#### Create Share Link
```
POST /api/documents/:docId/share-link
Body: {
  "role": "viewer",
  "password": "optional",
  "expires_at": "2026-09-14T00:00:00Z"
}

Response 201: {
  "share_link": "https://akira.app/docs/share/abc123",
  "share_link_id": "abc123",
  "expires_at": "..."
}
```

#### Get Collaborators
```
GET /api/documents/:docId/collaborators

Response 200: {
  "active": [
    {
      "user_id": "...",
      "name": "John",
      "avatar": "...",
      "cursor_block": "...",
      "is_editing": true,
      "last_seen": "2026-08-14T15:30:00Z"
    }
  ]
}
```

### Comments

#### Create Comment
```
POST /api/documents/:docId/blocks/:blockId/comments
Body: {
  "text": "Please clarify this",
  "text_start": 0,
  "text_end": 15
}

Response 201: Comment object
```

#### Resolve Comment
```
PUT /api/documents/:docId/comments/:commentId/resolve

Response 200: Updated comment (is_resolved=true)
```

#### Reply to Comment
```
POST /api/documents/:docId/comments/:commentId/replies
Body: {
  "text": "This means..."
}

Response 201: Reply comment object
```

### Search

#### Search Documents
```
GET /api/documents/search?q=revenue&org_id=...

Response 200: {
  "results": [
    {
      "document_id": "...",
      "title": "Q3 Revenue Report",
      "block_type": "heading1",
      "preview": "Q3 Revenue Report...",
      "relevance_score": 0.95
    }
  ]
}
```

### Version History

#### Get Block Versions
```
GET /api/documents/:docId/blocks/:blockId/versions

Response 200: {
  "current_version": 3,
  "versions": [
    {
      "version_number": 3,
      "content": {...},
      "changed_by": "user_name",
      "changed_at": "2026-08-14T15:30:00Z"
    }
  ]
}
```

#### Restore Block Version
```
POST /api/documents/:docId/blocks/:blockId/restore
Body: {
  "version_number": 2
}

Response 200: Restored block
```

---

## Implementation Strategy

### Phase 1: Core Infrastructure (2-3 weeks)

1. **Database Setup**
   - Create all tables with RLS policies
   - Set up indexes for performance
   - Create Postgres triggers for audit logs

2. **Service Layer**
   - `src/services/documents.service.js` — CRUD operations
   - `src/services/documentBlocks.service.js` — Block operations
   - `src/services/documentPermissions.service.js` — Permission management

3. **React Components**
   - `src/components/documents/DocumentList.jsx` — Browse all documents
   - `src/components/documents/DocumentEditor.jsx` — Main editor view
   - `src/components/documents/BlockRenderer.jsx` — Render blocks
   - `src/components/documents/BlockToolbar.jsx` — Add/edit blocks

4. **Real-time Setup**
   - `src/hooks/useDocumentRealtime.js` — Realtime sync hook
   - `src/hooks/useDocumentPresence.js` — Cursor tracking

### Phase 2: Rich Block Types (2-3 weeks)

1. **Block Components**
   - `src/components/blocks/ParagraphBlock.jsx`
   - `src/components/blocks/TableBlock.jsx` (with linked data)
   - `src/components/blocks/ChartBlock.jsx` (with linked data)
   - `src/components/blocks/CalendarBlock.jsx`
   - `src/components/blocks/KanbanBlock.jsx`

2. **Linked Data**
   - `src/services/blockLinking.service.js` — Fetch linked data
   - Data binding logic for table/chart blocks

### Phase 3: Collaboration (2 weeks)

1. **Permissions UI**
   - `src/components/documents/PermissionsPanel.jsx`
   - Share link generation and management

2. **Comments & Collaboration**
   - `src/components/documents/CommentThread.jsx`
   - Real-time cursor tracking UI
   - Block locking indicators

3. **Version History**
   - `src/components/documents/VersionHistory.jsx`
   - Restore functionality

### Phase 4: Search & Organization (1-2 weeks)

1. **Search UI**
   - `src/pages/DocumentSearch.jsx`
   - Full-text search integration

2. **Folders & Tags**
   - `src/components/documents/FolderTree.jsx`
   - Tag management UI

---

## Database Migration

### Supabase Migration File

Create `supabase/migrations/20260814_create_documents_system.sql`:

```sql
-- Full migration file (see above for individual table definitions)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- Create all tables with proper indexes and RLS

-- Setup RLS policies for multi-tenant security

-- Create functions for triggers
CREATE OR REPLACE FUNCTION update_document_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_document_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION update_document_updated_at();

-- Deploy with:
-- supabase db push
```

---

## Performance Considerations

### Query Optimization

1. **Index Strategy**
   - Index `org_id` and `user_id` for permission checks
   - Index `doc_id, position` for block ordering
   - Index `updated_at` for recently modified sorting
   - Full-text search index on content

2. **Pagination**
   - Fetch documents 20 per page max
   - Fetch blocks 50 per page max
   - Use cursor-based pagination for large datasets

3. **Caching**
   - Cache permissions in React state
   - Cache linked data (clients, projects) for 5 minutes
   - Invalidate on subscription updates

### Real-time Limits

- Max 5 concurrent subscriptions per document
- Broadcast cursor updates at 300ms interval (not on every keystroke)
- Batch block updates (send every 1 second)

---

## Testing Strategy

### Unit Tests
- Block type validation
- Permission checks
- Formatting logic

### Integration Tests
- Real-time sync with multiple users
- Permission enforcement
- Linked data fetching

### E2E Tests (Playwright)
- Create document, add blocks
- Share with user, verify access
- Real-time editing simulation

---

## Summary: Architecture Overview

```
AKIRA Documents System
├── Core Layer (tables, RLS)
├── Service Layer (queries, mutations)
├── Component Layer (UI, forms)
├── Real-time Layer (Supabase Realtime)
├── Permission Layer (RLS + API verification)
└── Data Linking Layer (clients, projects, finance)
```

**Key Strengths:**
✓ Real-time collaboration ready  
✓ Granular permissions (view/edit/admin)  
✓ Block-based extensibility  
✓ Data linking to business entities  
✓ Audit trail & versioning  
✓ Full-text search across org  
✓ Guest/public share links  

**Security:**
✓ Row-level security enforced  
✓ Permission verified at API + DB  
✓ Audit logging on all changes  
✓ No direct client access to data  

---

**End of Architecture Document**
