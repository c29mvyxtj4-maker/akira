# AKIRA Responsive - Next Steps Implementation Checklist

**Last Updated:** 2026-08-13  
**Phase:** 3 (Layout Adaptation) - 50% complete

---

## 🎯 Immediate Next Steps (Week 1)

### Task 1: Update Dashboard Page ⭐ HIGH PRIORITY
**Estimated Time:** 2-3 hours  
**Difficulty:** Easy (CSS already done)

**Steps:**
1. Open `src/pages/Dashboard.jsx`
2. Import responsive components:
   ```tsx
   import { KpiCardGrid, DashboardPanel, DashboardGrid, Stats } from '@/components/dashboard'
   import { DashboardResponsive } from '@/components/dashboard'
   ```

3. Replace KPI grid section:
   ```jsx
   // Old:
   <div className="dash-kpi-grid">
   
   // New:
   <KpiCardGrid>
   ```

4. Replace main grid section:
   ```jsx
   // Old:
   <div className="dash-main-grid">
   
   // New:
   <DashboardGrid variant="charts">
   ```

5. Wrap chart containers:
   ```jsx
   <DashboardPanel title="Revenue Chart">
     <RevenueChart {...props} />
   </DashboardPanel>
   ```

6. Test on mobile (DevTools: 375px, 768px, 1280px)

**Test Cases:**
- [ ] Mobile (375px): KPI cards stack 1 column
- [ ] Tablet (768px): KPI cards show 2 columns
- [ ] Desktop (1024px): KPI cards show 3-4 columns
- [ ] No horizontal scroll
- [ ] Charts readable on mobile
- [ ] Touch targets >= 44px

---

### Task 2: Update Clients Page
**Estimated Time:** 3-4 hours  
**Difficulty:** Medium

**Steps:**
1. Import responsive components:
   ```tsx
   import { ResponsiveTable } from '@/components/responsive'
   import { MobileSheet, useMobileSheet } from '@/components/layout'
   ```

2. Replace table with ResponsiveTable:
   ```jsx
   const columns = [
     { key: 'name', label: 'Name' },
     { key: 'email', label: 'Email' },
     { key: 'status', label: 'Status' },
     { key: 'revenue', label: 'Revenue', align: 'right' },
   ]
   
   <ResponsiveTable
     columns={columns}
     data={clients}
     onRowClick={(row) => { /* ... */ }}
     renderCard={(row) => (
       <div>/* Custom card layout */</div>
     )}
   />
   ```

3. Use MobileSheet for details:
   ```jsx
   const { open, onOpen, onClose } = useMobileSheet()
   
   <MobileSheet open={open} onClose={onClose}>
     {/* Details content */}
   </MobileSheet>
   ```

4. Test all interactions

**Test Cases:**
- [ ] Mobile: Cards render instead of table
- [ ] Tablet: Table is compact
- [ ] Desktop: Full table visible
- [ ] Click row opens details sheet
- [ ] Sheet closes properly on mobile/desktop

---

### Task 3: Update Projects Page
**Estimated Time:** 4-5 hours  
**Difficulty:** Medium-Hard

**Steps:**
1. Import components:
   ```tsx
   import { ResponsiveGrid } from '@/components/responsive'
   import { useResponsive } from '@/hooks/useResponsive'
   ```

2. Add mobile tabs:
   ```jsx
   const { isMobile } = useResponsive()
   const [activeColumn, setActiveColumn] = useState('todo')
   
   {isMobile && (
     <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
       {['Todo', 'In Progress', 'Done'].map(label => (
         <button 
           key={label}
           onClick={() => setActiveColumn(label.toLowerCase())}
         >
           {label}
         </button>
       ))}
     </div>
   )}
   ```

3. Make Kanban responsive:
   ```jsx
   <ResponsiveGrid
     cols={{ xs: 1, sm: 1, md: 2, lg: 3 }}
     gap="md"
   >
     {columns.map(col => <KanbanColumn {...col} />)}
   </ResponsiveGrid>
   ```

4. Filter columns on mobile:
   ```jsx
   const visibleColumns = isMobile 
     ? columns.filter(c => c.status === activeColumn)
     : columns
   ```

**Test Cases:**
- [ ] Mobile: Only 1 column visible, tabs work
- [ ] Tablet: 2 columns visible
- [ ] Desktop: 3 columns visible
- [ ] Drag-and-drop works on touch
- [ ] Swipe works between columns

---

## 📋 Task 4: Form Components Update
**Estimated Time:** 3-4 hours (multiple forms)  
**Difficulty:** Easy (mostly copy-paste)

**Affected Forms:**
- `ClientForm.jsx`
- `ProjectForm.jsx`
- Any other form components

**Steps for each form:**
1. Import form components:
   ```tsx
   import { 
     ResponsiveForm, 
     FormField, 
     FormInput,
     FormTextarea,
     FormActions
   } from '@/components/responsive'
   ```

2. Replace form wrapper:
   ```jsx
   // Old:
   <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
   
   // New:
   <ResponsiveForm onSubmit={handleSubmit} columns={2}>
   ```

3. Wrap each input:
   ```jsx
   <FormField label="Name" required error={errors.name}>
     <FormInput
       value={formData.name}
       onChange={(e) => setFormData({...formData, name: e.target.value})}
       error={!!errors.name}
     />
   </FormField>
   ```

4. Replace buttons:
   ```jsx
   <FormActions>
     <Button onClick={cancel}>Cancel</Button>
     <Button type="submit">Save</Button>
   </FormActions>
   ```

**Test Cases:**
- [ ] Mobile: Single column form
- [ ] Tablet: Single column form
- [ ] Desktop: 2 column form
- [ ] All inputs readable (16px+ font)
- [ ] Touch targets >= 44px
- [ ] Form scrollable on small screens
- [ ] No zooming on input focus (iOS)

---

## 🔄 Task 5: Testing & Refinement
**Estimated Time:** 2-3 hours  
**Difficulty:** Easy (verification only)

**Manual Testing Checklist:**
- [ ] iPhone SE (375px) - all pages
- [ ] iPhone 14 Pro (390px) - all pages
- [ ] iPad (768px) - all pages
- [ ] iPad Pro (1024px) - all pages
- [ ] Desktop (1280px+) - all pages

**Testing Steps for Each Device:**
1. Open each page
2. Verify layout adapts correctly
3. Test all interactions (clicks, scrolls, drag-drop)
4. Check no overflow on small screens
5. Verify touch targets are tappable
6. Test modals/sheets open/close
7. Verify form inputs don't zoom

**Performance Check:**
- [ ] Page loads in < 3s (mobile)
- [ ] No layout shifts
- [ ] Animations smooth (60fps)
- [ ] No console errors

**Accessibility Check:**
- [ ] All buttons >= 44x44px
- [ ] Contrast ratio >= 4.5:1
- [ ] Touch labels clear
- [ ] Keyboard navigation works

---

## 🚀 Deployment Readiness (Phase 4)

### Before Deploying:

1. **Code Review**
   - [ ] All components type-checked (TypeScript)
   - [ ] No console errors/warnings
   - [ ] Code follows project style
   - [ ] No breaking changes

2. **Testing**
   - [ ] All manual tests passed
   - [ ] Mobile devices: Safari & Chrome
   - [ ] Tablet devices: Safari & Chrome
   - [ ] No regressions on desktop

3. **Performance**
   - [ ] Lighthouse score >= 85
   - [ ] LCP < 2.5s
   - [ ] CLS < 0.1
   - [ ] No bundle size increase

4. **Documentation**
   - [ ] Updated relevant docs
   - [ ] Code commented where needed
   - [ ] Team notified of changes

---

## 📚 Reference Documents

**For Implementing:**
- `RESPONSIVE_IMPLEMENTATION_EXAMPLES.md` - Copy from examples
- `RESPONSIVE_QUICK_REFERENCE.md` - Hook/component reference

**For Understanding:**
- `RESPONSIVE_ARCHITECTURE.md` - How system works
- `RESPONSIVE_QUICK_REFERENCE.md` - Quick lookup

**For Status:**
- `RESPONSIVE_MOBILE_PROGRESS.md` - Overall progress
- `SESSION_SUMMARY.md` - What was completed

---

## 📊 Priority Matrix

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Dashboard | 🔴 CRITICAL | 2-3h | High - Most used page |
| Clients | 🔴 CRITICAL | 3-4h | High - Core feature |
| Projects | 🟡 HIGH | 4-5h | High - Core feature |
| Forms | 🟡 HIGH | 3-4h | Medium - Many forms |
| Testing | 🟡 HIGH | 2-3h | Critical - QA required |

**Recommended Order:** Dashboard → Clients → Projects → Forms → Testing

---

## ⏱️ Time Estimate

| Phase | Component | Estimate |
|-------|-----------|----------|
| Phase 3 | Dashboard | 2-3h |
|  | Clients | 3-4h |
|  | Projects | 4-5h |
|  | Forms (all) | 3-4h |
| Phase 4 | Testing | 2-3h |
|  | Polish | 2-3h |
| **Total** | | **16-22 hours** |

---

## ✅ Completion Criteria

When all tasks are done, you'll have:
- ✅ Fully responsive Dashboard
- ✅ Mobile-friendly Clients page
- ✅ Responsive Projects/Kanban
- ✅ Mobile-optimized forms
- ✅ Tested on real devices
- ✅ No breaking changes
- ✅ 100% feature parity

---

## 🆘 If You Get Stuck

### Common Issues & Solutions

**Issue: Component not found**
- Solution: Check import path matches file location
- Example: `@/components/responsive` → `src/components/responsive/index.ts`

**Issue: Styles not applying**
- Solution: Check responsive.css is imported in index.css
- Check media queries are correct for your breakpoint

**Issue: Mobile layout looks weird**
- Solution: Check useResponsive() is detecting breakpoint correctly
- Use DevTools: Window → Console → `window.innerWidth`

**Issue: Form inputs zooming on iOS**
- Solution: Ensure font-size is 16px+ (already in FormInput)
- Check input has proper focus styles

**Issue: Touch targets too small**
- Solution: Ensure min-height: 44px and min-width: 44px
- Check padding is sufficient for hit area

---

## 📞 Questions?

1. **"How do I know if it's working?"**
   - Check DevTools mobile view matches your breakpoint expectations
   - Check console for errors
   - Test on real device if possible

2. **"Can I customize the components?"**
   - Yes! All components accept props for customization
   - Check RESPONSIVE_QUICK_REFERENCE.md for all props

3. **"What if I break something?"**
   - All changes are local to components
   - No breaking changes to existing code
   - Can revert specific imports if needed

4. **"Do I need to update ALL forms?"**
   - Start with the most important ones
   - Can update incrementally
   - Old forms still work on desktop

---

## 🎉 You're Ready!

All foundation is in place. Just follow this checklist and you'll have a fully responsive AKIRA!

**Good luck!** 🚀
