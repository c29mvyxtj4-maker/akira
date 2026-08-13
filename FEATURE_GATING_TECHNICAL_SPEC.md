# Feature Gating Technical Specification
**For:** Frontend Developer  
**Scope:** Implement pricing tiers + paywall logic  
**Timeline:** Week of Aug 19 (start Monday, should be complete by Friday)  
**Effort:** Medium (5-8 dev days)

---

## Overview

AKIRA has 3 pricing tiers with specific feature limits and locks. The developer needs to:

1. **Determine user's plan** → fetch from Supabase `subscriptions` table or context
2. **Gate features** → show "locked" UI if feature unavailable for plan
3. **Enforce hard caps** → prevent database writes if limit exceeded
4. **Track usage** → log feature usage for analytics (future: upsell signals)

---

## Database Schema (Supabase)

### `subscriptions` Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  plan TEXT NOT NULL, -- 'starter' | 'professional' | 'enterprise'
  status TEXT NOT NULL, -- 'trial' | 'active' | 'paused' | 'canceled'
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Add RLS: Users can only see their own org's subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_see_own_org_subscription"
  ON subscriptions
  FOR SELECT
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

### Extend `organizations` Table (if not already)

```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_seats_used INT DEFAULT 1;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_projects_used INT DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_clients_used INT DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_storage_used_bytes INT DEFAULT 0;
```

---

## Plan Definitions (TypeScript)

Create `src/types/plans.ts`:

```typescript
export type PlanType = 'starter' | 'professional' | 'enterprise';

export const PLAN_LIMITS = {
  starter: {
    seats: 1,
    projects: 3,
    clients: 5,
    storage_gb: 5,
    invoices_per_month: 10,
    ai_enabled: false,
    integrations_enabled: false,
    client_portal: false,
    time_tracking_advanced: false,
    stripe_payments: false,
    document_count: 50,
  },
  professional: {
    seats: 5,
    projects: Infinity,
    clients: Infinity,
    storage_gb: 100,
    invoices_per_month: Infinity,
    ai_enabled: true,
    integrations_enabled: true,
    client_portal: true,
    time_tracking_advanced: true,
    stripe_payments: true,
    document_count: Infinity,
  },
  enterprise: {
    seats: Infinity,
    projects: Infinity,
    clients: Infinity,
    storage_gb: Infinity,
    invoices_per_month: Infinity,
    ai_enabled: true,
    integrations_enabled: true,
    client_portal: true,
    time_tracking_advanced: true,
    stripe_payments: true,
    document_count: Infinity,
  },
};

export const PLAN_FEATURES = {
  starter: ['dashboard', 'clients', 'projects', 'invoicing_basic', 'time_basic', 'knowledge_limited'],
  professional: [
    'dashboard', 'clients', 'projects', 'invoicing', 'time_advanced', 
    'knowledge', 'ai_brain', 'smart_actions', 'client_portal', 'integrations'
  ],
  enterprise: [
    'everything_in_professional', 'sso', 'audit_logs', 'custom_integrations', 
    'api_access', 'dedicated_support', 'custom_agents'
  ],
};
```

---

## Implementation Patterns

### Pattern 1: Feature Gate Component (React)

```typescript
// src/components/PlanGate.tsx
import { useOrg } from '@/context/OrgContext';
import { PLAN_LIMITS } from '@/types/plans';

interface PlanGateProps {
  feature: keyof typeof PLAN_LIMITS.professional;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PlanGate({ feature, children, fallback }: PlanGateProps) {
  const { currentOrg } = useOrg();
  const plan = currentOrg?.subscription?.plan || 'starter';
  const isUnlocked = PLAN_LIMITS[plan][feature];

  if (!isUnlocked) {
    return (
      fallback ?? (
        <div className="border border-amber-500 bg-amber-50 p-4 rounded-lg">
          <p className="text-sm text-amber-900 font-medium">
            {feature} is only available on Professional and Enterprise plans
          </p>
          <button 
            onClick={() => navigate('/pricing')}
            className="mt-2 px-4 py-2 bg-amber-600 text-white text-sm rounded"
          >
            View Plans
          </button>
        </div>
      )
    );
  }

  return <>{children}</>;
}
```

**Usage:**
```tsx
<PlanGate feature="ai_enabled">
  <AIBrainWidget />
</PlanGate>
```

### Pattern 2: Hard Cap Enforcement

```typescript
// In the service layer (e.g., projects.service.js)
export async function createProject(projectData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get org + plan info
  const { data: org } = await supabase
    .from('organizations')
    .select('plan, plan_projects_used')
    .eq('id', user.org_id)
    .single();

  const projectLimit = PLAN_LIMITS[org.plan].projects;
  
  // HARD CAP: Reject if at limit
  if (org.plan_projects_used >= projectLimit) {
    throw new Error(
      `Project limit (${projectLimit}) reached. Upgrade to Professional.`
    );
  }

  // Create project
  const { data: project } = await supabase
    .from('projects')
    .insert({
      name: projectData.name,
      org_id: user.org_id,
      // ... other fields
    })
    .select()
    .single();

  // Update usage counter
  await supabase
    .from('organizations')
    .update({ plan_projects_used: org.plan_projects_used + 1 })
    .eq('id', user.org_id);

  return project;
}
```

### Pattern 3: Soft Cap Warning (for throttled features)

```typescript
// For invoices (Starter max 10/mo)
export async function createInvoice(invoiceData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: org } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', user.org_id)
    .single();

  if (org.plan === 'starter') {
    // Count invoices created THIS month
    const monthStart = new Date();
    monthStart.setDate(1);
    
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('org_id', user.org_id)
      .gte('created_at', monthStart.toISOString());

    if (count >= 10) {
      // Show warning but allow (soft cap)
      showWarning('You've reached 10 invoices this month on Starter. Consider upgrading to Professional for unlimited.');
      // Still allow creation but log it
    }
  }

  // Create invoice...
}
```

### Pattern 4: UI Paywall Modal

```typescript
// src/components/UpgradeModal.tsx
export function UpgradeModal({ feature, onClose, plan }) {
  const missingPlan = plan === 'starter' ? 'professional' : 'enterprise';
  
  return (
    <Modal open onClose={onClose}>
      <div className="p-6 max-w-md">
        <h2 className="text-lg font-bold mb-2">Upgrade to {missingPlan} Plan</h2>
        <p className="text-gray-600 mb-4">
          {feature} requires a {missingPlan === 'professional' ? 'Professional' : 'Enterprise'} 
          plan. Upgrade now to unlock unlimited features.
        </p>
        
        <div className="bg-gray-100 p-4 rounded mb-4">
          <div className="text-2xl font-bold text-blue-600">
            ${missingPlan === 'professional' ? '$99' : 'Custom'}
          </div>
          <div className="text-sm text-gray-600">per month</div>
        </div>

        <button 
          onClick={() => {
            navigate('/settings?tab=billing');
            onClose();
          }}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium"
        >
          See Pricing
        </button>
      </div>
    </Modal>
  );
}
```

---

## Features to Gate (from Feature Matrix)

### HARD CAPS (Cannot exceed)

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|-----------|
| Projects | 3 | Unlimited | Unlimited |
| Clients | 5 | Unlimited | Unlimited |
| Team Members | 1 | 5 | Unlimited |
| Storage | 5 GB | 100 GB | Unlimited |
| Invoices/month | 10 | Unlimited | Unlimited |
| Documents | 50 | Unlimited | Unlimited |

**Implementation:** Enforce in service layer before database write. Return error if exceeded.

### FEATURE TOGGLES (All or nothing)

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|-----------|
| AI Brain | NO | YES | YES |
| Smart Actions | NO | YES | YES |
| Client Portal | NO | YES | YES |
| Stripe Payments | NO | YES | YES |
| Time Tracking (advanced) | NO | YES | YES |
| Integrations (Slack, Zapier, etc.) | NO | YES | YES |
| SSO / Audit Logs | NO | NO | YES |
| Custom Integrations / API | NO | NO | YES |

**Implementation:** 
- Conditionally render UI component
- Use `PlanGate` wrapper
- Show paywall modal on click if feature locked

### SOFT CAPS (Warn, allow)

| Feature | Starter | Professional |
|---------|---------|--------------|
| Invoices (per month) | 10 | Unlimited |
| Documents | 50 | Unlimited |

**Implementation:** Count usage in current month, show warning at 80%, allow at 100% with notice.

---

## Implementation Checklist

### Week of Aug 19

**Monday-Tuesday (Aug 19-20):**
- [ ] Add `subscriptions` table to Supabase
- [ ] Update `organizations` table with usage counters
- [ ] Create `plans.ts` with PLAN_LIMITS + PLAN_FEATURES
- [ ] Implement `PlanGate` wrapper component
- [ ] Add `getPlan()` helper function to context

**Wednesday-Thursday (Aug 21-22):**
- [ ] Add hard cap checks to services:
  - `projects.service.js` — max 3/5/unlimited projects
  - `clients.service.js` — max 5/unlimited clients
  - `invoices.service.js` — max 10/unlimited per month
  - `knowledge.service.js` — max 50 docs/unlimited
  
- [ ] Add feature toggles to components:
  - `AIBrain.jsx` — gate with PlanGate
  - `SmartActions.jsx` — gate with PlanGate
  - `ClientPortal.jsx` — gate with PlanGate
  - `IntegrationsList.jsx` — gate with PlanGate
  - `TimeTracking.jsx` — gate advanced features

**Friday (Aug 23):**
- [ ] Test all gates with different plan levels (use test accounts)
- [ ] Test paywall modals (upgrade CTA works)
- [ ] Test hard caps (verify error message on exceed)
- [ ] Test soft caps (verify warning message)
- [ ] Update settings page → "Current Plan" badge
- [ ] Prepare for beta: provision test accounts for beta customers

### Testing Plan

**Scenario 1: Starter Plan User tries to create 4th project**
```
Expected: Error modal "Project limit (3) reached. Upgrade to Professional."
```

**Scenario 2: Professional User clicks on Custom Agents**
```
Expected: Paywall modal "Custom agents available on Enterprise plan."
```

**Scenario 3: Starter User creates 10 invoices**
```
Expected: 10th invoice succeeds, but warning: "Upgrade for unlimited invoicing"
```

---

## API/Webhook for Stripe (Not Week 1, but plan ahead)

When payment is confirmed, Stripe webhook should:

```typescript
// Pseudo-code: handle Stripe webhook
supabase
  .from('subscriptions')
  .update({
    plan: stripePriceToName(event.data.object.items[0].price_id),
    stripe_subscription_id: event.data.object.id,
    status: 'active',
  })
  .eq('org_id', orgId);

// Clear usage counters on upgrade (if desired)
supabase
  .from('organizations')
  .update({
    plan: stripePriceToName(...),
    plan_projects_used: 0, // or keep existing
  })
  .eq('id', orgId);
```

---

## Notes for Developer

1. **Async Context:** Ensure `useOrg()` hook has plan data loaded before rendering gated components. Use `<Suspense>` if needed.

2. **Hard vs Soft:** Hard caps = throw error + prevent action. Soft caps = show warning + allow action. Be clear which is which.

3. **UX:** When a user hits a limit, show:
   - Clear message (what limit + current plan)
   - CTA button linking to `/pricing` or `/settings?tab=billing`
   - Option to contact sales (for Enterprise)

4. **Future:** Track feature usage in a `feature_usage_log` table for analytics + upsell signals (e.g., "User at 80% of project limit → offer Professional upgrade").

5. **Backward Compat:** Any org created before pricing goes live defaults to `plan: 'professional'` or gets a 30-day trial.

---

## Questions?

If unclear on any feature gate:
1. Check the Feature Matrix (matrix artifact)
2. Ask PM for clarification before building
3. Default: if not explicitly listed as available, it's locked

---

**Prepared by:** Product Manager  
**For:** Frontend Developer  
**Status:** Ready to implement  
**Deadline:** Friday Aug 23  

Good luck! This is critical path for Week 2 launch. 🚀
