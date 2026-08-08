# CLAUDE.md — AKIRA SaaS

This guide provides comprehensive guidance for Claude Code when working with AKIRA, a full-featured SaaS platform for business operations management.

---

## 🚀 CRITICAL: Deployment & Domains

**DO NOT CHANGE THESE SETTINGS** — This prevents errors:

| Setting | Value |
|---------|-------|
| **GitHub Repository** | https://github.com/c29mvyxtj4-maker/akira |
| **Main Branch** | `master` |
| **Vercel Project Name** | `akira-os` ← **NOT** akira-saas |
| **Production Domain** | https://akira-os-dun.vercel.app |
| **Project Root** | `akira-saas/` (folder, NOT root) |
| **Build Command** | `npm run build` |
| **Install Command** | `npm install --legacy-peer-deps` |

**⚠️ MISTAKE TO AVOID:**
- ❌ Do NOT deploy to "akira-saas-five" Vercel project — that's disconnected
- ✅ Only deploy to "akira-os" Vercel project — it's connected to GitHub
- ✅ When pushing to master branch, Vercel auto-deploys to akira-os-dun.vercel.app

---

## 🎬 YouTube Projects System (AKIRA v2.0 Feature)

**Purpose:** Marc is a content creator. This system automates video production workflow planning.

### Core Features
1. **Project Templates** — 5 predefined templates:
   - Tutorial (research → recording → editing → publishing)
   - Short Film (concept → storyboard → production → post-production)
   - Documentary (research → interviews → editing → sound design)
   - Review (research → recording → editing → publishing)
   - Podcast (planning → recording → editing → publishing)

2. **Automatic Phase Generation** — When creating a YouTube project:
   - Select template + publishing deadline
   - System calculates all phases working **backwards from deadline**
   - Creates youtube_phases with start/end dates
   - Creates youtube_milestones with reminders (3 days, 1 day before)

3. **Smart Timeline** — Visual progress tracking:
   - See all phases at a glance
   - Color-coded by phase type
   - Mark phases as completed
   - Track estimated vs actual hours
   - At-risk phases highlighted if deadline approaching

4. **Metrics Dashboard** — Project overview:
   - Overall progress %
   - Days until publishing
   - Hours invested vs estimated
   - Phases at risk
   - Time breakdown by phase

### Database Schema
```
youtube_projects
├── id, project_id, org_id
├── title, description, template
├── publishing_date (the key: all phases calculated from this)
├── status: planning | in-progress | completed | published
└── metadata (JSON)

youtube_phases
├── id, youtube_project_id
├── phase_name: research | planning | scripting | recording | editing | review | publishing
├── start_date, end_date (auto-calculated)
├── status: pending | in-progress | completed
├── estimated_hours, actual_hours
└── deliverables (what gets done in this phase)

youtube_milestones
├── id, youtube_phase_id
├── title, due_date, due_time
├── reminder_days: [3, 1]  (notify 3 days and 1 day before)
└── completed_at (when finished)
```

### File Structure
```
src/
├── pages/YouTube.jsx                   # Main project page
├── components/YouTube/
│   ├── YouTubeProjectForm.tsx          # Create new project
│   ├── YouTubeTimeline.tsx             # Visual phase timeline
│   ├── YouTubeMetrics.tsx              # Progress dashboard
│   └── index.ts
├── services/youtube.service.ts         # Supabase queries
├── hooks/useYouTube.ts                 # React state management
├── utils/dateCalculations.ts           # Phase date math
├── data/youtubeTemplates.ts            # Template definitions
└── types/youtube.ts                    # TypeScript interfaces

supabase/migrations/
└── 20260808_create_youtube_tables.sql  # Database tables + RLS
```

### How It Works
**Example: Tutorial Video due August 15, 2026**

1. User clicks "New YouTube Project"
2. Fills form:
   - Title: "React Hooks Tutorial"
   - Template: Tutorial
   - Publishing Date: August 15, 2026
3. System calculates backwards:
   - Publishing: Aug 14 (1 day)
   - Review: Aug 12-13 (2 days)
   - Editing: Aug 5-11 (7 days)
   - Recording: Jul 31-Aug 4 (5 days)
   - Planning: Jul 29-30 (2 days)
   - Research: Jul 26-28 (3 days)
4. Creates all phases + milestones automatically
5. User sees timeline with:
   - Each phase with dates
   - Deliverables for each phase
   - Estimated hours
   - Progress bar

### Key Functions
```typescript
// In YouTubeService.ts
createYouTubeProject()      // Create + auto-generate phases
getYouTubeProject()         // Fetch project with all phases
updatePublishingDate()      // Change deadline → recalculate all phases
completePhase()             // Mark phase done + track hours
deleteYouTubeProject()      // Delete (cascades to phases/milestones)

// In dateCalculations.ts
calculatePhaseDates()       // The core algorithm
recalculatePhasesForNewDate() // Recalc if deadline changes
daysUntil()                 // How many days to a date
isPhaseAtRisk()             // Approaching deadline?
calculateProjectProgress()  // % done
```

### Integration with Other Features
- **Calendar:** YouTubeMilestones sync with Calendar events (future)
- **Projects:** YouTube projects can be linked to main projects
- **Dashboard:** Widget showing "Next YouTube Milestone"
- **Time Tracking:** Hours logged can sync with youtube_phases.actual_hours
- **Brain (AI):** Can suggest next steps based on phase

### Navigation
- Menu item in Dock (Film icon) → `/youtube`
- Constant: `ROUTES.YOUTUBE = '/youtube'`
- No database migrations needed — new tables are isolated

### Customization Points
Users can later:
- Edit template phases
- Manually change phase dates (auto-syncs)
- Add custom milestones
- Adjust estimated hours
- Set reminders per milestone

---

## 🎯 Project Overview

**AKIRA** is a multi-tenant SaaS application for agencies and freelancers to manage:

- **CRM & Clients** — Profiles, timelines, communication, client portal access
- **Projects** — Kanban board, task templates, progress tracking, resource allocation
- **Finance** — Categories, forecasts, quarterly reports (PDF), cash flow analysis
- **Invoicing** — Invoice/quote generation with PDF, automatic numbering, tax calculation, Stripe payments
- **Time Tracking** — Hours logged per project, billable vs. non-billable
- **Knowledge Base** — Rich-text editor (TipTap) with file uploads and sharing
- **Client Portal** — Magic-link authentication, messaging, file downloads, invoice/quote approvals
- **AI Assistant** — Conversational AI (Gemini) for insights, smart actions, and business operations
- **Team & Organizations** — Multi-tenant with invitations, roles, and row-level security (RLS)
- **Mobile** — Native iOS app (Capacitor) + PWA support

---

## 🏗️ Full Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 18.3.1 |
| **Build Tool** | Vite (with rolldown/oxc) | 5.4.2 |
| **Styling** | TailwindCSS | 3.4.10 |
| **Animations** | Framer Motion | 11.3.31 |
| **Routing** | React Router | 6.26.2 |
| **Data Visualization** | Recharts | 2.12.7 |
| **Icons** | Lucide React | 0.414.0 |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime + RLS) | 2.45.4 |
| **Email** | Resend | — |
| **Payments** | Stripe (Checkout + Webhooks) | — |
| **AI** | Google Generative AI (Gemini) | — |
| **Rich Text Editor** | TipTap | 3.27 |
| **PDF Generation** | jsPDF + AutoTable | 4.2 |
| **Mobile Framework** | Capacitor | 8.4 |
| **Image Processing** | sharp | — |
| **Monitoring** | Sentry | — |
| **Testing** | Vitest + jsdom | — |
| **Utility Functions** | clsx | 2.1.1 |
| **Fonts** | Fraunces (fontsource) | 5.3.0 |

---

## 📂 Complete Directory Structure

```
AKIRA/
├── akira-saas/                         # Main SaaS web application
│   ├── src/
│   │   ├── pages/                      # Page/route components (~30 pages)
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── portal/
│   │   │   │   ├── PortalLogin.jsx
│   │   │   │   └── PortalDashboard.jsx
│   │   │   ├── Dashboard.jsx           # Home / analytics overview
│   │   │   ├── Clients.jsx             # Client management & CRM
│   │   │   ├── Projects.jsx            # Kanban board, project details
│   │   │   ├── Services.jsx            # Service catalog management
│   │   │   ├── Subscriptions.jsx       # Recurring billing & subscriptions
│   │   │   ├── Finance.jsx             # Financial overview, categories, forecasts
│   │   │   ├── Invoices.jsx            # Invoice management & creation
│   │   │   ├── Quotes.jsx              # Quote management
│   │   │   ├── Offers.jsx              # Proposals / offers
│   │   │   ├── Calendar.jsx            # Scheduling & events
│   │   │   ├── Documents.jsx           # Document management
│   │   │   ├── Knowledge.jsx           # Knowledge base (TipTap editor)
│   │   │   ├── Brain.jsx               # AI assistant conversation interface
│   │   │   ├── AIOperatives.jsx        # AI automations / smart actions
│   │   │   ├── TimeTracking.jsx        # Time logging & billable hours
│   │   │   ├── Mensajes.jsx            # Internal messaging (Spanish naming)
│   │   │   ├── InboxPage.jsx           # Unified inbox / notifications
│   │   │   ├── Inicio.jsx              # Experimental home page
│   │   │   ├── Settings.jsx            # Workspace & account settings
│   │   │   ├── JoinOrg.jsx             # Team invitation flow
│   │   │   ├── Legal.jsx               # Legal / terms & privacy
│   │   │   ├── LandingPage.jsx         # Marketing landing page
│   │   │   ├── AdminDashboard.jsx      # Admin oversight (if applicable)
│   │   │   └── ComingSoonPage.jsx      # Placeholder for future features
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.jsx        # Main app container, sidebar + content
│   │   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   │   ├── Topbar.jsx          # Header with branding & user menu
│   │   │   │   ├── CommandPalette.jsx  # Keyboard command launcher
│   │   │   │   └── NotificationsPanel.jsx
│   │   │   │
│   │   │   ├── ui/                     # Reusable, unstyled-by-default UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Dropdown.jsx
│   │   │   │   ├── Tabs.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Tooltip.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   ├── KeyboardShortcutsModal.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   └── Textarea.jsx
│   │   │   │
│   │   │   ├── charts/                 # Recharts visualizations
│   │   │   │   ├── BarChart.jsx
│   │   │   │   ├── AreaChart.jsx
│   │   │   │   ├── LineChart.jsx
│   │   │   │   ├── DonutChart.jsx
│   │   │   │   ├── ScatterChart.jsx
│   │   │   │   ├── PieChart.jsx
│   │   │   │   └── CustomTooltip.jsx
│   │   │   │
│   │   │   ├── dashboard/              # Dashboard-specific components
│   │   │   │   ├── KpiCard.jsx         # Metric card (value + trend)
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── ProjectsChart.jsx
│   │   │   │   ├── ActivityFeed.jsx
│   │   │   │   └── UpcomingEvents.jsx
│   │   │   │
│   │   │   ├── clients/                # Client management components
│   │   │   │   ├── ClientForm.jsx      # Create/edit client
│   │   │   │   ├── ClientList.jsx
│   │   │   │   ├── ClientCard.jsx
│   │   │   │   ├── ClientTimeline.jsx  # Activity timeline for a client
│   │   │   │   ├── ContactForm.jsx     # Manage contacts within client
│   │   │   │   └── ClientPortalAccess.jsx
│   │   │   │
│   │   │   ├── projects/               # Project management components
│   │   │   │   ├── KanbanBoard.jsx     # Drag-and-drop task board
│   │   │   │   ├── ProjectForm.jsx     # Create/edit project
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   ├── ProjectDetails.jsx
│   │   │   │   ├── TaskCard.jsx        # Individual task in Kanban
│   │   │   │   ├── ProjectMembers.jsx  # Team assignment
│   │   │   │   ├── ProjectFiles.jsx    # Project attachments
│   │   │   │   ├── ProjectSummary.jsx
│   │   │   │   └── TaskTemplateSelector.jsx  # Auto-apply task templates
│   │   │   │
│   │   │   ├── knowledge/              # Knowledge base components
│   │   │   │   ├── TipTapEditor.jsx    # Rich-text editor
│   │   │   │   ├── DocList.jsx         # Document listing
│   │   │   │   ├── FolderTree.jsx      # Folder navigation
│   │   │   │   ├── DocViewer.jsx       # Read-only document view
│   │   │   │   └── DocSearch.jsx       # Full-text search
│   │   │   │
│   │   │   ├── akira/                  # AI assistant components
│   │   │   │   ├── AskAkiraButton.jsx  # Floating AI button
│   │   │   │   ├── ChatWindow.jsx      # Conversation interface
│   │   │   │   ├── PromptTemplates.jsx # Quick action buttons
│   │   │   │   └── ActionPreview.jsx   # Preview AI suggestions
│   │   │   │
│   │   │   ├── operatives/             # AI Operatives (automation)
│   │   │   │   ├── OperativesList.jsx
│   │   │   │   ├── OperativeForm.jsx
│   │   │   │   └── OperativeScheduler.jsx
│   │   │   │
│   │   │   ├── settings/               # Settings page tabs
│   │   │   │   ├── ProfileTab.jsx
│   │   │   │   ├── WorkspaceTab.jsx
│   │   │   │   ├── BillingTab.jsx
│   │   │   │   ├── IntegrationsTab.jsx
│   │   │   │   ├── SecurityTab.jsx
│   │   │   │   ├── TeamTab.jsx
│   │   │   │   └── ApiKeysTab.jsx
│   │   │   │
│   │   │   ├── portal/                 # Client portal specific components
│   │   │   │   ├── PortalNav.jsx
│   │   │   │   ├── PortalInvoiceList.jsx
│   │   │   │   ├── PortalPayment.jsx   # Stripe payment form
│   │   │   │   ├── PortalMessages.jsx
│   │   │   │   └── PortalFileGallery.jsx
│   │   │   │
│   │   │   ├── effects/                # Animated/effect components
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── SkeletonLoader.jsx
│   │   │   │   └── EmptyState.jsx
│   │   │   │
│   │   │   ├── time/                   # Time tracking components
│   │   │   │   ├── TimeEntryForm.jsx
│   │   │   │   ├── TimeEntriesList.jsx
│   │   │   │   ├── TimesheetCalendar.jsx
│   │   │   │   └── BillableHoursSummary.jsx
│   │   │   │
│   │   │   ├── pwa/                    # PWA-specific components
│   │   │   │   └── InstallPrompt.jsx   # Add to home screen
│   │   │   │
│   │   │   ├── Stepper/                # Multi-step form component
│   │   │   │   ├── Stepper.jsx
│   │   │   │   └── BetaFormStepper.jsx
│   │   │   │
│   │   │   └── LandingPage.jsx         # Landing page (root level)
│   │   │
│   │   ├── services/                   # API & data access layer (abstracts Supabase)
│   │   │   ├── clients.service.js      # Client CRUD, timeline events, portal data
│   │   │   ├── projects.service.js     # Project queries, updates, task templates
│   │   │   ├── projectMembers.service.js
│   │   │   ├── projectFiles.service.js
│   │   │   ├── finance.service.js      # Financial data, categories, forecasts
│   │   │   ├── invoices.service.js     # Invoice CRUD, PDF generation
│   │   │   ├── quotes.service.js       # Quote management
│   │   │   ├── calendar.service.js     # Scheduling, events, availability
│   │   │   ├── knowledge.service.js    # Knowledge base docs, folders
│   │   │   ├── subscriptions.service.js# Recurring services
│   │   │   ├── audit.service.js        # Activity logs, audit trail
│   │   │   ├── brain.service.js        # AI conversation history
│   │   │   ├── brainActions.service.js # AI-assisted actions (Gemini integration)
│   │   │   ├── aiOperatives.service.js # AI automation / operatives
│   │   │   ├── advancedOperatives.service.js
│   │   │   ├── messages.service.js     # Internal messaging
│   │   │   ├── mentions.service.js     # @mentions, notifications
│   │   │   ├── categories.service.js   # Financial categories
│   │   │   ├── company.service.js      # Workspace / company info
│   │   │   ├── org.service.js          # Organization management
│   │   │   ├── portal.service.js       # Client portal data
│   │   │   ├── resourceAccess.service.js
│   │   │   ├── search.service.js       # Full-text search across records
│   │   │   ├── settings.service.js     # User preferences, workspace settings
│   │   │   ├── services.service.js     # Service catalog management
│   │   │   ├── time.service.js         # Time entry CRUD
│   │   │   ├── forecast.service.js     # Financial forecasting
│   │   │   ├── quarterlyReport.service.js
│   │   │   ├── templates.service.js    # Templates (documents, invoices, etc.)
│   │   │   ├── taskTemplates.service.js# Project task templates
│   │   │   ├── documents.service.js    # Document storage & versioning
│   │   │   ├── export.service.js       # CSV/PDF exports
│   │   │   └── kb.service.js           # Knowledge base (alternative/alias)
│   │   │
│   │   ├── context/                    # React Context providers
│   │   │   ├── AuthContext.jsx         # User auth state, session, profile
│   │   │   ├── OrgContext.jsx          # Organization/workspace selection
│   │   │   └── AppContext.jsx          # Global UI state, theme, preferences
│   │   │
│   │   ├── hooks/                      # Custom React hooks
│   │   │   ├── useAuth.js              # Access AuthContext
│   │   │   ├── useOrg.js               # Access OrgContext (or AppContext)
│   │   │   ├── useApp.js               # Access AppContext
│   │   │   ├── useClients.js           # Fetch & manage clients
│   │   │   ├── useProjects.js          # Fetch & manage projects
│   │   │   ├── useCalendar.js          # Calendar queries & mutations
│   │   │   ├── useKnowledge.js         # Knowledge base queries
│   │   │   ├── useNotifications.js     # Notification state & subscriptions
│   │   │   ├── usePreferences.js       # User settings/preferences
│   │   │   ├── useKeyboardShortcuts.js # Register keyboard commands (Cmd+K, etc.)
│   │   │   ├── usePWA.js               # PWA install & update detection
│   │   │   └── useNotifications.test.js# Hook unit tests
│   │   │
│   │   ├── lib/
│   │   │   └── supabase.js             # Supabase client initialization
│   │   │
│   │   ├── config/
│   │   │   ├── constants.js            # ROUTES, STATUS enums, BADGE_COLORS, etc.
│   │   │   └── motion.js               # Framer Motion preset animations
│   │   │
│   │   ├── data/
│   │   │   ├── templates/              # Invoice, quote, document templates
│   │   │   └── staticData.js           # Pre-defined data (industries, etc.)
│   │   │
│   │   ├── utils/
│   │   │   ├── generateInvoicePdf.js   # jsPDF invoice generation
│   │   │   ├── generateQuotePdf.js     # jsPDF quote generation
│   │   │   ├── csvExport.js            # CSV export utilities
│   │   │   ├── dateUtils.js            # Date formatting & calculations
│   │   │   ├── formatters.js           # Number, currency formatting
│   │   │   └── helpers.js              # General utilities
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css             # CSS variables for theme (--brand-500, --text-1, etc.)
│   │   │   ├── index.css               # Global resets & base styles
│   │   │   ├── App.css                 # App-level styles
│   │   │   ├── tiptap.css              # TipTap editor styles
│   │   │   └── animations.css          # Custom animations (loader, transitions)
│   │   │
│   │   ├── assets/
│   │   │   ├── images/                 # PNG, JPG, SVG images
│   │   │   └── icons/                  # SVG icon assets
│   │   │
│   │   ├── main.jsx                    # App entry, context providers
│   │   └── App.jsx                     # Routes, navigation, layout
│   │
│   ├── supabase/
│   │   └── functions/                  # Edge Functions (Deno)
│   │       ├── create-checkout/        # Stripe Checkout session creation
│   │       ├── stripe-webhook/         # Payment confirmation webhook
│   │       ├── send-email/             # Resend email sending
│   │       └── ...                     # Other serverless functions
│   │
│   ├── public/                         # Static assets served at root
│   │   ├── icons/
│   │   ├── logo.svg
│   │   └── manifest.json               # PWA manifest
│   │
│   ├── index.html                      # HTML entry point
│   ├── vite.config.js                  # Vite configuration (@ alias, oxc settings)
│   ├── tailwind.config.js              # TailwindCSS configuration
│   ├── postcss.config.js               # PostCSS plugins
│   ├── .oxlintrc.json                  # Oxlint rules (React, code quality)
│   ├── package.json                    # Dependencies
│   └── .env                            # (local) Supabase credentials, API keys
│
├── ios/                                # Capacitor iOS app
│   ├── Podfile                         # CocoaPods dependencies
│   ├── ios/                            # Xcode project files
│   └── ...
│
├── landing/                            # Marketing landing page (separate app?)
│   └── ...
│
├── docs/                               # Documentation
│   └── ...
│
├── .claude/                            # Claude Code config
│   ├── launch.json                     # Dev server configuration
│   └── settings.json                   # Permissions, hooks
│
├── .github/workflows/                  # CI/CD
│   ├── ci.yml
│   └── deploy.yml
│
├── .gitignore
├── .env.example                        # Template for .env
├── CLAUDE.md                           # This file
├── README.md                           # Project overview (Spanish)
├── package.json                        # Root-level scripts (monorepo?)
└── PHASE2_DATABASE_SCHEMA.sql          # Database schema documentation
```

---

## 🔑 Core Concepts & Architecture

### State Management with Context API

Three main context providers manage all app state:

1. **AuthContext** (`src/context/AuthContext.jsx`)
   - Manages Supabase auth session (`user`, `session`)
   - Loads and caches user profile (`profiles` table)
   - Exposes: `useAuth()` hook
   - Properties: `user`, `profile`, `isAuthenticated`, `loading`, methods like `logout()`

2. **OrgContext** (`src/context/OrgContext.jsx`)
   - Manages workspace/organization selection and data
   - Stores current org ID, org members, settings
   - Exposes: `useOrg()` hook
   - Handles multi-tenant isolation

3. **AppContext** (`src/context/AppContext.jsx`)
   - Global UI state: theme (light/dark), sidebar state, notifications
   - User preferences, sidebar collapsed state
   - Exposes: `useApp()` hook
   - Properties: `theme`, `sidebarOpen`, `notifications[]`, etc.

**Usage:**
```javascript
import { useAuth } from '@/context/AuthContext'
import { useOrg } from '@/context/OrgContext'
import { useApp } from '@/context/AppContext'

function MyComponent() {
  const { user, profile } = useAuth()
  const { currentOrg } = useOrg()
  const { theme, toggleTheme } = useApp()
}
```

### Service Layer Pattern

All Supabase queries are abstracted into `src/services/`. Each service is a module with async functions:

**Example: `clients.service.js`**
```javascript
import { supabase } from '@/lib/supabase'

export async function fetchClients(filters = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  return supabase
    .from('clients')
    .select('*')
    .eq('org_id', user.org_id)
    .order('created_at', { ascending: false })
}

export async function createClient(client) {
  const { data: { user } } = await supabase.auth.getUser()
  return supabase.from('clients').insert({
    ...client,
    org_id: user.org_id,
  })
}

export async function updateClient(id, updates) {
  return supabase.from('clients').update(updates).eq('id', id)
}

export async function deleteClient(id) {
  return supabase.from('clients').delete().eq('id', id)
}
```

**Services included:**
- `clients.service.js` — Client profiles, contacts, timeline events
- `projects.service.js` — Projects, tasks, templates
- `invoices.service.js` — Invoice CRUD, numbering, PDF
- `finance.service.js` — Categories, forecasts, reports
- `knowledge.service.js` — Documents, folders, full-text search
- `brain.service.js` — AI conversation history
- `brainActions.service.js` — AI-assisted operations (Gemini API calls)
- `time.service.js` — Time entries, billable hours
- `messages.service.js` — Internal team messaging
- `portal.service.js` — Client portal access, payments
- _and many more_ — check `src/services/` for the full list

### Component Patterns

1. **Page Components** (`src/pages/`)
   - Handle routing and compose layout + features
   - Import `AppShell` for main layout
   - Call service functions and manage local state
   - Example: `src/pages/Clients.jsx`

2. **Feature Components** (e.g., `src/components/clients/ClientForm.jsx`)
   - Medium-grained components combining UI + logic
   - May call services directly
   - Managed state, side effects (useEffect)
   - Example: Client form with validation

3. **UI Components** (`src/components/ui/`)
   - Small, reusable, minimal styling
   - Props-driven, no direct service calls
   - Examples: `Button`, `Input`, `Card`, `Modal`
   - Styled with Tailwind classes passed as props

### Routing

Routes are defined in `src/App.jsx`:

```javascript
<Routes>
  {/* Public routes */}
  <Route path={ROUTES.LOGIN} element={<Login />} />
  <Route path={ROUTES.RESET} element={<ResetPassword />} />

  {/* Private routes */}
  <Route element={<PrivateRoute><AppShell /></PrivateRoute>}>
    <Route path={ROUTES.HOME} element={<Dashboard />} />
    <Route path={ROUTES.CLIENTS} element={<Clients />} />
    <Route path={ROUTES.PROJECTS} element={<Projects />} />
    {/* ... more routes */}
  </Route>
</Routes>
```

**Route constants** defined in `src/config/constants.js`:
```javascript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  RESET: '/reset-password',
  CLIENTS: '/clients',
  PROJECTS: '/projects',
  FINANCE: '/finance',
  INVOICES: '/invoices',
  // ... etc
}
```

---

## 🎨 Styling & Theming

### TailwindCSS

- **Configuration**: `tailwind.config.js`
- **Utility-first styling**: All components use Tailwind classes
- **Custom colors**: Extended in `tailwind.config.js`

### CSS Variables (Design Tokens)

Global theme variables defined in `src/styles/globals.css`:

```css
:root {
  /* Brand */
  --brand-500: #e63946;
  
  /* Text */
  --text-1: #0d0d0d;
  --text-2: #4d4d4d;
  --text-3: #7f7f7f;
  --text-4: #b3b3b3;
  
  /* Surface */
  --surface-0: #ffffff;
  --surface-1: #f7f7f7;
  --surface-2: #e6e6e6;
  --surface-3: #d9d9d9;
  
  /* Semantic */
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #e63946;
  --info: #3b82f6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --text-1: #ffffff;
    --surface-0: #0d0d0d;
    /* ... inverted values */
  }
}
```

**Usage:**
```jsx
<div className="bg-surface-0 text-text-1 border border-surface-2">
  {/* Automatically adapts to light/dark mode */}
</div>
```

### Animations

Framer Motion is used for smooth transitions:

```jsx
import { motion } from 'framer-motion'

export function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

Preset animations defined in `src/config/motion.js`.

---

## 🚀 Development Workflow

### Setup

```bash
cd akira-saas
npm install

# Create .env file with Supabase credentials
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=your_anon_key" >> .env
```

### Running the App

```bash
npm run dev
```

Vite starts on `http://localhost:3000` with HMR enabled.

### Building

```bash
npm run build
```

Outputs optimized bundles to `dist/` (rolldown/oxc minification).

### Preview Build Locally

```bash
npm run preview
```

### Debugging

**Browser Console:**
- Supabase auth errors
- Network requests (open DevTools Network tab)
- Vite HMR messages

**Vite Server Console:**
- Build warnings
- HMR updates
- Module errors

**Supabase Dashboard:**
- Inspect database tables and RLS policies
- Check Edge Function logs
- Monitor real-time subscriptions

---

## 🔄 Common Development Patterns

### Adding a New Page

1. **Create the page** at `src/pages/MyFeature.jsx`:
   ```jsx
   import { AppShell } from '@/components/layout/AppShell'
   import { useAuth } from '@/context/AuthContext'

   export default function MyFeaturePage() {
     const { user } = useAuth()
     
     return (
       <AppShell>
         <div className="space-y-6">
           <h1 className="text-3xl font-bold">My Feature</h1>
           {/* Page content */}
         </div>
       </AppShell>
     )
   }
   ```

2. **Add the route** in `src/App.jsx`:
   ```jsx
   const MyFeature = lazy(() => import('@/pages/MyFeature'))
   
   {/* Inside private routes */}
   <Route path="/my-feature" element={<MyFeature />} />
   ```

3. **Add the route constant** in `src/config/constants.js`:
   ```javascript
   export const ROUTES = {
     // ...
     MY_FEATURE: '/my-feature',
   }
   ```

4. **Add navigation link** in `src/components/layout/Sidebar.jsx` (if needed)

### Adding a New Service

1. **Create** `src/services/myfeature.service.js`:
   ```javascript
   import { supabase } from '@/lib/supabase'

   export async function fetchMyData(filters) {
     const { data: { user } } = await supabase.auth.getUser()
     
     return supabase
       .from('my_table')
       .select('*')
       .eq('org_id', user.org_id)
       .order('created_at', { ascending: false })
   }

   export async function createMyRecord(record) {
     const { data: { user } } = await supabase.auth.getUser()
     
     return supabase.from('my_table').insert({
       ...record,
       org_id: user.org_id,
     }).select()
   }

   export async function updateMyRecord(id, updates) {
     return supabase
       .from('my_table')
       .update(updates)
       .eq('id', id)
       .select()
   }

   export async function deleteMyRecord(id) {
     return supabase.from('my_table').delete().eq('id', id)
   }
   ```

2. **Use the service** in components:
   ```jsx
   import { fetchMyData, createMyRecord } from '@/services/myfeature.service'

   export function MyFeatureComponent() {
     const [data, setData] = useState(null)
     const [loading, setLoading] = useState(true)

     useEffect(() => {
       fetchMyData().then(({ data }) => {
         setData(data)
         setLoading(false)
       })
     }, [])

     if (loading) return <Spinner />
     return <div>{/* render data */}</div>
   }
   ```

### Real-time Subscriptions

Listen to database changes:

```javascript
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useClientsRealtime(orgId) {
  const [clients, setClients] = useState([])

  useEffect(() => {
    // Initial fetch
    supabase
      .from('clients')
      .select('*')
      .eq('org_id', orgId)
      .then(({ data }) => setClients(data))

    // Subscribe to changes
    const subscription = supabase
      .channel(`public:clients:org_id=eq.${orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClients((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setClients((prev) =>
              prev.map((c) => c.id === payload.new.id ? payload.new : c)
            )
          } else if (payload.eventType === 'DELETE') {
            setClients((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orgId])

  return clients
}
```

### PDF Generation

AKIRA uses **jsPDF** for invoices and quotes. Utility functions:

- `src/utils/generateInvoicePdf.js` — Invoice PDF generation
- `src/utils/generateQuotePdf.js` — Quote PDF generation

**Example usage:**
```javascript
import { generateInvoicePdf } from '@/utils/generateInvoicePdf'

function InvoiceActions({ invoice }) {
  const handleDownload = () => {
    const pdf = generateInvoicePdf(invoice)
    pdf.save(`Invoice-${invoice.number}.pdf`)
  }

  return <button onClick={handleDownload}>Download PDF</button>
}
```

### AI Integration (Gemini)

Google Generative AI is integrated via `src/services/brainActions.service.js`:

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai'

const client = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY)

export async function askAkira(message, context = {}) {
  const model = client.getGenerativeModel({ model: 'gemini-pro' })
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: message }] }],
  })

  return result.response.text()
}
```

**Usage in a component:**
```jsx
import { askAkira } from '@/services/brainActions.service'

function AskAkiraButton() {
  const [response, setResponse] = useState('')

  const handleAsk = async () => {
    const answer = await askAkira('What are my top 3 clients by revenue?')
    setResponse(answer)
  }

  return (
    <button onClick={handleAsk}>
      Ask AKIRA
    </button>
  )
}
```

---

## 🚨 Important Patterns & Rules

### ✅ DO:

1. **Use the service layer** — Always put Supabase queries in `src/services/`
2. **Handle errors gracefully** — Show toast notifications or UI feedback
3. **Lazy-load routes** — Use `lazy()` to keep initial bundle small
4. **Use Tailwind classes** — Don't write CSS unless absolutely necessary
5. **Leverage Framer Motion** — For smooth, performant animations
6. **Validate user input** — At system boundaries (API, forms)
7. **Use RLS policies** — Enforce multi-tenant security at database level
8. **Handle loading states** — Show spinners, skeletons, or placeholders
9. **Use custom hooks** — For reusable logic (useClients, useProjects, etc.)

### ❌ DON'T:

1. **Call Supabase directly in components** — Use services instead
2. **Mix business logic with UI** — Separate concerns into services & hooks
3. **Hardcode environment variables** — Use `.env` and `import.meta.env`
4. **Add unnecessary CSS files** — Tailwind covers 99% of styling needs
5. **Create deeply nested component hierarchies** — Flatten with composition
6. **Ignore error states** — User experience depends on proper error handling
7. **Forget to clean up subscriptions** — Always unsubscribe in useEffect cleanup
8. **Commit secrets to git** — Use `.env.local` (git-ignored)

---

## 📊 Database Schema Overview

Supabase uses PostgreSQL with RLS (Row-Level Security) for multi-tenant isolation.

**Key tables:**
- `profiles` — User profiles, settings
- `organizations` — Workspace data
- `clients` — Client records (CRM)
- `projects` — Projects with templates
- `project_tasks` — Kanban tasks
- `invoices` — Invoice records
- `quotes` — Quote records
- `finance_categories` — Expense categories
- `time_entries` — Time tracking logs
- `documents` — Knowledge base
- `messages` — Internal messaging
- `audit_logs` — Activity tracking
- `subscriptions` — Recurring services

**RLS Example:**
```sql
-- Clients can only see their organization's data
CREATE POLICY "users_can_view_own_org_clients"
  ON public.clients
  FOR SELECT
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

See `PHASE2_DATABASE_SCHEMA.sql` for full schema documentation.

---

## 🔐 Authentication & Multi-Tenancy

- **Auth**: Supabase Auth (email + password, magic links, OAuth)
- **Session**: Supabase session tokens in localStorage
- **Multi-tenant**: Enforced via `org_id` and RLS policies
- **Roles**: Simple role-based access (admin, member, viewer)

**Checking auth in components:**
```jsx
const { user, profile, isAuthenticated } = useAuth()

if (!isAuthenticated) {
  return <Navigate to={ROUTES.LOGIN} />
}
```

---

## ⚡ Performance Optimizations

1. **Vite config** — Chunk size warning at 1000KB, source maps enabled
2. **Rolldown/oxc** — Faster bundling than esbuild
3. **Code splitting** — Routes lazy-loaded (each page is its own chunk)
4. **Framer Motion** — Minimal animations in list views to avoid jank
5. **Recharts** — Consider data windowing for 1000+ data points
6. **TipTap editor** — (~500KB) consider lazy loading on Knowledge page
7. **Supabase subscriptions** — Unsubscribe on component unmount
8. **Image optimization** — Use `sharp` for server-side processing

---

## 📱 Mobile (iOS)

- **Framework**: Capacitor 8.4
- **Sync**: `npx cap build ios` to sync web changes
- **PWA**: Enabled via `vite-plugin-pwa`, manifest at `public/manifest.json`
- **App Shell**: `src/components/pwa/InstallPrompt.jsx`

---

## 🛠️ Tools & Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run build` | Production build (rolldown/oxc) |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Tests in watch mode |
| `npx cap build ios` | Sync to Capacitor iOS project |

---

## 🔗 Key File Locations Quick Reference

| What | Where |
|------|-------|
| Routes | `src/App.jsx` |
| Route constants | `src/config/constants.js` |
| Authentication | `src/context/AuthContext.jsx` |
| Organization context | `src/context/OrgContext.jsx` |
| Global app state | `src/context/AppContext.jsx` |
| Supabase client | `src/lib/supabase.js` |
| API services | `src/services/*.service.js` |
| Custom hooks | `src/hooks/use*.js` |
| Theme colors | `src/styles/globals.css` |
| TailwindCSS config | `tailwind.config.js` |
| Vite config | `vite.config.js` |
| Page components | `src/pages/*.jsx` |
| UI components | `src/components/ui/*.jsx` |
| Database schema | `PHASE2_DATABASE_SCHEMA.sql` |

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "useAuth not defined" | Import: `import { useAuth } from '@/context/AuthContext'` |
| "Module not found @/..." | Check vite.config.js has `alias: { '@': './src' }` |
| "Supabase connection error" | Verify `.env` has correct VITE_SUPABASE_URL and KEY |
| "Type errors in services" | Ensure all Supabase queries return `.select()` or `.single()` |
| "Slow build times" | Check for circular dependencies, consider code splitting |
| "RLS policy denies insert" | Verify `org_id` matches user's organization in RLS policy |
| "Component not re-rendering" | Check subscription cleanup in useEffect |
| "PWA not installing" | Check manifest.json, test on production build |

---

## 📚 Architecture Decision Log

- **Context API over Redux** — Simpler for this project size, built-in React API
- **Services layer** — Encapsulates Supabase queries, easier testing & reuse
- **Lazy-loaded routes** — Keeps initial bundle small (critical for web perf)
- **Framer Motion** — Smooth, performant animations (better than CSS animations for complex UI)
- **TailwindCSS** — Utility-first, consistent styling, excellent DX
- **jsPDF for PDFs** — Client-side generation, no backend dependency
- **Capacitor for mobile** — Reuse web code, fast iOS development

---

## 🚀 Project Status & Next Steps

**Current Phase:** Active development with stable core features  
**Recent:** Project task templates, client portal, AI operatives  
**Next:** Enhanced forecasting, team collaboration, advanced reporting

For detailed PRs and commits, see `.git` history and GitHub Actions workflow logs.

---

**Last Updated:** 2026-08-07  
**Author:** Marc (marcroson7@gmail.com)  
**Contact:** Reach out with questions or architectural decisions
