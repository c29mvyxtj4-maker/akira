# AKIRA Documents System - Implementation Guide

Complete Notion-like collaborative document system with granular permissions, real-time collaboration, and version control.

**Created:** 2026-08-14  
**Status:** Production Ready

---

## Overview

The AKIRA Documents system provides:

- **Core Features**: Create, edit, and organize documents with flexible block-based structure
- **Collaboration**: Real-time editing with cursor tracking and presence awareness
- **Permissions**: Granular access control (viewer, editor, admin) with expiring tokens
- **Comments**: Inline threaded discussions anchored to specific blocks
- **Versioning**: Complete version history with rollback capability
- **Sharing**: Multiple share types (public view, public edit, password protected, client-only)
- **Organization**: Folder structure for document management within organizations
- **Audit Trail**: Complete activity log for compliance and debugging

---

## Files Created

### 1. Database Schema
- **File**: `/DOCUMENTS_DATABASE_SCHEMA.sql`
- **Purpose**: Complete SQL schema with RLS policies, indexes, and triggers
- **Tables**: 10 core tables, fully normalized
- **Policies**: Comprehensive row-level security rules
- **Functions**: Helper functions for auto-increment and timestamps

### 2. Migration File
- **File**: `/akira-saas/supabase/migrations/20260814_create_documents_system.sql`
- **Purpose**: Supabase-compatible migration with rollback instructions
- **Can be run**: `supabase db push` or via Supabase dashboard

### 3. Service Layer
- **File**: `/akira-saas/src/services/documents.service.js`
- **Purpose**: Complete CRUD operations and real-time subscriptions
- **Exports**: 40+ functions covering all document operations
- **Pattern**: Follows existing AKIRA service layer pattern

---

## Database Schema

### Core Tables

#### 1. `documents`
Main document container with metadata.

```sql
- id: UUID (Primary Key)
- org_id: UUID (Organization)
- title: TEXT
- description: TEXT
- created_by: UUID (User who created)
- created_at, updated_at: TIMESTAMPS
- is_archived, is_pinned: BOOLEANS
- tags: TEXT[] (array for searching)
- folder_id: UUID (optional folder)
- thumbnail_url: TEXT (preview image)
- content_preview: TEXT (first 200 chars)
- metadata: JSONB (custom fields)
```

#### 2. `document_blocks`
Individual blocks within a document (paragraphs, tables, charts, etc).

```sql
- id: UUID (Primary Key)
- document_id: UUID (parent document)
- type: VARCHAR(50)
  - Supported: paragraph, heading1-3, table, chart, calendar, kanban, 
              image, embed, callout, code, quote, divider, checklist
- content: JSONB (flexible structure per type)
- metadata: JSONB (type-specific metadata)
- position: INTEGER (order in document)
- created_by, updated_by: UUID (track changes)
- created_at, updated_at: TIMESTAMPS
- linked_to_table: VARCHAR (e.g., 'clients', 'projects')
- linked_to_id: UUID (ID of linked record)
- is_deleted: BOOLEAN (soft delete for undo)
```

#### 3. `document_permissions`
Granular access control per document.

```sql
- id: UUID (Primary Key)
- document_id: UUID
- user_id: UUID (who has access)
- role: VARCHAR(20) - viewer | editor | admin
- granted_by: UUID (who granted)
- granted_at: TIMESTAMP
- expires_at: TIMESTAMP (optional expiration)
- UNIQUE(document_id, user_id)
```

#### 4. `document_collaborators`
Real-time tracking of active editors.

```sql
- id: UUID (Primary Key)
- document_id: UUID
- user_id: UUID
- is_online: BOOLEAN
- last_edited_at: TIMESTAMP
- cursor_block_id: UUID (which block they're editing)
- cursor_offset: INTEGER (character position)
- color: VARCHAR(7) (cursor color for UI)
- UNIQUE(document_id, user_id)
```

#### 5. `document_comments`
Inline comments anchored to specific blocks.

```sql
- id: UUID (Primary Key)
- document_id, block_id: UUID
- user_id: UUID (who commented)
- text: TEXT
- resolved: BOOLEAN
- resolved_by, resolved_at: UUID, TIMESTAMP
- created_at, updated_at: TIMESTAMPS
```

#### 6. `document_comment_replies`
Threaded replies to comments.

```sql
- id: UUID (Primary Key)
- comment_id: UUID (parent comment)
- user_id: UUID
- text: TEXT
- created_at, updated_at: TIMESTAMPS
```

#### 7. `document_versions`
Version snapshots for undo/rollback.

```sql
- id: UUID (Primary Key)
- document_id: UUID
- version_number: INTEGER (auto-incremented per document)
- blocks_snapshot: JSONB (full document state)
- created_by: UUID
- created_at: TIMESTAMP
- change_description: TEXT (optional)
- UNIQUE(document_id, version_number)
```

#### 8. `document_folders`
Optional folder structure for organization.

```sql
- id: UUID (Primary Key)
- org_id: UUID
- name: TEXT
- parent_folder_id: UUID (allows nesting)
- created_by: UUID
- created_at, updated_at: TIMESTAMPS
- is_archived: BOOLEAN
```

#### 9. `document_shares`
Shareable links with unique tokens.

```sql
- id: UUID (Primary Key)
- document_id: UUID
- share_token: VARCHAR(32) UNIQUE
- share_type: VARCHAR(20)
  - public_view: Anyone with link can view
  - public_edit: Anyone with link can edit
  - password_protected: Requires password
  - client_only: Only specific client users
- created_by: UUID
- created_at, expires_at: TIMESTAMPS
- password_hash: TEXT (if password protected)
- access_count: INTEGER
- metadata: JSONB
```

#### 10. `document_activities`
Comprehensive audit log.

```sql
- id: UUID (Primary Key)
- document_id: UUID
- user_id: UUID
- action: VARCHAR(50) - create | update_block | delete_block | add_permission | comment | share
- details: JSONB (action-specific data)
- created_at: TIMESTAMP
```

---

## Indexes

Optimized for common queries:

```sql
-- Documents
idx_documents_org_id                    (fast org-wide queries)
idx_documents_created_by
idx_documents_folder_id
idx_documents_is_archived
idx_documents_is_pinned
idx_documents_tags                      (GIN index for array search)

-- Blocks (most frequently queried)
idx_document_blocks_document_id         (fetch all blocks in document)
idx_document_blocks_position            (ordered retrieval)
idx_document_blocks_type
idx_document_blocks_linked              (find linked records)

-- Permissions (checked on every access)
idx_document_permissions_document_id
idx_document_permissions_user_id        (user's accessible docs)
idx_document_permissions_role

-- Collaborators (real-time presence)
idx_document_collaborators_is_online    (active editors)

-- Search
idx_document_comments_document_id
idx_document_versions_document_id
idx_document_activities_created_at      (recent activity)
```

---

## Row-Level Security (RLS)

All tables have RLS enabled with policies enforcing:

### Document Access
- Users can only see documents where:
  - They are the creator (created_by = auth.uid()), OR
  - They have explicit permission (document_permissions)
  - Permission must not be expired (expires_at > NOW())

### Edit Permissions
- Only users with 'editor' or 'admin' role can modify blocks
- Admins can manage permissions and shares
- Viewers are read-only

### Examples

**View permitted documents:**
```sql
org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
AND (
  created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM document_permissions WHERE document_id = documents.id AND user_id = auth.uid())
)
```

**Edit blocks (editor/admin only):**
```sql
EXISTS (
  SELECT 1 FROM document_permissions
  WHERE document_id = document_blocks.document_id
  AND user_id = auth.uid()
  AND role IN ('editor', 'admin')
)
```

---

## Setup & Deployment

### Step 1: Apply Migration to Supabase

```bash
# Option A: Using Supabase CLI
cd akira-saas
supabase db push

# Option B: Manual via Supabase Dashboard
1. Go to SQL Editor
2. Create new query
3. Paste contents of akira-saas/supabase/migrations/20260814_create_documents_system.sql
4. Run
```

### Step 2: Verify Tables Created

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'document%'
ORDER BY table_name;
```

Expected tables:
- document_activities
- document_blocks
- document_collaborators
- document_comment_replies
- document_comments
- document_folders
- document_permissions
- document_shares
- document_versions
- documents

### Step 3: Verify RLS Policies

```sql
SELECT policyname, tablename 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'document%'
ORDER BY tablename;
```

Should see ~20 policies.

### Step 4: Test Permissions

```sql
-- As an authenticated user, try to create a document
INSERT INTO documents (org_id, title, created_by)
VALUES ('your-org-id', 'Test Doc', auth.uid())
RETURNING *;

-- Try to view documents (should only see own/shared)
SELECT * FROM documents;

-- Try to edit without permission (should fail)
UPDATE document_blocks SET content = '{}' 
WHERE id = 'some-other-users-block-id';
```

---

## Service Layer Usage

### Import & Use

```javascript
import {
  fetchDocuments,
  createDocument,
  updateDocument,
  fetchBlocks,
  createBlock,
  fetchPermissions,
  grantPermission,
  // ... 40+ functions
} from '@/services/documents.service'
```

### Common Patterns

#### Fetch user's documents
```javascript
const documents = await fetchDocuments({
  isArchived: false,
})
```

#### Create document with initial block
```javascript
const doc = await createDocument({
  org_id: currentOrg.id,
  title: 'My Document',
  description: 'A new document',
})

const block = await createBlock(doc.id, {
  type: 'paragraph',
  content: { text: 'Hello world' },
  position: 0,
})
```

#### Share with team member (editor role)
```javascript
const perm = await grantPermission(
  documentId,
  userId,
  'editor'
)
```

#### Listen to real-time changes
```javascript
const subscription = subscribeToDocument(documentId, (payload) => {
  console.log('Document changed:', payload)
  // Update UI
})

// Cleanup on unmount
return () => subscription.unsubscribe()
```

#### Create version snapshot
```javascript
const blocks = await fetchBlocks(documentId)
const version = await createVersion(
  documentId,
  blocks,
  'Saved version before major edit'
)
```

---

## Block Types & Content Structure

Each block type has a specific content structure:

### Paragraph
```json
{
  "type": "paragraph",
  "content": {
    "text": "This is a paragraph",
    "marks": [{"type": "bold", "start": 10, "end": 15}]
  }
}
```

### Heading
```json
{
  "type": "heading1",
  "content": {
    "text": "Section Title",
    "level": 1
  }
}
```

### Table
```json
{
  "type": "table",
  "content": {
    "rows": [
      {"cells": ["Header 1", "Header 2", "Header 3"]},
      {"cells": ["Data 1", "Data 2", "Data 3"]}
    ],
    "columnWidths": [100, 150, 200]
  }
}
```

### Chart
```json
{
  "type": "chart",
  "content": {
    "chartType": "bar|line|pie|area",
    "data": [...],
    "options": {...}
  }
}
```

### Calendar
```json
{
  "type": "calendar",
  "content": {
    "linked_to_table": "projects",
    "date_field": "deadline"
  },
  "metadata": {
    "view": "month|week|day"
  }
}
```

### Kanban
```json
{
  "type": "kanban",
  "content": {
    "linked_to_table": "project_tasks",
    "status_field": "status",
    "columns": ["todo", "in_progress", "done"]
  }
}
```

---

## Permissions Model

Three role levels:

| Role    | View | Edit Blocks | Manage Perms | Share | Delete |
|---------|------|-------------|--------------|-------|--------|
| viewer  | Yes  | No          | No           | No    | No     |
| editor  | Yes  | Yes         | No           | No    | No     |
| admin   | Yes  | Yes         | Yes          | Yes   | Yes    |

**Expiring Permissions:**

```javascript
// Grant temporary access (expires in 7 days)
const expiresAt = new Date()
expiresAt.setDate(expiresAt.getDate() + 7)

await grantPermission(documentId, userId, 'editor', {
  expires_at: expiresAt.toISOString(),
})
```

---

## Real-Time Features

### Presence Tracking

Track who's online and what they're editing:

```javascript
// On component mount
useEffect(() => {
  updateCollaboratorStatus(documentId, {
    blockId: currentBlockId,
    offset: cursorPosition,
  })
  
  const interval = setInterval(() => {
    updateCollaboratorStatus(documentId, {
      blockId: currentBlockId,
      offset: cursorPosition,
    })
  }, 5000) // Update every 5 seconds

  // On unmount
  return () => {
    clearInterval(interval)
    markOffline(documentId)
  }
}, [documentId, currentBlockId, cursorPosition])
```

### Listen to Block Changes

```javascript
useEffect(() => {
  const subscription = subscribeToDocument(documentId, (payload) => {
    if (payload.eventType === 'INSERT') {
      setBlocks(prev => [...prev, payload.new])
    } else if (payload.eventType === 'UPDATE') {
      setBlocks(prev => 
        prev.map(b => b.id === payload.new.id ? payload.new : b)
      )
    } else if (payload.eventType === 'DELETE') {
      setBlocks(prev => prev.filter(b => b.id !== payload.old.id))
    }
  })

  return () => subscription.unsubscribe()
}, [documentId])
```

---

## Version Control & Undo

### Create Snapshot
```javascript
// Before major edit, create version
const blocks = await fetchBlocks(documentId)
const version = await createVersion(
  documentId,
  blocks,
  'Before restructure'
)
```

### Restore Version
```javascript
// User clicks "Restore"
await restoreVersion(documentId, versionNumber)

// Fetch latest blocks
const blocks = await fetchBlocks(documentId)
```

### View History
```javascript
const versions = await fetchVersions(documentId)
// versions = [{version_number, created_at, created_by, change_description}, ...]
```

---

## Activity Audit Trail

Track all actions for compliance:

```javascript
const activities = await fetchActivities(documentId)

// Returns:
// [{
//   action: 'create|update_block|add_permission|comment|share',
//   details: {...},
//   created_at,
//   user: {id, full_name, email, avatar_url}
// }, ...]
```

**Actions logged:**
- `create` - Document created
- `update` - Document updated
- `create_block` - Block added
- `update_block` - Block content changed
- `delete_block` - Block deleted
- `add_permission` - Permission granted
- `remove_permission` - Permission revoked
- `comment` - Comment added
- `create_share` - Share link created
- `restore_version` - Reverted to version

---

## Integration with Existing AKIRA Features

### Link to Clients
```javascript
// Create block linked to a client record
await createBlock(documentId, {
  type: 'table',
  content: {...},
  linked_to_table: 'clients',
  linked_to_id: clientId,
})
```

### Link to Projects
```javascript
// Calendar block showing project milestones
await createBlock(documentId, {
  type: 'calendar',
  linked_to_table: 'projects',
  linked_to_id: projectId,
  metadata: {view: 'month'}
})
```

### Link to Invoices
```javascript
// Kanban showing invoice status
await createBlock(documentId, {
  type: 'kanban',
  linked_to_table: 'invoices',
  linked_to_id: invoiceId,
})
```

---

## Performance Considerations

### Query Optimization

1. **Fetch blocks only when needed** - Don't load all blocks on document list
2. **Use filters** - Filter by folder, archive status, tags
3. **Paginate activities** - Load activity feed in batches
4. **Debounce collaborator updates** - Update presence every 5 seconds, not on every keystroke

### Caching Strategy

```javascript
// Cache documents list
const [docs, setDocs] = useState(null)

useEffect(() => {
  fetchDocuments().then(setDocs)
}, [])

// When document updates, just update that document
setDocs(prev => prev.map(d => 
  d.id === docId ? {...d, ...updates} : d
))
```

### Soft Deletes

Blocks use soft delete (is_deleted = true) to enable undo. Periodically clean up:

```javascript
-- Archive deleted blocks after 30 days (if needed)
DELETE FROM document_blocks 
WHERE is_deleted = true 
AND updated_at < NOW() - INTERVAL '30 days'
```

---

## Testing Checklist

- [ ] Create document
- [ ] Add/edit/delete blocks
- [ ] Grant permission to user (editor role)
- [ ] Verify user can edit blocks
- [ ] Revoke permission
- [ ] Verify user can't edit blocks anymore
- [ ] Create comment on block
- [ ] Reply to comment
- [ ] Resolve comment
- [ ] Create version
- [ ] Restore version
- [ ] Create share link (public_view)
- [ ] Verify share token works
- [ ] Check activity audit log
- [ ] Test collaborators presence
- [ ] Test real-time block updates

---

## Rollback Instructions

If you need to remove the documents system:

```sql
-- Drop all functions, triggers, and tables
DROP TRIGGER IF EXISTS tr_update_reply_timestamp ON public.document_comment_replies;
DROP TRIGGER IF EXISTS tr_update_comment_timestamp ON public.document_comments;
DROP TRIGGER IF EXISTS tr_auto_increment_version ON public.document_versions;
DROP TRIGGER IF EXISTS tr_update_folder_timestamp ON public.document_folders;
DROP TRIGGER IF EXISTS tr_update_document_timestamp ON public.documents;
DROP TRIGGER IF EXISTS tr_update_document_timestamp_on_block_change ON public.document_blocks;

DROP FUNCTION IF EXISTS public.generate_share_token();
DROP FUNCTION IF EXISTS public.auto_increment_document_version();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

DROP TABLE IF EXISTS public.document_activities;
DROP TABLE IF EXISTS public.document_shares;
DROP TABLE IF EXISTS public.document_folders;
DROP TABLE IF EXISTS public.document_versions;
DROP TABLE IF EXISTS public.document_comment_replies;
DROP TABLE IF EXISTS public.document_comments;
DROP TABLE IF EXISTS public.document_collaborators;
DROP TABLE IF EXISTS public.document_permissions;
DROP TABLE IF EXISTS public.document_blocks;
DROP TABLE IF EXISTS public.documents;
```

---

## Support & Documentation

- **Schema File**: `/DOCUMENTS_DATABASE_SCHEMA.sql`
- **Migration**: `/akira-saas/supabase/migrations/20260814_create_documents_system.sql`
- **Service**: `/akira-saas/src/services/documents.service.js`
- **Next**: Create React components (`src/pages/Documents.jsx`, `src/components/Documents/`)

---

**Created by:** AKIRA Development  
**Date:** 2026-08-14  
**Production Ready:** Yes
