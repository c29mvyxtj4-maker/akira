# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AKIRA is a full-featured SaaS application built with React + Vite for managing clients, projects, finances, invoices, and business operations. It includes:

- **Frontend**: React 18 with Vite, TailwindCSS, Framer Motion for animations
- **Backend**: Supabase (PostgreSQL, auth, real-time)
- **Mobile**: Capacitor-based iOS app
- **AI Integration**: Google Generative AI (Gemini)
- **Rich Text**: TipTap editor for knowledge base and documents
- **PDF Generation**: jsPDF for invoices and quotes
- **Architecture**: Context API for state management, modular service layer

## Directory Structure

```
akira-saas/
├── src/
│   ├── pages/           # Page components (Dashboard, Clients, Projects, Finance, etc.)
│   ├── components/
│   │   ├── layout/      # AppShell, Sidebar, Topbar, CommandPalette, NotificationsPanel
│   │   ├── ui/          # Reusable UI components (Button, Modal, Input, Card, etc.)
│   │   ├── charts/      # Recharts visualizations (BarChart, DonutChart, AreaChart, etc.)
│   │   ├── dashboard/   # Dashboard-specific components (KpiCard, RevenueChart, ActivityFeed)
│   │   ├── clients/     # Client management components
│   │   ├── projects/    # Project components (KanbanBoard, ProjectSummaryCard)
│   │   ├── knowledge/   # Knowledge base (TipTapEditor, DocList, FolderTree)
│   │   └── akira/       # AI assistant components (AskAkiraButton)
│   ├── services/        # API layer for Supabase queries
│   ├── context/         # React Context (AuthContext, OrgContext, AppContext)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Supabase client initialization
│   ├── utils/           # Utilities (PDF generation)
│   ├── data/            # Static data and templates
│   ├── config/          # Constants and configuration
│   ├── styles/          # Global CSS and TipTap editor styles
│   └── assets/          # Images and SVG assets
├── ios/                 # Capacitor iOS app
├── public/              # Static assets
├── vite.config.js       # Vite configuration with @ alias to src/
├── tailwind.config.js   # TailwindCSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Development Commands

All commands run from the `akira-saas/` directory:

- **`npm run dev`** — Start Vite dev server (runs on port 3000)
- **`npm run build`** — Build for production
- **`npm run preview`** — Preview production build locally

### Environment Setup

Create a `.env` file in `akira-saas/` with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture Patterns

### Context-Based State Management

Three main context providers manage app state (see `main.jsx`):

1. **AuthContext** (`src/context/AuthContext.jsx`) — User authentication, profile data, session management
2. **OrgContext** (`src/context/OrgContext.jsx`) — Organization/workspace selection and data
3. **AppContext** (`src/context/AppContext.jsx`) — Global app state, theme, UI state

Use the corresponding hooks to access state: `useAuth()`, `useOrg()`, `useApp()`.

### Service Layer

API interactions are abstracted into service files in `src/services/`. Each service exports async functions for CRUD operations:

- `clients.service.js` — Client management, timeline events, portal data
- `projects.service.js` — Project queries and updates
- `finance.service.js` — Financial data and calculations
- `invoices.service.js` — Invoice CRUD and PDF generation
- `quotes.service.js` — Quote management
- `calendar.service.js` — Calendar and scheduling
- `knowledge.service.js` — Knowledge base documents
- `subscriptions.service.js` — Subscription tracking
- `audit.service.js` — Audit logs and activity
- `brainActions.service.js` — AI actions and integrations

All services use the `supabase` client from `src/lib/supabase.js`. Services retrieve the current user ID via `supabase.auth.getUser()`.

### Component Patterns

- **Page components** (`src/pages/*.jsx`) are route handlers; they compose layout and feature components
- **UI components** (`src/components/ui/`) are small, reusable, unstyled-by-default building blocks
- **Feature components** (e.g., `src/components/clients/ClientForm.jsx`) compose UI and business logic
- Use Framer Motion for animations (import from `framer-motion`)
- Use Lucide React for icons (import from `lucide-react`)
- Use Recharts for charts (components in `src/components/charts/`)

### Styling

- **TailwindCSS** for utility-first styling; configuration at `tailwind.config.js`
- **CSS variables** defined in `src/styles/globals.css` for theme colors (e.g., `--brand-500`, `--text-1`, `--surface-0`)
- Global styles in `src/index.css` and `src/App.css`
- TipTap editor styles in `src/styles/tiptap.css`

### Routing

Routes defined in `src/App.jsx`:
- **Public routes**: `/login`, `/reset-password`, `/portal`, `/join`
- **Private routes** (wrapped in `PrivateRoute`): `/`, `/clients/*`, `/projects/*`, `/finance/*`, etc.
- Use `ROUTES` constant from `src/config/constants.js` for route paths

### Linting

- **Oxlint** configured in `.oxlintrc.json` with React and Oxc rules
- Enforces `react/rules-of-hooks` and warns on `react/only-export-components`

## Key Technologies

- **React 18.3** — UI library
- **Vite 8.1** — Build tool and dev server
- **TailwindCSS 3.4** — Styling
- **Supabase 2.x** — Backend, auth, real-time database
- **React Router 6.30** — Routing
- **Framer Motion 11.3** — Animations
- **Recharts 2.12** — Data visualization
- **TipTap 3.27** — Rich text editor
- **jsPDF 4.2** — PDF generation
- **Lucide React 0.414** — Icon library
- **Google Generative AI** — Gemini AI integration
- **Capacitor 8.4** — Mobile framework (iOS)
- **sharp** — Image processing

## Common Development Patterns

### Adding a New Page

1. Create `src/pages/MyPage.jsx`
2. Add route to `src/App.jsx` within the private `<Route>` section
3. Add route constant to `src/config/constants.js` if needed
4. Compose using layout components and feature components

### Adding a New Service

1. Create `src/services/myfeature.service.js`
2. Export async functions that use the `supabase` client
3. Handle user authentication with `supabase.auth.getUser()`
4. Return data or errors consistently

### Using Real-time Subscriptions

Supabase subscriptions are managed in context/service files:
```javascript
const subscription = supabase
  .channel('public:my_table')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'my_table' }, callback)
  .subscribe()
// Clean up on unmount
```

### PDF Generation

Use jsPDF and jsPDF-AutoTable:
- `src/utils/generateInvoicePdf.js` — Invoice PDF
- `src/utils/generateQuotePdf.js` — Quote PDF

### AI Integration

Google Generative AI is integrated via `brainActions.service.js`. Use the AI assistant button (`AskAkiraButton.jsx`) for user-facing AI interactions.

## Performance Notes

- Vite is configured with `chunkSizeWarningLimit: 1000` and source maps enabled for dev debugging
- Framer Motion animations are used for smooth transitions but kept minimal in list views to avoid jank
- Recharts can be memory-intensive with large datasets; consider pagination or data windowing
- TipTap editor is rich-featured but adds ~500KB to bundle; consider lazy loading for knowledge base pages

## Mobile (iOS)

The iOS app in `akira-saas/ios/` is built with Capacitor. Run `npx cap build ios` to sync web changes to the native project. PWA support is enabled via `vite-plugin-pwa`.

## Testing & Debugging

- Check browser console for Supabase auth and session errors
- Use `console.warn` / `console.error` in services for error tracking
- Vite dev server logs requests and HMR updates to terminal
- Inspect Supabase tables and RLS policies in the dashboard for data issues
