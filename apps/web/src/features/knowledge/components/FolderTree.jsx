import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Plus, Trash2, Edit2, Star, Clock, FileText, FolderOpen } from 'lucide-react'
import clsx from 'clsx'

var FOLDER_COLORS = [
  '#e63946','#cc2936','#ff6464','#ef4444',
  '#f59e0b','#22c55e','#14b8a6','#3b82f6',
  '#64748b','#a855f7',
]

var FOLDER_ICONS = ['📁','📂','📋','📌','🗂️','📎','🔖','💼','🗃️','📦','⭐','🎯','🔒','🌐','💡']

function ColorPicker({ current, onChange, onClose }) {
  return (
    <div style={{ position: 'absolute', left: '100%', top: 0, zIndex: 100, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Color</p>
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', width: '120px', marginBottom: '8px' }}>
        {FOLDER_COLORS.map(function(c) {
          return (
            <button key={c} type="button" onClick={function() { onChange(c); onClose() }}
              style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: current === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }}
            />
          )
        })}
      </div>
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Icono</p>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', width: '120px' }}>
        {FOLDER_ICONS.map(function(icon) {
          return (
            <button key={icon} type="button" onClick={function() { onClose() }}
              style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', fontSize: '13px' }}
            >{icon}</button>
          )
        })}
      </div>
    </div>
  )
}

function FolderNode({
  folder, folders, level,
  selectedFolderId, expandedFolders, renamingFolder, docCounts,
  onSelect, onToggle, onCreateSub, onRename, onArchive, onColorChange,
}) {
  var [showMenu,  setShowMenu]  = useState(false)
  var [showColor, setShowColor] = useState(false)
  var [renameVal, setRenameVal] = useState(folder.name)
  var inputRef = useRef(null)

  var children   = folders.filter(function(f) { return f.parent_id === folder.id })
  var isExpanded = expandedFolders[folder.id]
  var isSelected = selectedFolderId === folder.id
  var isRenaming = renamingFolder   === folder.id
  var count      = docCounts[folder.id] || 0

  useEffect(function() {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  return (
    <div>
      <div
        style={{ position: 'relative' }}
        onMouseLeave={function() { setShowMenu(false); setShowColor(false) }}
      >
        <div
          onClick={function() { onSelect(folder.id); if (children.length > 0) onToggle(folder.id) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 8px 5px ' + (8 + level * 14) + 'px',
            borderRadius: '7px', cursor: 'pointer',
            background: isSelected ? 'rgba(230,57,70,0.15)' : 'transparent',
            transition: 'background 0.1s',
          }}
          onMouseEnter={function(e) {
            if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            setShowMenu(true)
          }}
          onMouseLeave={function(e) {
            if (!isSelected) e.currentTarget.style.background = 'transparent'
          }}
        >
          {/* Expand arrow */}
          <button type="button" onClick={function(e) { e.stopPropagation(); onToggle(folder.id) }}
            style={{ width: '14px', height: '14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, color: 'rgba(255,255,255,0.3)' }}
          >
            {children.length > 0 && (
              <ChevronRight style={{ width: '12px', height: '12px', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
            )}
          </button>

          {/* Icono */}
          <span style={{ fontSize: '14px', flexShrink: 0 }}>{folder.icon || '📁'}</span>

          {/* Nombre o input de renombrado */}
          {isRenaming ? (
            <input
              ref={inputRef}
              value={renameVal}
              onChange={function(e) { setRenameVal(e.target.value) }}
              onBlur={function() { onRename(folder.id, renameVal) }}
              onKeyDown={function(e) {
                if (e.key === 'Enter')  onRename(folder.id, renameVal)
                if (e.key === 'Escape') onRename(folder.id, folder.name)
              }}
              onClick={function(e) { e.stopPropagation() }}
              style={{ flex: 1, background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.4)', color: '#f1f5f9', borderRadius: '4px', fontSize: '12px', padding: '1px 6px', outline: 'none', fontFamily: 'inherit' }}
            />
          ) : (
            <span style={{ flex: 1, fontSize: '13px', color: isSelected ? '#ffb3b3' : 'rgba(255,255,255,0.7)', fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {folder.name}
            </span>
          )}

          {/* Badge de conteo */}
          {count > 0 && !isRenaming && (
            <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', borderRadius: '10px', padding: '0 5px', flexShrink: 0 }}>{count}</span>
          )}

          {/* Acciones hover */}
          {showMenu && !isRenaming && (
            <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }} onClick={function(e) { e.stopPropagation() }}>
              <button type="button" onClick={function() { onCreateSub(folder.id) }}
                style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', borderRadius: '4px' }}
                title="Nueva subcarpeta"
              ><Plus style={{ width: '11px', height: '11px' }} /></button>
              <button type="button" onClick={function() { setRenameVal(folder.name); onRename(folder.id, null); setShowMenu(false) }}
                style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', borderRadius: '4px' }}
                title="Renombrar"
              >
                <Edit2 style={{ width: '11px', height: '11px' }} />
              </button>
              <div style={{ position: 'relative' }}>
                <button type="button" onClick={function() { setShowColor(function(v) { return !v }) }}
                  style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                  title="Color"
                >
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: folder.color || '#e63946' }} />
                </button>
                {showColor && (
                  <ColorPicker current={folder.color} onChange={function(c) { onColorChange(folder.id, c) }} onClose={function() { setShowColor(false) }} />
                )}
              </div>
              <button type="button" onClick={function() { onArchive(folder.id) }}
                style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', borderRadius: '4px' }}
                title="Eliminar carpeta"
              ><Trash2 style={{ width: '11px', height: '11px' }} /></button>
            </div>
          )}
        </div>

        {/* Barra de color a la izquierda si seleccionado */}
        {isSelected && (
          <div style={{ position: 'absolute', left: level * 14 + 'px', top: '4px', bottom: '4px', width: '2px', borderRadius: '1px', background: folder.color || '#e63946' }} />
        )}
      </div>

      {/* Subcarpetas */}
      <AnimatePresence>
        {isExpanded && children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            {children.map(function(child) {
              return (
                <FolderNode
                  key={child.id}
                  folder={child}
                  folders={folders}
                  level={level + 1}
                  selectedFolderId={selectedFolderId}
                  expandedFolders={expandedFolders}
                  renamingFolder={renamingFolder}
                  docCounts={docCounts}
                  onSelect={onSelect}
                  onToggle={onToggle}
                  onCreateSub={onCreateSub}
                  onRename={onRename}
                  onArchive={onArchive}
                  onColorChange={onColorChange}
                />
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FolderTree({
  folders, docs, selectedFolderId, expandedFolders, renamingFolder,
  onSelect, onToggle, onCreateRoot, onCreateSub, onRename, onArchive, onColorChange,
}) {
  var rootFolders = folders.filter(function(f) { return !f.parent_id })

  var docCounts = {}
  docs.forEach(function(d) {
    if (d.folder_id) docCounts[d.folder_id] = (docCounts[d.folder_id] || 0) + 1
  })

  var SPECIAL = [
    { id: 'all',       icon: <FileText  style={{ width: '14px', height: '14px' }} />, label: 'Todos',     count: docs.length },
    { id: 'favorites', icon: <Star      style={{ width: '14px', height: '14px' }} />, label: 'Favoritos', count: docs.filter(function(d) { return d.is_favorited }).length },
    { id: 'templates', icon: <FolderOpen style={{ width: '14px', height: '14px' }} />, label: 'Plantillas', count: docs.filter(function(d) { return d.is_template }).length },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Vistas especiales */}
      <div style={{ padding: '8px 8px 4px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {SPECIAL.map(function(s) {
          var active = selectedFolderId === s.id
          return (
            <button key={s.id} type="button" onClick={function() { onSelect(s.id) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px', width: '100%',
                padding: '6px 8px', borderRadius: '7px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: active ? 'rgba(230,57,70,0.12)' : 'transparent',
                color: active ? '#ff8585' : 'rgba(255,255,255,0.5)',
                fontSize: '12px', fontWeight: active ? 600 : 400,
                transition: 'all 0.1s',
              }}
            >
              {s.icon}
              <span style={{ flex: 1 }}>{s.label}</span>
              {s.count > 0 && <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0 5px' }}>{s.count}</span>}
            </button>
          )
        })}
      </div>

      {/* Header carpetas */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px 4px' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Carpetas</span>
        <button type="button" onClick={onCreateRoot}
          style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', borderRadius: '4px' }}
          title="Nueva carpeta"
        ><Plus style={{ width: '13px', height: '13px' }} /></button>
      </div>

      {/* Árbol */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 12px' }}>
        {rootFolders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
            <p>Sin carpetas</p>
            <button type="button" onClick={onCreateRoot} style={{ marginTop: '6px', background: 'none', border: 'none', color: '#e63946', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
              Crear carpeta
            </button>
          </div>
        ) : (
          rootFolders.map(function(folder) {
            return (
              <FolderNode
                key={folder.id}
                folder={folder}
                folders={folders}
                level={0}
                selectedFolderId={selectedFolderId}
                expandedFolders={expandedFolders}
                renamingFolder={renamingFolder}
                docCounts={docCounts}
                onSelect={onSelect}
                onToggle={onToggle}
                onCreateSub={onCreateSub}
                onRename={onRename}
                onArchive={onArchive}
                onColorChange={onColorChange}
              />
            )
          })
        )}
      </div>
    </div>
  )
}