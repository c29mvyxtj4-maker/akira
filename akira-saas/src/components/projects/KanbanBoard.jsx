import { useState } from 'react'
import { motion } from 'framer-motion'
import { PROJECT_STAGE_MAP, PROJECT_STATUS_MAP } from '@/services/projects.service'

var STAGES = ['preproduction', 'production', 'postproduction', 'delivery', 'closed']

function fmtCur(n) { return (Number(n) || 0).toLocaleString('es-ES') + '€' }

function KanbanCard({ project, onSelect, onDragStart }) {
  var sc = PROJECT_STATUS_MAP[project.status]
  var tasks = Array.isArray(project.tasks) ? project.tasks : []
  var done  = tasks.filter(function(t) { return t.done }).length

  return (
    <motion.div
      layout
      draggable
      onDragStart={function(e) { onDragStart(e, project.id) }}
      onClick={function() { onSelect(project.id) }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-3)',
        border: '1px solid var(--border)', cursor: 'grab', marginBottom: '8px',
      }}
      whileHover={{ borderColor: 'var(--brand-border)' }}
    >
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</p>
      <p style={{ fontSize: '11px', color: 'var(--text-4)', marginBottom: '8px' }}>{project.clients ? (project.clients.company || project.clients.name) : 'Sin cliente'}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {sc && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', background: sc.color + '22', color: sc.color }}>{sc.label}</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {tasks.length > 0 && <span style={{ fontSize: '10px', color: 'var(--text-4)' }}>{done}/{tasks.length}</span>}
          {Number(project.budget) > 0 && <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-3)' }}>{fmtCur(project.budget)}</span>}
        </div>
      </div>
    </motion.div>
  )
}

export default function KanbanBoard({ projects, onSelect, onUpdateStage }) {
  var [dragOverStage, setDragOverStage] = useState(null)

  function handleDragStart(e, projectId) {
    e.dataTransfer.setData('text/plain', projectId)
  }

  function handleDrop(e, stage) {
    e.preventDefault()
    var projectId = e.dataTransfer.getData('text/plain')
    if (projectId) onUpdateStage(projectId, stage)
    setDragOverStage(null)
  }

  return (
    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', height: '100%' }}>
      {STAGES.map(function(stage) {
        var cfg = PROJECT_STAGE_MAP[stage]
        var items = projects.filter(function(p) { return p.stage === stage })
        var isOver = dragOverStage === stage

        return (
          <div key={stage}
            onDragOver={function(e) { e.preventDefault(); setDragOverStage(stage) }}
            onDragLeave={function() { setDragOverStage(function(s) { return s === stage ? null : s }) }}
            onDrop={function(e) { handleDrop(e, stage) }}
            style={{
              flex: '0 0 260px', display: 'flex', flexDirection: 'column',
              background: isOver ? 'rgba(230,57,70,0.04)' : 'transparent',
              border: '1px dashed ' + (isOver ? 'rgba(230,57,70,0.3)' : 'transparent'),
              borderRadius: '12px', padding: '8px', transition: 'all 0.1s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px 10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg ? cfg.color : '#6366f1', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-2)' }}>{cfg ? cfg.label : stage}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-5)', marginLeft: 'auto' }}>{items.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: '80px' }}>
              {items.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '11px', color: 'var(--text-5)' }}>Suelta aqui</div>
              ) : (
                items.map(function(p) {
                  return <KanbanCard key={p.id} project={p} onSelect={onSelect} onDragStart={handleDragStart} />
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}