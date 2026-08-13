# 🎯 WEEK 1 PROMPT - PRODUCT MANAGER

**Semana:** 1 (Aug 13-17, 2026)  
**Deadline:** Friday, Aug 17 EOD  
**Criticidad:** 🔴 MÁXIMA (Bloqueador para todos)  
**Tamaño:** 4-5 días, ~20 horas

---

## 🎯 OBJETIVO

Definir la estrategia de monetización completa de AKIRA y preparar beta program en 5 días.

**Sin esto, nada más puede empezar.**

---

## 📋 TAREAS SEMANA 1

### TAREA 1.1: Competitive Pricing Analysis (Day 1-2)
**Deadline:** Miércoles Aug 14  
**Tiempo:** ~4 horas

**Qué hacer:**
1. Analiza competitors (mínimo 5):
   - Notion
   - Monday.com
   - Asana
   - Basecamp
   - 1 más (tu elección)

2. Para cada competitor documenta:
   ```
   Company: [Name]
   Entry Price: $[X]/month
   Tier 2 Price: $[X]/month
   Enterprise: Custom or $[X]
   Key Features by Tier:
   - Tier 1: [features...]
   - Tier 2: [features...]
   Features that Cost Extra:
   - AI
   - Integrations
   - [etc]
   Target Market: [description]
   ```

3. Crea spreadsheet en Google Sheets con comparativa

**Deliverable:** Pricing Comparison Spreadsheet (1 tab = 1 competitor)

---

### TAREA 1.2: Define AKIRA's 3-Tier Pricing (Day 2-3)
**Deadline:** Jueves Aug 15  
**Tiempo:** ~4 horas

**Qué hacer:**
Basándote en análisis anterior, define la estructura de AKIRA:

```
TIER 1: STARTER - $[X]/mes
├─ Target: Freelancers, solopreneurs
├─ Features:
│  ├─ Dashboard básico
│  ├─ [X] projects
│  ├─ [X] users
│  ├─ [X] GB storage
│  ├─ Basic analytics
│  └─ NO AI features
├─ Rationale: Affordable entry point
└─ Expected LTV: [X]

TIER 2: PROFESSIONAL - $[X]/mes
├─ Target: Agencies (5-50 people)
├─ Features:
│  ├─ Unlimited projects
│  ├─ [X] users
│  ├─ [X] GB storage
│  ├─ Advanced analytics
│  ├─ AI insights
│  ├─ All integrations
│  └─ Priority support
├─ Rationale: Core feature set
└─ Expected LTV: [X]

TIER 3: ENTERPRISE - Custom
├─ Target: Large agencies (50+ people)
├─ Features:
│  ├─ Unlimited everything
│  ├─ SSO/SAML
│  ├─ Custom integrations
│  ├─ Dedicated support
│  ├─ API access
│  └─ Custom workflows
├─ Rationale: High-touch, high-value
└─ Expected LTV: [X]
```

**Cálculos a incluir:**
- LTV por tier (asume 20-month para Starter, 30-month para Pro)
- CAC assumptions ($100-300 per customer)
- Payback period (meta: < 12 months)
- Unit economics after Stripe fees (2.9% + $0.30)

**Deliverable:** Pricing Strategy Document (1-2 pages, bien estructurado)

---

### TAREA 1.3: Design Feature Gating Specification (Day 3)
**Deadline:** Viernes Aug 16 morning  
**Tiempo:** ~3 horas

**Qué hacer:**
Especifica exactamente qué features son "locked" por tier.

Crea tabla para Developer:

```
Feature Name | Starter | Professional | Enterprise | Notes
─────────────────────────────────────────────────────────
Dashboard   | Basic  | Advanced    | Custom     | Varies by features
CRM         | Max 3 clients | Unlimited | Unlimited | Based on plan
Projects    | 1      | Unlimited   | Unlimited  | Resource limit
Users       | 1      | 5           | Unlimited  | Seat-based
Storage     | 5GB    | 100GB       | Unlimited  | Soft cap
Analytics   | Basic  | Advanced    | Custom     | Feature parity + custom
AI Features | NO     | YES         | YES        | Whole feature locked
Time Tracking| NO    | YES         | YES        | Core feature
Invoicing   | Limited| Full       | Full       | Template limits?
Integrations| NO     | YES        | YES        | Zapier, Slack, etc
Support     | Email  | Priority   | Dedicated  | Response time SLA
```

Detalles importantes:
- ¿Qué pasa si user downgrade? (archive projects?)
- ¿Cómo mostramos "locked" features en UI? (upgrade CTA)
- ¿Trial period? (30 days free? freemium?)
- ¿Cancellation?

**Deliverable:** Feature Gating Spec (1 page, tabla clara)

---

### TAREA 1.4: Recruit Beta Customers (Day 4-5)
**Deadline:** Viernes Aug 17 EOD  
**Tiempo:** ~4 horas

**Qué hacer:**
Recluta MÍNIMO 5 beta customers (meta: 10).

**Beta Program Offer:**
```
"Join AKIRA Beta
- 6 months free Professional tier ($99/mo value)
- OR lifetime 50% discount
- Your feedback shapes the product
- Priority support
- Get mentioned in launch"
```

**Dónde buscar (Prioridad):**
1. Tu red personal (emails, LinkedIn, friends)
   - Agencias que conoces
   - Freelancers en comunidades
   - Founders en Twitter/IH
   
2. Comunidades:
   - Indie Hackers (@agencies)
   - Twitter SaaS community
   - Reddit r/EntrepreneurRideAlong
   - Agency communities
   
3. Outreach template:
```
Subject: AKIRA Beta - Free Pro tier for 6 months

Hi [Name],

We're building AKIRA - an all-in-one platform for agencies 
to manage clients, projects, invoices, and time tracking 
(like a mix of Monday + Stripe + Basecamp).

We're looking for 10 beta customers to shape the product 
before launch.

Interested? You'd get:
✅ Professional tier free for 6 months ($99/mo value)
✅ Your feedback heard and implemented
✅ Priority support
✅ Mentioned in our launch

Takes 5 min to sign up: [LINK]

Let me know if you have questions!

[Your name]
```

**Success Criteria:**
- [ ] 5+ beta customers signed up
- [ ] Diverse: mix of solopreneurs, small agencies, etc
- [ ] They'll actually USE it (active creators, not just collectors)
- [ ] Exchange emails scheduled (interviews next week)

**Deliverable:** 
- Beta customer list (name, email, company, size)
- Interview schedule (when will they test + interview)
- Onboarding flow prepared

---

## ✅ FINAL CHECKLIST (Due Friday EOD)

- [ ] **Pricing Comparison Spreadsheet** (Google Sheets, public link)
  ```
  Tab 1: Notion
  Tab 2: Monday.com
  Tab 3: Asana
  Tab 4: Basecamp
  Tab 5: [Other]
  Tab 6: AKIRA (our proposal)
  ```

- [ ] **Pricing Strategy Document** (2-3 pages, PDF or Google Doc)
  ```
  1. Executive Summary
  2. Tier definitions (Starter/Pro/Enterprise)
  3. Unit economics
  4. Rationale (why these prices)
  5. LTV/CAC analysis
  6. Trial strategy
  ```

- [ ] **Feature Gating Specification** (1 page table)
  ```
  - Clear feature matrix
  - What's locked by tier
  - Downgrade handling
  - UI messaging
  ```

- [ ] **Beta Program Details** (1-2 pages)
  ```
  - Offer details
  - Customer list (5+ names)
  - Interview schedule
  - How you'll collect feedback
  ```

- [ ] **GO/NO-GO Decision**
  ```
  Pricing ready? YES / NO / NEEDS ITERATION
  Beta customers ready? YES / NO / NEEDS MORE
  Developer can start feature gating? YES / NO
  
  RECOMMENDATION: [GO / NO-GO]
  ```

---

## 📊 Success Criteria (Week 1 End)

✅ **All of these must be TRUE:**
1. Pricing tiers defined and documented
2. Clear differentiation from competitors
3. LTV:CAC > 3:1 projection
4. 5+ beta customers recruited
5. Feature gating spec ready for developer
6. GO decision for Week 2

**If NO on any = needs rework before next week starts**

---

## 💬 Communication

**Share with:**
- Developer Agent: Feature gating spec (they start week 2)
- Finance Agent: Pricing + LTV/CAC assumptions (validation)
- Sales Agent: Beta customer list (interview scheduling)
- You: Daily check-ins on progress

**Format: Slack message each day with 2-min status**

```
🎯 PRODUCT MANAGER - Day 1 Status
Completed: Competitive analysis started
In Progress: Notion/Monday/Asana comparison
Blockers: None
Next: Complete spreadsheet by tonight
```

---

## 🎁 What You Get This Week

**By Friday Aug 17:**
- Clear pricing that differentiates
- Beta customers ready to test
- Developer ready to build feature gating
- Foundation for all future decisions

**Your job for Week 2:**
- Gather feedback from beta customers
- Iterate pricing if needed
- Prepare for Growth Agent to start (landing page)

---

## ⚠️ Risks & How to Avoid

**Risk:** Pricing too high → Low beta conversion
**Avoid:** Test with 2-3 beta customers first, adjust if needed

**Risk:** Pricing too low → Bad unit economics
**Avoid:** Remember LTV > 3x CAC rule

**Risk:** Can't recruit 5 beta customers
**Avoid:** Start TODAY, reach out to 20+ people

**Risk:** Feature gating too complex to implement
**Avoid:** Keep it simple (3 tiers, not 10)

---

## 🚀 START TODAY

No more planning. Start TODAY.

**Today (Aug 13):** Get competitor list, start spreadsheet
**Tomorrow (Aug 14):** Finish comparison, send to Finance Agent
**Wednesday (Aug 15):** Define final 3-tier pricing
**Thursday (Aug 16):** Feature gating spec done
**Friday (Aug 17):** Beta recruitment + GO decision

---

**This is the most important week. Everything else depends on you.** 🎯

Questions? Ask. Blockers? Escalate. Deadline? Friday EOD - no exceptions.

Let's go.

