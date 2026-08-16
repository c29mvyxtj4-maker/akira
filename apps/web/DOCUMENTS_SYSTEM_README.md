# Notion-like Document Editor System - Implementation Guide

## Overview

A complete, production-ready Notion-like document editor system has been created for AKIRA. The system features:

- **Block-based editing** with 9+ block types (headings, paragraphs, tables, charts, calendars, Kanban, images, embeds, callouts)
- **Slash command system** (`/`) for inserting blocks with keyboard navigation
- **Real-time collaboration** with Supabase Presence and live sync
- **Permission management** (Viewer, Editor, Admin roles)
- **Comments and threads** on individual blocks
- **Responsive Notion-like UI** with Tailwind + Framer Motion

## File Structure

```
src/components/documents/
├── DocumentEditor.jsx                    # Main container component
├── BlockRenderer.jsx                     # Universal block display router
├── SlashCommandPalette.jsx              # "/" command menu with keyboard nav
├── blocks/
│   ├── ParagraphBlock.jsx               # Text with inline formatting
│   ├── HeadingBlock.jsx                 # H1/H2/H3 headings
│   ├── TableBlock.jsx                   # Editable tables with CSV export
│   ├── ChartBlock.jsx                   # Recharts integration (bar/line/pie/scatter)
│   ├── CalendarBlock.jsx                # Month view calendar with events
│   ├── KanbanBlock.jsx                  # Drag-and-drop Kanban board
│   ├── ImageBlock.jsx                   # Image upload/URL with captions
│   ├── EmbedBlock.jsx                   # YouTube, Figma, Vimeo, etc
│   └── CalloutBlock.jsx                 # Alert/note blocks with icons
├── collaboration/
│   ├── CollaboratorsPanel.jsx           # Shows online collaborators
│   ├── PermissionPanel.jsx              # Manage access & share links
│   └── CommentThread.jsx                # Threaded comments on blocks
└── index.ts                             # Barrel exports

src/hooks/
├── useDocumentSync.ts                   # Real-time Supabase sync (INSERT/UPDATE/DELETE)
├── useBlockOperations.ts                # CRUD operations for blocks
└── useDocumentPermissions.ts            # Role-based access control

src/services/documents.service.js        # (EXISTING - fully featured)
```

## Component Architecture

### DocumentEditor (Main Container)
**Purpose**: Root component for document viewing/editing
**Features**:
- Real-time sync with Supabase
- Permission checking (show edit buttons if canEdit)
- Slash command palette trigger
- Collaborators and permissions panels
- Editable document title
- Drag-and-drop block reordering

**Props**:
```jsx
<DocumentEditor 
  documentId="doc_123"
  onClose={() => navigate('/documents')}
/>
```

### BlockRenderer (Universal Display)
**Purpose**: Routes to specific block component based on `block.type`
**Supported types**: heading1/2/3, paragraph, table, chart, calendar, kanban, image, embed, callout
**Features**:
- Duplicate block button
- Delete block button
- Comments thread
- Drag handle (when editable)

### SlashCommandPalette
**Purpose**: Notion-style "/" command menu
**Features**:
- ↑↓ arrow navigation
- Enter to select
- Esc to close
- Dynamic filtering by typing
- Shows icon + description for each command

**Commands Available**:
- Heading 1, 2, 3
- Paragraph
- Bulleted List
- Checklist
- Table
- Chart
- Calendar
- Kanban Board
- Image
- Embed
- Code
- Callout

### Block Components

#### ParagraphBlock
- Contenteditable div
- Inline formatting (bold, italic, underline, color)
- "/" triggers slash command palette
- Placeholder text

#### HeadingBlock
- Supports H1 (text-4xl), H2 (text-3xl), H3 (text-2xl)
- Same formatting as paragraph
- Auto-sized text

#### TableBlock
- Manual cell editing
- Add/remove rows and columns
- Rename columns
- CSV export
- Link to data sources (future)

#### ChartBlock
- 4 chart types: Bar, Line, Pie, Scatter
- Manual data input
- Live chart rendering with Recharts
- Customizable colors and labels
- Link to data sources (future)

#### CalendarBlock
- Month view navigation
- Add/edit/delete events
- Events list sidebar
- Click dates to add events

#### KanbanBlock
- Fully customizable columns
- Drag-and-drop cards between columns
- Card metadata (title, description, assignee, due date)
- Add/delete columns and cards
- Link to projects (future)

#### ImageBlock
- File upload or URL paste
- Drag-and-drop upload support
- Resizable
- Captions
- Preview in editor

#### EmbedBlock
- Auto-detect providers (YouTube, Vimeo, Figma)
- Embedded iframe display
- URL validation
- Change/remove embed

#### CalloutBlock
- Icon selector (info, warning, success, error, idea, note)
- Customizable text
- Background colors by type
- Resolved state

### Collaboration Components

#### CollaboratorsPanel
- Shows online collaborators with green dot
- Display last edited time
- Real-time updates via Supabase Presence
- User info (name, email, avatar)

#### PermissionPanel
- Add members by email
- Role selection (Viewer, Editor, Admin)
- Remove members
- Generate shareable link with expiration
- Role descriptions

#### CommentThread
- Thread comments on individual blocks
- Resolve/unresolve comments
- Show resolved comments in collapsed details
- Timestamp tracking

## Hooks

### useDocumentSync
Real-time document synchronization
```typescript
const { document, blocks, loading, error, syncBlock, deleteBlock } = useDocumentSync(documentId)
```
- Fetches document + blocks on mount
- Subscribes to Supabase changes
- Optimistic updates
- Handles conflicts (last-write-wins)

### useBlockOperations
Block CRUD operations
```typescript
const { insertBlock, updateBlock, reorderBlocks } = useBlockOperations(documentId)
```
- insertBlock(blockData)
- updateBlock(blockId, updates)
- reorderBlocks(blocksArray)

### useDocumentPermissions
Role-based access control
```typescript
const { userRole, canEdit, canComment, canAdmin, loading } = useDocumentPermissions(documentId, userId)
```
- Roles: viewer, editor, admin
- canEdit: editor | admin
- canComment: all except viewer
- canAdmin: admin only

## Service Layer (documents.service.js)

**Existing comprehensive implementation includes**:

### Documents
- fetchDocuments()
- fetchDocument(id)
- createDocument(data)
- updateDocument(id, updates)
- deleteDocument(id)
- archiveDocument(id)
- pinDocument(id)

### Blocks
- fetchBlocks(documentId)
- createBlock(documentId, blockData)
- updateBlock(blockId, updates)
- deleteBlock(blockId)
- reorderBlocks(documentId, blocks)

### Permissions
- fetchPermissions(documentId)
- grantPermission(documentId, userId, role)
- updatePermission(documentId, userId, role)
- revokePermission(documentId, userId)

### Collaborators
- updateCollaboratorStatus(documentId, cursor)
- fetchCollaborators(documentId)
- markOffline(documentId)

### Comments
- fetchComments(documentId)
- createComment(documentId, blockId, text)
- updateComment(commentId, text)
- deleteComment(commentId)
- resolveComment(commentId)
- addCommentReply(commentId, text)

### Versions
- fetchVersions(documentId)
- createVersion(documentId, blocks, description)
- restoreVersion(documentId, versionNumber)

### Real-time Subscriptions
- subscribeToDocument(documentId, callback)
- subscribeToCollaborators(documentId, callback)
- subscribeToComments(documentId, callback)

## Database Schema Requirements

The system requires these Supabase tables (should already exist):

```sql
-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES profiles(id),
  title TEXT,
  description TEXT,
  is_archived BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  folder_id UUID,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Document Blocks
CREATE TABLE document_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- heading1/2/3, paragraph, table, chart, calendar, kanban, image, embed, callout
  content TEXT,
  metadata JSONB DEFAULT '{}',
  position INT,
  is_deleted BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Document Permissions
CREATE TABLE document_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor', -- viewer, editor, admin
  granted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Document Collaborators (for real-time presence)
CREATE TABLE document_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT true,
  cursor_block_id UUID,
  cursor_offset INT,
  last_edited_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Document Comments
CREATE TABLE document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  block_id UUID REFERENCES document_blocks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  text TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Document Comment Replies
CREATE TABLE document_comment_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES document_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document Versions
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  blocks_snapshot JSONB,
  version_number INT,
  change_description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_org_docs"
  ON documents FOR SELECT
  USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "users_can_view_shared_docs"
  ON documents FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM document_permissions 
      WHERE document_id = documents.id 
      AND user_id = auth.uid()
    )
  );
```

## Usage

### Basic Implementation

```jsx
import { DocumentEditor } from '@/components/documents'

export function MyDocsPage() {
  const documentId = 'doc_123'
  
  return (
    <DocumentEditor 
      documentId={documentId}
      onClose={() => navigate('/documents')}
    />
  )
}
```

### With Custom Styling

The system uses Tailwind CSS with theme variables:
- `--brand-500` for primary brand color
- `--text-1/2/3/4` for text hierarchy
- `--surface-0/1/2/3` for backgrounds

Dark mode is automatically supported via `@media (prefers-color-scheme: dark)`

### Keyboard Shortcuts

Built-in:
- `/` - Open slash command palette
- `↑↓` - Navigate slash commands
- `Enter` - Select slash command / Save
- `Ctrl+B` - Bold (in text blocks)
- `Ctrl+I` - Italic
- `Ctrl+U` - Underline
- `Esc` - Close slash palette

## Integration Steps

1. **Database**: Run migration to create tables (if not existing)
2. **Routes**: Add to `src/App.jsx`
   ```jsx
   const DocumentPage = lazy(() => import('@/pages/Documents'))
   <Route path="/documents/:id" element={<DocumentPage />} />
   ```
3. **Sidebar**: Add to navigation menu
4. **Context**: Ensure AuthContext and OrgContext are set up
5. **Styles**: Ensure Tailwind + Framer Motion are configured

## Performance Optimizations

- **Lazy loading**: Each block type is rendered on-demand
- **Virtual scrolling**: For large documents (future enhancement)
- **Debounced saves**: Block updates are debounced to reduce API calls
- **Code splitting**: Components are loaded as routes
- **Images**: Lazy loaded with IntersectionObserver (future)

## Accessibility

- **Keyboard navigation**: Full keyboard support for slash palette
- **ARIA labels**: All interactive elements labeled
- **Color contrast**: Meets WCAG AA standards
- **Focus management**: Proper focus handling on modals
- **Semantic HTML**: Proper heading hierarchy

## Future Enhancements

- [ ] Linked data sources (fetch from Clients/Projects/Finance tables)
- [ ] Advanced permissions (custom roles)
- [ ] Document templates
- [ ] AI-powered block suggestions
- [ ] Version history with diff view
- [ ] Export to PDF/Markdown/Word
- [ ] Mentions and @-notifications
- [ ] Block-level access control
- [ ] Activity timeline
- [ ] Bulk operations

## Troubleshooting

### Blocks not syncing
- Check Supabase connection
- Verify RLS policies allow INSERT/UPDATE/DELETE
- Check browser console for errors

### Slash palette not appearing
- Verify SlashCommandPalette component mounts
- Check event listener on document
- Ensure "/" key event bubbles properly

### Collaborators not showing
- Verify Supabase Presence channels
- Check document_collaborators table exists
- Ensure subscription setup in useDocumentSync

### Permissions denied
- Check user role in document_permissions table
- Verify RLS policies match implementation
- Check canEdit/canAdmin logic in components

## File Paths (for Reference)

All files created:
- `src/components/documents/DocumentEditor.jsx`
- `src/components/documents/BlockRenderer.jsx`
- `src/components/documents/SlashCommandPalette.jsx`
- `src/components/documents/blocks/ParagraphBlock.jsx`
- `src/components/documents/blocks/HeadingBlock.jsx`
- `src/components/documents/blocks/TableBlock.jsx`
- `src/components/documents/blocks/ChartBlock.jsx`
- `src/components/documents/blocks/CalendarBlock.jsx`
- `src/components/documents/blocks/KanbanBlock.jsx`
- `src/components/documents/blocks/ImageBlock.jsx`
- `src/components/documents/blocks/EmbedBlock.jsx`
- `src/components/documents/blocks/CalloutBlock.jsx`
- `src/components/documents/collaboration/CollaboratorsPanel.jsx`
- `src/components/documents/collaboration/PermissionPanel.jsx`
- `src/components/documents/collaboration/CommentThread.jsx`
- `src/components/documents/index.ts`
- `src/hooks/useDocumentSync.ts`
- `src/hooks/useBlockOperations.ts`
- `src/hooks/useDocumentPermissions.ts`

Existing (updated):
- `src/services/documents.service.js` (already comprehensive)

## Support

For issues or questions:
1. Check the component props and TypeScript interfaces
2. Review Supabase RLS policies
3. Check browser DevTools console
4. Verify database schema matches expectations
