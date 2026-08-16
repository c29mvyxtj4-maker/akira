# 🤖 AKIRA SaaS - Master Plan para Agentes

**Objetivo:** Ejecutar roadmap SaaS con equipos especializados (agentes)  
**Timeline:** 90 días  
**Responsable:** Coordinador de proyectos (tú)

---

## 📋 Agentes Necesarios & Asignaciones

### 1️⃣ AGENT: Product Manager
**Responsabilidad:** Strategy, Pricing, Feature Gating  
**Timeline:** Weeks 1-4  
**Deliverables:** Pricing docs, feature gating specs, beta customer plan

---

## PROMPT PARA AGENT: Product Manager

```
OBJETIVO PRINCIPAL:
Define la estrategia de monetización para AKIRA en 4 semanas.
Esto es crítico: la empresa no genera ingresos sin esto.

CONTEXT:
- AKIRA es una plataforma all-in-one para agencias/freelancers
- Ya tiene todas las features: CRM, projects, invoicing, AI, time tracking
- Usuarios actuales: ~0 (pre-launch)
- Competidores: Notion, Monday.com, Basecamp, Asana
- Target market: 5-50 person agencies & freelancers

TAREAS (En este orden):

WEEK 1: PRICING STRATEGY
├─ Definir 3 tiers de precio:
│  ├─ Tier 1 (Starter): $29/mes
│  ├─ Tier 2 (Professional): $99/mes  
│  └─ Tier 3 (Enterprise): Custom
│
├─ Por cada tier, especificar:
│  ├─ Features incluidas (máx 3 diferenciadores por tier)
│  ├─ # de projects/users allowed
│  ├─ Storage limits
│  ├─ Support level
│  └─ AI features availability
│
├─ Análisis competitivo:
│  ├─ Pricing de Notion, Monday, Asana, Basecamp
│  ├─ Features incluidas a cada precio
│  └─ Posicionamiento de AKIRA
│
├─ Análisis financiero:
│  ├─ Unit economics por tier
│  ├─ LTV:CAC targets
│  ├─ Payback period goal
│  └─ Churn assumptions
│
└─ Propuesta de valor (UVP) clara

WEEK 2: FEATURE GATING DESIGN
├─ Identificar qué features costar $:
│  ├─ Free: Dashboard básico, 1 project, 1 user
│  ├─ $29: 3 projects, basic analytics
│  ├─ $99: Unlimited, AI features, advanced analytics
│  └─ Enterprise: Everything + custom integrations
│
├─ Especificar feature flags:
│  ├─ Qué flags crear en DB
│  ├─ Cómo validar en middleware
│  ├─ Cómo mostrar UI (locked features)
│  └─ Cómo manejar downgrade
│
├─ Upgrade/Downgrade flow:
│  ├─ User story para cada acción
│  ├─ Prorated billing logic
│  ├─ Data retention on downgrade
│  └─ Communication plan
│
└─ Documentación completa para dev team

WEEK 3: BETA PROGRAM PLAN
├─ Seleccionar 10 beta customers:
│  ├─ Criteria: Agencies, freelancers, diverse size
│  ├─ How to find them (your network, communities)
│  ├─ Onboarding process
│  └─ Incentive (discount or free)
│
├─ Feedback collection:
│  ├─ Customer interview guide (15 questions)
│  ├─ Usage analytics to track
│  ├─ Weekly review meeting
│  └─ Rapid iteration process
│
├─ Launch timeline:
│  ├─ Week 3 start: Invite first 5
│  ├─ Week 3 end: Invite next 5
│  ├─ Week 4: Iterate based on feedback
│  └─ Week 4 end: Pricing finalized
│
└─ Success metrics:
   ├─ Activation rate (% creating first project)
   ├─ Feature usage by tier
   ├─ Churn signals
   └─ NPS feedback

WEEK 4: REFINEMENT & LAUNCH PREP
├─ Pricing optimization:
│  ├─ Adjust tiers based on feedback
│  ├─ Consider annual discounts (15-20%?)
│  ├─ Add-on strategy (if any)
│  └─ Final pricing confirmed
│
├─ Stripe configuration:
│  ├─ Products & prices setup specs
│  ├─ Webhook event list
│  ├─ Customer metadata fields
│  └─ Invoice customization
│
├─ Release notes template
│
└─ Readiness checklist:
   ├─ Feature gating implemented? ✓
   ├─ Stripe integrated? ✓
   ├─ Beta customers converting? ✓
   ├─ Documentation done? ✓
   └─ Team trained? ✓

DELIVERABLES FINALES:
1. Pricing Strategy Document (3 pages)
   ├─ Rationale for each tier
   ├─ Feature breakdown per tier
   ├─ Competitor analysis
   └─ Financial projections
   
2. Feature Gating Specification (technical doc for devs)
   ├─ Feature flags to create
   ├─ Middleware validation logic
   ├─ UI/UX for locked features
   └─ Upgrade flow specs
   
3. Beta Program Plan (operational doc)
   ├─ Customer selection criteria
   ├─ Onboarding checklist
   ├─ Interview guide (15 Qs)
   ├─ Weekly review agenda
   └─ Success metrics dashboard
   
4. Stripe Integration Spec (technical)
   ├─ Products & prices JSON
   ├─ Webhook events needed
   ├─ Customer metadata schema
   └─ Invoice template specs
   
5. Go/No-Go Checklist
   ├─ All 10 items must be ✓ to proceed to Marketing (Month 2)

SUCCESS CRITERIA:
- Pricing strategy that differentiates from competitors
- Clear feature gating that prevents feature access appropriately
- 5-10 beta customers signed up by end of week 4
- At least 1 customer paying for Starter or Professional tier
- Team aligned on strategy and ready to execute Month 2 (Marketing)

CONSTRAINTS:
- Use data-driven reasoning (competitor pricing, unit economics)
- Focus on simplicity (3 tiers, not 5 or 10)
- Assume customers are price-sensitive (agencies/freelancers)
- LTV must be > 3x CAC for sustainability
- Annual discount sweet spot: 15-20% (not 50%+)

TOOLS/RESOURCES:
- Spreadsheet for competitive analysis (Google Sheets link: TBD)
- Stripe dashboard for competitor integration inspection
- Customer interview template (Notion: TBD)
- Financial model spreadsheet (Excel: TBD)

ESCALATION:
- If can't decide on tier differentiation: Schedule 1-hr decision meeting
- If beta customers won't convert: Pivot pricing or features
- If Stripe integration appears complex: Pair with dev team
```

---

### 2️⃣ AGENT: Growth & Marketing
**Responsibility:** Landing page, Product Hunt, content  
**Timeline:** Weeks 3-8  
**Deliverables:** Live landing page, PH launch, 100+ signups

---

## PROMPT PARA AGENT: Growth & Marketing

```
OBJETIVO PRINCIPAL:
Crear presencia de marketing profesional que convierta el traffic de Product Hunt
y comunidades en 100+ signups en 60 días.

CONTEXT:
- AKIRA: All-in-one platform para agencias/freelancers
- Target: Agencies (5-50 people), freelancers, consultants
- Pricing: $29/$99/Enterprise (3 tiers)
- Timeline: Landing page (Weeks 3-6), PH launch (Week 7-8)
- Current status: Pre-launch (0 customers, pre-revenue)

TAREAS (En este orden):

WEEK 3-4: LANDING PAGE STRATEGY & DESIGN
├─ Market research:
│  ├─ Analyze competitor landing pages (Monday, Notion, Basecamp)
│  ├─ Identify winning patterns (copy, design, CTAs)
│  ├─ Customer pain points (research through interviews)
│  └─ Unique selling proposition (UVP) for AKIRA
│
├─ Landing page structure:
│  ├─ Hero section
│  │  ├─ Headline (focus on pain point solved)
│  │  ├─ Subheadline
│  │  ├─ CTA: "Start free trial" or "See demo"
│  │  └─ Hero image/video
│  │
│  ├─ Problem section (3 pain points)
│  │  ├─ Spreadsheets chaos
│  │  ├─ Too many tools
│  │  └─ Billing complexity
│  │
│  ├─ Solution section (features in plain language)
│  │  ├─ CRM (client management)
│  │  ├─ Projects (Kanban board)
│  │  ├─ Invoicing (billing)
│  │  ├─ Time tracking
│  │  ├─ AI assistant
│  │  └─ Client portal
│  │
│  ├─ Pricing section
│  │  ├─ 3 tiers comparison table
│  │  ├─ Annual discount badge
│  │  ├─ FAQ
│  │  └─ CTA per tier
│  │
│  ├─ Social proof
│  │  ├─ Beta customer testimonials (minimum 3)
│  │  ├─ Case study: before/after
│  │  ├─ Trust badges (security, compliance)
│  │  └─ Number: "Used by X agencies"
│  │
│  ├─ FAQ section
│  │  ├─ Pricing questions
│  │  ├─ Feature questions
│  │  ├─ Integration questions
│  │  └─ Support/refund policy
│  │
│  └─ Footer
│     ├─ Quick links
│     ├─ Contact info
│     ├─ Social links
│     └─ Privacy/Terms

├─ Design requirements:
│  ├─ Mobile-first (responsive design, already done!)
│  ├─ Light/dark mode support
│  ├─ Fast loading (<3s)
│  ├─ Accessibility (WCAG AA)
│  ├─ SEO-optimized
│  └─ Brand consistency
│
└─ Copy strategy:
   ├─ Speak to pain points (not features)
   ├─ Use social proof heavily
   ├─ Clear CTAs throughout
   ├─ Benefit-driven language
   └─ Short paragraphs (scannable)

WEEK 4-5: LANDING PAGE BUILD
├─ Development:
│  ├─ Vercel deployment (fast, serverless)
│  ├─ Next.js for SEO (built-in)
│  ├─ Components:
│  │  ├─ Hero (engaging, animated)
│  │  ├─ Features (grid, icons)
│  │  ├─ Pricing table (comparison)
│  │  ├─ Testimonials (carousel)
│  │  ├─ FAQ (accordion)
│  │  └─ CTA buttons (color, contrast)
│  │
│  ├─ Analytics setup:
│  │  ├─ Google Analytics 4
│  │  ├─ Conversion tracking (signups)
│  │  ├─ Heatmap (Hotjar)
│  │  └─ Session recording (optional)
│  │
│  ├─ SEO setup:
│  │  ├─ Meta tags per page
│  │  ├─ Open Graph tags
│  │  ├─ Structured data (JSON-LD)
│  │  ├─ Sitemap.xml
│  │  └─ Robots.txt
│  │
│  ├─ Technical:
│  │  ├─ Signup form (email capture)
│  │  ├─ Stripe checkout integration
│  │  ├─ Email confirmation
│  │  ├─ Performance optimization
│  │  └─ Error handling
│  │
│  └─ Testing:
│     ├─ Mobile responsiveness (all devices)
│     ├─ Browser compatibility
│     ├─ Form submission
│     ├─ CTA clickthrough
│     └─ Page load speed (<3s)

├─ Content creation:
│  ├─ Demo video (30 sec)
│  │  ├─ Script
│  │  ├─ Screen recording (Loom)
│  │  ├─ Voiceover
│  │  └─ Captions
│  │
│  ├─ Case study (1 beta customer)
│  │  ├─ Challenge: What problem they had
│  │  ├─ Solution: How AKIRA helped
│  │  ├─ Results: Metrics (time saved, revenue increase)
│  │  └─ Quote from founder
│  │
│  └─ Blog post ideas (for later):
│     ├─ "Spreadsheets are slowing down your agency"
│     ├─ "How to choose project management software"
│     └─ "The true cost of tool sprawl"

└─ Launch readiness:
   ├─ Domain: akira-os.com or similar
   ├─ DNS configured
   ├─ SSL certificate installed
   ├─ Email configured (hello@akira-os.com)
   └─ Support email working

WEEK 5-6: PRODUCT HUNT PREP
├─ PH profile setup:
│  ├─ Company profile complete
│  ├─ Founder bio + photo
│  ├─ Product tagline (max 60 chars)
│  ├─ Product description (compelling)
│  ├─ 3-5 product images/screenshots
│  ├─ Demo video link
│  ├─ Website link
│  └─ Social links
│
├─ Launch day plan:
│  ├─ Schedule: Post at 12:01am PST (optimal)
│  ├─ Hunt partner identified
│  ├─ First 100 upvotes secured (friends, network)
│  ├─ Founder presence (respond to comments)
│  ├─ Social media coordination (Twitter, LinkedIn)
│  └─ Email list notification
│
├─ Supporting assets:
│  ├─ Twitter thread (10 tweets, prepared)
│  ├─ LinkedIn post
│  ├─ Email to network
│  ├─ Offer: "Special PH pricing" (discount or free tier)
│  └─ Thank you post (after PH)
│
├─ Team coordination:
│  ├─ Who responds to comments?
│  ├─ Who handles support questions?
│  ├─ Who monitors metrics?
│  └─ Sync meeting: Launch day 10am

└─ Success metrics:
   ├─ Target: #1 in category (optional)
   ├─ Target: 500+ upvotes
   ├─ Target: 200+ signups from PH
   ├─ Target: Press mentions (1+)
   └─ Target: Golden Kitty nomination

WEEK 6-7: MARKETING ASSETS & LAUNCH
├─ Email sequences:
│  ├─ Welcome email (1)
│  ├─ Feature highlight (2)
│  ├─ Social proof (3)
│  ├─ Case study (4)
│  ├─ Pricing explanation (5)
│  └─ First paid customer CTA (6)
│
├─ Social media strategy:
│  ├─ Twitter: Daily product updates + tips
│  ├─ LinkedIn: Founder insights + wins
│  ├─ Community engagement (IndieHackers, Reddit, Discord)
│  ├─ Hashtags: #SaaS #ProductManagement #Agencies
│  └─ Content calendar (8 weeks out)
│
├─ Community outreach:
│  ├─ Indie Hackers: Post to "Show IH"
│  ├─ Reddit: r/EntrepreneurRideAlong, r/SaaS
│  ├─ Discord communities (indie devs, agencies)
│  ├─ Twitter spaces (if applicable)
│  └─ Newsletter mentions (request partnerships)
│
├─ Press kit:
│  ├─ PDF one-pager (company + product)
│  ├─ Founder bio
│  ├─ 3-4 high-res screenshots
│  ├─ Demo video link
│  └─ Press contact email
│
├─ Influencer/partnership outreach:
│  ├─ List: 20 relevant influencers (SaaS founders, productivty YouTubers)
│  ├─ Outreach template
│  ├─ Offer: Free Premium tier for review/mention
│  └─ Follow-up cadence
│
└─ PH launch execution:
   ├─ Schedule posts across all platforms
   ├─ Morning of: Check all systems
   ├─ 12:01am PST: Post to PH
   ├─ First 2 hours: Active engagement
   ├─ Full day: Respond to all comments
   └─ Evening: Thank yous + celebrate

DELIVERABLES FINALES:
1. Landing Page (Live URL)
   ├─ Mobile-responsive
   ├─ SEO-optimized
   ├─ Analytics tracking
   ├─ Fast loading (<3s)
   └─ Conversion tracked
   
2. Marketing Assets Folder
   ├─ Demo video (30s)
   ├─ Case study document
   ├─ Press kit (PDF)
   ├─ Social media templates
   └─ Email sequences (6 emails)
   
3. Product Hunt Launch Plan (Playbook)
   ├─ PH profile setup
   ├─ Launch day timeline
   ├─ Team responsibilities
   ├─ Social media coordination
   └─ Success metrics dashboard
   
4. Marketing Content Calendar
   ├─ 8 weeks of posts
   ├─ Twitter, LinkedIn, email schedule
   ├─ Community engagement plan
   └─ Influencer outreach list

SUCCESS CRITERIA:
- Landing page live by end of week 5
- 100+ signups from landing page before PH launch
- 500+ upvotes on Product Hunt
- 200+ signups from Product Hunt
- Press mention in at least 1 tech publication
- 30% email list open rate
- Measurable MRR from marketing efforts

CONSTRAINTS:
- Budget: Minimal paid ads (focus on organic)
- Time: Founder + 1 part-time marketer
- Keep messaging simple and benefit-focused
- No misleading claims (legal compliance)
- All assets must reflect brand consistency

TOOLS/RESOURCES:
- Vercel (Next.js hosting)
- Google Analytics 4
- Hotjar (heatmaps)
- Loom (video recording)
- Canva (graphics, if needed)
- Mailchimp or similar (email)
- Notion (project management)
```

---

### 3️⃣ AGENT: Developer
**Responsibility:** Feature gating, mobile completion, integrations  
**Timeline:** Weeks 2-12  
**Deliverables:** Feature gating live, mobile responsive, 2+ integrations

---

## PROMPT PARA AGENT: Developer

```
OBJETIVO PRINCIPAL:
Implementar la monetización técnica (feature gating) + completar mobile responsiveness
+ iniciar integraciones de terceros en 12 semanas.

CONTEXT:
- Stack: React 18, Vite, Tailwind, Supabase (PostgreSQL), Stripe
- Architecture: Multi-tenant, RLS-enabled
- Responsive design: 70% Dashboard done today, rest pending
- No feature gating currently (everything is free)
- Current URL: akira-os-dun.vercel.app

TAREAS (En este orden):

PHASE 1: FEATURE GATING (Weeks 2-4) - CRITICAL PATH
├─ Database schema updates:
│  ├─ Add subscription table:
│  │  ├─ id (UUID)
│  │  ├─ org_id (FK to organizations)
│  │  ├─ tier (starter | professional | enterprise)
│  │  ├─ stripe_subscription_id
│  │  ├─ status (active | cancelled | past_due)
│  │  ├─ started_at (timestamp)
│  │  ├─ ends_at (timestamp)
│  │  └─ auto_renew (boolean)
│  │
│  ├─ Add feature_limits table:
│  │  ├─ id (UUID)
│  │  ├─ tier (starter | professional | enterprise)
│  │  ├─ feature_name
│  │  ├─ limit_value (number or unlimited)
│  │  └─ Examples:
│  │     ├─ max_projects (1, 3, unlimited)
│  │     ├─ max_users (1, 5, unlimited)
│  │     ├─ max_storage_gb (5, 100, unlimited)
│  │     ├─ ai_features_enabled (boolean)
│  │     ├─ advanced_analytics (boolean)
│  │     └─ integrations_enabled (boolean)
│  │
│  └─ Add feature_usage table:
│     ├─ id (UUID)
│     ├─ org_id (FK)
│     ├─ feature_name
│     ├─ usage_count
│     ├─ last_checked_at
│     └─ Example queries for enforcement
│
├─ Backend implementation:
│  ├─ Create /api/subscriptions endpoints:
│  │  ├─ GET /api/subscriptions/current (get org's subscription)
│  │  ├─ POST /api/subscriptions/upgrade (upgrade tier)
│  │  ├─ POST /api/subscriptions/downgrade (downgrade tier)
│  │  ├─ POST /api/subscriptions/cancel (cancel subscription)
│  │  └─ All require auth middleware
│  │
│  ├─ Create feature enforcement middleware:
│  │  ├─ checkSubscription(orgId, featureName)
│  │  ├─ checkUsageLimit(orgId, featureName, currentUsage)
│  │  ├─ Applied to all protected endpoints
│  │  └─ Returns { allowed: boolean, message: string, upgrade_url: string }
│  │
│  ├─ Update existing endpoints:
│  │  ├─ POST /api/projects (check max_projects limit)
│  │  ├─ POST /api/users (check max_users limit)
│  │  ├─ GET /api/analytics (check if tier allows)
│  │  ├─ GET /api/ai-insights (check if tier allows)
│  │  └─ All should gracefully handle 402 Payment Required
│  │
│  ├─ Stripe webhook handlers:
│  │  ├─ customer.subscription.created
│  │  ├─ customer.subscription.updated
│  │  ├─ customer.subscription.deleted
│  │  ├─ invoice.payment_succeeded
│  │  ├─ invoice.payment_failed
│  │  └─ Sync with database in real-time
│  │
│  ├─ Downgrade/cancellation logic:
│  │  ├─ If downgrade to Starter (1 project limit):
│  │  │  ├─ Archive projects 2+ (user notified)
│  │  │  └─ Keep one project active
│  │  ├─ If cancel subscription:
│  │  │  ├─ Downgrade to free tier (dashboard only)
│  │  │  ├─ Keep data for 30 days
│  │  │  └─ Send re-engagement email week 2
│  │  └─ Document this flow for support
│  │
│  └─ Testing:
│     ├─ Unit tests: Feature limit checks
│     ├─ Integration tests: Stripe webhook flow
│     ├─ E2E: Full upgrade/downgrade cycle
│     └─ Edge cases: Concurrent requests, refunds

├─ Frontend implementation:
│  ├─ Add <FeatureGate> component:
│  │  ├─ Props: { feature, children, fallback }
│  │  ├─ Shows children if feature allowed
│  │  ├─ Shows fallback (upgrade CTA) if not
│  │  └─ Usage: <FeatureGate feature="ai_insights">
│  │           <AIInsights />
│  │        </FeatureGate>
│  │
│  ├─ Update subscription UI:
│  │  ├─ Settings → Subscription page
│  │  │  ├─ Show current tier
│  │  │  ├─ Show next billing date
│  │  │  ├─ Upgrade/downgrade buttons
│  │  │  ├─ Cancel subscription button
│  │  │  ├─ Billing history
│  │  │  └─ Invoice download links
│  │  │
│  │  └─ Upgrade/downgrade flow:
│  │     ├─ Modal with tier comparison
│  │     ├─ Pricing clarity
│  │     ├─ Confirm with Stripe Checkout
│  │     ├─ Success page
│  │     └─ Automatic sync with backend
│  │
│  ├─ Upgrade CTAs throughout app:
│  │  ├─ When user hits project limit
│  │  ├─ When user hits user limit
│  │  ├─ When accessing locked features (AI, analytics)
│  │  └─ Links to /settings/subscription
│  │
│  ├─ Error handling:
│  │  ├─ 402 Payment Required → Show upgrade CTA
│  │  ├─ Payment failed → Retry logic + notification
│  │  ├─ Subscription expired → Graceful downgrade
│  │  └─ Network errors → Offline fallback (optional)
│  │
│  └─ Testing:
│     ├─ Mock different subscription tiers
│     ├─ Test feature gates show/hide correctly
│     ├─ Test upgrade CTA flows
│     └─ E2E: Full user journey

└─ Monitoring & metrics:
   ├─ Dashboard metrics:
   │  ├─ Signups by tier
   │  ├─ Upgrade rate
   │  ├─ Churn rate
   │  ├─ Feature usage by tier
   │  ├─ Payment success rate
   │  └─ Revenue by tier
   │
   └─ Alerting:
      ├─ Payment failures (Slack alert)
      ├─ Stripe API errors (Slack alert)
      └─ Feature limit hits (analytics only)

PHASE 2: MOBILE RESPONSIVENESS COMPLETION (Weeks 5-6)
├─ Dashboard pages remaining:
│  ├─ Complete Dashboard.jsx (70% done)
│  │  └─ Wrap remaining panels in DashboardPanel
│  │  └─ Test on mobile (375px, 768px, 1024px)
│  │  └─ Performance check (<3s load)
│  │
│  ├─ Clients page
│  │  ├─ List view responsive
│  │  ├─ Detail drawer on mobile
│  │  ├─ Forms full-width & touch-friendly
│  │  └─ Test all interactions
│  │
│  ├─ Projects/Kanban
│  │  ├─ Single column on mobile
│  │  ├─ Swipe between columns (or tabs)
│  │  ├─ Cards touch-draggable
│  │  └─ Test drag-and-drop
│  │
│  ├─ Forms (ClientForm, ProjectForm, etc.)
│  │  ├─ Single column layout
│  │  ├─ Full-width inputs
│  │  ├─ Keyboard-aware (iOS/Android)
│  │  └─ Submit button always visible
│  │
│  ├─ Tables (Invoices, Time Tracking)
│  │  ├─ Horizontal scroll on mobile
│  │  ├─ Or convert to card view
│  │  └─ Column selection/hiding
│  │
│  └─ Testing:
│     ├─ Real devices (if possible)
│     ├─ DevTools device emulation
│     ├─ Lighthouse audit (Performance >= 85)
│     ├─ Touch event testing
│     └─ Offline mode (PWA)

PHASE 3: INTEGRATIONS (Weeks 7-12)
├─ Integration 1: Zapier/Make (PRIORITY)
│  ├─ Webhook endpoints:
│  │  ├─ POST /api/zapier/webhook
│  │  ├─ Stripe integration event trigger
│  │  ├─ Test event payload
│  │  └─ Documentation for users
│  │
│  ├─ Setup Zapier app:
│  │  ├─ Connect via API key
│  │  ├─ List available triggers/actions
│  │  └─ Example Zaps (Slack notification on invoice)
│  │
│  └─ Testing: Run sample Zap end-to-end
│
├─ Integration 2: Slack (PRIORITY)
│  ├─ Create /api/slack/auth endpoint
│  ├─ Scopes: chat:write, channels:read, users:read
│  ├─ Store workspace ID + token securely
│  ├─ Send notifications:
│  │  ├─ Invoice created
│  │  ├─ Project milestone hit
│  │  ├─ Team member mentioned
│  │  ├─ Payment failed
│  │  └─ Configurable per org
│  │
│  ├─ Settings UI:
│  │  ├─ Connect Slack button
│  │  ├─ Choose notification channels
│  │  ├─ Test button (send sample message)
│  │  └─ Disconnect button
│  │
│  └─ Testing: Full auth + notification flow
│
├─ Integration 3: Google Calendar
│  ├─ OAuth2 flow for Google
│  ├─ List calendars user owns
│  ├─ Sync AKIRA events to calendar
│  │  ├─ Project deadlines
│  │  ├─ Milestones
│  │  ├─ Client meetings
│  │  └─ Reminders 24h before
│  │
│  ├─ Two-way sync (optional):
│  │  ├─ Google Calendar event → Create task in AKIRA
│  │  └─ Uses webhooks (advanced)
│  │
│  └─ Testing: Create event, verify in Google Calendar
│
├─ Integration 4: Gmail
│  ├─ OAuth2 for Gmail
│  ├─ Sync client emails to AKIRA
│  │  ├─ Thread view in client timeline
│  │  ├─ Search across emails
│  │  └─ Link emails to projects
│  │
│  ├─ Send email from AKIRA
│  │  ├─ Compose in AKIRA
│  │  ├─ Send via Gmail API
│  │  ├─ Archive to Gmail thread
│  │  └─ Track sent emails
│  │
│  └─ Testing: Send email, verify in Gmail
│
├─ Integration 5: Notion (NICE-TO-HAVE)
│  ├─ OAuth2 integration
│  ├─ Export knowledge base to Notion
│  ├─ Sync Notion docs to AKIRA KB
│  └─ Testing: Full two-way sync
│
└─ Documentation for each integration
   ├─ User setup guide
   ├─ Troubleshooting
   ├─ API docs (for developers)
   └─ Example workflows

DELIVERABLES FINALES:
1. Feature Gating System (Complete)
   ├─ Database schema + migrations
   ├─ Backend endpoints + middleware
   ├─ Frontend components + UI
   ├─ Stripe webhook handlers
   ├─ Test coverage (80%+)
   └─ Monitoring + alerting setup
   
2. Mobile Responsiveness (All Pages)
   ├─ Dashboard complete
   ├─ Clients page responsive
   ├─ Projects/Kanban mobile-friendly
   ├─ Forms mobile-optimized
   ├─ Tables scrollable or card view
   ├─ Lighthouse score >= 85
   └─ Real device tested (if possible)
   
3. First 2 Integrations Live
   ├─ Zapier/Make (Webhook + setup guide)
   ├─ Slack (Full auth + notifications)
   ├─ Documentation (User + API docs)
   ├─ Test coverage
   └─ Monitoring + alerting

SUCCESS CRITERIA:
- Feature gating enforced on all protected endpoints
- Revenue flowing through Stripe (test mode first)
- Mobile users can access all core features
- Lighthouse Mobile score >= 85
- 2+ integrations live and tested
- Zero critical bugs post-launch

TECHNICAL DEBT TO AVOID:
- Don't add feature flags on frontend only (backend must enforce)
- Don't skip Stripe webhook testing
- Don't hardcode feature names (use constants)
- Don't ignore mobile edge cases (notches, keyboard, slow network)
- Don't ship integrations without error handling

CONSTRAINTS:
- Must work with existing multi-tenant architecture
- Must maintain RLS security model
- No new external dependencies without approval
- Must be testable before launch
- Must not break existing free tier

TOOLS/RESOURCES:
- Stripe Dashboard (test keys)
- DevTools (mobile emulation)
- Lighthouse (performance audit)
- Zapier/Make API docs
- Slack API docs
- Google/Gmail OAuth2 docs
```

---

### 4️⃣ AGENT: Business/Finance
**Responsibility:** Financial model, metrics, analysis  
**Timeline:** Weeks 1-2  
**Deliverables:** Financial model, LTV/CAC analysis, dashboard

---

## PROMPT PARA AGENT: Business/Finance

```
OBJETIVO PRINCIPAL:
Crear un modelo financiero y de métricas que guíe las decisiones de monetización
y crecimiento durante los primeros 12 meses.

CONTEXT:
- AKIRA: SaaS para agencias/freelancers
- Pricing: $29 (Starter), $99 (Professional), Custom (Enterprise)
- Market: ~50K agencies en US/EU
- Timeline: Pre-revenue hoy, objetivo: $100K ARR en 12 meses

TAREAS:

WEEK 1: FINANCIAL MODEL
├─ Build 12-month spreadsheet:
│  ├─ Row 1: Assumptions
│  │  ├─ Startup costs (domain, hosting, Stripe fees)
│  │  ├─ Monthly burn rate (salary, tools)
│  │  ├─ Customer acquisition cost (CAC) by channel
│  │  └─ Churn assumptions
│  │
│  ├─ Row 2: Revenue model
│  │  ├─ Signups per month (by tier)
│  │  ├─ Upgrade/downgrade rate
│  │  ├─ Churn rate
│  │  ├─ MRR by month (Monthly Recurring Revenue)
│  │  ├─ ARR projection (Annual Recurring Revenue)
│  │  └─ Total revenue (monthly + one-time)
│  │
│  ├─ Row 3: Costs
│  │  ├─ Stripe processing fees (2.9% + $0.30)
│  │  ├─ Hosting (Vercel, Supabase)
│  │  ├─ Tools (analytics, email, etc)
│  │  ├─ Salary (if applicable)
│  │  └─ Contractor costs
│  │
│  ├─ Row 4: Metrics
│  │  ├─ Customer count (active subscriptions)
│  │  ├─ Churn rate (% leaving per month)
│  │  ├─ LTV (Lifetime Value = ARPU / Churn)
│  │  ├─ CAC (Customer Acquisition Cost)
│  │  ├─ Payback period (months to recover CAC)
│  │  ├─ MRR growth rate (%/month)
│  │  └─ Runway (months until out of cash)
│  │
│  └─ Scenarios:
│     ├─ Conservative: 5 customers/month, 5% churn
│     ├─ Realistic: 15 customers/month, 3% churn
│     └─ Optimistic: 30 customers/month, 2% churn

├─ Financial ratios:
│  ├─ LTV:CAC ratio (target > 3:1)
│  ├─ Payback period (target < 12 months)
│  ├─ Gross margin (after Stripe fees)
│  ├─ Magic Number = MRR growth / spend
│  └─ Documentation of each

├─ Unit economics:
│  ├─ Starter: $29/month
│  │  ├─ After Stripe: $27.06
│  │  ├─ After overhead (15%): $23.00
│  │  ├─ Margin: 79%
│  │  └─ LTV at 20-month avg: $460
│  │
│  ├─ Professional: $99/month
│  │  ├─ After Stripe: $96.13
│  │  ├─ After overhead (10%): $86.50
│  │  ├─ Margin: 87%
│  │  └─ LTV at 30-month avg: $2,595
│  │
│  └─ Enterprise: $500+/month (assumed average)
│     ├─ After Stripe + customization: $450
│     ├─ LTV at 36-month avg: $16,200
│     └─ Note: High value, slow sales cycle

├─ Break-even analysis:
│  ├─ At what MRR is company break-even?
│  ├─ At what customer count?
│  ├─ When expected (realistic scenario)?
│  └─ What if churn is 5%?

└─ Sensitivity analysis:
   ├─ If CAC is 20% higher, what happens to payback?
   ├─ If churn is 5% vs 3%, how much revenue is lost?
   ├─ If we reduce Starter price to $19, impact?
   └─ If we get 1 Enterprise customer, runway improves by?

WEEK 2: METRICS DASHBOARD & ANALYSIS
├─ Build metrics tracking system:
│  ├─ Daily metrics (automated)
│  │  ├─ Signups (total, by tier)
│  │  ├─ Upgrades/downgrades
│  │  ├─ Churn (active subscriptions)
│  │  ├─ MRR (running total)
│  │  ├─ ARR projection
│  │  └─ Revenue today
│  │
│  ├─ Weekly metrics (reporting)
│  │  ├─ New customers by tier
│  │  ├─ Churn in last 7 days
│  │  ├─ MoM growth rate
│  │  ├─ LTV:CAC ratio
│  │  ├─ Payback period
│  │  └─ Runway (if burning cash)
│  │
│  ├─ Monthly metrics (business review)
│  │  ├─ MRR report
│  │  ├─ Customer cohorts (month joined)
│  │  ├─ Churn by cohort
│  │  ├─ Lifetime value trends
│  │  ├─ CAC by channel (PH, organic, etc)
│  │  ├─ NPS feedback summary
│  │  ├─ Goals vs actuals
│  │  └─ Variance analysis
│  │
│  └─ Tools:
│     ├─ Google Sheets (collaboration)
│     ├─ Stripe dashboard (revenue source)
│     ├─ PostHog/Amplitude (product analytics)
│     └─ Custom query on Supabase (subscription data)

├─ KPI targets (by month):
│  ├─ Month 1: 5 free signups
│  ├─ Month 2: 1 Starter, 1 Professional
│  ├─ Month 3: 5 total customers, $400 MRR
│  ├─ Month 6: 50 customers, $4K MRR
│  ├─ Month 9: 100 customers, $8K MRR
│  ├─ Month 12: 150+ customers, $12K+ MRR
│  └─ Year 2: $100K+ ARR (ambitious)

├─ Forecasting:
│  ├─ Build 2-year projection
│  ├─ Include hiring plan impact
│  ├─ Market expansion (international)
│  ├─ New feature impact (AI features)
│  └─ Worst-case vs best-case scenarios

└─ Reporting template:
   ├─ Monthly business review deck
   ├─ What went right / wrong
   ├─ Key decisions needed
   ├─ Next month forecast
   └─ Updated financial model

DELIVERABLES FINALES:
1. Financial Model (Excel/Sheets)
   ├─ 12-month projection
   ├─ Unit economics by tier
   ├─ Break-even analysis
   ├─ Sensitivity analysis (5+ variables)
   └─ Conservative / Realistic / Optimistic scenarios
   
2. Metrics Tracking System
   ├─ Google Sheets dashboard (daily/weekly/monthly)
   ├─ Stripe query setup
   ├─ Supabase subscription table queries
   ├─ Automated reporting template
   └─ KPI targets documented
   
3. Unit Economics Analysis
   ├─ Per-tier margins and LTV
   ├─ CAC assumptions and targets
   ├─ Payback period goals
   └─ Tier recommendations (prioritize Professional?)
   
4. Executive Dashboard (1-page summary)
   ├─ Current MRR
   ├─ Customer count by tier
   ├─ Churn rate
   ├─ LTV:CAC ratio
   ├─ Runway
   └─ Status vs goals (RAG - Red/Amber/Green)

SUCCESS CRITERIA:
- Financial model covers 12 months with 3 scenarios
- Metrics tracked automatically (or semi-auto)
- Unit economics clear and defensible
- KPIs aligned with business goals
- Model updates monthly based on actuals
- Enough clarity to make pricing/spending decisions

ASSUMPTIONS TO VALIDATE:
- CAC of $100-200 (PH launch, organic)
- Churn of 3-5% monthly
- Average tenure: 20-30 months
- Freemium conversion: 5-10%
- Tier mix: 70% Starter, 25% Professional, 5% Enterprise

CONSTRAINTS:
- Must use real Stripe data (not guesses)
- Must be updateable monthly
- Must not require heavy analysis (automate what you can)
- Must inform decision-making (not just numbers)
```

---

### 5️⃣ AGENT: Sales & Customer Success
**Responsibility:** Customer interviews, onboarding, support strategy  
**Timeline:** Weeks 1-4 (concurrent with other phases)  
**Deliverables:** Interview findings, onboarding flow, support plan

---

## PROMPT PARA AGENT: Sales & Customer Success

```
OBJETIVO PRINCIPAL:
Establecer la estrategia de ventas, onboarding y customer success que convertirá
beta customers en fans evangelistas.

CONTEXT:
- AKIRA: SaaS para agencias/freelancers
- Beta timeline: Weeks 3-4 (5-10 customers)
- Goal: Understand pain points, refine messaging, build loyalty

TAREAS:

WEEK 1: CUSTOMER RESEARCH
├─ Interview guide (15 questions):
│  ├─ Background (company size, team, role)
│  ├─ Current tools and frustrations
│  ├─ Biggest pain point (not "what's your biggest need", ask problem first)
│  ├─ How do you currently solve this?
│  ├─ Have you tried alternatives? (gauge awareness)
│  ├─ What would make you switch?
│  ├─ Price sensitivity (what would you pay?)
│  ├─ How many people would use this?
│  ├─ Decision criteria (features, support, price?)
│  ├─ Timeline (when would you need it?)
│  ├─ Biggest blocker to switching
│  ├─ Who else should we talk to?
│  └─ May we include your quote/testimonial?

├─ Outreach strategy:
│  ├─ Where to find beta customers:
│  │  ├─ Your personal network (easiest)
│  │  ├─ Twitter outreach (@agencies, founders)
│  │  ├─ Indie Hackers community
│  │  ├─ Reddit r/EntrepreneurRideAlong
│  │  ├─ LinkedIn groups (agencies)
│  │  └─ Facebook groups (freelancers/agencies)
│  │
│  ├─ Incentive:
│  │  ├─ 6 months free Professional tier
│  │  ├─ OR lifetime 50% discount
│  │  ├─ OR free Enterprise for first 2 customers
│  │  └─ Goal: remove price objection for feedback
│  │
│  └─ Cadence:
│     ├─ Week 1: Recruit 3 customers
│     ├─ Week 2: Recruit next 3-5
│     ├─ Week 3: Conduct interviews
│     ├─ Week 4: Analyze + adjust messaging

├─ Feedback collection methods:
│  ├─ 1-on-1 interviews (Zoom, 30 min)
│  ├─ Usage data analysis (what features do they use?)
│  ├─ Follow-up survey (quick form)
│  ├─ Slack channel (direct feedback)
│  └─ Weekly check-ins

└─ Analysis & summary:
   ├─ Transcribe interviews
   ├─ Extract common themes
   ├─ Identify feature gaps
   ├─ Gauge price sensitivity
   ├─ Document by persona (agency owner, freelancer, etc)
   └─ Update marketing messaging based on findings

WEEK 2-4: ONBOARDING & SUPPORT
├─ Onboarding sequence:
│  ├─ Email 1 (welcome):
│  │  ├─ Celebrate their signup
│  │  ├─ Key benefits (2-3 points)
│  │  ├─ First action to take
│  │  ├─ Link to getting-started video
│  │  └─ Support email (direct line)
│  │
│  ├─ Email 2 (day 3, if no login):
│  │  ├─ "I noticed you haven't logged in yet"
│  │  ├─ Offer 15-min setup call
│  │  ├─ Common first steps
│  │  └─ Help video
│  │
│  ├─ Email 3 (week 1):
│  │  ├─ "Here's what successful customers do"
│  │  ├─ Feature highlight (most relevant to THEM)
│  │  ├─ Case study or testimonial
│  │  └─ Upsell: "Upgrade to Professional"
│  │
│  ├─ Email 4 (week 2):
│  │  ├─ Check-in: "How's it going?"
│  │  ├─ Offer a call if stuck
│  │  ├─ Share productivity tips
│  │  └─ Collect NPS feedback
│  │
│  └─ Email 5 (day 27):
│     ├─ Final reminder before free tier ends
│     ├─ Strong value prop for upgrade
│     ├─ Price summary (Starter: $29/mo)
│     ├─ FAQ on cancellation
│     └─ Link to upgrade

├─ Onboarding video (DIY):
│  ├─ 5-min walkthrough video
│  ├─ Loom screen recording
│  ├─ Show: Import clients → Create project → First invoice
│  ├─ Hosted: Link in emails + in-app
│  └─ Update monthly as features change

├─ Help center / FAQ:
│  ├─ Use existing knowledge base (TipTap)
│  ├─ Write 10 docs minimum:
│  │  ├─ Getting started (5 min)
│  │  ├─ Set up team members
│  │  ├─ First project (step-by-step)
│  │  ├─ Invoice customers (step-by-step)
│  │  ├─ Time tracking basics
│  │  ├─ Import data from Spreadsheet
│  │  ├─ Integrate with Slack
│  │  ├─ Pricing & billing
│  │  ├─ Cancel subscription
│  │  └─ Contact support
│  │
│  ├─ SEO-friendly (help.akira-os.com?)
│  └─ Link from every email

├─ Support infrastructure:
│  ├─ Email: hello@akira-os.com
│  │  ├─ Response time: < 4 hours
│  │  ├─ Template responses (for common Qs)
│  │  └─ Track in Notion/Airtable
│  │
│  ├─ In-app chat (optional, later)
│  │  ├─ Intercom or similar
│  │  ├─ Initial launch post-PH
│  │  └─ Adds overhead, delays to later
│  │
│  └─ Escalation path:
│     ├─ Tier 1: FAQ / self-serve docs
│     ├─ Tier 2: Email support (founder responds)
│     ├─ Tier 3: 1-on-1 call (blocked or high-value customer)
│     └─ Bug reports → dev team (#dev channel)
│
└─ Testimonial & referral loop:
   ├─ Ask for testimonial after "aha moment" (first invoice sent, first project completed)
   ├─ Ask for referral after 30 days if NPS >= 9
   ├─ Simple referral incentive (1 month free per referral)
   └─ Track in CRM (AKIRA's own Clients module — dogfooding)

DELIVERABLES FINALES:
1. Customer Interview Guide (15 preguntas)
   ├─ Question set + rationale per question
   ├─ Outreach script/templates (network, Twitter, IH, Reddit, LinkedIn)
   ├─ Incentive structure for participants
   └─ Interview scheduling process

2. Onboarding Email Sequence (5 emails)
   ├─ Welcome, day-3 nudge, week-1 highlight, week-2 check-in, day-27 upgrade
   ├─ Copy for each email
   ├─ Trigger logic (time-based + behavior-based)
   └─ 5-min onboarding video script + hosting plan

3. Help Center / FAQ (10 docs)
   ├─ Getting started, team setup, first project, invoicing, time tracking,
   │  data import, Slack integration, pricing/billing, cancellation, support
   ├─ Published in Knowledge Base (TipTap)
   └─ Linked from every onboarding email

4. Support Infrastructure Setup
   ├─ hello@akira-os.com configured, <4h response SLA
   ├─ Template responses for top 10 questions
   ├─ Escalation tiers documented
   └─ Testimonial/referral loop defined

SUCCESS CRITERIA:
- 10+ customer interviews completed by end of Week 1
- Common pain points and objections documented and shared with Product/Growth
- 5% minimum activation rate (beta signups completing first key action)
- NPS > 50 among beta customers
- Onboarding emails auto-sending with correct triggers
- At least 3 testimonials collected for landing page/PH launch

CONSTRAINTS:
- No dedicated support team — founder handles all support personally at this stage
- Interviews must not feel like a sales pitch (listen first, sell second)
- Incentives must not distort pricing signal (track separately from paid conversions)
- Help docs must stay in sync with actual product (update when features change)

TOOLS/RESOURCES:
- Zoom (customer interviews)
- Notion/Airtable (support ticket tracking)
- Loom (onboarding video)
- Mailchimp or similar (onboarding email automation)
- Knowledge Base / TipTap editor (help docs)

ESCALATION:
- If interview recruitment stalls: widen outreach channels, offer stronger incentive
- If activation rate is low: pair with Product Manager to simplify first-run experience
- If a beta customer is at churn risk: schedule call within 24 hours
```

---

## ✅ Plan Completo

Los 5 prompts de agentes están definidos end-to-end: **Product Manager**, **Growth & Marketing**,
**Developer**, **Business/Finance**, y **Sales & Customer Success**. Cada uno tiene objetivo,
contexto, tareas semana a semana, deliverables finales, success criteria, constraints y
tools/resources — listos para copiar y pasar a un agente specific.

Ver `AGENT_PROMPTS_INDEX.md` para el resumen ejecutivo, timeline visual de 90 días, y el
flujo de coordinación entre agentes.
│  