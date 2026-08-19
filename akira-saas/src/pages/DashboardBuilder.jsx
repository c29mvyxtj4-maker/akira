import { useState, useEffect } from 'react'
import { Plus, Save, Download, Share2, Trash2 } from 'lucide-react'
import { motion, Reorder, AnimatePresence } from 'framer-motion'
import AppLayout from '@/shared/components/layout/AppLayout'
import DashboardWidget from '@/components/dashboard/DashboardWidget'
import { fetchDashboards, saveDashboard, deleteDashboard, shareDashboard } from '@/services/dashboards.service'

const AVAILABLE_WIDGETS = [
  { id: 'kpi', name: 'KPI Card', size: 'small', icon: '📊' },
  { id: 'chart-revenue', name: 'Revenue Chart', size: 'large', icon: '📈' },
  { id: 'chart-projects', name: 'Projects Chart', size: 'large', icon: '📉' },
  { id: 'activity-feed', name: 'Activity Feed', size: 'large', icon: '📋' },
  { id: 'upcoming-events', name: 'Upcoming Events', size: 'medium', icon: '📅' },
  { id: 'forecast', name: 'Forecast Card', size: 'medium', icon: '🔮' },
  { id: 'quick-actions', name: 'Quick Actions', size: 'medium', icon: '⚡' },
  { id: 'metrics', name: 'Team Metrics', size: 'large', icon: '👥' },
]

export default function DashboardBuilderPage() {
  const [dashboards, setDashboards] = useState([])
  const [currentDashboard, setCurrentDashboard] = useState(null)
  const [widgets, setWidgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [showAddWidget, setShowAddWidget] = useState(false)

  useEffect(() => {
    loadDashboards()
  }, [])

  const loadDashboards = async () => {
    try {
      setLoading(true)
      const { data } = await fetchDashboards()
      setDashboards(data || [])
      if (data && data.length > 0) {
        setCurrentDashboard(data[0])
        setWidgets(data[0].widgets || [])
        setEditingName(data[0].name)
      }
    } catch (error) {
      console.error('Error loading dashboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWidget = (widgetType) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      config: {},
      size: AVAILABLE_WIDGETS.find(w => w.id === widgetType)?.size || 'medium',
    }
    setWidgets([...widgets, newWidget])
    setShowAddWidget(false)
  }

  const handleRemoveWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId))
  }

  const handleSaveDashboard = async () => {
    if (!editingName.trim()) {
      alert('El nombre del dashboard es requerido')
      return
    }

    try {
      setSaving(true)
      await saveDashboard({
        id: currentDashboard?.id,
        name: editingName,
        widgets: widgets,
      })
      alert('Dashboard guardado exitosamente')
      loadDashboards()
    } catch (error) {
      console.error('Error saving dashboard:', error)
      alert('Error al guardar dashboard')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDashboard = async () => {
    if (!currentDashboard || !window.confirm('¿Eliminar este dashboard?')) {
      return
    }

    try {
      await deleteDashboard(currentDashboard.id)
      loadDashboards()
    } catch (error) {
      console.error('Error deleting dashboard:', error)
    }
  }

  const handleShareDashboard = async () => {
    if (!currentDashboard) return

    try {
      const link = await shareDashboard(currentDashboard.id)
      navigator.clipboard.writeText(link)
      alert('Enlace copiado al portapapeles')
    } catch (error) {
      console.error('Error sharing dashboard:', error)
    }
  }

  const header = (
    <div style={{
      padding: 'var(--space-4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
    }}>
      <div>
        <h1 style={{
          margin: '0 0 4px 0',
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--text-1)',
        }}>
          Constructor de dashboards
        </h1>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: 'var(--text-3)',
        }}>
          Arrastra y personaliza tus widgets
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleShareDashboard}
          style={{
            padding: '10px 16px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-1)',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          <Share2 size={16} />
          Compartir
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleSaveDashboard}
          disabled={saving}
          style={{
            padding: '10px 16px',
            background: 'var(--brand)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'white',
            fontWeight: 600,
            fontSize: '13px',
            opacity: saving ? 0.5 : 1,
          }}
        >
          <Save size={16} />
          Guardar
        </motion.button>
      </div>
    </div>
  )

  const toolbar = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-2) var(--space-4)',
      borderBottom: '1px solid var(--border)',
    }}>
      <input
        type="text"
        value={editingName}
        onChange={(e) => setEditingName(e.target.value)}
        placeholder="Nombre del dashboard"
        style={{
          flex: 1,
          padding: '8px 12px',
          background: 'var(--bg-0)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: 'var(--text-1)',
          fontSize: '13px',
        }}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowAddWidget(!showAddWidget)}
        style={{
          padding: '8px 12px',
          background: 'var(--brand)',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'white',
          fontWeight: 600,
          fontSize: '13px',
        }}
      >
        <Plus size={16} />
        Agregar widget
      </motion.button>
      {currentDashboard && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleDeleteDashboard}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#ef4444',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          <Trash2 size={16} />
        </motion.button>
      )}
    </div>
  )

  return (
    <AppLayout header={header} toolbar={toolbar}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 3fr',
        gap: '24px',
        padding: 'var(--space-4)',
        height: 'calc(100vh - 200px)',
      }}>
        {/* Widgets Panel */}
        {showAddWidget && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{
              background: 'var(--bg-1)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-1)',
              textTransform: 'uppercase',
            }}>
              Widgets disponibles
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {AVAILABLE_WIDGETS.map(widget => (
                <motion.button
                  key={widget.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleAddWidget(widget.id)}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-1)',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  <span>{widget.icon}</span> {widget.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Canvas */}
        <Reorder.Group axis="y" values={widgets} onReorder={setWidgets} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-3)',
          overflowY: 'auto',
          padding: 'var(--space-2)',
          background: 'var(--bg-0)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
        }}>
          <AnimatePresence>
            {widgets.map(widget => (
              <Reorder.Item key={widget.id} value={widget}>
                <DashboardWidget
                  widget={widget}
                  onRemove={() => handleRemoveWidget(widget.id)}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </AppLayout>
  )
}
