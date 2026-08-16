import { supabase } from '@/lib/supabase'

export const PROJECT_STATUS_MAP = {
  pending:   { label: 'Pendiente',  color: 'default' },
  active:    { label: 'Activo',     color: 'info' },
  review:    { label: 'Revision',   color: 'warning' },
  completed: { label: 'Completado', color: 'success' },
  cancelled: { label: 'Cancelado',  color: 'danger' },
}

export const PROJECT_STAGE_MAP = {
  preproduction:  { label: 'Preproduccion', color: '#6366f1' },
  production:     { label: 'Produccion',    color: '#ef4444' },
  postproduction: { label: 'Postproduccion',color: '#f59e0b' },
  delivery:       { label: 'Entrega',       color: '#22c55e' },
  closed:         { label: 'Cerrado',       color: '#374151' },
}

export const PROJECT_PRIORITY_MAP = {
  low:    { label: 'Baja',    color: 'default' },
  medium: { label: 'Media',   color: 'info' },
  high:   { label: 'Alta',    color: 'warning' },
  urgent: { label: 'Urgente', color: 'danger' },
}

export function generateTaskId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
}

export function safeTasks(raw) {
  return Array.isArray(raw) ? raw : []
}