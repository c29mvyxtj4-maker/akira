# Responsive Design - Implementation Examples

## Phase 3: Adapting Main Pages

This guide shows how to update existing pages and components to use the new responsive system.

---

## 1. Dashboard Page Adaptation

### Before (Current)
```jsx
function Dashboard() {
  return (
    <div className="dash-kpi-grid">
      {kpis.map(kpi => <KpiCard {...kpi} />)}
    </div>
  )
}
```

### After (Responsive)
```jsx
import { DashboardResponsive, KpiCardGrid, DashboardPanel, Stats } from '@/components/dashboard'
import { useResponsive } from '@/hooks/useResponsive'

function Dashboard() {
  const { isMobile } = useResponsive()
  
  return (
    <DashboardResponsive>
      {/* KPI Cards - Auto-scales: xs:1 → md:2 → lg:3 → xl:4 */}
      <KpiCardGrid>
        {kpis.map(kpi => <KpiCard key={kpi.id} {...kpi} />)}
      </KpiCardGrid>

      {/* Charts Section - Single column on mobile */}
      <DashboardPanel title="Revenue">
        <RevenueChart data={data} />
      </DashboardPanel>

      {/* Stats with Icons */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
        <Stats value="$12,500" label="Total Revenue" change="+12% this month" changeType="positive" />
        <Stats value="24" label="Active Clients" change="+3 new" changeType="positive" />
      </div>
    </DashboardResponsive>
  )
}
```

---

## 2. Clients List Page Adaptation

### Before (Current)
```jsx
function Clients() {
  return (
    <table style={{ width: '100%' }}>
      {/* Static table - breaks on mobile */}
      <tr>
        <td>{client.name}</td>
        <td>{client.email}</td>
        <td>{client.status}</td>
      </tr>
    </table>
  )
}
```

### After (Responsive)
```jsx
import { ResponsiveTable } from '@/components/responsive'
import { SidebarDrawer } from '@/components/layout'
import { MobileSheet, useMobileSheet } from '@/components/layout'

function Clients() {
  const { open, onOpen, onClose } = useMobileSheet()
  const [selectedClient, setSelectedClient] = useState(null)

  const columns = [
    { key: 'name', label: 'Name', width: '200px' },
    { key: 'email', label: 'Email', width: '250px' },
    { key: 'status', label: 'Status', width: '100px' },
    { key: 'revenue', label: 'Revenue', width: '120px', align: 'right' },
  ]

  return (
    <SidebarDrawer sidebarContent={<Sidebar />}>
      <div style={{ padding: '16px' }}>
        <h1>Clients</h1>

        {/* Responsive Table - Cards on mobile, table on desktop */}
        <ResponsiveTable
          columns={columns}
          data={clients}
          onRowClick={(row) => {
            setSelectedClient(row)
            onOpen()
          }}
          renderCard={(row) => (
            <div style={{ padding: '12px', border: '1px solid var(--surface-2)', borderRadius: '8px' }}>
              <h3>{row.name}</h3>
              <p>{row.email}</p>
              <p>{row.status}</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand)' }}>
                {row.revenue}
              </p>
            </div>
          )}
        />

        {/* Details Modal - Bottom sheet on mobile, modal on desktop */}
        <MobileSheet open={open} onClose={onClose} title={selectedClient?.name}>
          <ClientDetails client={selectedClient} />
        </MobileSheet>
      </div>
    </SidebarDrawer>
  )
}
```

---

## 3. Projects Kanban Adaptation

### Before (Current)
```jsx
function Projects() {
  return (
    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
      {['todo', 'in_progress', 'done'].map(status => (
        <div key={status} style={{ flex: '0 0 300px', minHeight: '600px' }}>
          {/* Column with tasks */}
        </div>
      ))}
    </div>
  )
}
```

### After (Responsive)
```jsx
import { ResponsiveGrid } from '@/components/responsive'
import { useResponsive } from '@/hooks/useResponsive'
import { MobileSheet, useMobileSheet } from '@/components/layout'

function Projects() {
  const { isMobile, isTablet } = useResponsive()
  const { open, onOpen, onClose } = useMobileSheet()
  const [selectedTask, setSelectedTask] = useState(null)

  // Mobile: Show 1 column with swipeable tabs
  // Tablet: Show 2 columns
  // Desktop: Show 3 columns
  const columnCount = isMobile ? 1 : isTablet ? 2 : 3

  return (
    <div style={{ padding: '16px' }}>
      {/* Mobile: Tabs to switch between columns */}
      {isMobile && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['Todo', 'In Progress', 'Done'].map(label => (
            <button key={label} className="tab-button">
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Kanban Board Grid */}
      <ResponsiveGrid 
        cols={{ xs: 1, sm: 1, md: 2, lg: 3 }}
        gap="md"
      >
        {['todo', 'in_progress', 'done'].map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks[status]}
            onTaskClick={(task) => {
              setSelectedTask(task)
              onOpen()
            }}
          />
        ))}
      </ResponsiveGrid>

      {/* Task Details - Bottom sheet on mobile */}
      <MobileSheet open={open} onClose={onClose} title="Task Details">
        <TaskDetails task={selectedTask} />
      </MobileSheet>
    </div>
  )
}
```

---

## 4. Form Adaptation (Create/Edit Pages)

### Before (Current)
```jsx
function ClientForm() {
  return (
    <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />
      <textarea placeholder="Notes" />
      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit">Save</button>
      </div>
    </form>
  )
}
```

### After (Responsive)
```jsx
import { 
  ResponsiveForm, 
  FormField, 
  FormInput, 
  FormTextarea,
  FormSelect,
  FormActions
} from '@/components/responsive'
import { Button } from '@/components/ui'

function ClientForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    // Validate and submit
    onSubmit(formData)
  }

  return (
    <ResponsiveForm 
      onSubmit={handleSubmit}
      columns={2}  // Auto-adapts: 1 col on mobile, 2 on desktop
      gap="md"
    >
      {/* Field auto-spans to 2 columns on desktop, 1 on mobile */}
      <FormField label="Name" required error={errors.name}>
        <FormInput
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={!!errors.name}
        />
      </FormField>

      <FormField label="Email" required error={errors.email}>
        <FormInput
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={!!errors.email}
        />
      </FormField>

      {/* Full-width textarea */}
      <FormField 
        label="Notes" 
        hint="Internal notes (not shared with client)"
        span={2}  // Spans 2 columns on desktop, 1 on mobile
      >
        <FormTextarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </FormField>

      {/* Form Actions - Buttons stack on mobile */}
      <FormActions>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save Client
        </Button>
      </FormActions>
    </ResponsiveForm>
  )
}
```

---

## 5. List/Details Pattern (Mobile Drawer)

### Before (Current)
```jsx
function ItemList() {
  return (
    <div style={{ display: 'flex' }}>
      {/* List side-by-side with details */}
      <div style={{ flex: '0 0 300px' }}>
        <ItemListView />
      </div>
      <div style={{ flex: 1 }}>
        <ItemDetailsView />
      </div>
    </div>
  )
}
```

### After (Responsive)
```jsx
import { ResponsiveList, ResponsiveListItem } from '@/components/responsive'
import { MobileSheet, useMobileSheet } from '@/components/layout'
import { useResponsive } from '@/hooks/useResponsive'

function ItemList() {
  const { isDesktop } = useResponsive()
  const { open, onOpen, onClose } = useMobileSheet()
  const [selectedItem, setSelectedItem] = useState(null)

  return (
    <>
      {isDesktop ? (
        // Desktop: Side-by-side layout
        <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
          <div style={{ flex: '0 0 300px', borderRight: '1px solid var(--surface-2)' }}>
            <ResponsiveList
              items={items.map(item => ({
                title: item.name,
                subtitle: item.status,
                icon: <ItemIcon item={item} />,
                onClick: () => setSelectedItem(item),
                selected: selectedItem?.id === item.id,
              }))}
            />
          </div>
          <div style={{ flex: 1, padding: '16px' }}>
            {selectedItem && <ItemDetails item={selectedItem} />}
          </div>
        </div>
      ) : (
        // Mobile: List with drawer
        <>
          <ResponsiveList
            items={items.map(item => ({
              title: item.name,
              subtitle: item.status,
              icon: <ItemIcon item={item} />,
              onClick: () => {
                setSelectedItem(item)
                onOpen()
              },
            }))}
          />
          <MobileSheet 
            open={open} 
            onClose={onClose} 
            title={selectedItem?.name}
          >
            {selectedItem && <ItemDetails item={selectedItem} />}
          </MobileSheet>
        </>
      )}
    </>
  )
}
```

---

## 6. Modal Adaptation

### Before (Current)
```jsx
function Dialog({ open, onClose, children }) {
  if (!open) return null
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.5)',
    }}>
      <div style={{
        width: '500px',
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
      }}>
        {children}
      </div>
    </div>
  )
}
```

### After (Responsive)
```jsx
import { MobileSheet, useMobileSheet } from '@/components/layout'

function Example() {
  const { open, onOpen, onClose } = useMobileSheet()

  return (
    <>
      <button onClick={onOpen}>Open Dialog</button>
      
      {/* Auto-adapts: Centered modal on desktop, bottom sheet on mobile */}
      <MobileSheet 
        open={open} 
        onClose={onClose}
        title="Dialog Title"
        showHandle={true}
        maxHeight="80dvh"
      >
        {/* Content */}
      </MobileSheet>
    </>
  )
}
```

---

## 7. Multi-Column Layout Adaptation

### Before (Current)
```jsx
function Dashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
      <MainContent />
      <Sidebar />
    </div>
  )
}
```

### After (Responsive)
```jsx
import { DashboardGrid, DashboardSidebar } from '@/components/dashboard'

function Dashboard() {
  return (
    <DashboardGrid variant="charts">
      <div style={{ gridColumn: 'span 2' }}>
        <MainContent />
      </div>
    </DashboardGrid>

    {/* Sidebar auto-converts to drawer/stacked on mobile */}
    <DashboardSidebar title="Quick Actions">
      <QuickActionsList />
    </DashboardSidebar>
  )
}
```

---

## 8. Data Table Adaptation

### Before (Current)
```jsx
function Table() {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{item.name}</td>
          <td>{item.email}</td>
          <td>{item.amount}</td>
        </tr>
      </tbody>
    </table>
  )
}
```

### After (Responsive)
```jsx
import { ResponsiveTable } from '@/components/responsive'

function Table() {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'amount', label: 'Amount', align: 'right' },
  ]

  return (
    <ResponsiveTable
      columns={columns}
      data={items}
      onRowClick={(row) => navigate(`/items/${row.id}`)}
      striped={true}
      hoverable={true}
      renderCard={(row) => (
        <div style={{ padding: '12px', border: '1px solid var(--surface-2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>{row.name}</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
              {row.amount}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-3)' }}>
            {row.email}
          </p>
        </div>
      )}
    />
  )
}
```

---

## Component Matrix: Which to Use

| Use Case | Desktop | Tablet | Mobile | Component |
|----------|---------|--------|--------|-----------|
| Grid layout | 4 cols | 2 cols | 1 col | `ResponsiveGrid` |
| Data table | Full table | Compact | Cards | `ResponsiveTable` |
| Form | 2 cols | 1 col | 1 col | `ResponsiveForm` |
| Modal | Centered | Bottom | Sheet | `MobileSheet` |
| List + Details | Side-by-side | Stacked | Drawer | `MobileSheet` |
| Navigation | Sidebar | Drawer | Bottom | `SidebarDrawer`, `BottomNav` |
| Sections | Full width | Responsive | Full width | `ResponsiveSection` |

---

## Testing Checklist

When adapting a component:

- [ ] Mobile (375px): All elements visible, no overflow
- [ ] Tablet (768px): 2-column layouts work
- [ ] Desktop (1280px): Full layout renders correctly
- [ ] Form inputs 16px+ font size (iOS zoom prevention)
- [ ] Touch targets 44x44px minimum
- [ ] Modals bottom sheet on mobile
- [ ] Tables convert to cards on mobile
- [ ] No horizontal scroll except tables
- [ ] Safe area padding respected
- [ ] Colors/contrast meet WCAG AA

---

## Common Patterns

### Pattern: Drawer on Mobile, Sidebar on Desktop

```tsx
{isDesktop ? (
  <Sidebar />
) : (
  <SidebarDrawer sidebarContent={<Sidebar />}>
    <Content />
  </SidebarDrawer>
)}
```

### Pattern: Grid with Auto-Responsive Columns

```tsx
<ResponsiveGrid cols={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }}>
  {items.map(item => <Card {...item} />)}
</ResponsiveGrid>
```

### Pattern: Form with Auto-Stacking

```tsx
<ResponsiveForm columns={2}>
  <FormField label="Name">
    <FormInput />
  </FormField>
  {/* Auto-stacks on mobile */}
</ResponsiveForm>
```

### Pattern: Table with Mobile Card Fallback

```tsx
<ResponsiveTable
  columns={columns}
  data={data}
  renderCard={(row) => <CustomCard {...row} />}
/>
```

---

## Next Steps

1. Identify main pages (Dashboard, Clients, Projects, etc.)
2. Wrap with responsive components
3. Update inline styles to use CSS variables
4. Test on mobile devices
5. Polish touch interactions and spacing

All components handle mobile optimization automatically!
