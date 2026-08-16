import { motion } from 'framer-motion'
import { Star, Archive, Edit3, FileText, Clock, Tag } from 'lucide-react'
import clsx from 'clsx'

var STATUS_CFG = {
  draft:     { label: 'Borrador',  color: '#64748b' },
  published: { label: 'Publicado', color: '#22c55e' },
  archived:  { label: 'Archivado', color: '#f59e0b' },
  private:   { label: 'Privado',   color: '#a855f7' },
}

function DocCard({ doc, isActive, onClick, onArchive, onFavorite }) {
  var sc   = STATUS_CFG[doc.status] || STATUS_CFG.draft
  var tags = Array.isArray(doc.tags) ? doc.tags : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      style={{
        padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
        background: isActive ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.02)',
        border: '1px solid ' + (isActive ? 'rgba(230,57,70,0.25)' : 'rgba(255,255,255,0.04)'),
        marginBottom: '4px', transition: 'all 0.1s',
        position: 'relative',
      }}
      onMouseEnter={function(e) { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={function(e) { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{doc.icon || '📄'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: isActive ? '#ffb3b3' : '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>
            {doc.title || 'Sin titulo'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: sc.color + '22', color: sc.color, fontWeight: 600 }}>{sc.label}</span>
            {doc.word_count > 0 && (
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock style={{ width: '9px', height: '9px' }} />
                {doc.read_time_min}min
              </span>
            )}
            {doc.category && (
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{doc.category}</span>
            )}
          </div>
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '5px', flexWrap: 'wrap' }}>
              {tags.slice(0, 3).map(function(t) {
                return <span key={t} style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', color: '#e63946', border: '1px solid rgba(230,57,70,0.2)' }}>{t}</span>
              })}
              {tags.length > 3 && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>+{tags.length - 3}</span>}
            </div>
          )}
        </div>
        {/* Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}
          onClick={function(e) { e.stopPropagation() }}
        >
          <button type="button" onClick={function() { onFavorite(doc.id, doc.is_favorited) }}
            style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: doc.is_favorited ? '#fbbf24' : 'rgba(255,255,255,0.2)', borderRadius: '4px' }}
          ><Star style={{ width: '12px', height: '12px', fill: doc.is_favorited ? '#fbbf24' : 'none' }} /></button>
          <button type="button" onClick={function() { onArchive(doc.id) }}
            style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', borderRadius: '4px' }}
          ><Archive style={{ width: '12px', height: '12px' }} /></button>
        </div>
      </div>
    </motion.div>
  )
}

export default function DocList({ docs, loading, activeDocId, onOpen, onArchive, onFavorite, onNew }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px' }}>
        {[1,2,3,4,5].map(function(i) {
          return <div key={i} style={{ height: '68px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', animation: 'pulse 2s infinite' }} />
        })}
      </div>
    )
  }

  if (docs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', color: 'rgba(255,255,255,0.3)' }}>
        <FileText style={{ width: '32px', height: '32px', margin: '0 auto 10px', opacity: 0.3 }} />
        <p style={{ fontSize: '13px', marginBottom: '8px' }}>Sin documentos</p>
        <button type="button" onClick={onNew}
          style={{ padding: '6px 16px', borderRadius: '8px', background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
        >+ Nuevo documento</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '6px' }}>
      {docs.map(function(doc) {
        return (
          <DocCard
            key={doc.id}
            doc={doc}
            isActive={activeDocId === doc.id}
            onClick={function() { onOpen(doc.id) }}
            onArchive={onArchive}
            onFavorite={onFavorite}
          />
        )
      })}
    </div>
  )
}