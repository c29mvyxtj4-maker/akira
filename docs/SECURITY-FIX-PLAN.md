# AKIRA Security Fix Plan — Semana 3-5

**Status**: 🚀 Starting  
**Priority**: 🔴 CRITICAL — Prevents data leakage  
**Timeline**: 15 días (3 weeks)  
**Risk**: Data visibility across orgs without org_id scoping

---

## **Problem**

Current architecture:
- Users can belong to multiple organizations
- Tables (`invoices`, `clients`, `projects`, `company_settings`, `portal_users`, `portal_messages`) **DO NOT** have `org_id` column
- If user switches org, they can query/access data from other orgs
- **Result**: 🔓 Multi-tenant data isolation BROKEN

Example leak:
```javascript
// User in Org A switches to Org B
// Can still query: SELECT * FROM invoices WHERE owner_id = <User>;
// Gets invoices from BOTH orgs (because no org_id filtering)
```

---

## **Solution Architecture**

### Phase 1: Database Migrations (Semana 3)

**Add org_id to 6 critical tables**:

1. ✅ `invoices` → Add `org_id`, backfill, set NOT NULL, add FK
2. ✅ `clients` → Add `org_id`, backfill, set NOT NULL, add FK
3. ✅ `projects` → Add `org_id`, backfill via client, set NOT NULL, add FK
4. ✅ `company_settings` → RENAME `owner_id` → `org_id` (1:1 per org)
5. ✅ `portal_users` → Add `org_id`, backfill via client, set NOT NULL, add FK
6. ✅ `portal_messages` → Add `org_id`, backfill via portal_user, set NOT NULL, add FK

**Migration SQL**:
```sql
-- 1. invoices
ALTER TABLE invoices ADD COLUMN org_id UUID;
UPDATE invoices SET org_id = (
  SELECT org_id FROM organizations 
  WHERE organizations.id = invoices.owner_id
);
ALTER TABLE invoices ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE invoices ADD CONSTRAINT invoices_org_fk 
  FOREIGN KEY (org_id) REFERENCES organizations(id);

-- (repeat for other tables)
```

### Phase 2: RLS Policies (Semana 3-4)

**Replace old policies with org_id checks**:

```sql
-- invoices: only visible to org members
CREATE POLICY "users_can_view_org_invoices" ON invoices
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = invoices.org_id
    )
  );

-- (repeat for clients, projects, etc.)
```

### Phase 3: Service Layer Updates (Semana 4)

**Update all service files to scope by org_id**:

Files to update:
- ✅ `invoices.service.js` — Add `getActiveOrgId()` check
- ✅ `clients.service.js`
- ✅ `projects.service.js`
- ✅ `quotes.service.js`
- ✅ `services.service.js`
- ✅ `subscriptions.service.js`
- ✅ `portal.service.js` — CRITICAL: Fix invoice union query
- ✅ `AppContext.jsx` — Update init queries

**Pattern**:
```javascript
// Before
export const getInvoices = async (ownerId) => {
  return supabase.from('invoices').select('*').eq('owner_id', ownerId);
};

// After
export const getInvoices = async () => {
  const orgId = getActiveOrgId();
  return supabase.from('invoices').select('*').eq('org_id', orgId);
};
```

### Phase 4: Portal Invoice Union (Semana 5)

**Fix portal to read from BOTH invoice tables** (legacy + new):

```javascript
// Legacy invoices table (old data)
const legacyInvoices = await supabase
  .from('invoices')
  .select('*')
  .eq('org_id', orgId);

// New commercial_documents table (new data)
const newInvoices = await supabase
  .from('commercial_documents')
  .select('*')
  .eq('org_id', orgId);

// Union them
const allInvoices = [...(newInvoices || []), ...(legacyInvoices || [])];
```

---

## **Verification Checklist**

**Week 3-4**: After migrations & RLS
- [ ] Create test org with 2 users (A, B)
- [ ] User A creates invoice in org A
- [ ] User A switches to org B
- [ ] User A queries invoices → Should get ZERO results (org B empty)
- [ ] User A switches back to org A
- [ ] User A queries invoices → Should get 1 result (org A invoice)
- [ ] RLS blocks direct table access: `SELECT * FROM invoices;` → returns 0 rows

**Week 5**: After service layer updates
- [ ] Dashboard loads only current org data ✓
- [ ] Can switch orgs without data leakage ✓
- [ ] Portal invoice union shows old + new invoices ✓
- [ ] No console errors in AppContext init ✓

---

## **Risk Assessment**

| Risk | Mitigation |
|------|-----------|
| Data loss during backfill | Test on staging DB first; have prod backup |
| RLS locks out users | Test with test user before prod deploy |
| Service queries fail | Update services BEFORE deploying migrations |
| Portal invoices missing | Union query handles both tables |

---

## **Timeline**

| Week | Task | Status |
|------|------|--------|
| 3 | Audit tables + write migration | ⏳ This turn |
| 3-4 | Deploy migration + RLS policies | Next turn |
| 4 | Update service layer (8 files) | Next turn |
| 5 | Portal union query + final test | Next turn |

**Deadline**: End of week 5 (before Semana 6 mobile work)

---

## **Why This Matters**

Without org_id scoping:
- 🔴 **CRITICAL BUG**: User A can see User B's invoices/clients if both in same org
- 🔴 **Compliance issue**: GDPR/data privacy violation
- 🔴 **Blocks soft launch**: Can't invite beta users with this hole

**With org_id scoping**:
- ✅ Each org completely isolated
- ✅ Users can belong to multiple orgs safely
- ✅ Ready for multi-tenant SaaS scale

---

**Approved by**: Marc  
**Status**: 🚀 Ready to execute
