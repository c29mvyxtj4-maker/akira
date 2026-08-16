// Widget System exports
export { WidgetRegistry, widgetRegistry } from './WidgetRegistry'
export type { WidgetType, WidgetSize, WidgetConfig, DashboardConfig, WidgetProps, WidgetDefinition } from './types'

// Hooks
export { useWidgets } from './hooks/useWidgets'

// Components
export { Widget } from './components/Widget'
export { WidgetGrid } from './components/WidgetGrid'
export { WidgetEditor } from './components/WidgetEditor'

// Services
export * as dashboardsService from './services/dashboards.service'
