export var CLIENT_STATUS = {
  lead:    { label: 'Lead',      color: 'brand' },
  active:  { label: 'Activo',    color: 'success' },
  at_risk: { label: 'En riesgo', color: 'danger' },
  paused:  { label: 'Pausado',   color: 'warning' },
  lost:    { label: 'Perdido',   color: 'default' },
}

export var PROJECT_STATUS = {
  pending:   { label: 'Pendiente',  color: 'default' },
  active:    { label: 'Activo',     color: 'info' },
  review:    { label: 'Revision',   color: 'warning' },
  completed: { label: 'Completado', color: 'success' },
  cancelled: { label: 'Cancelado',  color: 'danger' },
}

export var PROJECT_PRIORITY = {
  low:    { label: 'Baja',    color: 'default' },
  medium: { label: 'Media',   color: 'info' },
  high:   { label: 'Alta',    color: 'warning' },
  urgent: { label: 'Urgente', color: 'danger' },
}

export var BADGE_COLORS = {
  brand:   { bg: 'rgba(230,57,70,0.12)',   text: '#e63946', border: 'rgba(230,57,70,0.25)' },
  success: { bg: 'rgba(34,197,94,0.12)',   text: '#22c55e', border: 'rgba(34,197,94,0.25)' },
  warning: { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  danger:  { bg: 'rgba(230,57,70,0.12)',   text: '#e63946', border: 'rgba(230,57,70,0.25)' },
  info:    { bg: 'rgba(59,130,246,0.12)',  text: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
  default: { bg: 'rgba(255,255,255,0.06)', text: 'var(--text-3)', border: 'var(--border)' },
  purple:  { bg: 'rgba(168,85,247,0.12)',  text: '#a855f7', border: 'rgba(168,85,247,0.25)' },
}

export var ROUTES = {
  HOME:           '/',
  LOGIN:          '/login',
  RESET:          '/reset-password',

  // Core
  CLIENTS:        '/clients',
  PROJECTS:       '/projects',
  SERVICES:       '/services',
  SUBSCRIPTIONS:  '/subscriptions',
  FINANCE:        '/finance',
  INVOICES:       '/invoices',
  CALENDAR:       '/calendar',
  KNOWLEDGE:      '/knowledge',
  BRAIN:          '/brain',
  SETTINGS:       '/settings',

  // Phase 2: Time Tracking
  TIME_TRACKING:  '/time',

  // Phase 3: AI Operatives
  OPERATIVES:     '/operatives',

  // Phase 4: API Ecosystem
  ADMIN:          '/admin',

  // Phase 5: Enterprise
  ENTERPRISE:     '/enterprise',

  // Phase 6: Mobile OS
  MOBILE:         '/mobile',

  // Phase 7: Advanced AI
  ADVANCED_AI:    '/advanced-ai',

  // Phase 8: Marketplace
  INTEGRATIONS:   '/integrations',
  PARTNERS:       '/partners',
  MARKETPLACE:    '/marketplace',

  // Phase 9: Analytics
  ANALYTICS:      '/analytics',
}