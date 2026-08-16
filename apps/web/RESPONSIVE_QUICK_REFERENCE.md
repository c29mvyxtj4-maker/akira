# AKIRA Responsive Design - Quick Reference Guide

## 🎯 Using Responsive Components

### 1. Responsive Grid (Auto-scaling columns)

```tsx
import { ResponsiveGrid } from '@/components/responsive'

export function ProductList() {
  return (
    <ResponsiveGrid 
      cols={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
      gap="md"
    >
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </ResponsiveGrid>
  )
}
```

**Default breakpoint behavior:**
- Mobile (< 480px): 1 column
- Tablet (480-768px): 1 column  
- Large tablet (768-1024px): 2 columns
- Desktop (1024-1280px): 3 columns
- Large desktop (1280px+): 4 columns

---

### 2. Responsive Section (Adaptive padding)

```tsx
import { ResponsiveSection } from '@/components/responsive'

export function PageContent() {
  return (
    <ResponsiveSection 
      padding="md"      // xs | sm | md | lg | xl
      gap="lg"
      fullWidth={true}
    >
      {/* Content automatically adjusts padding per breakpoint */}
    </ResponsiveSection>
  )
}
```

---

### 3. Bottom Sheet Modal

```tsx
import { MobileSheet, useMobileSheet } from '@/components/layout'

export function DetailsButton() {
  const { open, onOpen, onClose } = useMobileSheet()

  return (
    <>
      <button onClick={onOpen}>Show Details</button>
      
      <MobileSheet 
        open={open} 
        onClose={onClose}
        title="Details"
        showHandle={true}
      >
        {/* Content appears as:
            - Centered modal on desktop
            - Bottom sheet on mobile/tablet
        */}
      </MobileSheet>
    </>
  )
}
```

---

### 4. Conditional Rendering by Device

```tsx
import { useResponsive } from '@/hooks/useResponsive'

export function Navigation() {
  const { isMobile, isDesktop } = useResponsive()

  return (
    <>
      {isMobile && <MobileMenu />}
      {isDesktop && <DesktopMenu />}
    </>
  )
}
```

---

### 5. Sidebar as Drawer (Mobile)

```tsx
import { SidebarDrawer } from '@/components/layout'
import Sidebar from './Sidebar'

export function AppLayout() {
  return (
    <SidebarDrawer
      sidebarContent={<Sidebar />}
      showToggleButton={true}
    >
      <MainContent />
    </SidebarDrawer>
  )
}
```

---

### 6. Bottom Navigation (Mobile/Tablet)

Automatically integrated into AppShell. Shows on:
- Mobile (< 768px): Always visible
- Tablet (768-1024px): Always visible  
- Desktop (>= 1024px): Hidden

```tsx
// In AppShell - already set up!
<BottomNavigation onMoreClick={() => setMoreMenuOpen(true)} />
<MoreMenu open={moreMenuOpen} onClose={() => setMoreMenuOpen(false)} />
```

---

## 📱 Media Query Helpers

### useResponsive() - Main hook for breakpoint detection

```tsx
const {
  breakpoint,      // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isMobile,        // < 768px
  isTablet,        // 768px - 1280px
  isDesktop,       // >= 1024px
  width,           // actual window width
  isLessThan,      // isLessThan('md')
  isGreaterThan,   // isGreaterThan('lg')
  isBetween,       // isBetween('sm', 'lg')
} = useResponsive()
```

### useMedia() - Arbitrary media queries

```tsx
const isSmallScreen = useMedia('(max-width: 600px)')
const isDarkMode = useMedia('(prefers-color-scheme: dark)')
```

### useTouchDevice() - Detect if device supports touch

```tsx
const isTouch = useTouchDevice()
// Useful for disabling hover states on touch devices
```

### useOrientation() - Portrait vs Landscape

```tsx
const orientation = useOrientation() // 'portrait' | 'landscape'
```

---

## 🎨 CSS Variables (Dynamic Sizing)

All defined in `src/styles/responsive.css`:

```css
/* Layout Padding - Auto-adjusts per breakpoint */
var(--layout-padding-xs)      /* 8px */
var(--layout-padding-sm)      /* 12px */
var(--layout-padding-md)      /* 16px */
var(--layout-padding-lg)      /* 20px */
var(--layout-padding-xl)      /* 24px */

/* Sidebar & Topbar Heights */
var(--sidebar-width-expanded) /* 280px */
var(--sidebar-width-tablet)   /* 200px */
var(--sidebar-width-mobile)   /* 0px (drawer only) */
var(--topbar-height-desktop)  /* 56px */
var(--topbar-height-mobile)   /* 48px */

/* Bottom Navigation */
var(--bottombar-height)       /* 66px */
var(--bottombar-height-with-safe-area)

/* Responsive Spacing */
var(--space-xs)               /* 4-8px */
var(--space-sm)               /* 8-12px */
var(--space-md)               /* 12-16px */
var(--space-lg)               /* 16-20px */
var(--space-xl)               /* 20-24px */

/* Touch Targets (WCAG 2.5.5) */
var(--touch-target-min)       /* 44px */
```

---

## 🏗️ Layout Patterns

### Pattern 1: Stacked Layout (Mobile-first)

```tsx
<ResponsiveSection padding="md" gap="md">
  <Header />
  <ResponsiveGrid cols={{ xs: 1, md: 2 }}>
    <Card>Left Column</Card>
    <Card>Right Column on Desktop</Card>
  </ResponsiveGrid>
  <Footer />
</ResponsiveSection>
```

### Pattern 2: Sidebar + Content

```tsx
<SidebarDrawer sidebarContent={<Sidebar />}>
  <ResponsiveSection padding="lg">
    <MainContent />
  </ResponsiveSection>
</SidebarDrawer>
```

### Pattern 3: Modal/Sheet

```tsx
const { open, onOpen, onClose } = useMobileSheet()

<>
  <button onClick={onOpen}>Open</button>
  <MobileSheet open={open} onClose={onClose} title="Form">
    <FormContent onSubmit={handleSubmit} />
  </MobileSheet>
</>
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T: Use inline pixel values

```tsx
// Bad - breaks on different screen sizes
<div style={{ padding: '20px', width: '600px' }}>
```

### ✅ DO: Use CSS variables or responsive components

```tsx
// Good - adapts automatically
<ResponsiveSection padding="md">
  <ResponsiveGrid cols={{ xs: 1, md: 2 }}>
```

---

### ❌ DON'T: Forget bottom padding for mobile nav

```tsx
// Bad - content hidden behind bottom nav
<main style={{ paddingBottom: 0 }}>
```

### ✅ DO: Use BottomNavigationSpacer or CSS variables

```tsx
import { BottomNavigationSpacer } from '@/components/layout'

<main>
  <Content />
  <BottomNavigationSpacer />
</main>
```

---

### ❌ DON'T: Use small touch targets on mobile

```tsx
// Bad - too small for fingers
<button style={{ padding: '4px 8px' }}>Tap me</button>
```

### ✅ DO: Ensure 44x44px minimum

```tsx
// Good - meets WCAG 2.5.5 standard
<motion.button
  className="p-3 min-h-[44px] min-w-[44px]"
  whileTap={{ scale: 0.95 }}
>
  Tap me
</motion.button>
```

---

## 🔄 Testing Responsive Design

### In Browser DevTools:

1. **Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)**
2. **Test these viewports:**
   - iPhone SE (375px)
   - iPhone 14 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1280px+)

3. **Enable these settings:**
   - Touch emulation
   - Device frame
   - Show device pixel ratio

### On Real Devices:

```bash
# Run dev server with mobile access
npm run dev

# Visit on device: http://<your-ip>:3000
# (make sure dev server listens on 0.0.0.0)
```

---

## 📊 Breakpoint Reference Table

| Screen | Min | Max | Component Behavior |
|--------|-----|-----|-------------------|
| iPhone SE | 320px | 379px | 1-col grid, drawer sidebar, bottom nav |
| iPhone 14 | 390px | 479px | 1-col grid, drawer sidebar, bottom nav |
| iPad | 480px | 767px | 1-col grid, drawer sidebar, bottom nav |
| iPad Small | 768px | 1023px | 2-col grid, compact sidebar, bottom nav |
| iPad Large | 1024px | 1279px | 3-col grid, full sidebar, no bottom nav |
| Desktop | 1280px+ | ∞ | 4-col grid, full sidebar, no bottom nav |

---

## 🎯 Next Steps When Adding Features

When building new pages/components:

1. **Start mobile-first**
   ```tsx
   // Design for mobile first
   <ResponsiveGrid cols={{ xs: 1 }} />
   ```

2. **Layer in tablet behavior**
   ```tsx
   // Then add tablet
   <ResponsiveGrid cols={{ xs: 1, md: 2 }} />
   ```

3. **Add desktop layout**
   ```tsx
   // Finally add desktop
   <ResponsiveGrid cols={{ xs: 1, md: 2, lg: 3, xl: 4 }} />
   ```

4. **Test on real devices** before merging

---

## 💡 Pro Tips

1. **Use CSS clamp() for fluid typography:**
   ```css
   font-size: clamp(14px, 4vw, 16px);
   /* Scales smoothly between 14px and 16px */
   ```

2. **Leverage safe-area-inset for notched devices:**
   ```css
   padding-top: env(safe-area-inset-top);
   ```

3. **Use Framer Motion for smooth transitions:**
   ```tsx
   <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }}>
   ```

4. **Test with throttled network** to simulate mobile conditions:
   - Chrome DevTools → Network → Fast 3G
   - Ensures images and JS load quickly

---

## 📞 Quick Help

| Problem | Solution |
|---------|----------|
| Component cut off on mobile | Use `ResponsiveSection` with proper padding |
| Bottom nav covers content | Add `BottomNavigationSpacer` |
| Text too small to read | Check `--font-size-*` variables |
| Button can't be tapped | Ensure `min-height: 44px` |
| Sidebar overlaps content | Wrap in `SidebarDrawer` |
| Modal doesn't fit mobile | Use `MobileSheet` instead |
| Layout breaks at certain width | Check media query breakpoints |
| Safe area not respected | Add `safe-area-inset-*` classes |
