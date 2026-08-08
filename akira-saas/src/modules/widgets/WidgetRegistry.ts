// Central Registry of all available widgets
import { WidgetDefinition, WidgetType } from './types'
import KpiWidget from './components/widgets/KpiWidget'
import RevenueChartWidget from './components/widgets/RevenueChartWidget'
import ProjectStatusWidget from './components/widgets/ProjectStatusWidget'
import ClientListWidget from './components/widgets/ClientListWidget'
import TasksOverviewWidget from './components/widgets/TasksOverviewWidget'
import TimeSummaryWidget from './components/widgets/TimeSummaryWidget'
import InvoicesDueWidget from './components/widgets/InvoicesDueWidget'
import MessagesFeedWidget from './components/widgets/MessagesFeedWidget'
import CalendarMiniWidget from './components/widgets/CalendarMiniWidget'
import ActivityFeedWidget from './components/widgets/ActivityFeedWidget'
import ForecastChartWidget from './components/widgets/ForecastChartWidget'

export class WidgetRegistry {
  private static instance: WidgetRegistry
  private widgets: Map<WidgetType, WidgetDefinition> = new Map()

  private constructor() {
    this.registerDefaultWidgets()
  }

  static getInstance(): WidgetRegistry {
    if (!WidgetRegistry.instance) {
      WidgetRegistry.instance = new WidgetRegistry()
    }
    return WidgetRegistry.instance
  }

  private registerDefaultWidgets(): void {
    this.register('kpi', {
      type: 'kpi',
      title: 'KPI Card',
      description: 'Key metric with trend indicator',
      defaultSize: 'md',
      icon: 'TrendingUp',
      component: KpiWidget,
      defaultConfig: {
        metric: 'revenue',
        period: 'month',
        currency: 'USD',
      },
      dataSource: 'finance',
    })

    this.register('revenue-chart', {
      type: 'revenue-chart',
      title: 'Revenue Chart',
      description: 'Revenue over time visualization',
      defaultSize: 'lg',
      icon: 'BarChart3',
      component: RevenueChartWidget,
      defaultConfig: {
        period: '6months',
        chartType: 'bar',
      },
      dataSource: 'invoices',
    })

    this.register('project-status', {
      type: 'project-status',
      title: 'Project Status',
      description: 'Project distribution by status',
      defaultSize: 'md',
      icon: 'PieChart',
      component: ProjectStatusWidget,
      defaultConfig: {
        showLegend: true,
      },
      dataSource: 'projects',
    })

    this.register('client-list', {
      type: 'client-list',
      title: 'Top Clients',
      description: 'List of top clients by revenue',
      defaultSize: 'md',
      icon: 'Users',
      component: ClientListWidget,
      defaultConfig: {
        limit: 5,
        sortBy: 'revenue',
      },
      dataSource: 'clients',
    })

    this.register('tasks-overview', {
      type: 'tasks-overview',
      title: 'Tasks Overview',
      description: 'Pending and completed tasks',
      defaultSize: 'md',
      icon: 'CheckSquare',
      component: TasksOverviewWidget,
      defaultConfig: {
        showCompleted: true,
      },
      dataSource: 'projects',
    })

    this.register('time-summary', {
      type: 'time-summary',
      title: 'Time Summary',
      description: 'Billable hours summary',
      defaultSize: 'md',
      icon: 'Clock',
      component: TimeSummaryWidget,
      defaultConfig: {
        period: 'week',
        showBillable: true,
      },
      dataSource: 'time',
    })

    this.register('invoices-due', {
      type: 'invoices-due',
      title: 'Invoices Due',
      description: 'Upcoming invoice deadlines',
      defaultSize: 'md',
      icon: 'FileText',
      component: InvoicesDueWidget,
      defaultConfig: {
        daysAhead: 30,
      },
      dataSource: 'invoices',
    })

    this.register('messages-feed', {
      type: 'messages-feed',
      title: 'Messages',
      description: 'Recent team messages',
      defaultSize: 'md',
      icon: 'MessageSquare',
      component: MessagesFeedWidget,
      defaultConfig: {
        limit: 5,
      },
      dataSource: 'custom',
    })

    this.register('calendar-mini', {
      type: 'calendar-mini',
      title: 'Calendar',
      description: 'Mini calendar view',
      defaultSize: 'md',
      icon: 'Calendar',
      component: CalendarMiniWidget,
      defaultConfig: {
        showUpcoming: true,
      },
      dataSource: 'custom',
    })

    this.register('activity-feed', {
      type: 'activity-feed',
      title: 'Activity Feed',
      description: 'Recent activities',
      defaultSize: 'lg',
      icon: 'Activity',
      component: ActivityFeedWidget,
      defaultConfig: {
        limit: 10,
      },
      dataSource: 'custom',
    })

    this.register('forecast-chart', {
      type: 'forecast-chart',
      title: 'Revenue Forecast',
      description: 'Revenue forecast visualization',
      defaultSize: 'lg',
      icon: 'TrendingUp',
      component: ForecastChartWidget,
      defaultConfig: {
        months: 6,
      },
      dataSource: 'finance',
    })
  }

  register(type: WidgetType, definition: WidgetDefinition): void {
    this.widgets.set(type, definition)
  }

  get(type: WidgetType): WidgetDefinition | undefined {
    return this.widgets.get(type)
  }

  getAll(): WidgetDefinition[] {
    return Array.from(this.widgets.values())
  }

  getAllByDataSource(source: string): WidgetDefinition[] {
    return Array.from(this.widgets.values()).filter(
      (w) => w.dataSource === source
    )
  }
}

export const widgetRegistry = WidgetRegistry.getInstance()
