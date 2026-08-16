import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { TIMELINE_TYPES } from '@/services/clients.service'
import Button  from '@/components/ui/Button'
import Select  from '@/components/ui/Select'

function formatDt(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TYPE_OPTIONS = Object.entries(TIMELINE_TYPES).map(([v, { label }]) => ({ value: v, label }))

export default function ClientTimeline({ timeline = [], onAdd, onDelete }) {
  const [open,    setOpen]    = useState(false)
  const [type,    setType]    = useState('note')
  const [content, setContent] = useState('')
  const [date,    setDate]    = useState('')
  const [saving,  setSaving]  = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSaving(true)
    await onAdd({ type, content, occurred_at: date || new Date().toISOString() })
    setContent('')
    setDate('')
    setType('note')
    setOpen(false)
    setSaving(false)
  }

  return (
    <div>
      {/* Add entry button */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-text-2 uppercase tracking-wider">Timeline</h4>
        <Button
          variant="ghost"
          size="xs"
          icon={<Plus className="w-3 h-3" />}
          onClick={() => setOpen(v => !v)}
        >
          Añadir
        </Button>
      </div>

      {/* Add entry form */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-surface-3 rounded-lg p-3 border border-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  options={TYPE_OPTIONS}
                  size="sm"
                />
                <input
                  type="datetime-local"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="input-base h-8 text-xs"
                />
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Descripción del evento…"
                rows={2}
                className="input-base text-xs w-full resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="xs" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button size="xs" loading={saving} onClick={handleSubmit}>
                  Guardar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      {timeline.length === 0 ? (
        <p className="text-xs text-text-4 text-center py-6">Sin entradas en el timeline</p>
      ) : (
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-3">
            {timeline.map((entry, i) => {
              const cfg = TIMELINE_TYPES[entry.type] || TIMELINE_TYPES.other
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 relative"
                >
                  {/* Dot */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 border-2 border-surface-1"
                    style={{ background: cfg.color + '22', borderColor: cfg.color + '44' }}
                  >
                    <span className="text-xs">{cfg.emoji}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-surface-3 rounded-lg p-2.5 border border-border min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className="text-2xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ background: cfg.color + '20', color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xs text-text-4 whitespace-nowrap">
                          {formatDt(entry.occurred_at)}
                        </span>
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-status-danger text-text-4 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-text-2 leading-relaxed">{entry.content}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}