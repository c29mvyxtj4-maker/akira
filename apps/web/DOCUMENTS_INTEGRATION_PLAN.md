# AKIRA Documents Integration Plan
## Linking Notion Documents with Projects, Clients, Calendar & Finance

**Date:** 2026-08-14  
**Status:** Architecture & Strategy Document  
**Audience:** Development team  
**Next Phase:** Implementation (2-3 sprints)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Table Linking Strategy](#table-linking-strategy)
4. [Chart Integration](#chart-integration)
5. [Calendar Sync](#calendar-sync)
6. [Kanban Integration](#kanban-integration)
7. [Service Layer Design](#service-layer-design)
8. [API Endpoint Specifications](#api-endpoint-specifications)
9. [Sync Strategy & Caching](#sync-strategy--caching)
10. [UI/UX Implementation](#uiux-implementation)
11. [Permission Model](#permission-model)
12. [Database Migrations](#database-migrations)
13. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

The **Documents Integration Plan** enables AKIRA's Knowledge Base to become a hub for business data visualization and management. Users can:

- **Link live data** from Clients, Projects, Finance, and Time Tracking directly into document tables
- **Create dynamic charts** that visualize financial metrics, project performance, and time tracking data
- **Sync calendars** within documents, showing all events from the Calendar section
- **Embed Kanban boards** that link to project tasks with real-time updates
- **Mix manual and automatic data** with hybrid editing modes and conflict resolution

**Key Benefits:**
- No more copy-paste data into documents—live sync with source systems
- Create comprehensive business reports with embedded data and charts
- Centralize decision-making around documents with live insights
- Reduce data silos—documents become the single source for analysis

---

## Architecture Overview

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     KNOWLEDGE BASE (Document)                   │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Table Block     │  │  Chart Block     │  │ Kanban Block │  │
│  │  (linked_table)  │  │  (linked_data)   │  │ (linked_proj)│  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│           │                     │                     │         │
│           └─────────────────────┴─────────────────────┘         │
│                          │                                      │
│               ┌──────────────────────┐                          │
│               │ Document Syncer      │                          │
│               │ (Real-time + Cache)  │                          │
│               └──────────────────────┘                          │
└────────────────────────────┬─────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐          ┌─────────┐         ┌──────────┐
   │ Clients │          │ Projects│         │ Finance  │
   │ Service │          │ Service │         │ Service  │
   └─────────┘          └─────────┘         └──────────┘
        │                    │                    │
        ▼                    ▼                    ▼
   ┌──────────────────────────────────────────────────┐
   │          SUPABASE (PostgreSQL)                   │
   │  clients | projects | finance_categories | ...   │
   └──────────────────────────────────────────────────┘
```

### Block Type Extension Model

Each document block now supports:
- **content.linkedToTable** — Which data table to link (or null for manual)
- **content.linkedToId** — Filter for specific record (or null for all org data)
- **content.autoSync** — Boolean: true = auto-refresh, false = manual
- **content.manualOverrides** — { rowId: { column: value } } for hybrid edits
- **content.syncMetadata** — { lastSyncedAt, syncFrequency, cacheKey }

---

## Table Linking Strategy

### Use Cases

1. **Client Directory** — Link `clients` table, show name, email, phone, status
2. **Active Projects** — Link `projects` table, show title, status, date, team
3. **Invoices Dashboard** — Link `invoices` table, show number, amount, status, client
4. **Time Entries Log** — Link `time_entries` table, show hours, project, date, status
5. **Financial Categories** — Link `finance_categories` table, show category, monthly budget, spent

### Data Schema

```javascript
// document_blocks.content structure for table blocks

{
  type: 'table',
  
  // Linking configuration
  linkedToTable: 'clients',        // Table name or null for manual
  linkedToId: null,                // Org-wide, or specific record ID
  linkedToFilters: {               // Optional query filters
    status: 'active',              // Show only active clients
    created_after: '2026-01-01',
    created_before: '2026-12-31'
  },
  
  // Column configuration
  columns: [
    {
      key: 'name',                 // Database column name
      label: 'Client Name',        // Display label
      type: 'text',                // text, email, phone, date, number, status, currency
      width: 200,
      sortable: true,
      filterable: true,
      hidden: false
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      width: 250,
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      width: 120,
      options: ['active', 'paused', 'inactive']  // For status badge
    }
  ],
  
  // Sync configuration
  autoSync: true,                  // Auto-refresh every X minutes
  syncFrequency: 5,                // Minutes (5, 15, 30, 60)
  manualOverrides: {               // Hybrid mode: override cells
    'client_123': {
      name: 'Custom Client Name',  // Override name for this row
      notes: 'Special notes'       // Add extra columns
    }
  },
  
  // Row actions
  allowCreate: true,               // Can add new rows (creates in linked table)
  allowDelete: true,               // Can delete rows
  allowEdit: true,                 // Can edit cells
  
  // UI state
  sortBy: 'name',
  sortOrder: 'asc',
  filterActive: false,
  
  // Metadata
  syncMetadata: {
    lastSyncedAt: '2026-08-14T10:30:00Z',
    lastSyncStatus: 'success',     // success | error | pending
    cacheKey: 'doc_123_block_456_clients',
    rowCount: 24
  }
}
```

### Supported Table Linkages

| Table | Available Columns | Filters | Use Cases |
|-------|------------------|---------|-----------|
| `clients` | name, email, phone, website, status, industry, address, created_at | status, created_after, created_before | Client directory, contact lists |
| `projects` | title, description, status, client_id, start_date, end_date, budget, progress | status, client_id, date_range | Project tracker, timeline view |
| `invoices` | number, amount, status, client_id, issue_date, due_date, paid_date | status, client_id, amount_range, date_range | Invoice tracker, payment status |
| `finance_categories` | name, monthly_budget, spent, color, icon | type | Budget overview, spending tracker |
| `time_entries` | hours, billable, project_id, client_id, description, created_at | project_id, client_id, billable, date_range | Time log, billable hours summary |
| `documents` | title, created_by, created_at, updated_at, owner | created_by, type | Document index |

### Hybrid Editing Mode

**Problem:** Auto-synced data should be updateable, but also reflect source changes.

**Solution:** Two-layer model:
```javascript
// Source data (from linked table)
sourceData = [
  { id: 'client_1', name: 'Acme Corp', email: 'contact@acme.com' }
]

// User overrides (stored in manualOverrides)
manualOverrides = {
  'client_1': {
    name: 'Acme Corp (Key Account)',  // Override name
    notes: 'Top 10 client'              // Add extra column
  }
}

// Display data (sourceData merged with overrides)
displayData = [
  {
    id: 'client_1',
    name: 'Acme Corp (Key Account)',  // From override
    email: 'contact@acme.com',        // From source
    notes: 'Top 10 client'            // From override
  }
]

// On sync: update sourceData, preserve overrides
// On edit: if source column → update in manualOverrides
// On delete: remove from manualOverrides
```

### Implementation: Table Block Component

```jsx
// components/documents/blocks/TableBlock.jsx

export function TableBlock({ block, docId, editable }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [overrides, setOverrides] = useState(block.content.manualOverrides || {})
  const [lastSync, setLastSync] = useState(block.content.syncMetadata?.lastSyncedAt)

  // Fetch linked data
  useEffect(() => {
    if (!block.content.linkedToTable) {
      // Manual mode: show empty table
      return
    }

    // Fetch initial data
    fetchLinkedData()

    // Set up auto-sync if enabled
    if (block.content.autoSync) {
      const interval = setInterval(
        fetchLinkedData,
        (block.content.syncFrequency || 5) * 60 * 1000  // Convert to ms
      )
      return () => clearInterval(interval)
    }
  }, [block.content.linkedToTable, block.content.syncFrequency])

  async function fetchLinkedData() {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/documents/${docId}/table/${block.id}/rows`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Filters': JSON.stringify(block.content.linkedToFilters || {})
          }
        }
      )
      const { data: sourceData } = await response.json()

      // Merge source data with overrides
      const mergedData = sourceData.map(row => ({
        ...row,
        ...(overrides[row.id] || {})
      }))

      setData(mergedData)
      setLastSync(new Date().toISOString())
    } catch (error) {
      console.error('Failed to sync table data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCellEdit(rowId, column, value) {
    if (!editable) return

    // Update local overrides
    setOverrides(prev => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        [column]: value
      }
    }))

    // Persist override
    try {
      await fetch(`/api/documents/${docId}/table/${block.id}/rows/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column,
          value,
          isOverride: true  // Flag: this is a manual edit, not a sync
        })
      })
    } catch (error) {
      console.error('Failed to save override:', error)
      // Rollback?
    }
  }

  async function handleRefresh() {
    await fetchLinkedData()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{block.content.columns[0]?.label || 'Table'}</h3>
        <div className="flex gap-2 text-xs text-text-3">
          {loading && <Spinner size="sm" />}
          {lastSync && <span>Synced: {formatDate(lastSync)}</span>}
          {editable && <button onClick={handleRefresh}>Refresh</button>}
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-surface-2">
            {block.content.columns.map(col => (
              <th key={col.key} className="text-left p-2 font-semibold">
                {col.label}
              </th>
            ))}
            {editable && <th className="w-12">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id} className="border-b border-surface-2 hover:bg-surface-1">
              {block.content.columns.map(col => (
                <td
                  key={`${row.id}_${col.key}`}
                  className="p-2"
                  contentEditable={editable && block.content.allowEdit}
                  onBlur={(e) => handleCellEdit(row.id, col.key, e.currentTarget.textContent)}
                >
                  {formatCell(row[col.key], col.type)}
                </td>
              ))}
              {editable && (
                <td className="p-2">
                  {block.content.allowDelete && (
                    <button onClick={() => handleDeleteRow(row.id)}>×</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {editable && block.content.allowCreate && (
        <button onClick={handleAddRow} className="text-blue-500">
          + Add row
        </button>
      )}
    </div>
  )
}
```

---

## Chart Integration

### Use Cases

1. **Revenue Trend** — Line chart of monthly revenue from Finance
2. **Project Status** — Pie chart of projects by status
3. **Time Allocation** — Bar chart of hours per project
4. **Budget vs Actual** — Stacked bar chart of budget vs spent by category
5. **Client Revenue** — Top 10 clients by total invoice amount

### Data Schema

```javascript
// document_blocks.content structure for chart blocks

{
  type: 'chart',
  
  // Chart type
  chartType: 'line',               // line | bar | pie | doughnut | scatter | area
  
  // Data source
  dataSource: 'linked',            // linked | manual
  linkedToTable: 'finance',        // finance | projects | clients | time_entries | invoices
  linkedToFilters: {               // Optional filters
    category_type: 'income',       // Or 'expense'
    date_range: '2026-01',
    client_id: null
  },
  
  // Field mapping
  xAxis: {
    field: 'month',                // Database field or 'month', 'category', 'status'
    label: 'Month',
    type: 'categorical'            // categorical | temporal | quantitative
  },
  yAxis: {
    field: 'amount',               // Field to aggregate
    label: 'Revenue ($)',
    type: 'quantitative',
    aggregation: 'sum'             // sum | avg | count | min | max
  },
  
  // Multiple series (for multi-line/bar charts)
  series: [
    {
      field: 'amount',
      label: 'Revenue',
      color: '#22c55e',
      aggregation: 'sum'
    },
    {
      field: 'expenses',
      label: 'Expenses',
      color: '#ef4444',
      aggregation: 'sum'
    }
  ],
  
  // Styling
  colors: ['#e63946', '#f1faee', '#a8dadc'],  // Custom palette
  height: 400,
  
  // Sync configuration
  autoSync: true,
  syncFrequency: 15,               // Minutes
  
  // Manual data (for manual mode)
  manualData: [
    { x: 'Jan', y: 5000 },
    { x: 'Feb', y: 6200 }
  ],
  
  // Metadata
  syncMetadata: {
    lastSyncedAt: '2026-08-14T10:30:00Z',
    lastSyncStatus: 'success',
    cacheKey: 'doc_123_block_456_chart',
    dataPoints: 12
  }
}
```

### Supported Chart Data Sources

| Table | Fields | Aggregations | Chart Types | Examples |
|-------|--------|--------------|-------------|----------|
| `finance` | amount, category, type (income/expense), date | sum, avg, count | line, bar, pie | Monthly revenue, expense breakdown |
| `projects` | id, title, status, hours, budget | count, sum, avg | pie, bar | Project status distribution, budget utilization |
| `time_entries` | hours, billable, project_id, client_id, date | sum, avg, count | bar, line | Hours per project, billable vs non-billable |
| `invoices` | amount, status, client_id, issue_date | sum, count, avg | bar, pie, area | Revenue by client, invoice status |
| `clients` | id, name, total_revenue, invoice_count | count, sum, avg | bar, pie | Top clients by revenue |

### Implementation: Chart Block Component

```jsx
// components/documents/blocks/ChartBlock.jsx

import { BarChart, LineChart, PieChart } from 'recharts'

export function ChartBlock({ block, docId, editable }) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState(block.content.syncMetadata?.lastSyncedAt)

  useEffect(() => {
    if (block.content.dataSource === 'linked') {
      fetchChartData()

      if (block.content.autoSync) {
        const interval = setInterval(
          fetchChartData,
          (block.content.syncFrequency || 15) * 60 * 1000
        )
        return () => clearInterval(interval)
      }
    } else {
      // Manual mode
      setChartData(block.content.manualData || [])
    }
  }, [block.content.linkedToTable, block.content.syncFrequency])

  async function fetchChartData() {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/documents/${docId}/chart/${block.id}/data`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Filters': JSON.stringify(block.content.linkedToFilters || {})
          }
        }
      )
      const { data } = await response.json()
      setChartData(data)
      setLastSync(new Date().toISOString())
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    await fetchChartData()
  }

  function renderChart() {
    const commonProps = {
      data: chartData,
      height: block.content.height || 400,
      margin: { top: 5, right: 30, left: 0, bottom: 5 }
    }

    switch (block.content.chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={block.content.xAxis.field} />
            <YAxis />
            <Tooltip />
            <Legend />
            {block.content.series.map(s => (
              <Line
                key={s.field}
                type="monotone"
                dataKey={s.field}
                name={s.label}
                stroke={s.color}
              />
            ))}
          </LineChart>
        )
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={block.content.xAxis.field} />
            <YAxis />
            <Tooltip />
            <Legend />
            {block.content.series.map(s => (
              <Bar
                key={s.field}
                dataKey={s.field}
                name={s.label}
                fill={s.color}
              />
            ))}
          </BarChart>
        )
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={chartData}
              dataKey={block.content.yAxis.field}
              nameKey={block.content.xAxis.field}
              fill={block.content.colors[0]}
              label
            />
            <Tooltip />
            <Legend />
          </PieChart>
        )
      default:
        return <div>Chart type not supported</div>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          {block.content.xAxis.label} vs {block.content.yAxis.label}
        </h3>
        <div className="flex gap-2 text-xs text-text-3">
          {loading && <Spinner size="sm" />}
          {lastSync && <span>Updated: {formatDate(lastSync)}</span>}
          {editable && <button onClick={handleRefresh}>Refresh</button>}
        </div>
      </div>

      <div className="bg-surface-1 rounded-lg p-4 overflow-x-auto">
        {chartData.length > 0 ? renderChart() : <EmptyState />}
      </div>

      {block.content.dataSource === 'manual' && editable && (
        <button onClick={handleEditData}>Edit data</button>
      )}
    </div>
  )
}
```

---

## Calendar Sync

### Use Cases

1. **Project Deadlines** — See all project milestones
2. **Client Meetings** — View scheduled calls and meetings
3. **Team Events** — Shared calendar in document
4. **Deliverable Dates** — Track invoice due dates, project end dates

### Data Schema

```javascript
// document_blocks.content structure for calendar blocks

{
  type: 'calendar',
  
  // Sync configuration
  syncWith: 'calendar_section',  // Always syncs with main Calendar
  autoSync: true,
  syncFrequency: 5,              // Minutes
  
  // Filters
  filters: {
    project_id: null,            // null = all, or specific project
    client_id: null,             // null = all, or specific client
    event_type: 'all',           // all | meeting | deadline | call | reminder
    status: 'all',               // all | upcoming | completed | overdue
    dateRange: {
      start: '2026-08-14',
      end: '2026-12-31'
    }
  },
  
  // Display options
  viewMode: 'month',             // month | week | day
  showWeekends: true,
  highlightToday: true,
  
  // Actions
  allowCreate: true,             // Can add event (creates in Calendar)
  allowEdit: true,               // Can edit event (edits in Calendar)
  allowDelete: true,             // Can delete event
  
  // Styling
  colors: {
    meeting: '#3b82f6',
    deadline: '#ef4444',
    reminder: '#f59e0b',
    default: '#8b5cf6'
  },
  
  // Metadata
  syncMetadata: {
    lastSyncedAt: '2026-08-14T10:30:00Z',
    lastSyncStatus: 'success',
    cacheKey: 'doc_123_block_456_calendar',
    eventCount: 8
  }
}
```

### Implementation: Calendar Block Component

```jsx
// components/documents/blocks/CalendarBlock.jsx

import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'

const localizer = momentLocalizer(moment)

export function CalendarBlock({ block, docId, editable }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState(block.content.viewMode || 'month')

  useEffect(() => {
    fetchCalendarEvents()

    if (block.content.autoSync) {
      const interval = setInterval(
        fetchCalendarEvents,
        (block.content.syncFrequency || 5) * 60 * 1000
      )
      return () => clearInterval(interval)
    }
  }, [block.content.filters])

  async function fetchCalendarEvents() {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/documents/${docId}/calendar/${block.id}/events`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Filters': JSON.stringify(block.content.filters)
          }
        }
      )
      const { data } = await response.json()

      // Transform to react-big-calendar format
      const transformedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        resource: {
          type: event.event_type,        // meeting, deadline, etc
          clientId: event.client_id,
          projectId: event.project_id,
          description: event.description
        }
      }))

      setEvents(transformedEvents)
    } catch (error) {
      console.error('Failed to fetch calendar events:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSelectEvent(event) {
    if (!editable) return

    // Open event editor in Calendar section or modal
    openEventEditor(event.id)
  }

  function handleSelectSlot(slotInfo) {
    if (!editable || !block.content.allowCreate) return

    // Open new event form
    openNewEventForm(slotInfo.start)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Calendar</h3>
        <div className="flex gap-2 text-xs">
          {['month', 'week', 'day'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2 py-1 rounded ${
                viewMode === mode ? 'bg-brand-500 text-white' : 'bg-surface-2'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-0 rounded-lg p-4" style={{ height: '500px' }}>
        {loading ? (
          <Spinner />
        ) : (
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={viewMode}
            onView={setViewMode}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable={editable}
            popup
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: block.content.colors[event.resource.type] || block.content.colors.default
              }
            })}
          />
        )}
      </div>

      {editable && (
        <div className="text-xs text-text-3">
          {events.length} events • Last synced: {block.content.syncMetadata?.lastSyncedAt}
        </div>
      )}
    </div>
  )
}
```

---

## Kanban Integration

### Use Cases

1. **Project Tasks** — Link to specific project's Kanban board
2. **Client Tasks** — Show all tasks for a client across projects
3. **Team Workflow** — Shared task board in document context

### Data Schema

```javascript
// document_blocks.content structure for kanban blocks

{
  type: 'kanban',
  
  // Link configuration
  linkedToProject: 'project_id',  // Specific project ID or null for manual
  linkedToFilters: {              // Optional
    assigned_to: null,            // or specific team member
    status: 'all'                 // Filter by task status
  },
  
  // Column configuration
  columns: [
    {
      id: 'to-do',
      title: 'To Do',
      color: '#6b7280',
      status: 'pending'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: '#f59e0b',
      status: 'in_progress'
    },
    {
      id: 'done',
      title: 'Done',
      color: '#22c55e',
      status: 'completed'
    }
  ],
  
  // Card display
  cardFields: ['title', 'assignee', 'due_date', 'priority'],
  
  // Sync configuration
  autoSync: true,
  syncFrequency: 5,
  
  // Actions
  allowCreate: true,              // Can add card (creates in Projects)
  allowEdit: true,                // Can edit card (edits in Projects)
  allowDelete: true,              // Can delete card
  allowDragDrop: true,            // Drag to change status
  
  // Metadata
  syncMetadata: {
    lastSyncedAt: '2026-08-14T10:30:00Z',
    lastSyncStatus: 'success',
    cacheKey: 'doc_123_block_456_kanban',
    cardCount: 24
  }
}
```

### Implementation: Kanban Block Component

```jsx
// components/documents/blocks/KanbanBlock.jsx

import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd'

export function KanbanBlock({ block, docId, editable }) {
  const [tasks, setTasks] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (block.content.linkedToProject) {
      fetchKanbanData()

      if (block.content.autoSync) {
        const interval = setInterval(
          fetchKanbanData,
          (block.content.syncFrequency || 5) * 60 * 1000
        )
        return () => clearInterval(interval)
      }
    }
  }, [block.content.linkedToProject])

  async function fetchKanbanData() {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/documents/${docId}/kanban/${block.id}/tasks`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Filters': JSON.stringify(block.content.linkedToFilters || {})
          }
        }
      )
      const { data } = await response.json()

      // Group tasks by column
      const grouped = {}
      block.content.columns.forEach(col => {
        grouped[col.id] = data.filter(task => task.status === col.status)
      })

      setTasks(grouped)
    } catch (error) {
      console.error('Failed to fetch kanban data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Find new status
    const newColumn = block.content.columns.find(col => col.id === destination.droppableId)
    const taskId = draggableId

    try {
      // Update in Projects service
      await fetch(`/api/documents/${docId}/kanban/${block.id}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newColumn.status
        })
      })

      // Update local state
      const taskToMove = Object.values(tasks)
        .flat()
        .find(t => t.id === taskId)

      setTasks(prev => ({
        ...prev,
        [source.droppableId]: prev[source.droppableId].filter(t => t.id !== taskId),
        [destination.droppableId]: [
          ...prev[destination.droppableId].slice(0, destination.index),
          taskToMove,
          ...prev[destination.droppableId].slice(destination.index)
        ]
      }))
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          {block.linkedToProject ? `Project Tasks` : 'Tasks'}
        </h3>
        {loading && <Spinner size="sm" />}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {block.content.columns.map(column => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 min-w-[300px] bg-surface-1 rounded-lg p-4 ${
                    snapshot.isDraggingOver ? 'bg-surface-2' : ''
                  }`}
                >
                  <h4 className="font-semibold mb-4 pb-2 border-b border-surface-2">
                    {column.title}
                  </h4>

                  <div className="space-y-3">
                    {tasks[column.id]?.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-surface-0 p-3 rounded border-l-4 ${
                              snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                            }`}
                            style={{
                              borderLeftColor: column.color,
                              ...provided.draggableProps.style
                            }}
                          >
                            <p className="font-semibold text-sm">{task.title}</p>
                            {task.assignee && (
                              <p className="text-xs text-text-3 mt-1">{task.assignee}</p>
                            )}
                            {task.due_date && (
                              <p className="text-xs text-text-4 mt-1">
                                Due: {formatDate(task.due_date)}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>

                  {provided.placeholder}

                  {editable && block.content.allowCreate && (
                    <button
                      onClick={() => handleAddCard(column.id)}
                      className="w-full mt-4 py-2 text-center text-text-3 hover:bg-surface-2 rounded"
                    >
                      + Add card
                    </button>
                  )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
```

---

## Service Layer Design

### New Methods in `documents.service.js`

```javascript
// src/services/documents.service.js

import { supabase } from '@/lib/supabase'
import * as clientsService from './clients.service'
import * as projectsService from './projects.service'
import * as financeService from './finance.service'
import * as calendarService from './calendar.service'
import * as timeService from './time.service'

/**
 * Fetch document with all linked data for display
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Document with resolved linked data
 */
export async function getDocumentWithLinkedData(docId) {
  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', docId)
    .single()

  if (!doc) return null

  // Enrich blocks with linked data
  const enrichedBlocks = await Promise.all(
    (doc.content.blocks || []).map(async (block) => {
      if (!block.content.linkedToTable) return block

      try {
        const linkedData = await getLinkedBlockData(docId, block.id)
        return {
          ...block,
          content: {
            ...block.content,
            syncMetadata: {
              ...block.content.syncMetadata,
              linkedData
            }
          }
        }
      } catch (error) {
        console.error(`Failed to load linked data for block ${block.id}:`, error)
        return block
      }
    })
  )

  return {
    ...doc,
    content: {
      ...doc.content,
      blocks: enrichedBlocks
    }
  }
}

/**
 * Fetch linked data for a specific block
 * @param {string} docId - Document ID
 * @param {string} blockId - Block ID
 * @returns {Promise<Array>} Rows with merged overrides
 */
export async function getLinkedBlockData(docId, blockId) {
  const { data: doc } = await supabase
    .from('documents')
    .select('content')
    .eq('id', docId)
    .single()

  const block = doc.content.blocks.find(b => b.id === blockId)
  if (!block || !block.content.linkedToTable) return []

  // Fetch from appropriate service
  const sourceData = await fetchFromLinkedService(
    block.content.linkedToTable,
    block.content.linkedToFilters || {}
  )

  // Merge with overrides
  return sourceData.map(row => ({
    ...row,
    ...(block.content.manualOverrides?.[row.id] || {})
  }))
}

/**
 * Route to correct service based on linked table
 */
async function fetchFromLinkedService(tableName, filters) {
  const { data: { user } } = await supabase.auth.getUser()

  switch (tableName) {
    case 'clients':
      return await clientsService.fetchClients(filters)
    case 'projects':
      return await projectsService.fetchProjects(filters)
    case 'invoices':
      return await financeService.fetchInvoices(filters)
    case 'finance_categories':
      return await financeService.fetchCategories()
    case 'time_entries':
      return await timeService.fetchTimeEntries(filters)
    default:
      return []
  }
}

/**
 * Manually refresh linked data for a block (clear cache)
 */
export async function syncLinkedData(docId, blockId) {
  const { data: doc } = await supabase
    .from('documents')
    .select('content')
    .eq('id', docId)
    .single()

  const blockIndex = doc.content.blocks.findIndex(b => b.id === blockId)
  const block = doc.content.blocks[blockIndex]

  if (!block || !block.content.linkedToTable) return

  // Fetch fresh data
  const linkedData = await getLinkedBlockData(docId, blockId)

  // Update sync metadata
  block.content.syncMetadata = {
    ...block.content.syncMetadata,
    lastSyncedAt: new Date().toISOString(),
    lastSyncStatus: 'success',
    rowCount: linkedData.length
  }

  // Save back to document
  doc.content.blocks[blockIndex] = block
  await supabase.from('documents').update({ content: doc.content }).eq('id', docId)

  return linkedData
}

/**
 * Update a linked table row (or override)
 */
export async function updateLinkedBlockData(docId, blockId, rowId, updates) {
  const { data: doc } = await supabase
    .from('documents')
    .select('content')
    .eq('id', docId)
    .single()

  const block = doc.content.blocks.find(b => b.id === blockId)

  // Store in manualOverrides
  block.content.manualOverrides = {
    ...block.content.manualOverrides,
    [rowId]: {
      ...(block.content.manualOverrides?.[rowId] || {}),
      ...updates
    }
  }

  // Save document
  await supabase.from('documents').update({ content: doc.content }).eq('id', docId)

  // If linked: also update source table
  if (block.content.linkedToTable && block.content.autoSync) {
    await updateLinkedTableRow(block.content.linkedToTable, rowId, updates)
  }

  return block.content.manualOverrides[rowId]
}

/**
 * Update actual row in linked table
 */
async function updateLinkedTableRow(tableName, rowId, updates) {
  return supabase
    .from(tableName)
    .update(updates)
    .eq('id', rowId)
}

/**
 * Fetch chart data for a block
 */
export async function getChartData(docId, blockId) {
  const { data: doc } = await supabase
    .from('documents')
    .select('content')
    .eq('id', docId)
    .single()

  const block = doc.content.blocks.find(b => b.id === blockId)

  if (!block || block.content.dataSource === 'manual') {
    return block?.content.manualData || []
  }

  // Fetch from linked service and transform
  const rawData = await fetchFromLinkedService(
    block.content.linkedToTable,
    block.content.linkedToFilters || {}
  )

  // Aggregate data based on chart config
  return aggregateChartData(rawData, block.content)
}

/**
 * Transform raw data into chart format
 */
function aggregateChartData(rawData, chartConfig) {
  // Group by xAxis field
  const grouped = {}
  rawData.forEach(row => {
    const xValue = row[chartConfig.xAxis.field]
    if (!grouped[xValue]) grouped[xValue] = []
    grouped[xValue].push(row)
  })

  // Aggregate each group
  return Object.entries(grouped).map(([xValue, rows]) => {
    const result = { [chartConfig.xAxis.field]: xValue }

    chartConfig.series.forEach(series => {
      result[series.field] = aggregateValues(
        rows.map(r => r[series.field]),
        series.aggregation
      )
    })

    return result
  })
}

function aggregateValues(values, aggregation) {
  switch (aggregation) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length
    case 'count':
      return values.length
    case 'min':
      return Math.min(...values)
    case 'max':
      return Math.max(...values)
    default:
      return values[0]
  }
}
```

---

## API Endpoint Specifications

### Table Data Endpoints

#### GET `/api/documents/:docId/table/:blockId/rows`

Fetch rows for a linked table block.

**Query Parameters:**
- `filters` (JSON) — Optional Supabase filters
- `sort` (string) — Sort column
- `order` (asc|desc) — Sort order

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "client_1", "name": "Acme Corp", "email": "contact@acme.com" }
  ],
  "metadata": {
    "lastSyncedAt": "2026-08-14T10:30:00Z",
    "rowCount": 24,
    "linkedTable": "clients"
  }
}
```

#### POST `/api/documents/:docId/table/:blockId/rows`

Add a new row to linked table.

**Body:**
```json
{
  "name": "New Client",
  "email": "new@example.com",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "client_new",
    "name": "New Client",
    "email": "new@example.com"
  }
}
```

#### PUT `/api/documents/:docId/table/:blockId/rows/:rowId`

Update a row (manual override or source update).

**Body:**
```json
{
  "column": "name",
  "value": "Updated Name",
  "isOverride": true  // Store in manualOverrides, don't update source
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": "client_1", "name": "Updated Name" }
}
```

#### DELETE `/api/documents/:docId/table/:blockId/rows/:rowId`

Delete a row.

**Response:**
```json
{
  "success": true,
  "message": "Row deleted"
}
```

### Chart Data Endpoints

#### GET `/api/documents/:docId/chart/:blockId/data`

Fetch aggregated data for chart.

**Query Parameters:**
- `filters` (JSON) — Data filters

**Response:**
```json
{
  "success": true,
  "data": [
    { "month": "Jan", "revenue": 5000, "expenses": 2000 },
    { "month": "Feb", "revenue": 6200, "expenses": 2500 }
  ],
  "metadata": {
    "lastSyncedAt": "2026-08-14T10:30:00Z",
    "dataPoints": 12,
    "linkedTable": "finance"
  }
}
```

### Calendar Endpoints

#### GET `/api/documents/:docId/calendar/:blockId/events`

Fetch calendar events.

**Query Parameters:**
- `filters` (JSON) — `{ project_id, client_id, event_type, status, dateRange }`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "event_1",
      "title": "Project Review",
      "start_time": "2026-08-20T10:00:00Z",
      "end_time": "2026-08-20T11:00:00Z",
      "event_type": "meeting",
      "project_id": "project_1",
      "client_id": "client_1"
    }
  ],
  "metadata": {
    "lastSyncedAt": "2026-08-14T10:30:00Z",
    "eventCount": 8
  }
}
```

#### POST `/api/documents/:docId/calendar/:blockId/events`

Create new event.

**Body:**
```json
{
  "title": "New Meeting",
  "start_time": "2026-08-20T10:00:00Z",
  "end_time": "2026-08-20T11:00:00Z",
  "event_type": "meeting",
  "project_id": "project_1"
}
```

### Kanban Endpoints

#### GET `/api/documents/:docId/kanban/:blockId/tasks`

Fetch tasks for Kanban board.

**Query Parameters:**
- `filters` (JSON) — `{ assigned_to, status }`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task_1",
      "title": "Design homepage",
      "status": "in_progress",
      "assignee": "Sarah",
      "due_date": "2026-08-20",
      "priority": "high"
    }
  ],
  "metadata": {
    "lastSyncedAt": "2026-08-14T10:30:00Z",
    "cardCount": 24,
    "linkedProject": "project_1"
  }
}
```

#### PUT `/api/documents/:docId/kanban/:blockId/tasks/:taskId`

Update task status (drag-drop).

**Body:**
```json
{
  "status": "completed"
}
```

---

## Sync Strategy & Caching

### Auto-Sync Intervals

```
Manual Refresh:   Immediate
Real-time Block:  Supabase Realtime subscription
Auto Sync:        5 / 15 / 30 / 60 minutes (configurable per block)
```

### Cache Implementation

```javascript
// services/cache.service.js

const cache = new Map()

export function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > 5 * 60 * 1000) {
    // Expired (5 min TTL)
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCached(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

export function invalidateCache(pattern) {
  // Invalidate keys matching pattern
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}
```

### Sync Triggers

**Cache Invalidation happens when:**
1. User clicks "Refresh" in block UI
2. Source table changes (via Supabase Realtime)
3. Manual edit to linked row
4. Configurable time interval (5/15/30/60 min)

### Conflict Resolution

**Problem:** User edits local override while source data changes.

**Solution:**
```javascript
// When syncing linked data with overrides
function mergeSourceAndOverrides(sourceData, overrides) {
  return sourceData.map(row => {
    const override = overrides[row.id]
    if (!override) return row

    // Merge: source fields not in override stay, overrides take precedence
    return {
      ...row,
      ...override,
      _source_fields: Object.keys(row),     // Track which fields are from source
      _override_fields: Object.keys(override) // Track which are overridden
    }
  })
}
```

**UI Indicator:**
- Show lock icon next to overridden cells
- Tooltip: "This value is different from source"
- Option to "Reset to source"

---

## UI/UX Implementation

### Block Settings Modal

When user clicks settings on a table/chart/calendar/kanban block:

```jsx
// components/documents/BlockSettingsModal.jsx

export function BlockSettingsModal({ block, onSave, onCancel }) {
  const [config, setConfig] = useState(block.content)

  if (block.type === 'table') {
    return (
      <Modal>
        <Tabs>
          <Tab label="Link Data">
            <div className="space-y-4">
              <div>
                <label>Link to Table</label>
                <Select
                  value={config.linkedToTable}
                  options={[
                    { label: 'Clients', value: 'clients' },
                    { label: 'Projects', value: 'projects' },
                    { label: 'Invoices', value: 'invoices' },
                    { label: 'Finance Categories', value: 'finance_categories' },
                    { label: 'Time Entries', value: 'time_entries' }
                  ]}
                  onChange={(v) => setConfig({ ...config, linkedToTable: v })}
                />
              </div>

              <div>
                <label>Auto-sync</label>
                <Toggle
                  checked={config.autoSync}
                  onChange={(v) => setConfig({ ...config, autoSync: v })}
                />
              </div>

              {config.autoSync && (
                <div>
                  <label>Sync Frequency</label>
                  <Select
                    value={config.syncFrequency}
                    options={[
                      { label: '5 minutes', value: 5 },
                      { label: '15 minutes', value: 15 },
                      { label: '30 minutes', value: 30 },
                      { label: '60 minutes', value: 60 }
                    ]}
                    onChange={(v) => setConfig({ ...config, syncFrequency: v })}
                  />
                </div>
              )}

              <div>
                <label>Columns</label>
                {/* Column picker */}
              </div>

              <div>
                <label>Filters</label>
                {/* Filter builder */}
              </div>
            </div>
          </Tab>

          <Tab label="Actions">
            <Checkboxes
              options={[
                { label: 'Allow Create', value: 'allowCreate' },
                { label: 'Allow Edit', value: 'allowEdit' },
                { label: 'Allow Delete', value: 'allowDelete' }
              ]}
            />
          </Tab>
        </Tabs>

        <div className="flex gap-2 justify-end mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(config)}>
            Save
          </Button>
        </div>
      </Modal>
    )
  }

  // Similar for chart, calendar, kanban...
}
```

### Data Link Wizard

When creating a new table block:

```
Step 1: Select Table Type
┌─────────────────────────────┐
│ ◯ Clients                   │
│ ◯ Projects                  │
│ ◯ Invoices                  │
│ ◯ Finance Categories        │
│ ◯ Time Entries              │
│ ◯ Manual Entry              │
└─────────────────────────────┘
         [Next] [Cancel]

Step 2: Choose Columns
┌─────────────────────────────┐
│ ☑ Name                      │
│ ☑ Email                     │
│ ☑ Status                    │
│ ☐ Phone                     │
│ ☐ Website                   │
└─────────────────────────────┘
       [Back] [Next] [Cancel]

Step 3: Set Filters
┌─────────────────────────────┐
│ Status [is] [Active]        │
│ Created [after] [2026-01-01]│
│                             │
│ [+ Add Filter]              │
└─────────────────────────────┘
       [Back] [Finish]
```

---

## Permission Model

### Document Editor Permissions

| User Role | Linked Table Readable | Linked Data Editable | Can Create | Can Delete |
|-----------|---------------------|----------------------|-----------|------------|
| **Viewer** | Yes (read-only) | No | No | No |
| **Editor** | Yes | Only if has access to linked table | Only if has access | Only if has access |
| **Admin** | Yes | Yes | Yes | Yes |

### Linked Table Permission Check

```javascript
// Middleware to check permission before updating linked table

async function checkLinkedTablePermission(userId, tableName, action) {
  // Get user's org role
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', userId)
    .single()

  // Admin can do everything
  if (membership.role === 'admin') return true

  // Check table-specific permissions (future)
  // For now: editors can modify, viewers can't
  if (action === 'update' || action === 'create' || action === 'delete') {
    return membership.role === 'editor' || membership.role === 'admin'
  }

  return true
}
```

### RLS Policies

```sql
-- Existing: Users can only see their org's data
CREATE POLICY "users_see_own_org_clients"
  ON public.clients
  FOR SELECT
  USING (org_id = auth.jwt() ->> 'org_id');

-- New: Track linked data changes for document sync
CREATE POLICY "document_blocks_sync_changes"
  ON public.clients
  AFTER UPDATE
  EXECUTE FUNCTION notify_document_sync(
    old_row.id,
    new_row.id,
    'clients'
  );
```

---

## Database Migrations

### New Schema: `document_sync_log`

Track sync events for debugging and audit:

```sql
CREATE TABLE public.document_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  block_id text NOT NULL,
  linked_table text,
  sync_type text CHECK (sync_type IN ('manual', 'auto', 'realtime')),
  status text CHECK (status IN ('success', 'error', 'pending')),
  error_message text,
  rows_affected integer,
  synced_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_document_sync_log_document_id ON document_sync_log(document_id);
CREATE INDEX idx_document_sync_log_synced_at ON document_sync_log(synced_at DESC);

-- RLS
ALTER TABLE public.document_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_see_own_org_sync_logs"
  ON public.document_sync_log
  FOR SELECT
  USING (org_id = auth.jwt() ->> 'org_id');
```

### Modify `documents` Schema

Add cache hints to document_blocks:

```sql
-- documents.content.blocks[].content already supports:
-- - linkedToTable
-- - linkedToId
-- - linkedToFilters
-- - manualOverrides
-- - autoSync
-- - syncFrequency
-- - syncMetadata

-- No schema change needed: it's all JSON!
-- Just ensure PostgreSQL JSON operators work in queries
```

---

## Implementation Checklist

### Phase 1: Foundation (Sprint 1-2)

- [ ] Create `DOCUMENTS_INTEGRATION_PLAN.md` (this file)
- [ ] Update `documents.service.js` with new methods
- [ ] Create `cache.service.js` for caching
- [ ] Implement API endpoints (GET `/documents/:id/table/:blockId/rows`)
- [ ] Build TableBlock component (read-only + linked data)
- [ ] Build BlockSettingsModal for tables
- [ ] Add RLS policies for sync logging

### Phase 2: Chart & Calendar (Sprint 3)

- [ ] Implement chart data aggregation logic
- [ ] Build ChartBlock component (read-only)
- [ ] Build chart settings modal
- [ ] Implement calendar sync endpoints
- [ ] Build CalendarBlock component
- [ ] Add calendar event creation from documents

### Phase 3: Kanban & Advanced (Sprint 4)

- [ ] Implement Kanban block linking
- [ ] Build KanbanBlock component with drag-drop
- [ ] Add task creation from Kanban
- [ ] Implement hybrid editing (manual overrides)
- [ ] Add conflict resolution UI

### Phase 4: Polish & Testing (Sprint 5)

- [ ] Unit tests for sync logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for document blocks
- [ ] Performance optimization (caching, lazy loading)
- [ ] Documentation & user guide
- [ ] Permission testing

---

## Testing Strategy

### Unit Tests

```javascript
// __tests__/services/documents.service.test.js

describe('documents.service', () => {
  it('merges source data with manual overrides', () => {
    const sourceData = [
      { id: '1', name: 'Acme', email: 'acme@example.com' }
    ]
    const overrides = {
      '1': { name: 'Acme (Override)' }
    }

    const result = mergeSourceAndOverrides(sourceData, overrides)
    expect(result[0].name).toBe('Acme (Override)')
    expect(result[0].email).toBe('acme@example.com')
  })

  it('aggregates chart data correctly', () => {
    const data = [
      { month: 'Jan', revenue: 1000 },
      { month: 'Jan', revenue: 2000 },
      { month: 'Feb', revenue: 3000 }
    ]

    const aggregated = aggregateChartData(data, {
      xAxis: { field: 'month' },
      series: [{ field: 'revenue', aggregation: 'sum' }]
    })

    expect(aggregated[0].revenue).toBe(3000) // Jan sum
    expect(aggregated[1].revenue).toBe(3000) // Feb sum
  })
})
```

### Integration Tests

```javascript
// __tests__/api/documents.integration.test.js

describe('GET /api/documents/:docId/table/:blockId/rows', () => {
  it('returns linked client data', async () => {
    const response = await fetch(`/api/documents/doc_1/table/block_1/rows`)
    expect(response.status).toBe(200)

    const { data, metadata } = await response.json()
    expect(Array.isArray(data)).toBe(true)
    expect(metadata.linkedTable).toBe('clients')
  })

  it('respects manual overrides', async () => {
    // Document has manual override for client name
    const response = await fetch(`/api/documents/doc_1/table/block_1/rows`)
    const { data } = await response.json()

    expect(data[0].name).toBe('Overridden Client Name')
  })
})
```

---

## Future Enhancements

1. **Bi-directional sync** — Changes in document update source, changes in source update document
2. **Table merge blocks** — Combine data from multiple tables
3. **Filter UI** — Visual filter builder in block settings
4. **Data export** — Download linked data as CSV
5. **Webhooks** — Notify external services when linked data changes
6. **Custom formulas** — Calculate fields based on linked data
7. **Historical data** — Track changes to linked data over time

---

## Related Docs

- [Database Schema](../PHASE2_DATABASE_SCHEMA.sql)
- [Services Architecture](../services/)
- [Calendar Integration](./CALENDAR.md) *(if exists)*
- [Projects System](./PROJECTS.md) *(if exists)*

---

**Prepared by:** Claude Code  
**Date:** 2026-08-14  
**Status:** Ready for Implementation
