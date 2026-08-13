# AKIRA Responsive Architecture

## System Overview

The responsive design system consists of 5 interconnected layers:

```
┌─────────────────────────────────────────────────┐
│  Pages & Feature Components                     │
│  (Dashboard, Clients, Projects, etc.)           │
├─────────────────────────────────────────────────┤
│  Responsive Layout Components                   │
│  (ResponsiveGrid, ResponsiveSection, etc.)      │
├─────────────────────────────────────────────────┤
│  Layout Components (Navigation)                 │
│  (BottomNavigation, SidebarDrawer, MobileSheet) │
├─────────────────────────────────────────────────┤
│  Custom Hooks                                   │
│  (useResponsive, useMedia, useTouchDevice)      │
├─────────────────────────────────────────────────┤
│  CSS Variables & Media Queries                  │
│  (responsive.css - breakpoints, sizing)         │
└─────────────────────────────────────────────────┘
```

---

## Layer 1: CSS Variables & Media Queries

**File:** `src/styles/responsive.css`

Provides the foundation for all responsive behavior:

- **6 Breakpoints**: xs (320px) → 2xl (1536px)
- **Dynamic Variables**: Layout padding, sidebar widths, font sizes
- **Safe Area Support**: For notched devices
- **Utility Classes**: Hidden/visible toggles, responsive padding

```css
:root {
  --layout-padding-xs: 8px;
  --layout-padding-md: 16px;
  --layout-padding-lg: 20px;
  
  --sidebar-width-expanded: 280px;
  --sidebar-width-tablet: 200px;
  --topbar-height-desktop: 56px;
  --topbar-height-mobile: 48px;
}

@media (max-width: 479px) {
  :root {
    --layout-padding: var(--layout-padding-xs);
    --sidebar-width: var(--sidebar-width-mobile);
  }
  
  .sidebar { display: none; }
  .bottom-navigation { display: flex; }
}
```

---

## Layer 2: Custom Hooks

**File:** `src/hooks/useResponsive.ts`

Provides JavaScript-level breakpoint detection and device information:

```
useResponsive()
├── breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
├── isMobile: boolean
├── isTablet: boolean
├── isDesktop: boolean
├── width: number
├── isLessThan(breakpoint)
├── isGreaterThan(breakpoint)
└── isBetween(min, max)

useMedia(query: string)
└── matches: boolean

useTouchDevice()
└── isTouch: boolean

useOrientation()
└── 'portrait' | 'landscape'
```

---

## Layer 3: Layout Components

### AppShell (Main Container)

**File:** `src/components/layout/AppShell.jsx`

Orchestrates the entire app layout:

```typescript
// Conditionally shows navigation based on breakpoint
if (isMobile || isTablet) {
  // Mobile/Tablet: Bottom Navigation + More Menu
  <BottomNavigation onMoreClick={() => setMoreMenuOpen(true)} />
  <MoreMenu open={moreMenuOpen} onClose={() => setMoreMenuOpen(false)} />
} else {
  // Desktop: Legacy BottomBar
  <BottomBar />
}

// Toast positioning adapts too
<ToastStack 
  bottom={(isMobile || isTablet) ? 'var(--bottombar-height-with-safe-area) + 16px' : '96px'}
/>
```

### BottomNavigation

**File:** `src/components/layout/BottomNavigation.tsx`

Shows 5 main nav items + "More" button on mobile/tablet:

```
┌─────────────────────────────────────────┐
│ Content                                 │
│                                         │
├─────────────────────────────────────────┤
│ 🏠 │ 👥 │ 💼 │ 📊 │ 🧠 │ ⋯ More       │
└─────────────────────────────────────────┘
```

- Auto-hidden on desktop
- Badge support for notifications
- Active indicator animation
- Touch-friendly (44x44px buttons)

### MoreMenu

**File:** `src/components/layout/MoreMenu.tsx`

Drawer menu for additional features:

```
┌──────────────────────┐
│ More Options    [X]  │
├──────────────────────┤
│ ⏱️ Time Tracking    │
│ ⚡ AI Operatives    │
│ 🎬 YouTube Projects │
│ ⚙️ Settings         │
│ ❓ Help             │
│ 🚪 Log Out          │
└──────────────────────┘
```

- Bottom sheet design
- Smooth open/close animation
- Safe area padding

### SidebarDrawer

**File:** `src/components/layout/SidebarDrawer.tsx`

Wraps Sidebar for responsive behavior:

```
Desktop (>= 1024px):
┌────┬──────────┐
│    │          │
│ Sb │ Content  │
│    │          │
└────┴──────────┘

Mobile/Tablet (< 1024px):
┌────────────────┐
│ [☰] Menu       │
├────────────────┤
│ Content        │  ← Sidebar slides in from left
│                │     when menu button clicked
└────────────────┘
```

### MobileSheet

**File:** `src/components/layout/MobileSheet.tsx`

Responsive modal component:

```
Desktop:              Mobile:
┌─────────────────┐   ┌──────────────────┐
│      Modal      │   │                  │
│                 │   │ Bottom Sheet     │
│                 │   │                  │
└─────────────────┘   └──────────────────┘
```

- Auto-adapts layout based on breakpoint
- Draggable handle on mobile
- Safe area support

---

## Layer 4: Responsive Wrappers

### ResponsiveGrid

**File:** `src/components/responsive/ResponsiveGrid.tsx`

Auto-scaling grid based on screen size:

```tsx
<ResponsiveGrid cols={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }} gap="md">
  {items.map(item => <Card {...item} />)}
</ResponsiveGrid>

// Renders as:
// Mobile (xs): 1 column
// Tablet (md): 2 columns
// Desktop (lg): 3 columns
// Large Desktop (xl): 4 columns
```

### ResponsiveSection

**File:** `src/components/responsive/ResponsiveSection.tsx`

Container with adaptive padding:

```tsx
<ResponsiveSection padding="md" gap="lg">
  {/* Padding adjusts per breakpoint using CSS variables */}
</ResponsiveSection>
```

### ResponsiveLayout

**File:** `src/components/responsive/ResponsiveLayout.tsx`

Main layout adapter:

```tsx
<ResponsiveLayout sidebarOpen={open} onSidebarClose={close}>
  {/* Content adapts layout structure per breakpoint */}
</ResponsiveLayout>
```

---

## Layer 5: Page Components

Pages use the responsive components to adapt their layouts:

```tsx
// Example: Dashboard Page
export function Dashboard() {
  const { isDesktop } = useResponsive()
  
  return (
    <ResponsiveSection padding="md" gap="lg">
      {/* KPI Cards - stacks on mobile, grids on desktop */}
      <ResponsiveGrid 
        cols={{ xs: 1, md: 2, lg: 4 }}
        gap="md"
      >
        {kpis.map(kpi => <KpiCard {...kpi} />)}
      </ResponsiveGrid>

      {/* Charts - different layout per device */}
      <ResponsiveGrid cols={{ xs: 1, md: 2 }}>
        <ChartCard />
        <ChartCard />
      </ResponsiveGrid>

      {/* Details panel - drawer on mobile, sidebar on desktop */}
      {isDesktop ? (
        <DetailsSidebar />
      ) : (
        <MobileSheet open={open} onClose={close}>
          <DetailsContent />
        </MobileSheet>
      )}
    </ResponsiveSection>
  )
}
```

---

## Data Flow

### Breakpoint Detection Flow

```
Window Resize Event
        ↓
useResponsive Hook
        ↓
matchMedia queries
        ↓
State update (breakpoint, isMobile, etc.)
        ↓
Components re-render with new state
        ↓
CSS variables apply new values
        ↓
Layout adapts visually
```

### Navigation State Flow

```
BottomNavigation (More button clicked)
        ↓
setMoreMenuOpen(true)
        ↓
MoreMenu renders with open={true}
        ↓
User selects item or clicks backdrop
        ↓
Navigate to route + setMoreMenuOpen(false)
        ↓
MoreMenu closes with animation
```

### Modal Flow (MobileSheet)

```
Button click
        ↓
useMobileSheet() → onOpen()
        ↓
MobileSheet opens
        ↓
useResponsive() determines:
  - Desktop: centered modal
  - Mobile: bottom sheet
        ↓
User closes (button/backdrop/swipe)
        ↓
onClose() closes sheet
```

---

## Integration Examples

### Complete Page Layout

```tsx
export default function ClientsPage() {
  const { open, onOpen, onClose } = useMobileSheet()
  const { isMobile } = useResponsive()

  return (
    <SidebarDrawer sidebarContent={<Sidebar />}>
      <ResponsiveLayout>
        <ResponsiveSection padding="md" gap="lg">
          
          {/* Header with search */}
          <div className="flex gap-2">
            <input type="text" placeholder="Search clients..." />
            <button onClick={onOpen}>Add Client</button>
          </div>

          {/* Clients list - responsive grid */}
          <ResponsiveGrid cols={{ xs: 1, md: 2, lg: 3 }}>
            {clients.map(client => (
              <ClientCard key={client.id} {...client} />
            ))}
          </ResponsiveGrid>

        </ResponsiveSection>

        {/* Add Client modal */}
        <MobileSheet 
          open={open} 
          onClose={onClose} 
          title="Add Client"
        >
          <ClientForm onSubmit={handleAdd} />
        </MobileSheet>
      </ResponsiveLayout>
    </SidebarDrawer>
  )
}
```

---

## CSS Variable Inheritance Chain

```
Browser default
        ↓
responsive.css (:root)
        ↓
responsive.css (@media queries)
        ↓
Component inline styles
        ↓
Tailwind classes
        ↓
Final computed style
```

Example:

```css
/* Global default */
:root { --layout-padding: 16px; }

/* Mobile override */
@media (max-width: 479px) {
  :root { --layout-padding: 8px; }
}
```

```tsx
/* Component uses it */
<div style={{ padding: 'var(--layout-padding)' }}>
  {/* Automatically uses 8px on mobile, 16px on desktop */}
</div>
```

---

## Performance Considerations

1. **CSS Variables** - Zero runtime cost, calculated at render time
2. **useResponsive Hook** - Uses `window.innerWidth`, minimal overhead
3. **Framer Motion** - GPU-accelerated animations
4. **Tailwind Classes** - Pre-compiled, no runtime parsing
5. **Component Memoization** - Consider for large grids

---

## Testing Strategy

### Unit Tests
- Hook return values (useResponsive, useMedia)
- Component prop validation
- Event handling (click, close, etc.)

### Integration Tests
- Navigation flow (mobile → more menu → route)
- Modal open/close on different breakpoints
- Sidebar drawer toggle

### E2E Tests
- Full page load and adaptation
- Responsive grid column count changes
- Device orientation changes
- Safe area respect (notched devices)

### Manual Testing
- Real devices (iPhone, iPad, Android)
- Browser DevTools responsive mode
- Touch interaction on actual touchscreen
- Landscape/Portrait orientation changes

---

## Migration Guide

To update existing components for responsive design:

### Step 1: Replace fixed grids
```tsx
// Before
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>

// After
<ResponsiveGrid cols={{ xs: 1, md: 2, lg: 4 }}>
```

### Step 2: Use responsive sections
```tsx
// Before
<div style={{ padding: '20px 40px' }}>

// After
<ResponsiveSection padding="lg">
```

### Step 3: Replace modals with MobileSheet
```tsx
// Before
<Modal open={open} onClose={close}>

// After
<MobileSheet open={open} onClose={close}>
```

### Step 4: Wrap sidebars
```tsx
// Before
<div style={{ display: 'flex' }}>
  <Sidebar />
  <Content />
</div>

// After
<SidebarDrawer sidebarContent={<Sidebar />}>
  <Content />
</SidebarDrawer>
```

---

## File Organization

```
src/
├── styles/
│   ├── responsive.css ← CSS foundation
│   ├── index.css (imports responsive.css)
│
├── hooks/
│   └── useResponsive.ts ← Breakpoint detection
│
├── components/
│   ├── responsive/
│   │   ├── ResponsiveLayout.tsx
│   │   ├── ResponsiveGrid.tsx
│   │   ├── ResponsiveSection.tsx
│   │   └── index.ts
│   │
│   └── layout/
│       ├── AppShell.jsx ← Navigation orchestration
│       ├── BottomNavigation.tsx ← Mobile nav
│       ├── MoreMenu.tsx ← Options drawer
│       ├── SidebarDrawer.tsx ← Sidebar wrapper
│       ├── MobileSheet.tsx ← Responsive modals
│       └── index.ts
│
└── pages/
    ├── Dashboard.jsx ← Uses responsive components
    ├── Clients.jsx
    ├── Projects.jsx
    └── ...
```

---

## Summary

The responsive system works by:

1. **CSS Variables** provide a dynamic sizing foundation
2. **Hooks** detect viewport size and device capabilities
3. **Layout Components** adapt structure per breakpoint
4. **Responsive Wrappers** auto-scale content
5. **Pages** compose these components for full responsiveness

All layers work together to provide a seamless mobile-to-desktop experience with minimal code changes.
