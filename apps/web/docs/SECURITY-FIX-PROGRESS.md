# AKIRA Security Fix — Progress Report

**Date**: 2026-08-02  
**Phase**: Semana 3 (Phase 1-2 of 4)  
**Status**: ✅ In Progress

---

## What's Done ✅

### Week 1: Database Migrations Created

1. ✅ **Migration 1: Add org_id columns**
   - File: `supabase/migrations/20260802000001_add_org_id_to_core_tables.sql`
   - Tables updated: invoices, clients, projects, portal_users, portal_messages, company_settings
   - Backfill logic: Maps ownership to organizations via relationships
   - Indexes: Added for performance (idx_*_org_id on each table)
   - Foreign keys: Added with ON DELETE CASCADE

2. ✅ **Migration 2: RLS Policies**
   - File: `supabase/migrations/20260802000002_rls_org_policies.sql`
   - Policies: CRUD policies for all 6 tables checking org_members membership
   - Coverage: SELECT, INSERT, UPDATE, DELETE on each table
   - Security: Only users in org can access org data

### Week 2: Service Layer Updates (2 of 8 critical services)

**✅ COMPLETED:**
- `src/services/invoices.service.js` 
  - ✅ Added imports: `getActiveOrgId`, `scopeToOrg`
  - ✅ Added `getOrgId()` helper
  - ✅ Updated `getInvoices()` — add scopeToOrg
  - ✅ Updated `getInvoiceById()` — scoped query
  - ✅ Updated `createInvoice()` — insert with org_id, use org_id_explicit for company_settings
  - ✅ Updated `updateInvoice()` — scoped update
  - ✅ Updated `updateInvoiceStatus()` — scoped update
  - ✅ Updated `archiveInvoice()` — scoped update

- `src/services/clients.service.js`
  - ✅ Added imports: `getActiveOrgId`, `scopeToOrg`
  - ✅ Added `getOrgId()` helper
  - ✅ Updated `getClients()` — add scopeToOrg
  - ✅ Updated `getClientById()` — scoped query
  - ✅ Updated `createClient()` — insert with org_id
  - ✅ Updated `updateClient()` — scoped update
  - ✅ Updated `archiveClient()` — scoped update

**⏳ REMAINING (6 critical services):**
- [ ] `src/services/projects.service.js` — 6 functions
- [ ] `src/services/quotes.service.js` — 4 functions
- [ ] `src/services/services.service.js` — 3 functions
- [ ] `src/services/subscriptions.service.js` — 5 functions
- [ ] `src/services/portal.service.js` — **CRITICAL** union query for invoices
- [ ] `src/context/AppContext.jsx` — init queries (finance_entries, services)

---

## Documentation Created ✅

1. **SECURITY-FIX-PLAN.md** — Overall 3-week plan, phases, risk assessment
2. **SERVICE-LAYER-AUDIT.md** — Detailed list of 14 services needing updates
3. **SECURITY-FIX-PROGRESS.md** — This file, tracking execution

---

## Next Steps (Remaining 5 Days of Semana 3)

### Day 3-4: Complete Service Layer
- [ ] Update `projects.service.js` (may be split across multiple files)
- [ ] Update `quotes.service.js`
- [ ] Update `services.service.js`
- [ ] Update `subscriptions.service.js`
- [ ] Update `portal.service.js` — CRITICAL: Add union query for both invoice tables
- [ ] Update `AppContext.jsx` — Scope all init queries

### Day 5: Testing on Staging
- [ ] Deploy migrations to Supabase staging
- [ ] Verify RLS policies block cross-org access
- [ ] Test portal invoice union query shows both old + new
- [ ] Smoke test: create org, add user, create data, verify isolation

---

## Deployment Checklist

**Before deploying to production**:

1. [ ] All 8 service files updated + tested locally
2. [ ] No console errors on getInvoices, getClients, etc.
3. [ ] Test org switching — data should disappear when switching orgs
4. [ ] Migrations tested on staging Supabase
5. [ ] Portal shows both old `invoices` and new `commercial_documents` invoices
6. [ ] RLS policies allow authenticated users in org to read/write
7. [ ] RLS policies block users from other orgs

---

## Timeline Summary

| Week | Phase | Task | Status |
|------|-------|------|--------|
| 3 | 1 | Migrations + service layer (invoices, clients) | 🟡 50% |
| 3-4 | 2 | Service layer (remaining 6) + testing | ⏳ Pending |
| 5 | 3 | Portal union query + final test | ⏳ Pending |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Queries return 0 rows | Defensive pattern: if no org_id, don't apply filter; RLS still blocks |
| Existing users can't login | org_id was backfilled from existing ownership; should work immediately |
| Portal breaks | Union query handles both tables; old data stays readable |
| Performance impact | Added indexes (idx_*_org_id) on each table for quick lookups |

---

## Notes for Marc

✅ **Vercel deployed** — App is live at https://akira-saas-five.vercel.app

🔒 **Security critical** — This fix prevents data leakage across organizations. Must be done before soft launch.

📊 **No downtime needed** — Can deploy migrations and RLS without restarting app. Services will start using org_id immediately.

🧪 **Easy to test** — Create 2 test orgs, switch between them, verify data isolation.

---

**Deadline**: End of Semana 5 (2026-08-16)  
**Next**: Update remaining 6 services → Portal union query → Production deployment
