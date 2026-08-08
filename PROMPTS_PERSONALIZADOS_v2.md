# AKIRA v2.0 — Prompts Personalizados para Claude Code

**Fecha:** 2026-08-07  
**Proyecto:** AKIRA SaaS (`C:\Users\marcr\Desktop\AKIRA\akira-saas`)  
**Usuario:** Marc (marcroson7@gmail.com)

---

## 📊 ANÁLISIS DEL PROYECTO ACTUAL

### Estadísticas
- **Total de archivos:** 191 (122 .jsx, 58 .js, 8 .css)
- **Líneas de código:** 28,861 LOC
- **Páginas:** 28 rutas
- **Servicios:** 33 módulos de API
- **Componentes:** 88 componentes React
- **Hooks:** 9 custom hooks
- **Contextos:** 3 (Auth, Org, App)

### Estructura Actual (Perfecta para mejoras incrementales)
```
src/
├── components/     (88 componentes organizados por dominio)
│   ├── layout/     (8 - AppShell, Sidebar, Topbar, etc)
│   ├── ui/         (17 - Button, Input, Modal, etc)
│   ├── dashboard/  (5)
│   ├── projects/   (7)
│   ├── clients/    (5)
│   ├── settings/   (24 - tabs de configuración)
│   ├── time/       (6)
│   ├── operatives/ (2)
│   ├── knowledge/  (3)
│   ├── charts/     (5 - Recharts)
│   └── [otros 14+]
├── pages/          (28 páginas/rutas)
├── services/       (33 servicios Supabase)
├── context/        (3 contextos: Auth, Org, App)
├── hooks/          (9 custom hooks)
├── lib/            (supabase.js)
├── config/         (constants, motion)
├── utils/          (PDF, CSV, helpers)
├── styles/         (globals, animations)
├── data/           (templates estáticos)
└── assets/         (images, icons)
```

### Stack Actual (v1.0)
- React 18.3.1
- Vite 8.1.4 (con rolldown/oxc)
- TailwindCSS 3.4.10
- Supabase 2.110.2
- Framer Motion 11.3.31
- Recharts 2.12.7
- TipTap 3.27.3 (editor rich-text)
- jsPDF 4.2.1 (PDFs)
- Capacitor 8.4.1 (iOS)
- Google Generative AI (Gemini)
- Sentry 10.66.0 (error tracking)
- Vitest 2.1.9 (testing)

### Módulos Funcionando Perfectamente
✅ Dashboard - Analytics y KPIs  
✅ Clients - CRM completo  
✅ Projects - Kanban board  
✅ Finance - Categorías y forecasts  
✅ Invoices - Generación PDF  
✅ Calendar - Eventos  
✅ Knowledge - Editor TipTap  
✅ Time Tracking - Horas  
✅ Messages - Mensajería interna  
✅ Portal - Acceso clientes  
✅ Brain - AI assistant (Gemini)  
✅ Operatives - Automatizaciones básicas  
✅ Auth - Supabase auth  
✅ Multi-tenant - RLS activo  
✅ PWA - Mobile ready  

### Lo que FALTA para v2.0
❌ Widget System - No existe  
❌ Universal Automation - Parcial (solo Brain)  
❌ Global Data Sync - Parcial  
❌ Advanced Analytics - Básico  
❌ Workflow Templates - Parcial  
❌ Agent System - Parcial (1 agent)  

---

## 🎯 PROMPTS PERSONALIZADOS (LISTOS PARA USAR)

### ✨ PROMPT 1: Widget System Integration

**Usar cuando:** Quieras implementar sistema de widgets personalizable  
**Tiempo:** 2-3 horas  
**Complejidad:** Media  

```markdown
# AKIRA v2.0 - Widget System Integration

## Current Project Context
- **Location:** C:\Users\marcr\Desktop\AKIRA\akira-saas
- **Framework:** React 18.3.1 + Vite 8.1.4 + TailwindCSS 3.4.10
- **State:** 191 files, 28,861 LOC, 28 pages, 33 services
- **Existing:** Dashboard (Dashboard.jsx), Projects, Clients, Finance, Calendar, Knowledge, Brain
- **DB:** Supabase with RLS + multi-tenant support

## Task: Create Widget System

Integrate a widget system into the existing Dashboard without breaking anything.

### Requirements
1. **Non-breaking** - Existing Dashboard.jsx continues to work
2. **Composable** - Add widgets to any page (not just Dashboard)
3. **Supabase-backed** - Store widget configs, user layouts
4. **Drag & Drop** - Users can reorder widgets (nice-to-have: persist order)
5. **Registry** - Central registry of available widgets
6. **10+ Widget Types** minimum:
   - KPI Card (value + trend)
   - Revenue Chart (bar/line)
   - Project Status (pie chart)
   - Client List
   - Tasks Overview
   - Time Summary
   - Invoices Due
   - Messages Feed
   - Calendar Mini
   - Custom Query Widget

### New Files to Create

#### 1. Core Widget Infrastructure
```
src/modules/widgets/
├── WidgetRegistry.ts              # Singleton registry of all widgets
├── types.ts                        # WidgetConfig, WidgetType, WidgetProps
├── hooks/
│   ├── useWidgets.ts             # Fetch user's saved widgets
│   ├── useDragDrop.ts            # Drag-drop logic
│   └── useWidgetData.ts          # Fetch data for a widget
├── components/
│   ├── Widget.tsx                 # Base widget wrapper
│   ├── WidgetGrid.tsx            # Grid layout + drag-drop
│   ├── WidgetEditor.tsx          # Add/remove/configure widgets
│   ├── WidgetSettings.tsx        # Widget config modal
│   └── widgets/                  # Individual widget components
│       ├── KpiWidget.tsx
│       ├── RevenueChartWidget.tsx
│       ├── ProjectStatusWidget.tsx
│       ├── ClientListWidget.tsx
│       ├── TasksWidget.tsx
│       ├── TimeSummaryWidget.tsx
│       ├── InvoicesDueWidget.tsx
│       ├── MessagesFeedWidget.tsx
│       ├── CalendarMiniWidget.tsx
│       ├── CustomQueryWidget.tsx
│       └── [more widgets as needed]
└── utils/
    ├── widgetDefaults.ts         # Default configurations
    └── widgetValidation.ts       # Config validation
```

#### 2. Database Tables (New - add to Supabase)
```sql
-- User dashboard widgets configuration
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Individual widget instances
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL,
  widget_type TEXT NOT NULL,
  position INTEGER NOT NULL,
  size TEXT DEFAULT 'md',
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_can_view_own_dashboards" ON dashboards
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "users_can_edit_own_dashboards" ON dashboards
  FOR UPDATE USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

#### 3. Integration Points
- **Modify:** src/pages/Dashboard.jsx (add WidgetGrid, keep existing KPIs as fallback)
- **Add:** useWidgets hook to fetch/save configurations
- **Add:** WidgetEditor component for widget management
- **Use:** Existing services (clients.service.js, finance.service.js, etc.)
- **Style:** TailwindCSS (match existing theme from globals.css)

### Implementation Strategy

1. **Create WidgetRegistry** - Central place to register all widget types
2. **Create base Widget wrapper** - Handle loading, errors, sizing
3. **Create 10+ individual widgets** - Each uses existing services
4. **Create WidgetGrid** - Layout + drag-drop (use @hello-pangea/dnd or similar)
5. **Create WidgetEditor** - Modal to add/remove/configure widgets
6. **Create Supabase service** - dashboards.service.js
7. **Modify Dashboard.jsx** - Use WidgetGrid instead of hardcoded layout
8. **Add RLS policies** - Ensure multi-tenant security

### Code Quality
- Use existing patterns: services layer, hooks for data fetching, context for state
- Match code style: Tailwind utilities, Framer Motion for animations
- Type safety: Use JSDoc or TypeScript-like comments
- Performance: Memoize widgets, lazy-load data
- Accessibility: ARIA labels, keyboard navigation

### Testing
- WidgetRegistry returns correct widget types
- Widgets render with correct data
- Drag-drop reorders widgets
- Save/load widget configurations
- RLS policies work (users see only their org's widgets)

### Output
✅ All files created in src/modules/widgets/  
✅ Database migrations ready to apply  
✅ Dashboard.jsx updated to use WidgetGrid  
✅ dashboards.service.js with full CRUD  
✅ No breaking changes to existing code  
✅ Can preview in dev: npm run dev → http://localhost:3000  

### Notes
- Don't modify existing services (reuse them!)
- Don't break Dashboard.jsx (add new features, don't remove)
- Use Supabase directly (already connected in src/lib/supabase.js)
- Follow existing React patterns (hooks, context, services)
- Respond with full file contents ready to paste into project
```

---

### 🤖 PROMPT 2: Universal Automation Platform

**Usar cuando:** Quieras crear sistema de automatización con templates y agents  
**Tiempo:** 3-4 horas  
**Complejidad:** Alta  

```markdown
# AKIRA v2.0 - Universal Automation Platform

## Current Project Context
- **Location:** C:\Users\marcr\Desktop\AKIRA\akira-saas
- **Framework:** React 18.3.1 + Vite 8.1.4
- **Existing:** Brain.jsx (AI assistant), brainActions.service.js (Gemini API)
- **Services:** 33 existing services for all features
- **DB:** Supabase with multi-tenant support

## Task: Create Automation Platform

Build a workflow engine with 4 templates and 8 specialized agents.

### Architecture Overview
```
Automation Engine
├── Templates (pre-configured workflows)
│   ├── ContentProduction (Blog → Social → Email)
│   ├── SaasDevelopment (Spec → Dev → Test → Release)
│   ├── ClientProject (Intake → Plan → Execute → Deliver)
│   └── MarketingCampaign (Strategy → Content → Launch → Analytics)
│
├── Agents (specialized AI workers - each uses Gemini)
│   ├── ResearchAgent (web scraping, competitive analysis)
│   ├── StrategyAgent (planning, decision making)
│   ├── ContentAgent (writing, copywriting)
│   ├── ReviewAgent (quality assurance, feedback)
│   ├── DesignAgent (UX/UI suggestions, layouts)
│   ├── PublishAgent (deployment, scheduling)
│   ├── AnalyticsAgent (metrics, insights)
│   └── ManagerAgent (orchestration, scheduling)
│
└── Execution Engine
    ├── WorkflowRunner (executes steps sequentially or parallel)
    ├── AgentExecutor (calls agents with context)
    ├── StateManager (tracks workflow progress)
    └── ErrorHandler (retries, fallbacks)
```

### New Files to Create

#### 1. Core Automation Infrastructure
```
src/modules/automation/
├── WorkflowEngine.ts              # Main orchestration engine
├── AgentFactory.ts                # Creates agent instances
├── types.ts                        # WorkflowTemplate, Agent, Execution types
├── hooks/
│   ├── useWorkflows.ts           # Fetch/manage workflows
│   ├── useAgents.ts              # List/call agents
│   └── useWorkflowExecution.ts   # Track running workflows
├── agents/
│   ├── BaseAgent.ts              # Abstract base class
│   ├── ResearchAgent.ts          # Research & analysis
│   ├── StrategyAgent.ts          # Strategic planning
│   ├── ContentAgent.ts           # Content creation
│   ├── ReviewAgent.ts            # QA & reviews
│   ├── DesignAgent.ts            # Design decisions
│   ├── PublishAgent.ts           # Publishing
│   ├── AnalyticsAgent.ts         # Analytics & insights
│   └── ManagerAgent.ts           # Workflow orchestration
├── templates/
│   ├── ContentProductionTemplate.ts
│   ├── SaasDevelopmentTemplate.ts
│   ├── ClientProjectTemplate.ts
│   └── MarketingCampaignTemplate.ts
├── components/
│   ├── WorkflowBuilder.tsx       # UI for creating workflows
│   ├── WorkflowExecutor.tsx      # Run workflow, show progress
│   ├── AgentChat.tsx             # Chat with agent
│   ├── WorkflowHistory.tsx       # Past executions
│   ├── TemplateSelector.tsx      # Choose template
│   └── ExecutionMonitor.tsx      # Real-time progress
├── services/
│   └── workflows.service.js       # Supabase CRUD for workflows
└── utils/
    ├── agentPrompts.ts           # System prompts for each agent
    └── workflowValidation.ts     # Validation logic
```

#### 2. Database Tables (New)
```sql
-- Workflow templates
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  steps JSONB NOT NULL,
  agents_involved TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- User workflows (instances of templates)
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  template_id UUID,
  status TEXT DEFAULT 'draft',
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Workflow executions (runs)
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL,
  org_id UUID NOT NULL,
  status TEXT DEFAULT 'running',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  result JSONB,
  error TEXT
);

-- Agent activity logs
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  input TEXT,
  output TEXT,
  status TEXT,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
```

#### 3. Agent Implementation Example (ResearchAgent)
```typescript
// src/modules/automation/agents/ResearchAgent.ts

import { BaseAgent } from './BaseAgent'
import { GoogleGenerativeAI } from '@google/generative-ai'

export class ResearchAgent extends BaseAgent {
  constructor() {
    super('research', 'Researches topics and competitors')
  }

  async execute(input: {
    topic: string
    scope: 'competitive' | 'market' | 'technical'
    context?: string
  }): Promise<string> {
    const prompt = this.buildPrompt(input)
    const gemini = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY)
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' })
    
    const result = await model.generateContent(prompt)
    return result.response.text()
  }

  private buildPrompt(input: any): string {
    return `
Research the following topic and provide insights:
Topic: ${input.topic}
Scope: ${input.scope}
Context: ${input.context || 'None'}

Provide:
1. Key findings
2. Competitive landscape (if competitive scope)
3. Trends and patterns
4. Recommendations
5. Sources
    `.trim()
  }
}
```

#### 4. Template Implementation Example (ContentProduction)
```typescript
// src/modules/automation/templates/ContentProductionTemplate.ts

import { WorkflowTemplate } from '../types'

export const ContentProductionTemplate: WorkflowTemplate = {
  id: 'content-production',
  name: 'Content Production Pipeline',
  description: 'Blog → Social Media → Email Campaign',
  steps: [
    {
      id: 'research',
      name: 'Research Topic',
      agent: 'research',
      input: { topic: '{topic}', scope: 'market' },
      required: true,
    },
    {
      id: 'strategy',
      name: 'Create Strategy',
      agent: 'strategy',
      input: { research: '{research.output}' },
      required: true,
    },
    {
      id: 'content',
      name: 'Write Content',
      agent: 'content',
      input: { strategy: '{strategy.output}', type: 'blog' },
      required: true,
    },
    {
      id: 'social',
      name: 'Create Social Posts',
      agent: 'content',
      input: { blog: '{content.output}', format: 'social' },
      parallel: false,
    },
    {
      id: 'email',
      name: 'Write Email Campaign',
      agent: 'content',
      input: { blog: '{content.output}', format: 'email' },
      parallel: false,
    },
    {
      id: 'review',
      name: 'Quality Review',
      agent: 'review',
      input: { content: '{content.output}', social: '{social.output}', email: '{email.output}' },
      required: true,
    },
    {
      id: 'publish',
      name: 'Publish All',
      agent: 'publish',
      input: { blog: '{content.output}', social: '{social.output}', email: '{email.output}' },
      required: true,
    },
  ],
  estimatedDuration: 120, // minutes
}
```

#### 5. Integration with Existing Code
- **Use existing Brain.jsx** → Can call workflows from Brain
- **Use existing brainActions.service.js** → Agent calls via Gemini
- **Use existing services** → Agents can call clients.service.js, finance.service.js, etc.
- **Add new page:** src/pages/Automation.jsx (list/manage workflows)
- **Add to sidebar navigation**

### Implementation Strategy

1. **Create BaseAgent** - Abstract class all agents inherit from
2. **Create 8 Agents** - Each one specialized
3. **Create 4 Templates** - Pre-configured workflows
4. **Create WorkflowEngine** - Orchestration logic
5. **Create workflows.service.js** - Supabase CRUD
6. **Create UI components** - Builder, executor, history
7. **Add new page** - Automation.jsx
8. **Integrate with Brain** - Can trigger workflows from AI chat

### Code Quality
- Follow existing patterns (services, hooks, context)
- Use Supabase for persistence
- Google Generative AI for agent logic
- Error handling for failed agents
- Progress tracking for long-running workflows
- Logging for debugging

### Testing
- Each agent produces correct output
- Workflow executes steps in correct order
- Templates can be instantiated
- Execution tracking works
- Database queries work with RLS

### Output
✅ All agent classes created  
✅ 4 templates implemented  
✅ WorkflowEngine core logic  
✅ UI components for management  
✅ Database schema + RLS  
✅ workflows.service.js  
✅ Automation.jsx page  
✅ Brain.jsx integration hints  

### Notes
- Agents use Gemini API (already in project)
- Workflows are async, can take time
- Consider queuing (Bull/BullMQ) for production
- Each agent logs its activity
- Support variable substitution ({step.output})
```

---

### 🔄 PROMPT 3: Global Data Sync Layer

**Usar cuando:** Quieras mejorar sincronización en tiempo real  
**Tiempo:** 1-2 horas  
**Complejidad:** Media  

```markdown
# AKIRA v2.0 - Global Data Sync Layer

## Current Context
- Supabase with real-time subscriptions (partial)
- Multiple services accessing data independently
- Some data inconsistencies across components

## Task: Create Global Sync Engine

Implement a centralized data synchronization layer that:
1. Manages all real-time subscriptions
2. Prevents duplicate subscriptions
3. Provides single source of truth
4. Handles offline/online transitions
5. Syncs data across all pages/components

### New Files to Create

```
src/modules/sync/
├── SyncEngine.ts                 # Main orchestration
├── types.ts                      # SyncState, SyncChannel types
├── hooks/
│   ├── useGlobalSync.ts         # Access sync state
│   └── useSyncChannel.ts        # Subscribe to specific channel
├── services/
│   └── syncService.js           # Supabase subscription management
└── utils/
    ├── channelManager.ts        # Manage subscriptions
    └── offlineQueue.ts          # Queue mutations when offline
```

### Integration Points
- Modify AppContext to include sync state
- Update all service calls to use sync layer
- Add offline detection
- Add sync status indicator to UI

### Implementation Strategy

1. Create SyncEngine singleton
2. Replace direct Supabase subscriptions with sync calls
3. Add offline queue for mutations
4. Add sync status to AppContext
5. Add UI indicator for sync status

### Output
✅ SyncEngine.ts with full implementation  
✅ Hooks for consuming sync state  
✅ Offline queue for mutations  
✅ Integration guide for existing services  
```

---

### 📱 PROMPT 4: Mobile Responsive Enhancement

**Usar cuando:** Quieras mejorar experiencia móvil  
**Tiempo:** 1-2 horas  
**Complejidad:** Baja  

```markdown
# AKIRA v2.0 - Mobile Responsive Enhancement

## Current Context
- PWA enabled
- TailwindCSS responsive utilities in place
- Some components need mobile optimization

## Task: Enhance Mobile Experience

1. **Audit** - Find components that don't work well on mobile
2. **Fix** - Improve layouts for screens < 768px
3. **Optimize** - Ensure touch-friendly interactions
4. **Test** - Verify on various screen sizes

### Components to Review
- Dashboard.jsx (KPI cards stack)
- Projects.jsx (Kanban on mobile)
- Invoices.jsx (Table layout)
- Settings.jsx (Tabs layout)
- Calendar.jsx (Month view on mobile)

### Implementation
- Use Tailwind's sm:, md:, lg: breakpoints
- Add mobile-specific components where needed
- Test with DevTools mobile emulation
- Ensure touch targets are >= 44x44px

### Output
✅ All components responsive  
✅ No horizontal scrolling  
✅ Touch-friendly buttons  
✅ Mobile-optimized navigation  
```

---

### 🧹 PROMPT 5: Code Cleanup & Compression

**Usar cuando:** Quieras limpiar y optimizar el código existente  
**Tiempo:** 2-3 horas  
**Complejidad:** Media  

```markdown
# AKIRA v2.0 - Code Cleanup & Compression

## Current Context
- 191 files, 28,861 LOC
- 88 components
- Some duplicated patterns
- Some unused code
- Some verbose configurations

## Task: Clean & Optimize Codebase

### Areas to Review
1. **Duplicate logic** - Find repeated patterns, extract to utils/hooks
2. **Unused imports** - Remove unused dependencies
3. **Verbose components** - Compress long components without losing readability
4. **Inline styles** - All styles should use Tailwind classes
5. **Type safety** - Add JSDoc comments where types aren't clear
6. **Service methods** - Consolidate similar queries
7. **Constants** - Move magic strings to constants.js
8. **Comments** - Remove obvious comments, keep WHY comments

### Implementation
- Audit each module
- Create utils for repeated logic
- Consolidate similar services
- Remove dead code
- Update imports
- Add missing JSDoc

### Output
✅ No duplicate patterns  
✅ All imports used  
✅ Clean, readable components  
✅ ~10-15% code reduction  
✅ Better maintainability  
```

---

## 🚀 CÓMO USAR ESTOS PROMPTS

### Opción 1: Rápida (30 minutos)
```bash
cd C:\Users\marcr\Desktop\AKIRA\akira-saas

# Copia PROMPT 1 (Widget System)
# Pégalo en Claude Code → "Generate"
# Los archivos se crean automáticamente en src/modules/widgets/

npm run dev
# Abre http://localhost:3000
# ¡Los widgets aparecen en Dashboard!
```

### Opción 2: Completa (8 horas)
```bash
# Día 1: Widgets (2-3h)
# Día 2: Automation (3-4h)
# Día 3: Sync + Mobile + Cleanup (2-3h)

# Ejecuta PROMPT 1 → integra
# Ejecuta PROMPT 2 → integra
# Ejecuta PROMPT 3 → integra
# Ejecuta PROMPT 4 → integra
# Ejecuta PROMPT 5 → integra

# ¡AKIRA v2.0 completo!
```

### Opción 3: A tu ritmo
- Haz 1 prompt hoy
- Integra + test
- Haz otro mañana
- Sin presión

---

## ✅ CHECKLIST ANTES DE EJECUTAR

- [ ] Proyecto compila: `npm run dev` funciona
- [ ] Supabase conectado (credenciales en .env)
- [ ] Git status limpio o con cambios guardados
- [ ] Terminal abierta en: `C:\Users\marcr\Desktop\AKIRA\akira-saas`
- [ ] Claude Code disponible

---

## 📝 PASO A PASO PARA CADA PROMPT

### Ejecutar PROMPT 1 (Widget System)

```bash
# 1. Abre terminal en akira-saas
cd C:\Users\marcr\Desktop\AKIRA\akira-saas

# 2. Prepárate para recibir archivos
# Claude generará archivos en src/modules/widgets/

# 3. Pega PROMPT 1 en Claude Code
# (el de arriba, "AKIRA v2.0 - Widget System Integration")

# 4. Claude genera todos los archivos
# Revisa que se creen en la carpeta correcta:
# ls src/modules/widgets/
# Should show: WidgetRegistry.ts, components/, hooks/, etc.

# 5. Aplica las migraciones SQL a Supabase
# Ve a Supabase Dashboard → SQL Editor
# Copia el SQL del PROMPT 1 y ejecútalo

# 6. Reinicia dev server
npm run dev

# 7. Abre http://localhost:3000/
# El Dashboard ahora tiene WidgetGrid!

# 8. Prueba agregar/remover widgets
# Deberían guardarse en Supabase

# 9. Git commit
git add .
git commit -m "feat(widgets): add widget system v2.0"
```

### Ejecutar PROMPT 2 (Automation)

```bash
# 1. Primero asegúrate que PROMPT 1 esté integrado

# 2. Pega PROMPT 2 en Claude Code

# 3. Claude genera:
# src/modules/automation/
# Agents, templates, WorkflowEngine, componentes

# 4. Aplica SQL de workflows a Supabase

# 5. Reinicia dev server
npm run dev

# 6. Abre Dashboard o nueva página Automation
# Deberías poder crear workflows

# 7. Git commit
git add .
git commit -m "feat(automation): add workflow engine + 8 agents"
```

### Ejecutar PROMPT 3, 4, 5 (Igual patrón)

---

## 🎯 RESULTADO FINAL (AKIRA v2.0)

Después de todos los prompts:

```
✅ Widget System
   - 10+ widgets
   - Drag-drop reordering
   - User-specific layouts
   - Persistent to Supabase

✅ Automation Platform
   - 8 specialized agents
   - 4 templates
   - Workflow execution
   - Agent logging
   - Integration with Brain.jsx

✅ Global Sync Layer
   - Centralized subscriptions
   - Offline support
   - Sync status UI
   - Prevents duplicates

✅ Mobile Optimization
   - All responsive
   - Touch-friendly
   - No h-scroll
   - PWA ready

✅ Code Quality
   - ~15% reduction in LOC
   - No duplicates
   - Clean organization
   - Better maintainability

Total time: 8-10 horas (spread over days)
Breaking changes: ZERO
Risk level: LOW
Result: Production-ready AKIRA v2.0
```

---

## 📞 SOPORTE

Si algo no funciona:

1. **Error en Claude Code:**
   - Copia el prompt EXACTO (no lo modifiques)
   - Asegúrate que Supabase está en .env
   - Reinicia dev server después

2. **Archivos no se crean:**
   - Verifica ruta: C:\Users\marcr\Desktop\AKIRA\akira-saas
   - Asegúrate que tienes permisos de escritura
   - Intenta desde terminal admin

3. **Supabase errors:**
   - Verifica credenciales en .env
   - Aplica migraciones SQL primero
   - Habilita RLS policies

4. **Runtime errors:**
   - Chequea console del navegador (F12)
   - Chequea server logs (terminal dev)
   - Verifica imports (paths con @/)

---

**¡Listo! Ahora tienes los prompts personalizados para transformar AKIRA en v2.0**

Elige uno y empieza. Los demás pueden esperar. 🚀
