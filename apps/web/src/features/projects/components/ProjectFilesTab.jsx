import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Trash2, Download, Image as ImageIcon, Video, Music, FileText, File as FileIcon } from 'lucide-react'
import { getProjectFiles, uploadProjectFile, deleteProjectFile, fmtFileSize, fileKind } from '@db/queries/projectFiles.service'
import { supabase } from '@/shared/lib/supabase'

var KIND_ICON = { image: ImageIcon, video: Video, audio: Music, pdf: FileText, other: FileIcon }
var KIND_COLOR = { image: '#22c55e', video: '#3b82f6', audio: '#a855f7', pdf: '#f59e0b', other: '#64748b' }

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function FileCard({ file, onDelete }) {
  var kind = fileKind(file.file_type)
  var Icon = KIND_ICON[kind]
  var color = KIND_COLOR[kind]

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      style={{ borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-3)', overflow: 'hidden' }}
    >
      {kind === 'image' ? (
        <a href={file.file_url} target="_blank" rel="noreferrer" style={{ display: 'block', height: '110px', background: 'var(--bg-4)' }}>
          <img src={file.file_url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </a>
      ) : kind === 'video' ? (
        <video src={file.file_url} controls style={{ width: '100%', height: '110px', background: '#000', display: 'block' }} />
      ) : (
        <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '0d' }}>
          <Icon style={{ width: '32px', height: '32px', color: color }} />
        </div>
      )}

      <div style={{ padding: '10px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-4)' }}>
            {fmtFileSize(file.file_size)} {file.version > 1 ? 'Â· v' + file.version : ''}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-5)' }}>{fmtDate(file.created_at)}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          <a href={file.file_url} target="_blank" rel="noreferrer" download
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '5px', borderRadius: '6px', background: 'var(--bg-4)', color: 'var(--text-3)', textDecoration: 'none', fontSize: '11px' }}
          ><Download style={{ width: '11px', height: '11px' }} /> Descargar</a>
          <button type="button" onClick={function() { onDelete(file) }}
            style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', cursor: 'pointer' }}
          ><Trash2 style={{ width: '11px', height: '11px' }} /></button>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProjectFilesTab({ project }) {
  var [files,   setFiles]   = useState([])
  var [loading, setLoading] = useState(true)
  var [uploading, setUploading] = useState(false)
  var inputRef = useRef(null)

  function load() {
    setLoading(true)
    getProjectFiles(project.id).then(setFiles).catch(function() {}).finally(function() { setLoading(false) })
  }

  useEffect(function() { load() }, [project.id])

  useEffect(function() {
    var channel = supabase.channel('project-files-' + project.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_files' }, function() { load() })
      .subscribe()
    return function() { supabase.removeChannel(channel) }
  }, [project.id])

  function handleFilesSelected(e) {
    var selected = Array.from(e.target.files || [])
    if (selected.length === 0) return
    setUploading(true)
    Promise.all(selected.map(function(f) { return uploadProjectFile(project.id, f) }))
      .then(function() { load() })
      .catch(function(err) { window.alert('Error al subir: ' + err.message) })
      .finally(function() { setUploading(false); if (inputRef.current) inputRef.current.value = '' })
  }

  function handleDelete(file) {
    if (!window.confirm('Eliminar "' + file.name + '"?')) return
    deleteProjectFile(file.id, file.file_path).then(load).catch(function(e) { window.alert(e.message) })
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <input ref={inputRef} type="file" multiple onChange={handleFilesSelected} style={{ display: 'none' }} />
        <button type="button" onClick={function() { inputRef.current.click() }} disabled={uploading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer' }}
        >
          <Upload style={{ width: '15px', height: '15px' }} />
          {uploading ? 'Subiendo...' : 'Subir archivos'}
        </button>
        <p style={{ fontSize: '11px', color: 'var(--text-5)', marginTop: '6px' }}>
          Si subes un archivo con el mismo nombre que otro ya existente, se guarda como una version nueva, sin borrar la anterior.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>
      ) : files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-5)' }}>
          <Upload style={{ width: '32px', height: '32px', margin: '0 auto 10px', opacity: 0.3 }} />
          <p style={{ fontSize: '13px' }}>Sin archivos todavia en este proyecto</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {files.map(function(f) { return <FileCard key={f.id} file={f} onDelete={handleDelete} /> })}
        </div>
      )}
    </div>
  )
}

