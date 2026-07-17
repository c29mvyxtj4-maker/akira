# AKIRA Phase 1 - Integration Guide

**Level:** Intermediate (requires React/Framer Motion knowledge)  
**Estimated Time:** 5-8 hours  
**Difficulty:** Medium

---

## Overview

This guide walks through integrating the Phase 1 components into AKIRA's existing pages.

All components are created and self-contained. No dependencies needed beyond what's already installed (React, Framer Motion, Lucide).

---

## Step 1: Verify Files Are In Place

### Check these files exist:
```bash
cd akira-saas/src/

# Components
ls components/ui/Skeleton.jsx                    # ✅ Created
ls components/ui/KeyboardShortcutsModal.jsx     # ✅ Created
ls components/ui/Button.jsx                     # ✅ Updated
ls components/ui/EmptyState.jsx                 # ✅ Updated

# Hooks
ls hooks/useKeyboardShortcuts.js                # ✅ Created

# Styles
ls styles/globals.css                           # ✅ Updated
```

All files should exist. If missing, check CLAUDE.md for file paths.

---

## Step 2: Test Skeleton Screens

### Create test file:
```bash
# Create a test component
cat > test-skeleton.jsx << 'EOF'
import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'

export default function TestSkeleton() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Skeleton Screens</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Single Card:</h3>
        <SkeletonCard />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <h3>Text Lines:</h3>
        <SkeletonText lines={3} />
      </div>
      <div>
        <h3>Multiple Cards:</h3>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
EOF
```

### Add to router to view:
Edit `src/App.jsx` and add temporary route:
```jsx
import TestSkeleton from '@/test-skeleton'

// In routes
<Route path="/test-skeleton" element={<TestSkeleton />} />
```

Visit http://localhost:3000/test-skeleton to verify.

---

## Step 3: Integrate Skeleton Screens Into Pages

### 3.1 Update Dashboard (`src/pages/Dashboard.jsx`)

**Before:**
```jsx
const [loading, setLoading] = useState(true)

return (
  <div>
    {loading ? <Spinner /> : <DashboardContent />}
  </div>
)
```

**After:**
```jsx
import { SkeletonPageHeader, SkeletonCard } from '@/components/ui/Skeleton'

const [loading, setLoading] = useState(true)

return (
  <div>
    {loading ? (
      <div>
        <SkeletonPageHeader style={{ marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    ) : (
      <DashboardContent />
    )}
  </div>
)
```

### 3.2 Update Clients Page (`src/pages/Clients.jsx`)

**Before:**
```jsx
return (
  <div>
    {loading ? <Spinner /> : <ClientsList clients={clients} />}
  </div>
)
```

**After:**
```jsx
import { SkeletonCard } from '@/components/ui/Skeleton'

return (
  <div>
    {loading ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    ) : (
      <ClientsList clients={clients} />
    )}
  </div>
)
```

### 3.3 Update Projects Page (`src/pages/Projects.jsx`)

Same pattern as Clients page.

### 3.4 Update Invoices Page (`src/pages/Invoices.jsx`)

Same pattern as Clients page.

### 3.5 Update Finance Dashboard

If it has charts that load, use `SkeletonCard` while chart loads.

---

## Step 4: Add Keyboard Shortcuts

### 4.1 Update Main App (`src/App.jsx`)

Add at top of component:
```jsx
import { useState } from 'react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import KeyboardShortcutsModal from '@/components/ui/KeyboardShortcutsModal'

export default function App() {
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)

  // Add keyboard shortcuts hook
  useKeyboardShortcuts([
    {
      key: '?',
      label: 'Show keyboard shortcuts',
      handler: () => setShowShortcutsHelp(true),
    },
  ])

  return (
    <>
      <Routes>
        {/* ... existing routes ... */}
      </Routes>

      <KeyboardShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </>
  )
}
```

### 4.2 Test Keyboard Shortcuts

1. Press `?` anywhere in the app
2. Modal should appear showing all shortcuts
3. Type to search shortcuts
4. Press ESC to close

---

## Step 5: Update Empty States

### 5.1 Update Clients Page

**Before:**
```jsx
return (
  <div>
    {clients.length === 0 ? (
      <EmptyState title="No clients" />
    ) : (
      <ClientsList />
    )}
  </div>
)
```

**After:**
```jsx
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { Users } from 'lucide-react'

const handleCreateClient = () => {
  // Open create client dialog
}

return (
  <div>
    {clients.length === 0 ? (
      <EmptyState
        icon={Users}
        emoji="👥" // Alternative to icon
        title="No clients yet"
        description="Start building your client base. Your first client is just one click away."
        actionLabel="Create first client"
        actionShortcut="Cmd+N"
        action={
          <Button
            onClick={handleCreateClient}
            variant="primary"
          >
            Create Client
          </Button>
        }
      />
    ) : (
      <ClientsList />
    )}
  </div>
)
```

### 5.2 Update Projects Page

Similar to Clients. Replace icon with `Briefcase`, action with "Create Project".

### 5.3 Update Invoices Page

Similar to Clients. Replace icon with `FileText`, action with "Create Invoice".

### 5.4 Update Knowledge Page

Replace icon with `BookOpen`, action with "Create Document".

---

## Step 6: Verify Animations

### Test that animations work:

1. **Button hover/press:**
   - Hover over any button → Should lift slightly
   - Click button → Should scale down to 0.98
   - Release → Should pop back to 1.0

2. **Skeleton screen pulse:**
   - Skeleton screens should have subtle pulse animation
   - Should respect `prefers-reduced-motion` setting

3. **Empty state entrance:**
   - Empty state should fade in smoothly
   - Icon should scale in with delay
   - Text should stagger in

4. **Modal appearance:**
   - Backdrop should fade in
   - Modal should scale in from 0.95 to 1.0

### Test `prefers-reduced-motion`:

On macOS:
```bash
# System Preferences → Accessibility → Display → Reduce motion
# Then reload app - all animations should be instant
```

---

## Step 7: Performance Testing

### Run Lighthouse:
```bash
# Assuming dev server is running on 3000
npx lighthouse http://localhost:3000 --view

# Or use Chrome DevTools:
# 1. Open Chrome
# 2. Go to localhost:3000
# 3. F12 → Lighthouse tab
# 4. Click "Analyze page load"
```

### Expected scores (before optimization):
- Performance: 70-80
- Accessibility: 85-95
- Best Practices: 80-90
- SEO: 80-90

### If score is low:
- Check Console for errors
- Check Network tab for slow requests
- Check Performance tab for jank

---

## Step 8: Accessibility Audit

### Install axe DevTools:
```bash
# Chrome extension
# https://www.deque.com/axe/devtools/
```

### Run accessibility scan:
1. Install axe DevTools extension
2. Open any AKIRA page
3. Click axe icon → Scan
4. Fix any violations (should be none)

### Manual keyboard navigation test:
1. Open app in Chrome
2. Press Tab repeatedly
3. Verify:
   - Focus ring visible on every element
   - Tab order is logical
   - Can interact with keyboard alone

---

## Step 9: Cross-Browser Testing

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (if possible)

**Things to check:**
- Animations smooth on all browsers
- Focus rings visible
- Colors correct
- Spacing correct
- No layout shifts

---

## Step 10: Performance Optimization (Optional)

### If Lighthouse score is below 80:

#### 1. Enable code splitting
Edit `vite.config.js`:
```javascript
export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
          'recharts': ['recharts'],
        },
      },
    },
  },
})
```

#### 2. Lazy load routes
Edit `src/App.jsx`:
```jsx
import { lazy, Suspense } from 'react'
import { Spinner } from '@/components/ui/Spinner'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Clients = lazy(() => import('@/pages/Clients'))
const Projects = lazy(() => import('@/pages/Projects'))

// In routes:
<Suspense fallback={<Spinner />}>
  <Route path="/" element={<Dashboard />} />
  <Route path="/clients" element={<Clients />} />
</Suspense>
```

#### 3. Compress images
Add to `vite.config.js`:
```javascript
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import imagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      webp: { quality: 75 },
    }),
  ],
})
```

---

## Common Integration Issues

### Issue: Skeleton not showing
**Solution:**
- Make sure component is imported: `import { SkeletonCard } from '@/components/ui/Skeleton'`
- Check that loading state is correctly set
- Verify component renders when `loading === true`

### Issue: Button animation feels slow
**Solution:**
- Check `transition` prop is set correctly
- Spring stiffness should be 400+
- Try: `transition={{ type: 'spring', stiffness: 400, damping: 30 }}`

### Issue: Keyboard shortcuts not working
**Solution:**
- Make sure hook is called in main layout/app
- Check that window event listener is attached
- Verify in DevTools: `window.addEventListener('keydown', ...)`

### Issue: EmptyState styling looks off
**Solution:**
- Make sure CSS variables are available
- Check that `globals.css` is imported in `index.css`
- Verify theme colors: `console.log(getComputedStyle(document.documentElement).getPropertyValue('--brand'))`

### Issue: Animations janky on mobile
**Solution:**
- Check `prefers-reduced-motion` setting
- Reduce animation complexity for mobile
- Use `will-change: transform` for animated elements
- Test on real device, not simulator

---

## Deployment Checklist

Before deploying Phase 1:

- [ ] All skeleton screens integrated
- [ ] All empty states updated with actions
- [ ] Keyboard shortcuts working (Cmd+?)
- [ ] Lighthouse score > 85
- [ ] Accessibility scan clean (axe)
- [ ] Keyboard navigation tested
- [ ] Cross-browser tested
- [ ] Mobile tested
- [ ] Performance acceptable
- [ ] No breaking changes
- [ ] All tests passing

---

## Rollback Plan

If anything breaks:

1. Revert modified files:
   ```bash
   git checkout -- akira-saas/src/components/ui/Button.jsx
   git checkout -- akira-saas/src/components/ui/EmptyState.jsx
   git checkout -- akira-saas/src/styles/globals.css
   ```

2. Remove new components (or disable):
   ```bash
   git checkout -- akira-saas/src/components/ui/Skeleton.jsx
   git checkout -- akira-saas/src/components/ui/KeyboardShortcutsModal.jsx
   git checkout -- akira-saas/src/hooks/useKeyboardShortcuts.js
   ```

3. Redeploy previous version
4. Investigate issue offline
5. Re-test thoroughly before next deploy

---

## Success Indicators

After deployment, you should see:

✅ **Immediate (Day 1)**
- Users notice "app looks more polished"
- Animations feel smooth
- Empty states help guide users
- Keyboard shortcuts discovered (Cmd+?)

✅ **Week 1**
- NPS scores increase
- Support tickets about "how do I create" decrease
- Keyboard shortcut usage visible in analytics
- No critical bugs reported

✅ **Month 1**
- Session duration increases 10-15%
- Task completion rate up 20-30%
- Retention improves
- Users mention premium feel in feedback

---

## Next Phase After Deployment

Once Phase 1 is stable:

1. **Phase 2:** Time tracking module
   - Start planning UI/UX
   - Define database schema
   - Build timer component

2. **Phase 3:** AI features
   - Integrate LLM for document generation
   - Build recommendation engine
   - Churn prediction model

3. **Phase 4:** Ecosystem
   - Design public API
   - Build marketplace
   - Developer portal

---

## Questions During Integration?

1. **Component doesn't render?**
   - Check import path
   - Check that file exists
   - Check for console errors

2. **Animation feels wrong?**
   - Check transition props
   - Verify Framer Motion version
   - Test with reduced-motion disabled

3. **Accessibility issues?**
   - Run axe scan
   - Check WCAG AA compliance
   - Test with keyboard only

4. **Performance problems?**
   - Run Lighthouse
   - Check for memory leaks
   - Profile with DevTools

---

**Integration Guide Version:** 1.0  
**Last Updated:** 2026-07-17  
**Estimated Completion:** 2026-07-20
