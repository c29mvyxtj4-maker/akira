# AKIRA Pricing Model

**Effective Date**: 2026-08-01  
**Target Market**: Marketing agencies (1-5 people, EU/ES)  
**Billing**: Monthly + Annual (with discount)

---

## 3-Tier Pricing Structure

### TIER 1: STARTER — $29/month

**Best for**: Solo freelancers or micro agencies just starting out

**Includes**:
- ✅ 1 user account
- ✅ Up to 5 clients
- ✅ CRM (client management, contact history)
- ✅ Projects (kanban board, basic tasks)
- ✅ Invoicing (create, send, track paid/unpaid)
- ✅ Client portal (share links, no password)
- ✅ Email support

**Does NOT include**:
- ❌ APIs or webhooks
- ❌ Zapier/Make integrations
- ❌ Advanced reporting/analytics
- ❌ Time tracking
- ❌ Custom branding

**Monthly**: $29/month  
**Annual**: $261/year (10 months paid, 2 free) — **saves 10%**

---

### TIER 2: PROFESSIONAL — $79/month

**Best for**: Growing marketing agencies (2-5 people) with multiple clients

**Includes**:
- ✅ 3 user accounts
- ✅ Unlimited clients
- ✅ Everything from Starter PLUS:
- ✅ Time tracking (log hours per project/client)
- ✅ Basic reporting (revenue by client, project margin)
- ✅ Team collaboration (invite members, assign projects)
- ✅ Zapier/Make integrations
- ✅ API access (build custom integrations)
- ✅ Priority email support (24h response)

**Does NOT include**:
- ❌ Advanced analytics (forecasting, burndown)
- ❌ White-label (custom branding)
- ❌ Dedicated account manager
- ❌ Custom workflows/automation

**Monthly**: $79/month  
**Annual**: $711/year (10 months paid, 2 free) — **saves 10%**

---

### TIER 3: ENTERPRISE — $199+/month

**Best for**: Established agencies or teams needing full customization

**Includes**:
- ✅ 5+ user accounts (can add more at $10/user/month)
- ✅ Unlimited everything
- ✅ Everything from Professional PLUS:
- ✅ Advanced analytics (revenue forecasting, profit margins, project burn rate)
- ✅ Custom workflows & automation (Zapier recipes pre-built)
- ✅ White-label option (custom branding, white-label portal)
- ✅ Dedicated Slack channel with Marc for support
- ✅ Monthly strategy calls (how to use AKIRA better)
- ✅ Custom integrations (we build them for you)
- ✅ SLA guarantee (99.5% uptime)

**Custom pricing based on**:
- Number of additional team members needed
- Custom integration complexity
- On-premise or self-hosted option

**Monthly**: Starting at $199/month, custom quote  
**Annual**: Negotiable (typically 15-20% discount for committed contracts)

---

## Billing Strategy

### Monthly Billing
- Charged on the same day each month
- Can cancel anytime (no lock-in)
- Best for: Users wanting flexibility

### Annual Billing (Recommended)
- Pay for 10 months, get 2 free (10% discount)
- Auto-renews unless cancelled
- Best for: Users committing to using AKIRA
- Example: Pay $261 now, get 12 months of Starter

**Discount Rationale**: 
- Reduces churn (committed users stay longer)
- Improves cash flow (get cash upfront)
- Builds reciprocal loyalty (you invest, we invest in your success)

---

## Feature Comparison Table

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|-----------|
| **Users** | 1 | 3 | 5+ |
| **Clients** | 5 | Unlimited | Unlimited |
| **CRM** | ✅ | ✅ | ✅ |
| **Projects** | ✅ Basic | ✅ Full | ✅ Full |
| **Invoicing** | ✅ | ✅ | ✅ |
| **Time Tracking** | ❌ | ✅ | ✅ |
| **Basic Reports** | ❌ | ✅ | ✅ |
| **Advanced Analytics** | ❌ | ❌ | ✅ |
| **APIs** | ❌ | ✅ | ✅ |
| **Integrations (Zapier)** | ❌ | ✅ | ✅ |
| **White-Label** | ❌ | ❌ | ✅ |
| **Custom Integrations** | ❌ | ❌ | ✅ |
| **Dedicated Support** | Email | Priority Email | Slack + calls |
| **SLA** | Best effort | 99% uptime | 99.5% uptime |

---

## Stripe Configuration

### Products Created:
1. **AKIRA Starter**
   - Price ID (monthly): `price_1Starter_monthly`
   - Price ID (annual): `price_1Starter_annual`
   - Amount: $29/month or $261/year

2. **AKIRA Professional**
   - Price ID (monthly): `price_1Pro_monthly`
   - Price ID (annual): `price_1Pro_annual`
   - Amount: $79/month or $711/year

3. **AKIRA Enterprise**
   - Price ID (monthly): `price_1Enterprise_monthly`
   - Amount: $199/month (custom annual pricing)

**Billing Cycle**:
- Monthly: Automatically renews every 30 days
- Annual: Automatically renews every 365 days

**Payment Methods**: 
- Credit card (Visa, Mastercard, Amex)
- SEPA transfer (for EU customers)

---

## Go-to-Market Strategy

### Phase 1: Private Beta (Week 9-10)
- Offer: **Free for 3 months** to first 5-10 users
- After 3 months: Convert to lowest tier they're using (Starter default)
- Goal: Get testimonials + understand which tier resonates

### Phase 2: Public Beta (Week 11)
- Offer: **50% discount for annual prepay** (early bird)
  - Starter: $130.50/year (was $261)
  - Professional: $355.50/year (was $711)
- Lock in price for 1 year (build loyalty)
- Goal: Get 2-3 paying customers

### Phase 3: Public Launch (Month 3+)
- Full pricing (no discounts)
- Freemium option (optional, v1.1+)
- Add-ons (extra users at $10/user/month)

---

## Pricing Philosophy

**Why these prices?**

1. **Starter ($29)** — Below HubSpot CRM ($50), Freshbooks ($15), Harvest ($12)
   - Cheaper than paying for 3 tools separately (~$77 for all 3)
   - Accessible for solo freelancers
   - Enough to cover Supabase + Vercel costs (roughly)

2. **Professional ($79)** — HubSpot CRM competitive ($50-120)
   - Attracts serious agencies with revenue
   - Margin to hire support, improve product
   - Worth it for unlimited clients + time tracking

3. **Enterprise ($199+)** — Slack, Notion tier
   - Custom pricing for serious, committed customers
   - Builds relationship (support calls, custom builds)
   - LTV target: $2000-5000+ over 12 months

---

## Success Metrics

**By end of Q1 2026:**
- Target: $1,000 MRR (10-15 paying customers across tiers)
- Expected mix: 60% Starter, 30% Professional, 10% Enterprise
- CAC: $0-200 (founder-led sales initially)
- LTV: $2,000-3,000+ (2-year average customer lifetime)

---

**Approved by**: Marc Roson, Founder  
**Status**: ✅ Ready for Stripe setup + landing page  
**Next step**: Create landing page with pricing table
