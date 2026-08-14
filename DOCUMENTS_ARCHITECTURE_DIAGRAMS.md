# AKIRA Documents System — Architecture Diagrams

## 1. Document System Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AKIRA DOCUMENTS SYSTEM OVERVIEW                      │
└─────────────────────────────────────────────────────────────────────────────┘

                            Organization
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼────────┐        ┌────────▼──────────┐
            │   Documents    │        │  Document Folders │
            │   (metadata)   │        │  (organization)   │
            └───────┬────────┘        └───────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼──┐   ┌───▼──┐   ┌───▼──┐
    │Block1│   │Block2│   │Block3│
    │Para  │   │Table │   │Chart │
    └──────┘   └──┬───┘   └──┬───┘
               ┌──▼──────┐   │
               │ Linked  │   └──────┐
               │to Client│          │
               │s Table  │    Linked to
               └─────────┘    Finance
                             Data
```

---

## 2. Real-time Sync Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                   REAL-TIME COLLABORATION FLOW                       │
└──────────────────────────────────────────────────────────────────────┘

User A (Browser)              Supabase               User B (Browser)
    │                            │                        │
    │  1. Edit paragraph         │                        │
    │  (optimistic update)       │                        │
    │  ─────────────────>        │                        │
    │                            │                        │
    │                    2. Insert/Update                 │
    │                    document_blocks                  │
    │                            │                        │
    │                    3. Postgres                      │
    │                    Trigger fires                    │
    │                            │                        │
    │                    4. Broadcast to                  │
    │                    Realtime channel                 │
    │                            │                        │
    │  5. Receive update  <──────┼────────>  5. Receive update
    │     (via Realtime)         │           (via Realtime)
    │                            │
    │  6. Merge with local       │  6. Merge with local
    │     state (LWW)            │     state (LWW)
    │                            │
    └────────────────────────────┴────────────────────────┘

Channel Structure:
├─ docs:{docId}:blocks       → Block content changes
├─ docs:{docId}:permissions  → Permission updates
├─ docs:{docId}:presence     → Cursor positions, online status
├─ docs:{docId}:comments     → Comment additions/updates
└─ docs:{docId}:activity     → Activity log events
```

---

## 3. Permission Hierarchy & Access Control

```
┌──────────────────────────────────────────────────────────────────────┐
│                    PERMISSION INHERITANCE MODEL                      │
└──────────────────────────────────────────────────────────────────────┘

Organization (Multi-tenant boundary)
└── Document Permissions (explicit per-user)
    │
    ├─ VIEWER ─────→ [Read-only access]
    │                ├─ View all blocks
    │                ├─ View comments
    │                ├─ Cannot edit blocks
    │                └─ Cannot change permissions
    │
    ├─ EDITOR ─────→ [Read & Write access]
    │                ├─ View all blocks ✓
    │                ├─ Create new blocks ✓
    │                ├─ Edit block content ✓
    │                ├─ Delete blocks ✓
    │                ├─ Add comments ✓
    │                ├─ Cannot delete document
    │                └─ Cannot change permissions
    │
    └─ ADMIN ──────→ [Full control]
                     ├─ All EDITOR permissions ✓
                     ├─ Change document metadata ✓
                     ├─ Manage permissions ✓
                     ├─ Delete document ✓
                     └─ Archive document ✓

Special Roles:
├─ CREATOR (auto-admin) → Always has admin access
└─ GUEST (share link) → Optional password, time-limited access
```

---

## 4. Block Type Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                      BLOCK TYPE HIERARCHY                            │
└──────────────────────────────────────────────────────────────────────┘

                        Block (Base Interface)
                               │
                ┌──────────────┬┴──────────────┬──────────────┐
                │              │               │              │
            ┌───▼───┐      ┌───▼───┐      ┌───▼───┐      ┌───▼───┐
            │ Text  │      │ Media │      │ Data  │      │ Embed │
            │Blocks │      │Blocks │      │Blocks │      │Blocks │
            └───┬───┘      └───┬───┘      └───┬───┘      └───┬───┘
                │              │              │              │
        ┌───────┼───┐    ┌────┼────┐   ┌────┼────┐   ┌────┼────┐
        │       │   │    │    │    │   │    │    │   │    │    │
    Paragraph  H1  H2   Image Embed Table Chart Calendar Kanban
        H3      ─────
        │       Callout
        │
    ├─ Text formatting
    ├─ Mentions (@user)
    ├─ Links
    └─ Rich text

    ├─ Image URL
    ├─ Captions
    └─ Sizing

    ├─ Embedded content
    ├─ iframes
    └─ Responsive sizing
```

---

## 5. Data Linking Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    BLOCK DATA LINKING SYSTEM                         │
└──────────────────────────────────────────────────────────────────────┘

Document Blocks (Rich Content)
│
├─ Linked Blocks:
│  │
│  ├─ TABLE BLOCK
│  │   │
│  │   └─ Link to Source:
│  │      ├─ clients table ──→ Fetch live client names, emails, status
│  │      ├─ projects table ──→ Fetch project names, deadlines, status
│  │      └─ finance categories ──→ Fetch expense data
│  │      
│  │   Properties:
│  │   ├─ Read-only columns (synced from source)
│  │   ├─ Custom columns (editable, stored locally)
│  │   └─ Auto-sync toggle (manual vs auto-refresh)
│  │
│  │
│  ├─ CHART BLOCK
│  │   │
│  │   └─ Link to Source:
│  │      ├─ projects table ──→ Revenue by project
│  │      ├─ clients table ──→ Client distribution
│  │      └─ invoices table ──→ Revenue trends over time
│  │
│  │   Properties:
│  │   ├─ Data aggregation (sum, count, avg)
│  │   ├─ Group by (month, category, status)
│  │   └─ Filters (only show active items)
│  │
│  │
│  └─ CALENDAR BLOCK
│      │
│      └─ Link to Source:
│         ├─ calendar_events ──→ Sync with main calendar
│         └─ project milestones ──→ Show project deadlines
│
└─ Manual Blocks (No linking):
   ├─ Paragraph
   ├─ Heading
   ├─ Image
   ├─ Embed
   └─ Callout

Sync Strategy:
┌─────────────────────────┐
│ Auto-sync: TRUE         │
│ (every document load)   │
├─────────────────────────┤
│ Query source table      │
│ Apply filters           │
│ Render fresh data       │
│ Mark as "synced now"    │
└─────────────────────────┘

┌─────────────────────────┐
│ Manual-sync: FALSE      │
│ (user controls)         │
├─────────────────────────┤
│ Use cached snapshot     │
│ Show "last synced: Xm"  │
│ User can refresh button │
└─────────────────────────┘
```

---

## 6. Collaboration & Presence

```
┌──────────────────────────────────────────────────────────────────────┐
│               REAL-TIME CURSOR & PRESENCE TRACKING                   │
└──────────────────────────────────────────────────────────────────────┘

Document Editor
│
├─ User A (Cursor on Block 3)
│  ├─ Position: Block3, char 45
│  ├─ Color: #FF5733 (red)
│  └─ Status: editing_block_2
│
├─ User B (Cursor on Block 5)
│  ├─ Position: Block5, char 120
│  ├─ Color: #33FF57 (green)
│  └─ Status: idle
│
└─ User C (Offline)
   └─ Status: away (last seen 5m ago)

Presence Channel Updates:
┌────────────────────────────────────────┐
│ Every 300ms (not on every keystroke)   │
├────────────────────────────────────────┤
│ supabase                               │
│   .channel('docs:{docId}:presence')   │
│   .track({                             │
│     user_id,                           │
│     cursor_block_id,                   │
│     cursor_position,                   │
│     is_editing,                        │
│     updated_at                         │
│   })                                   │
└────────────────────────────────────────┘

Block Locking (prevent conflicts):
┌────────────────────────────────────┐
│ User A starts editing Block 2       │
│ → Acquire lock (5 min expiry)       │
│ → Show "User A is editing" UI       │
│ → User B sees block as locked       │
│ → Auto-release after 5 min idle     │
│ → Or release on focus blur          │
└────────────────────────────────────┘
```

---

## 7. Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────────────┐
│                    DATABASE TABLE RELATIONSHIPS                      │
└──────────────────────────────────────────────────────────────────────┘

organizations
    ↓ (1)
    └─────────────────────────────────────────────────┐
                                                      ↓ (many)
documents ◄────────────────── document_folders        │
    │                                 ↑               │
    │ (1)                             │ (parent)      │
    ├─ created_by ─→ profiles         │               │
    └─ last_edited_by ─→ profiles     │               │
                                      └───────────────┘

documents (1) ──┬─────────────────────────────────── (many) document_blocks
                │                                           │
                │                                           ├─ created_by ─→ profiles
                │                                           ├─ updated_by ─→ profiles
                │                                           └─ (linked data: clients, projects, finance)
                │
                ├─ (many) document_permissions ◄─── (1) profiles
                │
                ├─ (many) document_collaborators ◄─── (1) profiles
                │
                ├─ (many) document_block_comments ◄─── (1) document_blocks
                │          │                           ├─ author_id ─→ profiles
                │          └─ (self-referential replies)
                │
                ├─ (many) document_block_locks ◄─── (1) document_blocks
                │                                  ├─ user_id ─→ profiles
                │
                └─ (many) document_block_versions ◄─── (1) document_blocks
                                                     ├─ changed_by ─→ profiles

Activity Tracking:
document_activity_log
    ├─ doc_id ─→ documents
    ├─ user_id ─→ profiles
    ├─ resource_id ─→ document_blocks (optional)
    └─ (audit trail of all changes)
```

---

## 8. API Request/Response Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    API ENDPOINT REQUEST FLOW                         │
└──────────────────────────────────────────────────────────────────────┘

CLIENT (React)                      MIDDLEWARE                  SERVICE LAYER           DATABASE (RLS)
      │                                  │                            │                        │
      │ GET /api/documents/:docId        │                            │                        │
      ├─────────────────────────────────>│                            │                        │
      │                                  │                            │                        │
      │                        1. Verify auth                         │                        │
      │                        2. Extract user_id                     │                        │
      │                                  │                            │                        │
      │                        3. Check permission                    │                        │
      │                                  ├──────────────────────────>│                        │
      │                                  │  Query document_permissions
      │                                  │  WHERE doc_id & user_id    │                        │
      │                                  │<──────────────────────────┤                        │
      │                                  │  ✓ Has access             │                        │
      │                                  │                            │                        │
      │                        4. Fetch document + blocks             │                        │
      │                                  ├──────────────────────────>│                        │
      │                                  │  SELECT * FROM documents  │                        │
      │                                  │  WHERE id & org_id (RLS)  │                        │
      │                                  │<──────────────────────────┤                        │
      │                                  │  SELECT * FROM blocks     │                        │
      │                                  │  WHERE doc_id (RLS)       │                        │
      │                                  │<──────────────────────────┤                        │
      │                                  │                            │                        │
      │                        5. Build response JSON                 │                        │
      │<─────────────────────────────────┤                            │                        │
      │  200 OK                          │                            │                        │
      │  { document, blocks, permissions } │                          │                        │
      │                                  │                            │                        │
      ▼                                  ▼                            ▼                        ▼

Error Handling:
┌────────────────────────────────┐
│ No auth token                  │ → 401 Unauthorized
├────────────────────────────────┤
│ Valid auth but no permission   │ → 403 Forbidden (RLS denies SELECT)
├────────────────────────────────┤
│ Document not found             │ → 404 Not Found
├────────────────────────────────┤
│ Insufficient role (e.g., need  │
│ 'editor' but have 'viewer')    │ → 403 Forbidden
└────────────────────────────────┘
```

---

## 9. Real-time Sync Conflict Resolution

```
┌──────────────────────────────────────────────────────────────────────┐
│              LAST-WRITE-WINS (LWW) CONFLICT RESOLUTION              │
└──────────────────────────────────────────────────────────────────────┘

Scenario: Two users edit same paragraph block simultaneously

User A (15:30:00)                    User B (15:30:01)
│                                    │
│ 1. Read: "Hello"                   │ (same initial state)
│    updated_at: 15:29:50            │
│                                    │
│ 2. Edit: "Hello World"             │
│    Send to server                  │ 1. Read: "Hello"
│    ┌────────────┐                  │    updated_at: 15:29:50
│    │ UPDATE ... │                  │
│    │ content =  │                  │ 2. Edit: "Hello Marc"
│    │ 'Hello W'  │                  │    Send to server
│    │ updated_at │                  │    ┌────────────┐
│    │ = 15:30:00 │                  │    │ UPDATE ... │
│    └─────┬──────┘                  │    │ content =  │
│          │                          │    │ 'Hello M'  │
│          ▼                          │    │ updated_at │
│  ✓ ACCEPTED                       │    │ = 15:30:01 │
│  Block updated to "Hello World"    │    └─────┬──────┘
│  updated_at: 15:30:00              │          ▼
│                                    │   Server comparison:
│  Realtime broadcasts update  ┐     │   15:30:01 > 15:30:00?
│  to all clients          <───┼─────┼──→ YES → Accept User B's edit
│                              │     │
│ 3. Receive update from User B│     │
│    15:30:01 > 15:30:00? YES  │     │
│    Revert local state        │     │
│    Accept "Hello Marc"       │     │
│    Show toast:               │     │
│    "Marc updated this block" │     │
│                              │     │
▼                              ▼     ▼

Final State (all clients see):
content: "Hello Marc"
updated_at: 15:30:01
updated_by: User B
last_conflict: "15:30:00 update from User A was overwritten"
```

---

## 10. Complete System Lifecycle

```
┌──────────────────────────────────────────────────────────────────────┐
│                 DOCUMENT LIFECYCLE & STATE TRANSITIONS               │
└──────────────────────────────────────────────────────────────────────┘

1. CREATE DOCUMENT
   │
   └─→ POST /api/documents
       ├─ Validate user can create in org
       ├─ Insert into documents table
       ├─ Set created_by = current_user
       ├─ Auto-grant creator 'admin' permission
       └─→ Return document object

2. OPEN DOCUMENT
   │
   └─→ GET /api/documents/:id
       ├─ Verify user has permission
       ├─ Subscribe to Realtime channels
       │  ├─ docs:docId:blocks (content changes)
       │  ├─ docs:docId:permissions (permission changes)
       │  ├─ docs:docId:presence (cursor tracking)
       │  └─ docs:docId:comments (comments)
       ├─ Track user presence (online)
       └─→ Render document with blocks

3. EDIT BLOCKS (Real-time)
   │
   ├─→ User edits paragraph
   │   ├─ Optimistic update (immediate local UI)
   │   ├─ PUT /api/documents/:docId/blocks/:blockId
   │   ├─ Server validates permission (must be 'editor' or 'admin')
   │   ├─ Update database (increments version)
   │   ├─ Broadcast via Realtime to other clients
   │   └─ Other clients merge update (LWW)
   │
   ├─→ User adds block
   │   ├─ POST /api/documents/:docId/blocks
   │   ├─ Server validates permission
   │   ├─ Inserts block with auto-position
   │   ├─ Broadcast insert event
   │   └─ Other clients append to their blocks array
   │
   └─→ User deletes block
       ├─ DELETE /api/documents/:docId/blocks/:blockId
       ├─ Server validates permission
       ├─ Soft delete (mark is_deleted=true)
       ├─ Broadcast delete event
       └─ Other clients hide block

4. SHARE DOCUMENT
   │
   └─→ POST /api/documents/:docId/permissions
       ├─ Only 'admin' role can grant permissions
       ├─ Insert permission record
       ├─ Send notification to recipient
       ├─ Broadcast permission change
       └─ Recipient can now access

5. ADD COMMENTS
   │
   └─→ POST /api/documents/:docId/blocks/:blockId/comments
       ├─ Any user with access can comment
       ├─ Insert comment record
       ├─ Broadcast new comment
       ├─ Notify mentioned users (@user)
       └─ Resolving comment marks is_resolved=true

6. ARCHIVE/DELETE DOCUMENT
   │
   └─→ DELETE /api/documents/:docId
       ├─ Only 'admin' can delete
       ├─ Soft delete (is_archived=true)
       ├─ Unsubscribe from Realtime
       ├─ Move to archive section
       └─ Can be restored (hard delete option later)

7. VIEW VERSION HISTORY
   │
   └─→ GET /api/documents/:docId/blocks/:blockId/versions
       ├─ Show all previous versions with timestamps
       ├─ Show who changed it and when
       ├─ Allow restore to any previous version
       └─ POST /api/.../restore
           ├─ Revert block to that version
           └─ Creates new version record
```

---

## 11. Performance & Scalability Considerations

```
┌──────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE OPTIMIZATION STRATEGY                 │
└──────────────────────────────────────────────────────────────────────┘

Query Optimization:
┌─────────────────────────────────┐
│ Large Document (1000+ blocks)   │
├─────────────────────────────────┤
│ Fetch blocks in pages (50/page) │
│ Lazy-load as user scrolls       │
│ Index: (doc_id, position)       │
│ Cache: Load blocks on mount     │
└─────────────────────────────────┘

Realtime Performance:
┌─────────────────────────────────┐
│ Cursor updates: 300ms interval  │
│ (not on every keystroke)        │
├─────────────────────────────────┤
│ Block updates: Batch every 1s   │
│ (not individual character edits)│
├─────────────────────────────────┤
│ Max concurrent subscriptions: 5 │
│ (per document, per user)        │
└─────────────────────────────────┘

Data Linking Cache:
┌─────────────────────────────────┐
│ Linked table data (clients):    │
│ Cache for 5 minutes             │
│ Invalidate on permission update │
│ Manual refresh button available │
│ Show "last synced: 2m ago"      │
└─────────────────────────────────┘

Pagination:
┌─────────────────────────────────┐
│ Documents list: 20 per page     │
│ Blocks in document: 50 per page │
│ Search results: 10 per page     │
│ Collaborators: 50 max           │
└─────────────────────────────────┘
```

---

## 12. Security Layers

```
┌──────────────────────────────────────────────────────────────────────┐
│                    MULTI-LAYER SECURITY MODEL                        │
└──────────────────────────────────────────────────────────────────────┘

Layer 1: Authentication
└─→ Supabase Auth (email/password or OAuth)
    ├─ JWT token stored in localStorage
    └─ Verified on every API call

Layer 2: Authorization (API)
└─→ Permission check middleware
    ├─ Verify user has explicit permission on document
    ├─ Role-based check (viewer/editor/admin)
    └─ Block operation based on minimum role

Layer 3: Database Security (RLS)
└─→ Postgres Row-Level Security
    ├─ SELECT policy: Only visible if org_id matches OR has permission
    ├─ INSERT policy: Only org_id matches AND user is editor/admin
    ├─ UPDATE policy: Only if editor/admin role
    └─ DELETE policy: Only if admin role

Layer 4: Data Isolation
└─→ Multi-tenant boundaries
    ├─ All queries filtered by org_id
    ├─ Cannot access other org's documents
    └─ Permissions are org-specific

Layer 5: Audit Trail
└─→ Activity logging
    ├─ Log all document changes
    ├─ Track who changed what and when
    ├─ Immutable audit log (append-only)
    └─ Used for compliance & debugging

Security Checklist:
✓ Auth required for all endpoints
✓ Permission verified before operation
✓ RLS enforced at database level
✓ Org_id isolation on all tables
✓ No direct object IDs in URLs (or verify ownership)
✓ Audit log captures all mutations
✓ Rate limiting on create/delete operations
✓ Share links have optional password + expiration
✓ Sensitive data not logged (passwords, tokens)
✓ CORS configured for production domain
```

---

## Summary

This architecture provides:

✅ **Real-time Collaboration** — Multiple users editing simultaneously with cursor tracking  
✅ **Granular Permissions** — View/Edit/Admin roles with RLS enforcement  
✅ **Rich Block Types** — Extensible architecture for future block types  
✅ **Data Integration** — Tables, charts linked to live business data  
✅ **Audit Trail** — Complete activity log for compliance  
✅ **Scalability** — Pagination, caching, optimized queries  
✅ **Security** — Multi-layer access control, encryption-ready  
✅ **Search** — Full-text search across all documents  

---

**Architecture Diagrams — End**
