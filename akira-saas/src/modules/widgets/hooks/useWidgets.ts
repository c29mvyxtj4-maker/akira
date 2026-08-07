import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DashboardConfig, WidgetConfig } from '../types'

export function useWidgets(dashboardId?: string) {
  const [dashboard, setDashboard] = useState<DashboardConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's default dashboard
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const query = dashboardId
        ? supabase.from('dashboards').select('*').eq('id', dashboardId)
        : supabase.from('dashboards').select('*').eq('is_default', true)

      const { data, error: err } = await query.single()

      if (err) throw err
      setDashboard(data)
    } catch (err) {
      console.error('[useWidgets] fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard')
    } finally {
      setLoading(false)
    }
  }, [dashboardId])

  // Save dashboard configuration
  const saveDashboard = useCallback(
    async (config: Partial<DashboardConfig>) => {
      try {
        if (!dashboard) throw new Error('No dashboard loaded')

        const { error: err } = await supabase
          .from('dashboards')
          .update({
            ...config,
            updated_at: new Date().toISOString(),
          })
          .eq('id', dashboard.id)

        if (err) throw err
        setDashboard((prev) => (prev ? { ...prev, ...config } : null))
      } catch (err) {
        console.error('[useWidgets] save error:', err)
        setError(err instanceof Error ? err.message : 'Failed to save dashboard')
      }
    },
    [dashboard]
  )

  // Add widget to dashboard
  const addWidget = useCallback(
    async (widget: WidgetConfig) => {
      try {
        if (!dashboard) throw new Error('No dashboard loaded')

        const { error: err } = await supabase.from('dashboard_widgets').insert({
          dashboard_id: dashboard.id,
          widget_type: widget.type,
          position: (dashboard.widgets?.length || 0) + 1,
          size: widget.size,
          config: widget.config,
        })

        if (err) throw err

        setDashboard((prev) =>
          prev
            ? {
                ...prev,
                widgets: [...(prev.widgets || []), widget],
              }
            : null
        )
      } catch (err) {
        console.error('[useWidgets] add widget error:', err)
        setError(err instanceof Error ? err.message : 'Failed to add widget')
      }
    },
    [dashboard]
  )

  // Remove widget from dashboard
  const removeWidget = useCallback(
    async (widgetId: string) => {
      try {
        const { error: err } = await supabase
          .from('dashboard_widgets')
          .delete()
          .eq('id', widgetId)

        if (err) throw err

        setDashboard((prev) =>
          prev
            ? {
                ...prev,
                widgets: prev.widgets?.filter((w) => w.id !== widgetId) || [],
              }
            : null
        )
      } catch (err) {
        console.error('[useWidgets] remove widget error:', err)
        setError(err instanceof Error ? err.message : 'Failed to remove widget')
      }
    },
    []
  )

  // Update widget configuration
  const updateWidget = useCallback(
    async (widgetId: string, config: Partial<WidgetConfig>) => {
      try {
        const { error: err } = await supabase
          .from('dashboard_widgets')
          .update(config)
          .eq('id', widgetId)

        if (err) throw err

        setDashboard((prev) =>
          prev
            ? {
                ...prev,
                widgets: prev.widgets?.map((w) =>
                  w.id === widgetId ? { ...w, ...config } : w
                ),
              }
            : null
        )
      } catch (err) {
        console.error('[useWidgets] update widget error:', err)
        setError(err instanceof Error ? err.message : 'Failed to update widget')
      }
    },
    []
  )

  // Reorder widgets
  const reorderWidgets = useCallback(
    async (widgets: WidgetConfig[]) => {
      try {
        // Update all positions
        await Promise.all(
          widgets.map((w, idx) =>
            supabase
              .from('dashboard_widgets')
              .update({ position: idx })
              .eq('id', w.id)
          )
        )

        setDashboard((prev) =>
          prev
            ? {
                ...prev,
                widgets,
              }
            : null
        )
      } catch (err) {
        console.error('[useWidgets] reorder error:', err)
        setError(err instanceof Error ? err.message : 'Failed to reorder widgets')
      }
    },
    []
  )

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    dashboard,
    loading,
    error,
    saveDashboard,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
  }
}
