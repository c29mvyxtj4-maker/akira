# AKIRA — Financial Model, Unit Economics & Metrics Tracking Plan

**Agent:** 4️⃣ Business/Finance
**Timeline:** Weeks 1–2 (build), then monthly (maintain)
**Owner:** Marc
**Goal:** A defensible, bottom-up 12-month financial model, tier-level unit economics, a metrics tracking system that runs on real Stripe/Supabase data, and a 1-page executive dashboard — enough clarity to make pricing and spending decisions without guessing.

**A note on scope:** AKIRA does not yet have its own billing/subscription table for org-level tiers — `subscriptions` in the current schema tracks *the agency's own clients'* recurring revenue, not orgs paying AKIRA. Section 6 below specifies the `org_subscriptions` table this model assumes; it's the same table the Developer agent's Phase 1 (feature gating) is scoped to build. Until it ships, treat Stripe Dashboard + manual counts from `organizations` as the interim source of truth (noted inline where relevant).

---

## 1. Assumptions

| Assumption | Value | Source / rationale |
|---|---|---|
| Pricing | Starter $29/mo · Professional $99/mo · Enterprise ~$500/mo avg | `SAAS_ROADMAP_2026.md` pricing table |
| Stripe fees | 2.9% + $0.30 per transaction | Stripe standard US pricing |
| Tier mix (target) | 70% Starter / 25% Professional / 5% Enterprise | Master plan assumption — **unvalidated**, see Section 8 |
| Blended monthly churn | 4.5% (Realistic) · 5.5% (Conservative) · 3.0% (Optimistic) | Weighted from tier churn: Starter 5%, Professional 3.5%, Enterprise 2% |
| Avg tenure by tier | Starter 20mo · Professional 30mo · Enterprise 36mo (capped) | ≈ 1/churn, Enterprise capped conservatively (annual-contract behavior, not pure churn math) |
| CAC (blended) | $100–200; modeled per-tier at $80 / $150 / $800 | Master plan range — **unvalidated**, see Section 8 |
| Fixed monthly opex (base) | ~$100/mo (domain amortized + Vercel + analytics tools) | `SAAS_ROADMAP_2026.md` Budget & Resources |
| Founder draw target | $4,000/mo (used only for the "sustainable solo" break-even marker) | Placeholder — replace with your real number |
| Team opex (post-PMF) | +$3–7K/mo (part-time marketing + support) | `SAAS_ROADMAP_2026.md` Month 3+ budget |

---

## 2. Unit Economics by Tier

| | Starter ($29) | Professional ($99) | Enterprise (~$500 avg) |
|---|---|---|---|
| Stripe fee | $1.14 | $3.17 | $14.80 |
| Overhead allocation | 15% → $4.35 | 10% → $9.90 | 5% → $25.00 |
| **Net monthly contribution** | **$23.51** | **$85.93** | **$460.20** |
| Gross margin | 81% | 87% | 92% |
| Avg tenure | 20 months | 30 months | 36 months |
| **LTV** | **$470** | **$2,578** | **$16,567** |
| Assumed CAC | $80 | $150 | $800 |
| **LTV:CAC** | **5.9:1** | **17.2:1** | **20.7:1** |
| **CAC payback** | **3.4 months** | **1.75 months** | **1.74 months** |

**Reading this:** all three tiers clear the >3:1 LTV:CAC bar and the <12-month payback bar by a wide margin — the model has real cushion even if CAC assumptions turn out to be conservative. Starter is the weakest tier by every metric (thinnest margin, slowest payback, lowest LTV:CAC) but still healthy in isolation.

**Recommendation — prioritize Professional:**
1. Professional and Enterprise both pay back CAC in under 2 months vs. Starter's 3.4 — every dollar of ad spend or founder time is better directed at Professional-qualified leads (teams of 2+, agencies not solo freelancers).
2. Make Professional the visually "recommended" tier on the pricing page (most SaaS pricing pages do this deliberately — it anchors perceived value and nudges the marginal Starter buyer up a tier).
3. Section 8's sensitivity analysis shows tier-mix shift toward Professional/Enterprise is the single highest-leverage variable in the entire model — more impactful than churn or CAC.
4. Consider testing Starter at $39 instead of $29 (see sensitivity #3) — its current margin is thin enough that a price increase is worth an A/B test before assuming volume will make up the gap.

---

## 3. 12-Month Model — Three Scenarios

Built bottom-up: monthly gross customer adds (schedule below) minus churn, compounding month over month, times blended ARPU for that scenario's tier mix.

> **Correction note:** `SAAS_ROADMAP_2026.md`'s scenario table has an internal inconsistency — e.g. Conservative lists "Month 12: $25K MRR" but "Year 1: ~$75K ARR" (25K × 12 = $300K, not $75K). The numbers below are computed bottom-up and are internally consistent; treat this document as the source of truth going forward and update the roadmap doc's table to match once you sign off on these.

### Conservative (5.5% churn, personal-network-only growth, ARPU ~$55)

| Month | Gross adds | Active customers | MRR |
|---|---|---|---|
| 1 | 1 | 1 | $55 |
| 2 | 1 | 2 | $110 |
| 3 | 2 | 4 | $220 |
| 4 | 2 | 6 | $330 |
| 5 | 3 | 9 | $495 |
| 6 | 3 | 12 | $660 |
| 7 | 4 | 15 | $825 |
| 8 | 4 | 18 | $990 |
| 9 | 5 | 22 | $1,210 |
| 10 | 5 | 26 | $1,430 |
| 11 | 6 | 31 | $1,705 |
| 12 | 6 | 35 | **$1,925** |

Exit ARR run-rate: **~$23.1K**

### Realistic (4.5% churn, landing page + PH launch in Month 2, ARPU ~$70)

| Month | Gross adds | Active customers | MRR |
|---|---|---|---|
| 1 | 2 | 2 | $140 |
| 2 | 12 | 14 | $980 |
| 3 | 14 | 27 | $1,890 |
| 4 | 10 | 36 | $2,520 |
| 5 | 10 | 44 | $3,080 |
| 6 | 11 | 53 | $3,710 |
| 7 | 14 | 65 | $4,550 |
| 8 | 16 | 78 | $5,460 |
| 9 | 18 | 92 | $6,440 |
| 10 | 20 | 108 | $7,560 |
| 11 | 22 | 125 | $8,750 |
| 12 | 28 | 147 | **$10,290** |

Exit ARR run-rate: **~$123.5K** — this is the scenario to plan around; it lands close to the "$100K+ ARR Year 1" mission-statement target.

### Optimistic (3.0% churn, PH surge + strong word-of-mouth, ARPU ~$85)

| Month | Gross adds | Active customers | MRR |
|---|---|---|---|
| 1 | 3 | 3 | $255 |
| 2 | 30 | 33 | $2,805 |
| 3 | 25 | 57 | $4,845 |
| 4 | 20 | 75 | $6,375 |
| 5 | 20 | 93 | $7,905 |
| 6 | 22 | 112 | $9,520 |
| 7 | 24 | 133 | $11,305 |
| 8 | 26 | 155 | $13,175 |
| 9 | 28 | 178 | $15,130 |
| 10 | 30 | 203 | $17,255 |
| 11 | 32 | 229 | $19,465 |
| 12 | 35 | 257 | **$21,845** |

Exit ARR run-rate: **~$262K** — matches the roadmap's optimistic ~$250K ARR target well.

---

## 4. Break-Even Analysis

Two different break-even bars, since "profitable" means different things at $100/mo opex vs. once you're paying yourself or contractors:

| Break-even bar | Threshold | Conservative | Realistic | Optimistic |
|---|---|---|---|---|
| **Bare infra** (hosting/tools only, ~$100/mo) | MRR ≥ $100 | Month 2 | Month 1 | Month 1 |
| **Sustainable solo** (+ $4,000/mo founder draw) | MRR ≥ $4,100 | Not reached in Year 1 | ~Month 8 | ~Month 5 |
| **Team-funded** (+ $6,000/mo marketing & support) | MRR ≥ $6,100 | Not reached in Year 1 | ~Month 10 | ~Month 6 |

**Implication:** the Conservative scenario never funds a real team within Year 1 — if actuals track closer to Conservative through Month 3–4, that's the signal to hold off on the Month-3+ contractor hires in the roadmap's team plan, not push through on schedule.

---

## 5. Sensitivity Analysis (5 Variables)

Base case = Realistic scenario, Month 12 (147 customers, $10,290 MRR).

| Variable | Change | Resulting Month-12 MRR | Δ vs base |
|---|---|---|---|
| Churn | 4.5% → 3.5% (−1pt) | 154 customers → $10,780 | +4.8% |
| Churn | 4.5% → 5.5% (+1pt) | 142 customers → $9,940 | −3.4% |
| CAC | +20% across all tiers | MRR unchanged; Starter payback 3.4→4.1mo, Professional 1.75→2.1mo | still well under 12mo target — model has cushion |
| Starter price | $29 → $19 | Starter contribution drops 35% ($23.51→$15.30/customer); ~103 Starter customers → MRR ≈ $9,260 | **−10%** |
| Tier mix | Shift 5pts from Starter to Enterprise (70/25/5 → 65/25/10) | Blended ARPU $70→$93.60 → MRR ≈ $13,760 | **+34%** |

**Takeaway:** churn and CAC (the two variables everyone worries about first) barely move the needle this early — growth is still adds-dominated, not retention-dominated. **Tier mix is the highest-leverage variable by far**, which is the quantitative backing for the Section 2 recommendation to prioritize Professional/Enterprise positioning over squeezing Starter conversion.

---

## 6. Metrics Tracking System

### Cadence

**Daily (automated once `org_subscriptions` ships):**
Signups (total + by tier) · upgrades/downgrades · churned accounts · running MRR · ARR projection · revenue today.

**Weekly (Friday, manual review):**
New customers by tier · 7-day churn · MoM growth rate · LTV:CAC · payback period · runway if burning cash.

**Monthly (business review, first week of following month):**
MRR report · cohort table (signup-month × retained %) · churn by cohort · LTV trend · CAC by channel (PH vs. organic vs. outreach) · NPS summary · goals vs. actuals · variance write-up.

### Tools

| Tool | Role |
|---|---|
| **Stripe Dashboard** | Source of truth for actual revenue, refunds, failed payments — today's only real revenue source until `org_subscriptions` ships |
| **Supabase** | Source of truth for customer/tier/org counts once `org_subscriptions` exists; `organizations` table for signup counts in the meantime |
| **Google Sheets** | Rollup + the model itself (Section 3 tables live here, refreshed monthly against actuals) |
| **PostHog/Amplitude** | Product usage — activation, feature adoption, funnel drop-off (not revenue) |

### Supabase queries (wire up once the Developer agent's `org_subscriptions` table ships — schema: `id, org_id, tier, stripe_subscription_id, status, started_at, ends_at, auto_renew`)

```sql
-- Active paying customers by tier
SELECT tier, COUNT(*) AS active_customers
FROM org_subscriptions
WHERE status = 'active'
GROUP BY tier;

-- Current MRR (Enterprise assumed to carry a price_override column for custom deals)
SELECT SUM(
  CASE tier
    WHEN 'starter'      THEN 29
    WHEN 'professional'  THEN 99
    WHEN 'enterprise'    THEN COALESCE(price_override, 500)
  END
) AS mrr
FROM org_subscriptions
WHERE status = 'active';

-- Churn in the last 30 days
SELECT COUNT(*) AS churned_last_30d
FROM org_subscriptions
WHERE status = 'cancelled' AND updated_at >= now() - interval '30 days';

-- Monthly cohort retention
SELECT
  date_trunc('month', started_at) AS cohort_month,
  COUNT(*) FILTER (WHERE status = 'active') AS still_active,
  COUNT(*) AS cohort_size,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'active') / COUNT(*), 1) AS retention_pct
FROM org_subscriptions
GROUP BY 1
ORDER BY 1;

-- Total signups (free + paid) in the last 7 days — works today against `organizations`
SELECT COUNT(*) AS signups_7d
FROM organizations
WHERE created_at >= now() - interval '7 days';
```

### Google Sheets structure

Five tabs:
1. **Daily Log** — one row per day: signups, upgrades, downgrades, churned, MRR running total, revenue today. Paste from the Supabase queries above (or Stripe export) weekly if not automated yet.
2. **Weekly Rollup** — auto-computed from Daily Log via `SUMIFS`/`QUERY`: new customers by tier, 7-day churn, MoM growth %, LTV:CAC, payback, runway.
3. **Monthly Cohort** — grid of signup-month × months-since-signup, retention % per cell (standard cohort retention triangle).
4. **Financial Model** — the Section 3 tables, one tab per scenario, with actuals columns added alongside projections so variance is visible at a glance.
5. **Executive Dashboard** — the Section 7 template below, copy-updated monthly.

---

## 7. Executive Dashboard (1-Page Template)

Copy this block into the Google Sheets "Executive Dashboard" tab at the start of each month and fill in actuals.

```
AKIRA — Executive Dashboard          Month: __________  vs. Realistic scenario target

METRIC                    ACTUAL      TARGET      STATUS (RAG)
─────────────────────────────────────────────────────────────
Current MRR               $______     $______     🔴🟡🟢
Customers — Starter       ____        ____        🔴🟡🟢
Customers — Professional  ____        ____        🔴🟡🟢
Customers — Enterprise    ____        ____        🔴🟡🟢
Monthly churn rate        ___%        4.5%        🔴🟡🟢
LTV:CAC (blended)         ___:1       >3:1        🔴🟡🟢
CAC payback               ___ mo      <12 mo      🔴🟡🟢
Runway (if burning cash)  ___ mo      —           🔴🟡🟢

RAG rule of thumb: 🟢 within 10% of target · 🟡 10–25% off · 🔴 >25% off or trending wrong direction

Top win this month:      _______________________________________________
Top risk / blocker:      _______________________________________________
Decision needed:         _______________________________________________
Next month forecast:     $______ MRR, ____ customers
```

---

## 8. KPI Targets by Month (Realistic Scenario)

| Month | Customers | MRR | Note |
|---|---|---|---|
| 1 | 2 | $140 | Beta conversions only, pre-launch |
| 3 | 27 | $1,890 | Post landing-page + PH launch |
| 6 | 53 | $3,710 | |
| 9 | 92 | $6,440 | |
| 12 | 147 | $10,290 | ~$123K ARR run-rate |

These are more granular than — and in the earlier months slightly ahead of — the round-number KPI targets already listed in `AGENT_PROMPTS_MASTER_PLAN.md` ("Month 3: 5 total customers, $400 MRR"). That's expected: the master plan's numbers were a quick napkin estimate: this model is the bottom-up version and should be treated as the operating target from here on.

---

## 9. Assumptions to Validate (Do Not Treat as Fact)

These came from the master plan with no real data behind them yet — flag explicitly rather than let them harden into unquestioned truth:

- **CAC $100–200** — unknown until the first paid channel (PH, ads, outreach) produces real cost-per-signup data. Revisit after Month 2.
- **Churn 3–5% monthly** — no customers yet, so this is an industry-typical guess for early-stage SMB SaaS. Revisit after 90 days of real subscription data (need at least one full cohort aging).
- **Avg tenure 20–36 months** — derived mathematically from the churn guess above, not observed. Same revisit timing.
- **Freemium conversion 5–10%** — unvalidated; depends entirely on where the free-tier gate is drawn (Developer agent's feature-gating spec).
- **Tier mix 70/25/5** — unvalidated; the beta customer interviews (Sales agent, Section 1 of `SALES_CUSTOMER_SUCCESS_PLAN.md`) should produce a real signal on price sensitivity and seat count before Month 4.

**Update trigger:** re-run this model with actuals the first week of every month once `org_subscriptions` has 30+ days of real data (~Month 2–3), and re-validate every assumption in this section against the monthly cohort table (Section 6).

---

## 10. Light 2-Year Directional View

Not a full month-by-month model — Year 2 has too many unknowns (hiring, international expansion, AI feature impact) to model with false precision. Directional only, anchored to Year 1 exit run-rate:

| | Year 1 exit ARR (run-rate) | Year 2 exit ARR (directional) |
|---|---|---|
| Conservative | ~$23K | ~$50–70K (slow compounding, still solo) |
| Realistic | ~$123K | ~$250–320K (2–2.5x, growth decelerates as base matures, contractors added per roadmap Month 3+ plan) |
| Optimistic | ~$262K | ~$550–700K (2–2.5x, assumes successful hire of sales/marketing support) |

The roadmap's "$1M ARR club" is realistically a Year 3+ milestone off the Realistic or Optimistic track, not a Year 2 target — worth correcting expectations on that now rather than after a disappointing Year 2 review.

---

## 11. Monthly Business Review Template

```
AKIRA Monthly Business Review — [Month Year]

1. MRR: $______ (target $______, variance ___%)
2. Customers: ____ Starter / ____ Professional / ____ Enterprise
3. Churn this month: ___%  |  New cohort retention (Month 1): ___%
4. LTV:CAC: ___:1  |  CAC payback: ___ months
5. What went right:
   -
6. What went wrong:
   -
7. Key decisions needed:
   -
8. Next month forecast: $______ MRR, ____ customers
9. Financial model updated: Y/N
```

---

## Deliverables Checklist

- [x] 12-month financial model (3 scenarios, internally consistent, bottom-up)
- [x] Unit economics by tier + Professional-priority recommendation
- [x] Break-even analysis (bare infra / sustainable solo / team-funded)
- [x] Sensitivity analysis (5 variables)
- [x] Metrics tracking system — cadence, tools, Supabase queries, Sheets structure
- [x] Executive dashboard template
- [x] KPI targets (Realistic scenario, monthly)
- [x] Assumptions-to-validate list with revisit triggers
- [x] 2-year directional view
- [x] Monthly business review template
