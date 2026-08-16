# AKIRA — Sales, Onboarding & Customer Success Plan

**Agent:** 5️⃣ Sales & Customer Success
**Timeline:** Weeks 1–4 (concurrent with Product/Finance/Dev tracks)
**Owner:** Marc
**Goal:** Turn 5–10 beta customers into evangelists — validated pain points, refined messaging, real testimonials, and a repeatable onboarding motion before Product Hunt.

---

## 1. Customer Interview Guide (15 Questions)

**Format:** 30-min Zoom call, recorded (with permission) for transcription. One interviewer, one note-taker if possible (or use Otter.ai/Zoom transcript).

**Opening (1 min):** *"Thanks for taking the time. This isn't a sales call — I want to understand how you run your agency/freelance business today, warts and all. There are no wrong answers, and if AKIRA isn't a fit, I genuinely want to know that too."*

### Background
1. Tell me about your business — team size, how long you've been running it, and what kind of work you do.
2. What's your role day-to-day, and how much of it is "running the business" vs. doing the client work itself?

### Current tools & pain
3. Walk me through the tools you currently use to manage clients, projects, and invoicing — one by one.
4. Of all of those, which one causes you the most friction or frustration *this week*? (Push for a specific recent incident, not a generality.)
5. When that friction happens, what do you actually do — work around it, complain, tolerate it, or actively look for something new?

### Solution awareness
6. Have you looked at or tried alternatives (Notion, Monday, Basecamp, HoneyBook, Dubsado, spreadsheets)? What happened?
7. What would have to be true for you to actually switch tools, given the pain of migrating?

### Price & decision criteria
8. If a tool solved [the pain point they named in Q4] completely, what would you expect to pay for it monthly?
9. Who else, besides you, would use this day-to-day? (Gauges seat count / team buy-in needed.)
10. When you're evaluating a tool like this, what matters most — price, specific features, support quality, or something else? Rank if you can.

### Timing & blockers
11. If you decided today this was the right tool, when would you actually be able to implement it? What's competing for your time?
12. What's the single biggest thing that would stop you from switching, even if you loved the product?

### Referral & closing
13. Who else do you know running an agency or freelance business who deals with the same problems?
14. Would you be open to a follow-up call in a few weeks once you've used AKIRA, to tell me what's working and what isn't?
15. If AKIRA solves this well for you, would you be comfortable being quoted (name + company) on the landing page or in a case study?

**Post-call (same day):** Write a 5-bullet summary while it's fresh — persona, top pain point (verbatim quote if possible), price signal, blocker, referral names.

---

## 2. Beta Customer Outreach Strategy

### Where to find them
| Channel | Approach | Effort |
|---|---|---|
| Personal network | Direct DM/email to agency owners, freelancers you already know | Lowest — start here Week 1 |
| Twitter/X | Reply + DM to people posting about agency ops pain, indie SaaS founders | Medium |
| Indie Hackers | Post in "Ask IH" asking for beta testers, offer free tier | Medium |
| Reddit r/EntrepreneurRideAlong, r/freelance, r/agency | Value-first post (not a pitch) linking to a short survey, then DM interested repliers | Medium |
| LinkedIn agency/freelancer groups | Comment + connect, then soft pitch in DM | Medium-high |
| Facebook groups (freelancer/agency) | Same as LinkedIn — check group rules on self-promotion first | Medium-high |

**Rule:** lead with the interview, not the product. "I'm researching how agencies manage client work and I'll trade you a free year of the tool I'm building for 30 minutes of your time" converts far better than "check out my SaaS."

### Incentive (pick one, be consistent)
- **6 months free Professional tier** for all beta interviewees — recommended default, keeps commitment reasonable.
- **Lifetime 50% discount** for the first 10 who convert to paid after beta.
- **Free Enterprise tier** for the first 2 customers only, as a flagship-logo play.

Goal: remove the price objection entirely so feedback is about the product, not the cost.

### Cadence
- **Week 1:** Recruit 3 customers (personal network first).
- **Week 2:** Recruit next 3–5 (communities + social).
- **Week 3:** Conduct all interviews, begin onboarding the earliest signups.
- **Week 4:** Analyze findings, adjust messaging, keep onboarding stragglers.

### Feedback collection methods (ongoing, not just Week 1)
- 1-on-1 interviews (Zoom, 30 min) — Week 3, primary source.
- Usage data — which features get opened in the first 7 days (proxy for activation).
- Short follow-up survey (Typeform/Google Form, 5 questions) at day 14.
- Dedicated Slack Connect channel or WhatsApp group for real-time feedback.
- Weekly async check-in message: "How's it going, what's blocking you?"

### Analysis & synthesis (end of Week 4)
- Transcribe all interviews (Otter.ai or manual notes).
- Tag responses by theme (pricing, missing feature, UX friction, switching cost).
- Group findings by persona: **Solo Freelancer**, **Small Agency Owner (2–10 people)**, **Growing Agency (10–50 people)**.
- Write a 1-page findings summary: top 3 pain points per persona, price sensitivity range, most-requested missing feature, strongest quote per persona.
- Feed this directly into the Growth agent's landing page copy and the Product Manager's tier definitions.

---

## 3. Onboarding Email Sequence (5 Emails)

Send via Resend (already in the stack). Trigger on signup event; branch Email 2 on login status.

### Email 1 — Welcome (sent immediately on signup)

> **Subject:** You're in — let's get your first project set up
>
> Hi {{first_name}},
>
> Welcome to AKIRA. You just joined a small beta group of agency owners and freelancers who are done juggling five different tools to run their business.
>
> Here's what AKIRA gives you in one place:
> - **Clients + Projects** — CRM and Kanban boards, linked together
> - **Invoicing** — professional PDFs, sent and tracked without leaving the app
> - **Your first step:** add your first client and create a project — takes about 3 minutes.
>
> [Watch the 5-min getting started video →]
> [Add your first client →]
>
> Stuck on anything, just reply to this email — it comes straight to me, not a ticket queue.
>
> — Marc, founder of AKIRA

### Email 2 — Day 3, sent only if no login recorded

> **Subject:** Noticed you haven't logged in yet — want a hand?
>
> Hi {{first_name}},
>
> I saw you signed up for AKIRA but haven't had a chance to log in yet — totally normal, everyone's busy.
>
> If it'd help, I'm happy to jump on a 15-minute call and set up your first client and project with you live, so you walk away with something actually working.
>
> [Book 15 minutes with me →]
>
> Or if you'd rather go it alone, here's the fastest path:
> 1. Log in → Add a client
> 2. Create a project for them
> 3. Send your first invoice
>
> [Getting started video (5 min) →]
>
> — Marc

### Email 3 — Week 1

> **Subject:** What successful AKIRA users do in their first week
>
> Hi {{first_name}},
>
> The agencies getting the most out of AKIRA in week one all do the same three things:
> 1. Import their existing client list (don't start from zero)
> 2. Set up one active project with real tasks
> 3. Send at least one invoice through the platform, not their old tool
>
> **Feature spotlight:** {{most_relevant_feature}} — [based on their signup context/industry].
>
> "{{beta_testimonial_quote}}" — {{beta_customer_name}}, {{beta_customer_company}}
>
> If you're already finding AKIRA useful for managing more than one client, Professional tier unlocks unlimited projects, AI insights, and advanced analytics. [See what's included →]
>
> — Marc

### Email 4 — Week 2

> **Subject:** How's it going so far?
>
> Hi {{first_name}},
>
> Quick check-in — how has the first two weeks with AKIRA been? I read every reply personally.
>
> If something's confusing or missing, tell me — beta feedback directly shapes what gets built next.
>
> If you're stuck on anything specific, I'm happy to hop on a quick call: [Book time →]
>
> One tip a few users have found helpful: {{productivity_tip}}.
>
> Quick one-question favor — on a scale of 0–10, how likely are you to recommend AKIRA to another agency owner or freelancer? Just reply with a number.
>
> — Marc

### Email 5 — Day 27 (before free tier / beta period ends)

> **Subject:** Your beta access wraps up in 3 days
>
> Hi {{first_name}},
>
> Your beta period ends in 3 days. Here's what happens next:
>
> - **Starter — $29/mo:** up to 3 projects, unlimited clients, invoicing, basic analytics
> - **Professional — $99/mo:** unlimited projects, AI insights, advanced analytics, priority support
> - As a beta tester, you keep your **{{beta_incentive}}** — no action needed if you already redeemed it.
>
> **Cancelling?** No hard feelings — reply and let me know why, it genuinely helps. Your data stays available for 30 days in case you change your mind.
>
> [Upgrade now →]  [See full pricing / FAQ →]
>
> Thanks for being one of the first people to actually use AKIRA — it means a lot.
>
> — Marc

---

## 4. Onboarding Video (DIY, Loom)

**Length:** 5 minutes. **Flow to record:**
1. (0:00–0:30) What AKIRA is, in one sentence — "one place to run your agency instead of five tools."
2. (0:30–2:00) Import/add a client → show the CRM view.
3. (2:00–3:30) Create a project from that client, add 2–3 tasks to the Kanban board.
4. (3:30–4:30) Generate and send the first invoice as a PDF.
5. (4:30–5:00) Where to get help — support email + help center link.

**Distribution:** embed in Email 1, pin in the in-app dashboard for first-time users, link at the top of the help center. Re-record monthly as UI changes (note as a recurring task, not one-time).

---

## 5. Help Center — 10 Core Docs

Build these in the existing Knowledge Base (TipTap). Each is written below at publish-ready length — copy into the KB and adjust screenshots.

### Doc 1: Getting Started (5 minutes)
Welcome to AKIRA. In your first 5 minutes: (1) Add your first client under **Clients → New Client** — just name, email, and company. (2) Create a project for them from **Projects → New Project**, pick a template or start blank. (3) Add 3–5 tasks to your Kanban board so you can see progress at a glance. That's it — you now have a live workspace. Next: invite your team or send your first invoice.

### Doc 2: Set Up Team Members
Go to **Settings → Team → Invite Member**. Enter their email and choose a role: **Admin** (full access, billing), **Member** (day-to-day work, no billing/settings access), or **Viewer** (read-only, good for stakeholders). They'll get an email invite with a link to join your organization — no separate signup needed if they already have an AKIRA account. Manage or revoke access anytime from the same screen.

### Doc 3: Your First Project (Step-by-Step)
From **Projects → New Project**: name it, link it to a client, and pick a template (or "Blank" for full control). Templates auto-populate a Kanban board with common phases (e.g., Research → Execution → Review → Delivery). Drag tasks between columns as work progresses, assign team members to individual tasks, and set due dates so nothing slips. Use **Project Files** to attach briefs, assets, or contracts directly to the project.

### Doc 4: Invoice a Customer (Step-by-Step)
Go to **Invoices → New Invoice**, select the client and project, then add line items (description, quantity, rate). AKIRA calculates totals and tax automatically. Preview the PDF, then either download it or send it directly to the client's email with one click. Track status (Draft → Sent → Paid → Overdue) from the Invoices list. If Stripe is connected, clients can pay online directly from the invoice email.

### Doc 5: Time Tracking Basics
Start a timer from any task via the clock icon, or log time manually with **Time Tracking → New Entry**. Mark entries as **Billable** or **Non-billable** — billable hours can be pulled directly into an invoice as line items, so you're never re-typing hours. Use the weekly/monthly view to see hours by project or by team member, useful for capacity planning and client reporting.

### Doc 6: Import Data from a Spreadsheet
Go to **Clients → Import** (or **Projects → Import**). Download the CSV template, fill in your existing data (name, email, company, etc.), and upload it. AKIRA validates the file and shows a preview before committing — nothing is written until you confirm. Common gotcha: make sure email columns don't have duplicate or blank rows, as those get flagged and skipped.

### Doc 7: Integrate with Slack
From **Settings → Integrations → Slack**, click **Connect** and authorize AKIRA to post to your workspace. Choose which channel receives notifications and which events trigger them — new invoice, project milestone hit, or teammate mentioned. Use **Send test message** to confirm it's wired up correctly before relying on it. Disconnect anytime from the same screen.

### Doc 8: Pricing & Billing
AKIRA has three tiers: **Starter ($29/mo)** — up to 3 projects, unlimited clients, invoicing. **Professional ($99/mo)** — unlimited projects, AI insights, advanced analytics, priority support. **Enterprise (custom)** — everything plus custom integrations and dedicated support. Manage your plan, view invoices, and update your payment method from **Settings → Subscription**. Upgrades apply immediately; downgrades take effect at the next billing cycle.

### Doc 9: Cancel Your Subscription
Go to **Settings → Subscription → Cancel Plan**. You'll be asked for a quick reason (optional but appreciated — it helps us improve). Your account moves to a free, read-only tier at the end of the current billing period, and your data is retained for 30 days in case you want to reactivate. After 30 days, data is permanently deleted per our data retention policy. No cancellation fees.

### Doc 10: Contact Support
Email **hello@akira-os.com** — a real person (Marc) reads and responds, typically within 4 hours during business hours. For faster help, include your organization name and a screenshot if it's a visual issue. This help center covers the most common questions; if you can't find an answer here, just ask.

**Publishing notes:**
- Host at `help.akira-os.com` if a subdomain is set up, otherwise inside the app's Knowledge base with a public share link.
- Link the help center from the footer of every onboarding email and from the in-app help icon.
- Revisit monthly — add a doc whenever a support question repeats 3+ times.

---

## 6. Support Infrastructure

### Email support (launch default)
- **Address:** hello@akira-os.com
- **SLA:** respond within 4 hours during business hours (set expectation, don't over-promise 24/7 as a solo founder).
- **Template responses** for the top 5 recurring questions (billing, cancellation, import issues, invite issues, invoice/PDF issues) — draft these after the first 2 weeks of real tickets, not before, so they reflect actual language customers use.
- **Tracking:** a simple Notion or Airtable board (Open / Waiting on customer / Resolved) is enough at this volume — no need for Zendesk/Intercom yet.

### In-app chat (explicitly deferred)
- Not for launch. Adds tooling overhead and expectation of instant response that a solo founder can't sustain pre-revenue.
- Revisit post-Product Hunt once there's either paid revenue to justify the cost or volume that email can't handle (rough trigger: 15+ tickets/week).

### Weekly rhythm during beta (Weeks 2–4)
- Monday: review weekend feedback/tickets, triage.
- Wednesday: async check-in message to all active beta users.
- Friday: log the week's findings into the interview synthesis doc (Section 1) — support tickets are also research data, not just fires to put out.

---

## 7. Success Metrics

| Metric | Target |
|---|---|
| Customer interviews completed | 10+ |
| Activation rate (creates first project within 3 days) | ≥ 50% |
| NPS during beta | > 50 |
| Support response time | < 4 hours |
| Beta → paid conversion | ≥ 1 customer on Starter/Professional by end of Week 4 |
| Testimonials/quotes secured | ≥ 3, usable on landing page |

---

## 8. Week-by-Week Checklist

- [ ] **Week 1:** Interview guide finalized · Recruit first 3 beta customers · Draft outreach messages per channel
- [ ] **Week 2:** Recruit next 3–5 beta customers · Onboarding emails 1–2 live · Help center docs 1–5 published
- [ ] **Week 3:** Conduct all 10 interviews · Onboarding emails 3–5 live · Help center docs 6–10 published · Slack/WhatsApp feedback channel active
- [ ] **Week 4:** Synthesize findings into persona summary · Hand off findings to Product Manager (pricing) and Growth (landing page copy) · Secure 3+ testimonials/quotes · Confirm at least 1 beta→paid conversion
