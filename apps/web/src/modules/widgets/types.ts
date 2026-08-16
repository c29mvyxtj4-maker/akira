// Widget System Types & Interfaces
export type WidgetType =
  | 'kpi'
  | 'revenue-chart'
  | 'project-status'
  | 'client-list'
  | 'tasks-overview'
  | 'time-summary'
  | 'invoices-due'
  | 'messages-feed'
  | 'calendar-mini'
  | 'custom-query'
  | 'activity-feed'
  | 'forecast-chart'

export type WidgetSize = 'sm' | 'md' | 'lg' | 'full'

export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  size: WidgetSize
  position: number
  config: Record<string, any>
  refreshInterval?: number // milliseconds
  customQuery?: string
  filters?: Record<string, any>
}

export interface DashboardConfig {
  id: string
  orgId: string
  userId: string
  name: string
  isDefault: boolean
  widgets: WidgetConfig[]
  layout: 'grid' | 'masonry'
  gridCols: 2 | 3 | 4
  createdAt: string
  updatedAt: string
}

export interface WidgetProps {
  config: WidgetConfig
  data?: any
  loading?: boolean
  error?: string
  onUpdate?: (config: WidgetConfig) => void
  onRemove?: (id: string) => void
  onReorder?: (widgets: WidgetConfig[]) => void
}

export interface WidgetDefinition {
  type: WidgetType
  title: string
  description: string
  defaultSize: WidgetSize
  icon: string
  component: React.ComponentType<WidgetProps>
  defaultConfig: Record<string, any>
  dataSource?: 'clients' | 'projects' | 'finance' | 'invoices' | 'time' | 'custom'
}
