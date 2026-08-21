import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
  getFolders,
  createFolder,
  updateFolder,
  archiveFolder,
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  archiveDocument,
  toggleFavorite,
  saveVersion,
  getVersions,
  uploadAndSaveAttachment,
  getAttachments,
  deleteAttachment,
} from '@/services/kb.service'

function safePrimitive(val) {
  if (val === null || val === undefined) return val
  if (typeof val === 'string')  return val
  if (typeof val === 'number')  return val
  if (typeof val === 'boolean') return val
  if (Array.isArray(val))       return val.filter(function(v) { return typeof v === 'string' })
  return null
}

export function useKnowledge() {
  var [folders,          setFolders]          = useState([])
  var [foldersLoading,   setFoldersLoading]   = useState(true)
  var [docs,             setDocs]             = useState([])
  var [docsLoading,      setDocsLoading]      = useState(false)
  var [activeDoc,        setActiveDoc]        = useState(null)
  var [docLoading,       setDocLoading]       = useState(false)
  var [saving,           setSaving]           = useState(false)
  var [lastSaved,        setLastSaved]        = useState(null)
  var [versions,         setVersions]         = useState([])
  var [attachments,      setAttachments]      = useState([])
  var [showAttachments,  setShowAttachments]  = useState(false)
  var [selectedFolderId, setSelectedFolderId] = useState('all')
  var [search,           setSearch]           = useState('')
  var [statusFilter,     setStatusFilter]     = useState('all')
  var [expandedFolders,  setExpandedFolders]  = useState({})
  var [view,             setView]             = useState('list')
  var [renamingFolder,   setRenamingFolder]   = useState(null)
  var [toastMsg,         setToastMsg]         = useState(null)
  var saveTimer = useRef(null)
  var activeDocRef = useRef(null) // –† NUEVO: para saber el doc activo dentro de la suscripción sin recrearla

  function showToast(msg, type) {
    setToastMsg({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToastMsg(null) }, 3500)
  }

  /* –”€–”€ Carpetas –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  var loadFolders = useCallback(function() {
    setFoldersLoading(true)
    getFolders()
      .then(function(data) { setFolders(data) })
      .catch(function(e) { console.error('[kb] folders:', e) })
      .finally(function() { setFoldersLoading(false) })
  }, [])

  useEffect(function() { loadFolders() }, [loadFolders])

  /* –”€–”€ Documentos –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  var loadDocs = useCallback(function() {
    setDocsLoading(true)
    getDocuments(selectedFolderId, search, statusFilter)
      .then(function(data) { setDocs(data) })
      .catch(function(e) { console.error('[kb] docs:', e) })
      .finally(function() { setDocsLoading(false) })
  }, [selectedFolderId, search, statusFilter])

  useEffect(function() {
    var t = setTimeout(loadDocs, 250)
    return function() { clearTimeout(t) }
  }, [loadDocs])

  /* –”€–”€ Abrir documento –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  function openDocument(id) {
    setDocLoading(true)
    setView('editor')
    getDocumentById(id)
      .then(function(doc) {
        setActiveDoc(doc)
        activeDocRef.current = doc // –† NUEVO
        return Promise.all([
          getVersions(id).catch(function() { return [] }),
          getAttachments(id).catch(function() { return [] }),
        ])
      })
      .then(function(results) {
        setVersions(results[0])
        setAttachments(results[1])
      })
      .catch(function(e) {
        console.error('[kb] openDocument:', e)
        showToast(e.message, 'error')
      })
      .finally(function() { setDocLoading(false) })
  }

  /* –”€–”€ Tiempo real: recargar cuando cambia algo en otro dispositivo –”€–”€ */
  // –† NUEVO: todo este bloque
  useEffect(function() {
    var channel = supabase.channel('kb-store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kb_folders' }, function() {
        loadFolders()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kb_documents' }, function(payload) {
        loadDocs()

        // Si el documento que estás viendo ahora mismo cambió en otro dispositivo, lo actualizamos también
        var changedId = payload.new && payload.new.id
        var current   = activeDocRef.current
        if (changedId && current && changedId === current.id && !saveTimer.current) {
          getDocumentById(changedId)
            .then(function(doc) {
              setActiveDoc(doc)
              activeDocRef.current = doc
            })
            .catch(function() {})
        }
      })
      .subscribe()

    return function() { supabase.removeChannel(channel) }
  }, [loadFolders, loadDocs])

  /* –”€–”€ Autosave –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  function scheduleAutoSave(docId, updates) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(function() {
      setSaving(true)
      updateDocument(docId, updates)
        .then(function(saved) {
          setActiveDoc(function(prev) {
            var merged = prev && prev.id === saved.id ? Object.assign({}, prev, saved) : prev
            activeDocRef.current = merged // –† NUEVO
            return merged
          })
          setDocs(function(prev) {
            return prev.map(function(d) {
              return d.id === saved.id
                ? Object.assign({}, d, {
                    title:      saved.title,
                    updated_at: saved.updated_at,
                    word_count: saved.word_count,
                  })
                : d
            })
          })
          setLastSaved(new Date())
          saveTimer.current = null // –† NUEVO: liberamos el "candado" para volver a aceptar cambios remotos
        })
        .catch(function(e) { showToast('Error al guardar: ' + e.message, 'error') })
        .finally(function() { setSaving(false) })
    }, 2000)
  }

  /* –”€–”€ Handlers de contenido –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  function handleContentChange(docId, content) {
    if (!docId || !content || typeof content !== 'object') return
    // content ya viene limpio desde TipTapEditor (getJSON + cleanJSON)
    setActiveDoc(function(prev) {
      if (!prev || prev.id !== docId) return prev
      var updated = Object.assign({}, prev, { content: content })
      activeDocRef.current = updated // –† NUEVO
      return updated
    })
    scheduleAutoSave(docId, { content: content })
  }

  function handleTitleChange(docId, title) {
    if (!docId || typeof title !== 'string') return
    setActiveDoc(function(prev) {
      if (!prev || prev.id !== docId) return prev
      var updated = Object.assign({}, prev, { title: title })
      activeDocRef.current = updated // –† NUEVO
      return updated
    })
    scheduleAutoSave(docId, { title: title })
  }

  function handleMetaChange(docId, updates) {
    if (!docId || !updates || typeof updates !== 'object') return
    var safeUpdates = {}
    Object.keys(updates).forEach(function(key) {
      var safe = safePrimitive(updates[key])
      if (safe !== null || updates[key] === null) safeUpdates[key] = safe
    })
    if (Object.keys(safeUpdates).length === 0) return
    setActiveDoc(function(prev) {
      if (!prev || prev.id !== docId) return prev
      var updated = Object.assign({}, prev, safeUpdates)
      activeDocRef.current = updated // –† NUEVO
      return updated
    })
    scheduleAutoSave(docId, safeUpdates)
  }

  /* –”€–”€ Version manual –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  function handleSaveVersion() {
    if (!activeDoc) return
    saveVersion(activeDoc)
      .then(function(v) {
        setVersions(function(prev) { return [v].concat(prev) })
        showToast('Version guardada')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  /* –”€–”€ Crear documento –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  function handleCreateDoc(folderId) {
    var target = folderId || (
      selectedFolderId !== 'all' &&
      selectedFolderId !== 'favorites' &&
      selectedFolderId !== 'templates'
        ? selectedFolderId : null
    )
    createDocument(target, 'Sin titulo')
      .then(function(doc) {
        setDocs(function(prev) { return [doc].concat(prev) })
        openDocument(doc.id)
        showToast('Documento creado')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  // –† NUEVO: crea un documento ya con el contenido de una plantilla dentro
  function handleCreateDocFromTemplate(title, content, folderId) {
    var target = folderId || (
      selectedFolderId !== 'all' &&
      selectedFolderId !== 'favorites' &&
      selectedFolderId !== 'templates'
        ? selectedFolderId : null
    )
    createDocument(target, title)
      .then(function(doc) {
        return updateDocument(doc.id, { content: content }).then(function(updated) {
          var merged = Object.assign({}, doc, updated)
          setDocs(function(prev) { return [merged].concat(prev) })
          openDocument(doc.id)
          showToast('Documento creado desde plantilla')
        })
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  /* –”€–”€ Archivar documento –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  function handleArchiveDoc(id) {
    if (!window.confirm('Archivar este documento?')) return
    archiveDocument(id)
      .then(function() {
        setDocs(function(prev) { return prev.filter(function(d) { return d.id !== id }) })
        if (activeDoc && activeDoc.id === id) { setActiveDoc(null); activeDocRef.current = null; setView('list') }
        showToast('Documento archivado')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  /* –”€–”€ Favorito –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  function handleToggleFavorite(id, current) {
    toggleFavorite(id, current)
      .then(function(updated) {
        setDocs(function(prev) {
          return prev.map(function(d) {
            return d.id === updated.id
              ? Object.assign({}, d, { is_favorited: updated.is_favorited })
              : d
          })
        })
        if (activeDoc && activeDoc.id === id) {
          setActiveDoc(function(prev) {
            var merged = Object.assign({}, prev, { is_favorited: updated.is_favorited })
            activeDocRef.current = merged // –† NUEVO
            return merged
          })
        }
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  /* –”€–”€ Adjuntos –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  function handleAttachFile(file) {
    if (!activeDoc) return Promise.reject(new Error('No hay documento activo'))
    return uploadAndSaveAttachment(file, activeDoc.id)
      .then(function(att) {
        setAttachments(function(prev) { return [att].concat(prev) })
        showToast('Archivo adjuntado')
        return att
      })
  }

  function handleDeleteAttachment(id, filePath) {
    return deleteAttachment(id, filePath)
      .then(function() {
        setAttachments(function(prev) { return prev.filter(function(a) { return a.id !== id }) })
        showToast('Adjunto eliminado')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  /* –”€–”€ Carpetas CRUD –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  function handleCreateFolder(parentId) {
    createFolder('Nueva carpeta', parentId)
      .then(function(folder) {
        setFolders(function(prev) { return prev.concat([folder]) })
        setRenamingFolder(folder.id)
        if (parentId) {
          setExpandedFolders(function(prev) {
            return Object.assign({}, prev, { [parentId]: true })
          })
        }
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleRenameFolder(id, name) {
    if (name === null) { setRenamingFolder(id); return }
    if (!name || !name.trim()) { setRenamingFolder(null); return }
    updateFolder(id, { name: name.trim() })
      .then(function(updated) {
        setFolders(function(prev) {
          return prev.map(function(f) { return f.id === updated.id ? updated : f })
        })
        setRenamingFolder(null)
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleUpdateFolderColor(id, color) {
    updateFolder(id, { color: color })
      .then(function(updated) {
        setFolders(function(prev) {
          return prev.map(function(f) { return f.id === updated.id ? updated : f })
        })
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleArchiveFolder(id) {
    if (!window.confirm('Eliminar esta carpeta?')) return
    archiveFolder(id)
      .then(function() {
        setFolders(function(prev) { return prev.filter(function(f) { return f.id !== id }) })
        if (selectedFolderId === id) setSelectedFolderId('all')
        showToast('Carpeta eliminada')
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function toggleFolderExpanded(id) {
    setExpandedFolders(function(prev) {
      return Object.assign({}, prev, { [id]: !prev[id] })
    })
  }

  /* –”€–”€ Return –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€ */
  return {
    folders:                 folders,
    foldersLoading:          foldersLoading,
    expandedFolders:         expandedFolders,
    renamingFolder:          renamingFolder,
    setRenamingFolder:       setRenamingFolder,
    handleCreateFolder:      handleCreateFolder,
    handleRenameFolder:      handleRenameFolder,
    handleUpdateFolderColor: handleUpdateFolderColor,
    handleArchiveFolder:     handleArchiveFolder,
    toggleFolderExpanded:    toggleFolderExpanded,
    docs:                    docs,
    docsLoading:             docsLoading,
    selectedFolderId:        selectedFolderId,
    setSelectedFolderId:     setSelectedFolderId,
    search:                  search,
    setSearch:               setSearch,
    statusFilter:            statusFilter,
    setStatusFilter:         setStatusFilter,
    handleCreateDoc:         handleCreateDoc,
    handleCreateDocFromTemplate: handleCreateDocFromTemplate, // –† NUEVO
    handleArchiveDoc:        handleArchiveDoc,
    handleToggleFavorite:    handleToggleFavorite,
    activeDoc:               activeDoc,
    docLoading:              docLoading,
    saving:                  saving,
    lastSaved:               lastSaved,
    view:                    view,
    setView:                 setView,
    versions:                versions,
    openDocument:            openDocument,
    handleContentChange:     handleContentChange,
    handleTitleChange:       handleTitleChange,
    handleMetaChange:        handleMetaChange,
    handleSaveVersion:       handleSaveVersion,
    attachments:             attachments,
    showAttachments:         showAttachments,
    setShowAttachments:      setShowAttachments,
    handleAttachFile:        handleAttachFile,
    handleDeleteAttachment:  handleDeleteAttachment,
    toastMsg:                toastMsg,
  }
}
