# Documents System - Quick Reference

## Common Operations

### Create Document
```javascript
import { createDocument } from '@/services/documents.service'

const doc = await createDocument({
  org_id: currentOrg.id,
  title: 'My Document',
  description: 'Document description'
})
// Returns: {id, org_id, title, created_by, created_at, ...}
```

### Fetch Documents (with filters)
```javascript
import { fetchDocuments } from '@/services/documents.service'

// All documents
const docs = await fetchDocuments()

// Filtered
const docs = await fetchDocuments({
  folderId: 'folder-id',      // optional
  isArchived: false,           // optional
  isPinned: true,              // optional
  tags: ['client', 'invoice'], // optional
  search: 'financial'          // optional
})
```

### Add Block
```javascript
import { createBlock } from '@/services/documents.service'

const block = await createBlock(documentId, {
  type: 'paragraph',
  content: { text: 'Hello world' },
  position: 0
})
```

### Update Block
```javascript
import { updateBlock } from '@/services/documents.service'

await updateBlock(blockId, {
  content: { text: 'Updated text' }
})
```

### Grant Permission
```javascript
import { grantPermission } from '@/services/documents.service'

// Give user editor access
await grantPermission(documentId, userId, 'editor')

// With expiration (7 days)
const expiresAt = new Date()
expiresAt.setDate(expiresAt.getDate() + 7)
await grantPermission(documentId, userId, 'viewer', {
  expires_at: expiresAt.toISOString()
})
```

### Create Comment
```javascript
import { createComment } from '@/services/documents.service'

const comment = await createComment(
  documentId,
  blockId,
  'This needs revision'
)
```

### Real-time Subscription
```javascript
import { subscribeToDocument } from '@/services/documents.service'

useEffect(() => {
  const subscription = subscribeToDocument(documentId, (payload) => {
    console.log('Change:', payload)
    // Update UI
  })
  
  return () => subscription.unsubscribe()
}, [documentId])
```

### Presence Tracking
```javascript
import { updateCollaboratorStatus } from '@/services/documents.service'

useEffect(() => {
  // Update every 5 seconds
  const interval = setInterval(() => {
    updateCollaboratorStatus(documentId, {
      blockId: currentBlockId,
      offset: cursorPosition
    })
  }, 5000)

  return () => clearInterval(interval)
}, [documentId, currentBlockId, cursorPosition])
```

### Create Version
```javascript
import { createVersion, fetchBlocks } from '@/services/documents.service'

const blocks = await fetchBlocks(documentId)
const version = await createVersion(
  documentId,
  blocks,
  'Saved before major restructure'
)
```

### Restore Version
```javascript
import { restoreVersion } from '@/services/documents.service'

await restoreVersion(documentId, versionNumber)
```

---

## Block Types

### Paragraph
```javascript
{
  type: 'paragraph',
  content: { text: 'Some text' }
}
```

### Heading
```javascript
{
  type: 'heading1', // heading1, heading2, heading3
  content: { text: 'Title', level: 1 }
}
```

### Table
```javascript
{
  type: 'table',
  content: {
    rows: [
      { cells: ['Header 1', 'Header 2'] },
      { cells: ['Data 1', 'Data 2'] }
    ]
  }
}
```

### Chart
```javascript
{
  type: 'chart',
  content: {
    chartType: 'bar|line|pie|area',
    data: [...],
    options: {...}
  }
}
```

### Kanban
```javascript
{
  type: 'kanban',
  content: {
    linked_to_table: 'project_tasks',
    status_field: 'status'
  },
  linked_to_id: projectId
}
```

### Calendar
```javascript
{
  type: 'calendar',
  content: {
    linked_to_table: 'projects',
    date_field: 'deadline'
  },
  metadata: { view: 'month' },
  linked_to_id: projectId
}
```

### Code
```javascript
{
  type: 'code',
  content: {
    code: 'console.log("hello")',
    language: 'javascript'
  }
}
```

### Callout
```javascript
{
  type: 'callout',
  content: {
    text: 'Important note',
    icon: 'info|warning|success|error'
  }
}
```

---

## Permissions

### Roles
- **viewer**: Read-only access
- **editor**: Can edit blocks, not permissions
- **admin**: Full control (edit, permissions, sharing, delete)

### Grant Permission
```javascript
await grantPermission(docId, userId, 'editor')
```

### Revoke Permission
```javascript
await revokePermission(docId, userId)
```

### Update Permission
```javascript
await updatePermission(docId, userId, 'admin')
```

### Fetch Permissions
```javascript
const perms = await fetchPermissions(docId)
// [{user_id, role, granted_at, expires_at, user: {...}}, ...]
```

---

## Folders

### Create Folder
```javascript
import { createFolder } from '@/services/documents.service'

const folder = await createFolder(orgId, {
  name: 'Client Docs',
  parent_folder_id: null // null = root level
})
```

### Fetch Folders
```javascript
import { fetchFolders } from '@/services/documents.service'

const folders = await fetchFolders(orgId)
```

### Move Document to Folder
```javascript
import { updateDocument } from '@/services/documents.service'

await updateDocument(docId, {
  folder_id: folderId
})
```

---

## Sharing

### Create Share Link
```javascript
import { createShare } from '@/services/documents.service'

// Public view (read-only)
const share = await createShare(docId, {
  share_type: 'public_view'
})
// share.share_token -> use in URL

// Public edit
await createShare(docId, {
  share_type: 'public_edit'
})

// Password protected
await createShare(docId, {
  share_type: 'password_protected',
  password_hash: hashPassword('secret123') // hash client-side
})

// Client-only
await createShare(docId, {
  share_type: 'client_only'
})
```

### Fetch Shares
```javascript
const shares = await fetchShares(docId)
```

### Delete Share
```javascript
await deleteShare(shareId)
```

---

## Comments

### Create Comment
```javascript
const comment = await createComment(docId, blockId, 'Need review')
```

### Reply to Comment
```javascript
const reply = await addCommentReply(commentId, '@Marc fix this')
```

### Resolve Comment
```javascript
await resolveComment(commentId)
```

### Fetch Comments
```javascript
const comments = await fetchComments(docId)
// [{id, text, user: {...}, resolved, replies: [...], block_id}, ...]
```

---

## Versions

### Create Version
```javascript
const blocks = await fetchBlocks(docId)
const version = await createVersion(docId, blocks, 'Major edit')
```

### Fetch Versions
```javascript
const versions = await fetchVersions(docId)
// [{version_number, created_at, created_by, change_description}, ...]
```

### Restore Version
```javascript
await restoreVersion(docId, 2) // Restore to version 2
```

---

## Activities

### Fetch Activity Log
```javascript
const activities = await fetchActivities(docId)
// [{action, user: {...}, details, created_at}, ...]
```

### Activity Actions
- `create` - Document created
- `update` - Document metadata updated
- `create_block` - Block added
- `update_block` - Block content changed
- `delete_block` - Block deleted
- `add_permission` - Permission granted
- `remove_permission` - Permission revoked
- `comment` - Comment added
- `create_share` - Share link created
- `restore_version` - Reverted to version

---

## Real-time Events

### Subscribe to Document Changes
```javascript
subscribeToDocument(docId, (payload) => {
  if (payload.eventType === 'INSERT') {
    // New block added
  } else if (payload.eventType === 'UPDATE') {
    // Block updated
  } else if (payload.eventType === 'DELETE') {
    // Block deleted
  }
})
```

### Subscribe to Collaborators
```javascript
subscribeToCollaborators(docId, (payload) => {
  // User joined/left or updated position
  console.log('Collaborators changed:', payload)
})
```

### Subscribe to Comments
```javascript
subscribeToComments(docId, (payload) => {
  // New comment or reply
  console.log('Comment added:', payload)
})
```

---

## Error Handling

```javascript
try {
  const doc = await createDocument({...})
} catch (error) {
  console.error('Failed to create document:', error.message)
  // RLS policy violation?
  // Not authenticated?
  // Database error?
}
```

Common errors:
- `Not authenticated` - User not logged in
- `new row violates row-level security` - Permission denied by RLS
- `Unique violation` - Duplicate document_id + user_id in permissions
- `Foreign key violation` - Referenced document/user doesn't exist

---

## Performance Tips

1. **Don't fetch all blocks on list view**
   ```javascript
   // DO NOT:
   const docs = await fetchDocuments()
   docs.forEach(doc => fetchBlocks(doc.id)) // Too many queries!
   
   // DO:
   const docs = await fetchDocuments() // Just titles
   // Fetch blocks when user clicks document
   ```

2. **Debounce collaborator updates**
   ```javascript
   const updateTimeout = useRef(null)
   const handleCursorChange = (blockId, offset) => {
     clearTimeout(updateTimeout.current)
     updateTimeout.current = setTimeout(() => {
       updateCollaboratorStatus(docId, {blockId, offset})
     }, 500)
   }
   ```

3. **Cache documents list**
   ```javascript
   const [docs, setDocs] = useState([])
   useEffect(() => {
     fetchDocuments().then(setDocs)
   }, [])
   
   // Update local copy when document changes
   setDocs(prev => prev.map(d => 
     d.id === updated.id ? updated : d
   ))
   ```

4. **Limit activity log pagination**
   ```javascript
   const [page, setPage] = useState(0)
   const activities = await fetchActivities(docId)
     .slice(page * 20, (page + 1) * 20)
   ```

---

## Integration Examples

### Link Block to Client
```javascript
await createBlock(docId, {
  type: 'table',
  content: { rows: [...] },
  linked_to_table: 'clients',
  linked_to_id: clientId
})
```

### Link Block to Project
```javascript
await createBlock(docId, {
  type: 'kanban',
  linked_to_table: 'project_tasks',
  linked_to_id: projectId
})
```

### Show Project Timeline
```javascript
await createBlock(docId, {
  type: 'calendar',
  content: {
    linked_to_table: 'projects',
    date_field: 'deadline'
  },
  metadata: { view: 'month' },
  linked_to_id: projectId
})
```

---

## Useful Queries

### Get user's documents
```javascript
const docs = await fetchDocuments() // Auto-filtered by RLS
```

### Get document with all data
```javascript
const doc = await fetchDocument(docId)
const blocks = await fetchBlocks(docId)
const comments = await fetchComments(docId)
const perms = await fetchPermissions(docId)
const versions = await fetchVersions(docId)
```

### Who has access to document?
```javascript
const perms = await fetchPermissions(docId)
perms.forEach(p => {
  console.log(`${p.user.full_name} has ${p.role} access`)
})
```

### Document change history
```javascript
const activities = await fetchActivities(docId)
activities.forEach(a => {
  console.log(`${a.user.full_name} ${a.action} at ${a.created_at}`)
})
```

---

## Testing

```javascript
// Create test document
const doc = await createDocument({
  org_id: orgId,
  title: 'Test Doc'
})

// Add block
const block = await createBlock(doc.id, {
  type: 'paragraph',
  content: { text: 'Hello' },
  position: 0
})

// Grant permission
await grantPermission(doc.id, userId, 'editor')

// Create comment
const comment = await createComment(doc.id, block.id, 'Test comment')

// Create version
const version = await createVersion(doc.id, [block])

// Cleanup
await deleteDocument(doc.id)
```

---

For complete documentation, see: `DOCUMENTS_SYSTEM_IMPLEMENTATION_GUIDE.md`
