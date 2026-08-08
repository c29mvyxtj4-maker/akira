import { useState, useEffect, useCallback } from 'react'
import { DashboardConfig, WidgetConfig } from '../types'

const STORAGE_KEY = 'akira_dashboard_widgets'

export function useWidgets(dashboardId?: string) {
  const [dashboard, setDashboard] = useState<DashboardConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch from localStorage
  const fetchDashboard = useCallback(() => {
    try {
      setLoading(true)
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        setDashboard(data)
      } else {
        setDashboard({ widgets: [] })
      }
    } catch (err) {
      console.error('[useWidgets] fetch error:', err)
      setDashboard({ widgets: [] })
      setError('Error loading dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  // Save to localStorage
  const saveDashboard = useCallback((config: Partial<DashboardConfig>) => {
    try {
      setDashboard((prev) => {
        const updated = prev ? { ...prev, ...config } : (config as DashboardConfig)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (err) {
      console.error('[useWidgets] save error:', err)
      setError('Error saving dashboard')
    }
  }, [])

  // Add widget
  const addWidget = useCallback((widget: WidgetConfig) => {
    try {
      setDashboard((prev) => {
        const updated = prev
          ? { ...prev, widgets: [...(prev.widgets || []), widget] }
          : { widgets: [widget] }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (err) {
      console.error('[useWidgets] add widget error:', err)
      setError('Error adding widget')
    }
  }, [])

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    try {
      setDashboard((prev) => {
        if (!prev) return null
        const updated = {
          ...prev,
          widgets: prev.widgets?.filter((w) => w.id !== widgetId) || [],
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (err) {
      console.error('[useWidgets] remove widget error:', err)
      setError('Error removing widget')
    }
  }, [])

  // Update widget
  const updateWidget = useCallback((widgetId: string, config: Partial<WidgetConfig>) => {
    try {
      setDashboard((prev) => {
        if (!prev) return null
        const updated = {
          ...prev,
          widgets: prev.widgets?.map((w) =>
            w.id === widgetId ? { ...w, ...config } : w
          ),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (err) {
      console.error('[useWidgets] update widget error:', err)
      setError('Error updating widget')
    }
  }, [])

  // Reorder widgets
  const reorderWidgets = useCallback((widgets: WidgetConfig[]) => {
    try {
      setDashboard((prev) => {
        const updated = prev ? { ...prev, widgets } : { widgets }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (err) {
      console.error('[useWidgets] reorder error:', err)
      setError('Error reordering widgets')
    }
  }, [])

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
