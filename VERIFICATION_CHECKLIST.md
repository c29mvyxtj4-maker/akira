# ✅ AKIRA v2.0 — Complete Verification Checklist

**Date:** 2026-08-07  
**Status:** Post-Deployment Verification  
**Estimated Time:** 45-60 minutes  

---

## 🔍 SECTION 1: GIT & DEPLOYMENT STATUS (5 min)

### GitHub Verification
- [ ] **Commit exists** 
  - Run: `git log --oneline | head -1`
  - Should show: `feat: AKIRA v2.0 - Complete integration...`
  
- [ ] **Branch is up to date**
  - Run: `git status`
  - Should show: `On branch master` and `Your branch is up to date`

- [ ] **All files committed**
  - Run: `git diff --stat`
  - Should show: `0 files changed` (no uncommitted changes)

- [ ] **Check remote is correct**
  - Run: `git remote -v`
  - Should show: `origin https://github.com/c29mvyxtj4-maker/akira.git`

### Vercel Deployment Verification
- [ ] **Deployment is live**
  - Check: https://vercel.com/akira-saas/akira-saas
  - Status should show: "Ready"

- [ ] **Production URL works**
  - Visit: https://akira-saas-e0o8q40ow-akira-saas.vercel.app
  - Should load without errors

- [ ] **Alias URL works**
  - Visit: https://akira-saas-five.vercel.app
  - Should redirect to production

- [ ] **Build logs show success**
  - Check Vercel dashboard > Deployments > Latest
  - Should show: Green checkmark and "Deployment Ready"

---

## 🗄️ SECTION 2: SUPABASE DATABASE SETUP (15 min)

### Critical: Apply Migrations

⚠️ **REQUIRED BEFORE TESTING FEATURES**

- [ ] **Migration 001: Widgets Tables**
  ```
  1. Open Supabase Dashboard
  2. SQL Editor > New Query
  3. Copy content from:
     C:\Users\marcr\Desktop\AKIRA\akira-saas\infrastructure\supabase\migrations\001_create_widgets_tables.sql
  4. Click RUN
  5. Verify success (no errors)
  ```

- [ ] **Migration 002: Automation Tables**
  ```
  1. SQL Editor > New Query
  2. Copy content from:
     C:\Users\marcr\Desktop\AKIRA\akira-saas\infrastructure\supabase\migrations\002_create_automation_tables.sql
  3. Click RUN
  4. Verify success (no errors)
  ```

### Verify Tables Were Created

- [ ] **Widgets tables exist**
  - In Supabase Dashboard > Database > Tables
  - Should see:
    - [ ] `dashboards` table
    - [ ] `dashboard_widgets` table
  - Check row count: Should be 0 (empty after migration)

- [ ] **Automation tables exist**
  - Should see:
    - [ ] `workflows` table
    - [ ] `workflow_executions` table
    - [ ] `agent_logs` table
  - Check row count: Should be 0 (empty after migration)

- [ ] **Indexes created**
  - In Supabase > Database > Indexes
  - Should see multiple indexes for performance

- [ ] **RLS Policies active**
  - In Supabase > Database > Tables > (each table)
  - Should see RLS enabled and policies listed

- [ ] **No errors in Supabase logs**
  - Check: Supabase Dashboard > Logs
  - Should see no SQL errors

---

## 🚀 SECTION 3: LOCAL DEVELOPMENT (15 min)

### Start Dev Server

- [ ] **Dev server starts without errors**
  ```bash
  cd C:\Users\marcr\Desktop\AKIRA\akira-saas
  npm run dev
  ```
  - Should show: `Local: http://localhost:3000`
  - Should show: `ready in XXXms`
  - No error messages in console

- [ ] **No build errors**
  - Terminal should show no red error text
  - Check for warnings (yellow text) - acceptable but note them

- [ ] **Check console for module imports**
  - Look for any import errors about new modules
  - Should NOT see:
    - `Cannot find module '@/modules/widgets'`
    - `Cannot find module '@/modules/automation'`
    - `Cannot find module '@/modules/sync'`

---

## 🎨 SECTION 4: DASHBOARD & WIDGETS (15 min)

### Load Dashboard Page

- [ ] **Dashboard page loads**
  - Navigate to: http://localhost:3000/dashboard
  - Page should load without errors
  - Should see greeting: "Buenos días/tardes/noches, [nombre]"

- [ ] **Widget toggle button visible**
  - Look for button: "Mostrar widgets" (top right of greeting)
  - Button should be clickable

- [ ] **Widget grid appears when toggled**
  - Click "Mostrar widgets" button
  - Should see widget grid appear with animation
  - Should show: "+ Add Widget" button

### Test Widget Functionality

- [ ] **Add widget works**
  - Click "+ Add Widget"
  - Modal should appear with widget types
  - Should see 10+ widget options:
    - [ ] KPI Card
    - [ ] Revenue Chart
    - [ ] Project Status
    - [ ] Client List
    - [ ] Tasks Overview
    - [ ] Time Summary
    - [ ] Invoices Due
    - [ ] Messages Feed
    - [ ] Calendar Mini
    - [ ] Activity Feed

- [ ] **Select and add a widget**
  - Click on "KPI Card" (or any widget)
  - Type a title (e.g., "Revenue")
  - Choose size (sm, md, lg, full)
  - Click "Add Widget"
  - Widget should appear in grid

- [ ] **Widget displays data**
  - Added widget should show content
  - Should NOT show errors
  - Should have proper formatting

- [ ] **Drag-drop reordering works**
  - Click and drag widget to new position
  - Other widgets should rearrange
  - No errors in console

- [ ] **Remove widget works**
  - Click X button on widget
  - Widget should disappear
  - Grid should update

- [ ] **Hide widgets button works**
  - Click "Ocultar widgets"
  - Widget grid should hide
  - Dashboard should show original content

### Check Offline Indicator

- [ ] **Offline indicator appears when online**
  - Check Dashboard header
  - Should NOT see "Modo offline" badge (unless actually offline)
  - Should NOT see sync queue indicator (unless mutations pending)

- [ ] **Offline indicator appears when offline**
  - DevTools > Network > Offline
  - Try to add a widget
  - Should see "Modo offline" badge
  - Should see "X cambios pendientes" badge

---

## ⚙️ SECTION 5: AUTOMATION PAGE (15 min)

### Navigate to Automation

- [ ] **Automation link in sidebar**
  - Open sidebar (if collapsed, expand it)
  - Look for "Akira" section
  - Should see "Automation v2.0" link (under Brain)
  - Icon should be Zap (⚡)

- [ ] **Automation page loads**
  - Click "Automation v2.0" link
  - Navigate to: http://localhost:3000/automation
  - Page should load without errors
  - Should show: "Automation Workflows" heading

### Verify Workflow Templates

- [ ] **4 workflow templates visible**
  - Should see cards for:
    - [ ] Content Production Pipeline
    - [ ] SaaS Development Lifecycle
    - [ ] Client Project Delivery
    - [ ] Marketing Campaign Launch

- [ ] **Template cards show details**
  - Each card should show:
    - [ ] Workflow name
    - [ ] Description
    - [ ] Number of steps (e.g., "6 steps")
    - [ ] Estimated duration (e.g., "~120 min")
    - [ ] "Run Workflow" button

- [ ] **Template cards are interactive**
  - Hover over card
  - Should show shadow effect
  - Border should change color

### Test Workflow Execution

- [ ] **Execute a workflow**
  - Click "Run Workflow" on any template
  - Button should change to "Running..."
  - Page should respond (not frozen)

- [ ] **Workflow execution completes**
  - Wait for execution to finish (~5-10 seconds)
  - Button should return to "Run Workflow"
  - Should NOT show errors

- [ ] **Execution appears in history**
  - Scroll down to "Recent Executions"
  - Should see executed workflow in list
  - Should show:
    - [ ] Workflow name
    - [ ] Timestamp
    - [ ] Progress bar
    - [ ] Status badge (completed/running/failed)

- [ ] **Check browser console**
  - DevTools > Console
  - Should NOT see errors about:
    - [ ] Missing agents
    - [ ] API failures
    - [ ] Module not found

---

## 📱 SECTION 6: MOBILE RESPONSIVENESS (10 min)

### Desktop View

- [ ] **Layout looks good at 1920x1080**
  - Open DevTools
  - Toggle device toolbar OFF
  - Dashboard should display properly
  - Sidebar should work

### Tablet View

- [ ] **Layout responsive at 768px (iPad)**
  - DevTools > Toggle device toolbar
  - Select iPad
  - Widgets should stack properly
  - Navigation should be accessible
  - No horizontal scrolling

### Mobile View

- [ ] **Layout responsive at 375px (iPhone)**
  - Select iPhone SE
  - Widgets should stack vertically (1 column)
  - All buttons should be touchable (44px minimum)
  - Text should be readable (16px minimum)
  - No horizontal scrolling on body

- [ ] **Mobile-specific issues**
  - Touch interactions work
  - Modals fit on screen
  - Forms are usable on mobile
  - Navigation is accessible

---

## 🔒 SECTION 7: SECURITY & ENVIRONMENT (10 min)

### Environment Variables

- [ ] **Check .env file exists**
  ```bash
  cd C:\Users\marcr\Desktop\AKIRA\akira-saas
  ls -la .env
  ```
  - Should exist (not empty)

- [ ] **Supabase credentials set**
  - .env should contain:
    - [ ] `VITE_SUPABASE_URL=...`
    - [ ] `VITE_SUPABASE_ANON_KEY=...`

- [ ] **Google AI Key set** (for agents)
  - .env should contain:
    - [ ] `VITE_GOOGLE_AI_KEY=...`
  - If missing, agents will fail
  - Add it if you want to test automation

- [ ] **.env is git-ignored**
  - Run: `git status`
  - .env should NOT be listed in changes
  - Should see in .gitignore

### Console Security

- [ ] **No sensitive data in console**
  - DevTools > Console
  - Should NOT see:
    - [ ] API keys
    - [ ] Tokens
    - [ ] User passwords
    - [ ] Database credentials

- [ ] **No CSP violations**
  - Should NOT see messages about:
    - [ ] Content Security Policy
    - [ ] Blocked resources
    - [ ] Unsafe-inline violations

---

## ⚡ SECTION 8: PERFORMANCE (10 min)

### Bundle Size

- [ ] **Build completes**
  - Run: `npm run build`
  - Should complete without errors
  - Should show size summary

- [ ] **Bundle size reasonable**
  - Check build output for dist/ size
  - Should be under 2MB (with new modules ~2.5MB acceptable)

- [ ] **No performance warnings**
  - Build should NOT show:
    - [ ] Chunk size warning (unless expected)
    - [ ] Memory leaks
    - [ ] Slow imports

### Runtime Performance

- [ ] **Dashboard loads quickly**
  - DevTools > Network tab
  - Initial page load < 3 seconds
  - Widgets appear without lag

- [ ] **Automation page loads quickly**
  - Navigate to /automation
  - Page appears in < 1 second
  - Templates render smoothly

- [ ] **No memory leaks**
  - DevTools > Memory tab
  - Take heap snapshot
  - Close/reopen pages
  - Memory should not continuously grow

---

## 🧪 SECTION 9: FEATURE INTEGRATION TESTS (15 min)

### Dashboard + Widgets

- [ ] **Existing Dashboard content still works**
  - Scroll down on Dashboard
  - Should see:
    - [ ] Attention section
    - [ ] Opportunities section
    - [ ] KPI cards
    - [ ] Revenue chart
    - [ ] Forecast card
    - [ ] Quick actions
    - [ ] Upcoming projects
    - [ ] Activity feed

- [ ] **Widgets don't break existing features**
  - Add widgets
  - Navigate away and back
  - Dashboard should still render
  - No infinite loops or hanging

### Navigation

- [ ] **All sidebar links work**
  - Click each link in sidebar:
    - [ ] Inicio
    - [ ] Centro de mando (Dashboard)
    - [ ] Clientes
    - [ ] Proyectos
    - [ ] Calendario
    - [ ] Tiempo
    - [ ] Finanzas
    - [ ] Brain
    - [ ] Automation ⭐
    - [ ] Conocimiento
    - [ ] Settings

- [ ] **No broken links**
  - Each page should load
  - Should NOT see 404 or error pages

### Sync Integration

- [ ] **Sync indicators on Dashboard**
  - Check header area
  - When online: No "Modo offline" badge
  - When offline (simulated): Shows "Modo offline" badge

- [ ] **Offline mode queue works**
  - Toggle offline in DevTools
  - Try to add a widget
  - Should see "X cambios pendientes"
  - Go back online
  - Changes should sync automatically

---

## 📊 SECTION 10: DATA VERIFICATION (10 min)

### Supabase Data Check

- [ ] **Dashboards table has data**
  - Supabase > Table: dashboards
  - Should have at least 1 row after adding widgets
  - Should show user_id, org_id, config, etc.

- [ ] **Dashboard widgets table has data**
  - Supabase > Table: dashboard_widgets
  - Should have rows for each widget you added
  - Should show widget_type, size, position, etc.

- [ ] **Workflows table is ready**
  - Supabase > Table: workflows
  - Should be empty initially (no rows)
  - Structure looks correct

- [ ] **Workflow executions table is ready**
  - Supabase > Table: workflow_executions
  - May have rows if you executed workflows
  - Should show status, progress, etc.

- [ ] **Agent logs table is ready**
  - Supabase > Table: agent_logs
  - May have rows if agents executed
  - Should show agent_name, input, output, etc.

---

## 🎯 SECTION 11: FINAL VALIDATION (10 min)

### Code Quality

- [ ] **No console errors**
  - DevTools > Console
  - Should be clean (no red errors)
  - Warnings are OK

- [ ] **No TypeScript errors**
  - Terminal should show no TS errors
  - If using IDE, should show no squiggly underlines

- [ ] **All imports resolve**
  - Should NOT see module not found errors
  - Should NOT see path resolution errors

### User Experience

- [ ] **No infinite loading spinners**
  - Dashboard should load completely
  - Automation page should load completely
  - Widgets should appear without hanging

- [ ] **Button interactions work**
  - All buttons clickable
  - Modals open and close
  - Forms submit without errors

- [ ] **Animations are smooth**
  - Widget appear/disappear smoothly
  - No jank or stuttering
  - Transitions feel polished

---

## ✨ SECTION 12: DEPLOYMENT VERIFICATION (5 min)

### Production URL Testing

- [ ] **Visit production URL**
  - Open: https://akira-saas-five.vercel.app
  - Page should load in < 3 seconds
  - Should see Dashboard

- [ ] **Login works on production**
  - If redirected to login
  - Should be able to log in
  - Should see Dashboard after login

- [ ] **Dashboard widgets on production**
  - Click "Mostrar widgets"
  - Should see widgets appear
  - Should work same as local

- [ ] **Automation page on production**
  - Navigate to /automation
  - Page should load
  - Templates should be visible

- [ ] **Mobile works on production**
  - DevTools > Device toolbar > iPhone
  - Should be responsive
  - Should be usable on mobile

---

## 🚨 SECTION 13: KNOWN ISSUES & NOTES

### Expected Behavior

- [ ] **Google AI Key required for agents**
  - If not set, agents will fail
  - Automation page still works
  - Workflows don't execute without key

- [ ] **Database migrations required**
  - If migrations not applied:
    - Widgets won't save
    - Automation workflows won't save
  - This is CRITICAL

### Acceptable Warnings

- [ ] **Build warnings about esbuild/oxc**
  - This is expected
  - Does not affect functionality
  - Can be ignored for now

- [ ] **NPM audit vulnerabilities**
  - These exist in dependencies
  - Monitor but not blocking for v2.0

---

## ✅ FINAL CHECKLIST SUMMARY

### Critical Items (Must Complete)

- [ ] Git commit exists and is pushed
- [ ] Vercel deployment is live
- [ ] Supabase migrations applied
- [ ] Database tables created
- [ ] Dev server runs without errors

### Feature Items (Should Work)

- [ ] Dashboard loads with widgets
- [ ] Can add/remove widgets
- [ ] Can drag-drop widgets
- [ ] Automation page accessible
- [ ] Can run workflows
- [ ] Offline mode works
- [ ] Mobile responsive

### Quality Items (Should Verify)

- [ ] No console errors
- [ ] No network errors
- [ ] No infinite loops
- [ ] Performance acceptable
- [ ] All links work

### Production Items (Verify Live)

- [ ] Production URL responds
- [ ] Dashboard works on production
- [ ] Automation works on production
- [ ] Mobile works on production

---

## 📝 ISSUES FOUND & RESOLUTION

If you find issues, note them here:

```
Issue 1: [Description]
- Steps to reproduce: [Steps]
- Expected: [What should happen]
- Actual: [What actually happens]
- Resolution: [How to fix]

Issue 2: [Description]
- ...
```

---

## 🎉 SIGN-OFF

When all items are checked:

**Status:** ✅ VERIFIED  
**Date Completed:** [Today's date]  
**Verified By:** [Your name]  
**Notes:** [Any additional notes]  

---

## 📞 SUPPORT

If you find issues during verification:

1. **Check the INTEGRATION_GUIDE.md** for step-by-step setup
2. **Check the MODULES_SUMMARY.md** for module details
3. **Check the IMPLEMENTATION_COMPLETE.md** for full breakdown
4. **Check browser console** for specific error messages
5. **Check Supabase logs** for database errors

---

**AKIRA v2.0 Verification Checklist Complete!**

When all items above are ✅, you're ready to announce v2.0 launch! 🚀
