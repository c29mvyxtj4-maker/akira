# Service Layer Audit — Multi-Tenant Scoping

**Status**: Phase 3 of Security Fix (Semana 4)  
**Goal**: Update all service queries to scope by org_id  
**Timeline**: 5 días  

---

## Services to Update (Priority Order)

### 🔴 CRITICAL (data access security)

#### 1. **invoices.service.js** — 8 functions
- `getInvoices()` — needs `scopeToOrg()`
- `getInvoiceById()` — verify client belongs to org
- `createInvoice()` — must link to current org
- `updateInvoice()` — verify belongs to org
- `deleteInvoice()` — verify belongs to org
- `getInvoicesByClient()` — scope by org
- Other invoice functions

**Current**: Uses `owner_id` only (user-level scoping)  
**Fix**: Add `scopeToOrg()` to all queries

#### 2. **clients.service.js** — 7 functions
- `getClients()` — needs `scopeToOrg()`
- `getClientById()` — verify belongs to org
- `createClient()` — must link to current org
- `updateClient()`, `deleteClient()` — verify org
- Portal functions

**Current**: Uses `owner_id` only  
**Fix**: Wrap with `scopeToOrg()`

#### 3. **projects.service.js** — 6 functions
- `getProjects()` — needs `scopeToOrg()`
- `getProjectById()` — verify org
- `createProject()` — link to org
- `updateProject()`, `deleteProject()` — verify org
- Kanban queries

**Current**: May use `owner_id` or client-based filtering  
**Fix**: Use `scopeToOrg()` with projects table

#### 4. **quotes.service.js** — 4 functions
- `getQuotes()` — scope by org
- `createQuote()`, `updateQuote()`, `deleteQuote()`

**Current**: May lack org scoping  
**Fix**: Apply `scopeToOrg()`

#### 5. **services.service.js** — 3 functions
- `getServices()` — scope by org
- `createService()`, `updateService()`

**Current**: May be missing org scope  
**Fix**: Apply `scopeToOrg()`

#### 6. **subscriptions.service.js** — 5 functions
- `getSubscriptions()` — scope by org
- CRUD operations

**Current**: Check if using org_id  
**Fix**: Ensure all queries use `scopeToOrg()`

#### 7. **portal.service.js** — MOST CRITICAL
- `getPortalClientData()` — **MUST read both invoice tables** (legacy + commercial_documents)
- `getPortalInvoices()` — **union query**
- `getPortalUser()` — verify org
- `createPortalMessage()` — link to org

**Current**: Reads only legacy `invoices` table  
**Fix**: Add union query + org scoping

---

### 🟡 HIGH (transactional data)

#### 8. **calendar.service.js**
- Already uses `getActiveOrgId()` in some places (check if all queries use it)

#### 9. **finance.service.js**
- Uses `getActiveOrgId()` but may have edge cases
- Verify all queries scoped

#### 10. **documents.service.js**
- KB and documents may need org scope
- Check if table has org_id

#### 11. **time.service.js**
- Time tracking entries should be org-scoped
- Add org_id to table if missing

---

### 🟢 MEDIUM (configuration)

#### 12. **company.service.js**
- Get company settings for current org
- Should use company_settings.org_id_explicit

#### 13. **settings.service.js**
- Organization settings
- Should scope by org

#### 14. **org.service.js**
- Organization management
- Verify all queries correct

---

### 🔵 LOW (nice to have, less critical)

#### 15. Others
- `messages.service.js` — if user-scoped, may be OK
- `audit.service.js` — should be org-scoped for compliance
- `brain.service.js` — AI actions, verify org scope
- `kb.service.js` — Knowledge base, add org scope

---

## Pattern Template

### Before (Insecure):
```javascript
export async function getInvoices() {
  const res = await supabase
    .from('invoices')
    .select('*')
    .eq('archived', false);  // ← Only filtering archived, not org!
  if (res.error) throw res.error;
  return res.data || [];
}
```

### After (Secure):
```javascript
import { scopeToOrg } from '@/lib/activeOrg';

export async function getInvoices() {
  let query = supabase
    .from('invoices')
    .select('*')
    .eq('archived', false);
  
  query = scopeToOrg(query);  // ← Add this line
  
  const res = await query.order('issue_date', { ascending: false });
  if (res.error) throw res.error;
  return res.data || [];
}
```

---

## Verification Checklist

After updating each service:

- [ ] Import `scopeToOrg` from `@/lib/activeOrg`
- [ ] Wrap all queries with `scopeToOrg(query)`
- [ ] Test on dev: create data in org1, switch to org2, verify no data
- [ ] No console errors
- [ ] RLS policies allow/deny correctly

---

## Files to Edit (Summary)

```
✅ DONE (8 critical services):
  src/services/invoices.service.js
  src/services/clients.service.js
  src/services/projects.service.js
  src/services/quotes.service.js
  src/services/services.service.js
  src/services/subscriptions.service.js
  src/services/portal.service.js (CRITICAL: union query)
  src/context/AppContext.jsx (init queries)

⏳ LATER (6 secondary services):
  src/services/calendar.service.js (verify existing scope)
  src/services/finance.service.js (verify existing scope)
  src/services/documents.service.js
  src/services/time.service.js
  src/services/company.service.js
  src/services/settings.service.js
```

---

## Timeline

| Day | Task | Status |
|-----|------|--------|
| 1 | Update invoices + clients (top 2) | ⏳ |
| 2 | Update projects + quotes + services | ⏳ |
| 3 | Update subscriptions + portal (CRITICAL) | ⏳ |
| 4 | Update AppContext + secondary services | ⏳ |
| 5 | Test + fix edge cases | ⏳ |

---

## Risk

| Risk | Mitigation |
|------|-----------|
| Queries return 0 rows after update | Test on staging first; have rollback |
| Users can't access own org's data | RLS policies may be too strict; test with real user |
| Portal breaks (no invoices show) | Union query handles both tables |

---

**Next**: Start with `invoices.service.js` ↓
