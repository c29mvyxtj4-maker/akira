import { useState } from 'react'
import { Grid, Columns, Calendar, Images, LayoutGrid } from 'lucide-react'
import { motion } from 'framer-motion'

export function DatabaseViews({ data = [], onViewChange }) {
  const [currentView, setCurrentView] = useState('table')

  const views = [
    { id: 'table', label: 'Tabla', icon: Columns },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'gallery', label: 'Galería', icon: Images },
    { id: 'timeline', label: 'Timeline', icon: Grid },
  ]

  const handleViewChange = (viewId) => {
    setCurrentView(viewId)
    onViewChange?.(viewId)
  }

  return (
    <div className="w-full">
      {/* View selector */}
      <div className="flex gap-2 mb-6 border-b border-surface-2 pb-4">
        {views.map((view) => {
          const Icon = view.icon
          return (
            <motion.button
              key={view.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleViewChange(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === view.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-surface-2 text-text-2 hover:bg-surface-3'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{view.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* View content */}
      {currentView === 'table' && <TableView data={data} />}
      {currentView === 'kanban' && <KanbanView data={data} />}
      {currentView === 'calendar' && <CalendarView data={data} />}
      {currentView === 'gallery' && <GalleryView data={data} />}
      {currentView === 'timeline' && <TimelineView data={data} />}
    </div>
  )
}

function TableView({ data }) {
  const mockData = [
    { id: 1, name: 'Proyecto A', status: 'En progreso', fecha: '2026-08-15', dueño: 'Marc' },
    { id: 2, name: 'Proyecto B', status: 'Completado', fecha: '2026-08-10', dueño: 'Sofia' },
    { id: 3, name: 'Proyecto C', status: 'En espera', fecha: '2026-08-20', dueño: 'Carlos' },
  ]

  const displayData = data.length > 0 ? data : mockData

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-surface-2">
          <tr className="text-text-2">
            <th className="text-left px-4 py-2 font-semibold">Nombre</th>
            <th className="text-left px-4 py-2 font-semibold">Estado</th>
            <th className="text-left px-4 py-2 font-semibold">Fecha</th>
            <th className="text-left px-4 py-2 font-semibold">Dueño</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((item) => (
            <motion.tr
              key={item.id}
              whileHover={{ backgroundColor: 'var(--surface-2)' }}
              className="border-b border-surface-2 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 text-text-1">{item.name}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.status === 'Completado' ? 'bg-green-600/20 text-green-700' :
                  item.status === 'En progreso' ? 'bg-blue-600/20 text-blue-700' :
                  'bg-yellow-600/20 text-yellow-700'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3 text-text-2">{item.fecha}</td>
              <td className="px-4 py-3 text-text-2">{item.dueño}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KanbanView({ data }) {
  const columns = ['En progreso', 'En revisión', 'Completado']

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column} className="flex-shrink-0 w-80 bg-surface-1 rounded-lg p-4">
          <h3 className="font-semibold text-text-1 mb-4 text-sm">{column}</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((card) => (
              <motion.div
                key={card}
                whileHover={{ y: -2 }}
                className="bg-surface-0 border border-surface-2 rounded p-3 cursor-grab hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-text-1 mb-2">Tarea {card}</p>
                <div className="flex items-center gap-2 text-xs text-text-3">
                  <span>📅 2026-08-{15 + card}</span>
                  <span>👤 Marc</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function CalendarView({ data }) {
  return (
    <div className="bg-surface-1 rounded-lg p-6">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-text-2 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, idx) => {
          const day = idx - 5
          const isCurrentMonth = day >= 1 && day <= 31

          return (
            <motion.div
              key={idx}
              whileHover={{ backgroundColor: isCurrentMonth ? 'var(--surface-2)' : '' }}
              className={`aspect-square flex items-center justify-center rounded text-sm ${
                isCurrentMonth
                  ? 'bg-surface-0 border border-surface-2 cursor-pointer text-text-1'
                  : 'text-text-3'
              }`}
            >
              {isCurrentMonth && day}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function GalleryView({ data }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((card) => (
        <motion.div
          key={card}
          whileHover={{ y: -4 }}
          className="bg-surface-1 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="w-full h-40 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-4xl">
            📷
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-text-1 text-sm mb-2">Proyecto {card}</h3>
            <p className="text-xs text-text-3">Actualizado hace 2 días</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function TimelineView({ data }) {
  const events = [
    { date: '2026-08-10', title: 'Inicio del proyecto', status: 'completed' },
    { date: '2026-08-15', title: 'Primera reunión', status: 'completed' },
    { date: '2026-08-20', title: 'Revisión intermedia', status: 'in-progress' },
    { date: '2026-08-30', title: 'Presentación final', status: 'pending' },
  ]

  return (
    <div className="space-y-6">
      {events.map((event, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full ${
              event.status === 'completed' ? 'bg-green-600' :
              event.status === 'in-progress' ? 'bg-blue-600' :
              'bg-surface-3'
            }`} />
            {idx < events.length - 1 && (
              <div className="w-px h-12 bg-surface-2 mt-2" />
            )}
          </div>
          <div className="pt-1">
            <p className="text-xs text-text-3 font-medium">{event.date}</p>
            <p className="text-sm text-text-1 font-semibold mt-1">{event.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
