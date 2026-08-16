import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { scopeToOrg, getActiveOrgId } from '@/shared/lib/activeOrg'

export function useProjects() {
  var [projects,      setProjects]      = useState([])
  var [loading,       setLoading]       = useState(true)
  var [error,         setError]         = useState(null)
  var [search,        setSearch]        = useState('')
  var [status,        setStatus]        = useState('all')
  var [clientId,      setClientId]      = useState('all')
  var [priority,      setPriority]      = useState('all')
  var [stage,         setStage]         = useState('all')
  var [sortBy,        setSortBy]        = useState('due_date')
  var [sortDir,       setSortDir]       = useState('asc')
  var [clients,       setClients]       = useState([])
  var [selectedId,    setSelectedId]    = useState(null)
  var [detail,        setDetail]        = useState(null)
  var [detailLoading, setDetailLoading] = useState(false)
  var [modalOpen,     setModalOpen]     = useState(false)
  var [editing,       setEditing]       = useState(null)
  var [formLoading,   setFormLoading]   = useState(false)
  var [toastMsg,      setToastMsg]      = useState(null)

  function showToast(msg, type) {
    setToastMsg({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToastMsg(null) }, 3500)
  }

  function safeTasks(raw) {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    try { return JSON.parse(raw) } catch (e) { return [] }
  }

  function makeId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
  }

  useEffect(function() {
    supabase.from('clients').select('id, name, company').eq('archived', false).order('name')
      .then(function(res) { setClients(res.data || []) })
  }, [])

  var loadList = useCallback(function() {
    setLoading(true)
    setError(null)
    var q = supabase.from('projects').select('*, clients(id, name, company)').eq('archived', false)
    q = scopeToOrg(q) // aislar por workspace activo (defensivo)
    if (status   !== 'all') q = q.eq('status',    status)
    if (clientId !== 'all') q = q.eq('client_id', clientId)
    if (priority !== 'all') q = q.eq('priority',  priority)
    if (stage    !== 'all') q = q.eq('stage',     stage)
    if (search.trim())      q = q.ilike('name', '%' + search.trim() + '%')
    q = q.order(sortBy, { ascending: sortDir === 'asc', nullsFirst: false })
    q.then(function(res) {
      if (res.error) { setError(res.error.message) }
      else {
        setProjects((res.data || []).map(function(p) {
          return Object.assign({}, p, { tasks: safeTasks(p.tasks) })
        }))
      }
      setLoading(false)
    })
  }, [search, status, clientId, priority, stage, sortBy, sortDir])

  useEffect(function() {
    var t = setTimeout(loadList, 300)
    return function() { clearTimeout(t) }
  }, [loadList])

  var loadDetail = useCallback(function(id) {
    if (!id) { setDetail(null); return }
    setDetailLoading(true)
    supabase.from('projects').select('*, clients(id, name, company, email, phone)').eq('id', id).single()
      .then(function(res) {
        if (res.error) { console.error(res.error); return }
        setDetail(Object.assign({}, res.data, { tasks: safeTasks(res.data.tasks) }))
      })
      .finally(function() { setDetailLoading(false) })
  }, [])

  useEffect(function() {
    loadDetail(selectedId)
  }, [selectedId, loadDetail])

  useEffect(function() {
    var channel = supabase.channel('projects-store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, function(payload) {
        loadList()
        var changedId = (payload.new && payload.new.id) || (payload.old && payload.old.id)
        if (changedId && changedId === selectedId) {
          loadDetail(selectedId)
        }
      })
      .subscribe()

    return function() { supabase.removeChannel(channel) }
  }, [loadList, loadDetail, selectedId])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(p)  { setEditing(p);   setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  function handleSave(form) {
    setFormLoading(true)
    supabase.auth.getUser().then(function(res) {
      var ownerId = res.data && res.data.user ? res.data.user.id : null
      if (!ownerId) throw new Error('No hay sesion activa')
      var payload = {
        name:            (form.name || '').trim(),
        client_id:       form.client_id       || null,
        description:     form.description     || null,
        status:          form.status          || 'pending',
        priority:        form.priority        || 'medium',
        stage:           form.stage           || 'preproduction',
        budget:          Number(form.budget)  || 0,
        actual_cost:     Number(form.actual_cost)     || 0,
        estimated_hours: Number(form.estimated_hours) || 0,
        start_date:      form.start_date      || null,
        due_date:        form.due_date        || null,
        shoot_date:      form.shoot_date      || null,
        delivery_date:   form.delivery_date   || null,
        notes:           form.notes           || null,
        owner_id:        ownerId,
        org_id:          getActiveOrgId() || null, // etiquetar al workspace activo
        archived:        false,
      }
      if (!payload.name) throw new Error('El nombre es obligatorio')
      if (editing) {
        return supabase.from('projects').update(payload).eq('id', editing.id).select('*, clients(id, name, company)').single()
          .then(function(r) {
            if (r.error) throw r.error
            var n = Object.assign({}, r.data, { tasks: safeTasks(r.data.tasks) })
            setProjects(function(prev) { return prev.map(function(p) { return p.id === r.data.id ? n : p }) })
            if (selectedId === r.data.id) setDetail(n)
            showToast('Proyecto actualizado')
            closeModal()
          })
      } else {
        return supabase.from('projects').insert(Object.assign({}, payload, { tasks: [], progress: 0 })).select('*, clients(id, name, company)').single()
          .then(function(r) {
            if (r.error) throw r.error
            var n = Object.assign({}, r.data, { tasks: [] })
            setProjects(function(prev) { return [n].concat(prev) })
            setSelectedId(r.data.id)
            showToast('Proyecto creado')
            closeModal()
          })
      }
    })
    .catch(function(e) { showToast(e.message, 'error') })
    .finally(function() { setFormLoading(false) })
  }

  function handleArchive(id) {
    supabase.from('projects').update({ archived: true }).eq('id', id).then(function(res) {
      if (res.error) { showToast(res.error.message, 'error'); return }
      setProjects(function(prev) { return prev.filter(function(p) { return p.id !== id }) })
      if (selectedId === id) setSelectedId(null)
      showToast('Proyecto archivado')
    })
  }

  function saveTasksToDB(projectId, newTasks) {
    return supabase.from('projects').update({ tasks: newTasks }).eq('id', projectId).select('id, tasks').single()
      .then(function(res) {
        if (res.error) throw res.error
        var saved = safeTasks(res.data.tasks)
        setProjects(function(prev) {
          return prev.map(function(p) { return p.id === projectId ? Object.assign({}, p, { tasks: saved }) : p })
        })
        setDetail(function(prev) {
          if (!prev || prev.id !== projectId) return prev
          return Object.assign({}, prev, { tasks: saved })
        })
        return saved
      })
  }

  function handleAddTask(projectId, text, taskPriority) {
    if (!projectId || !text || !text.trim()) return
    supabase.from('projects').select('tasks').eq('id', projectId).single()
      .then(function(res) {
        if (res.error) throw res.error
        var current = safeTasks(res.data.tasks)
        var newTask = { id: makeId(), text: text.trim(), done: false, priority: taskPriority || 'medium', due_date: null, assignee: '', createdAt: new Date().toISOString() }
        return saveTasksToDB(projectId, current.concat([newTask]))
      })
      .then(function() { showToast('Tarea anadida') })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleToggleTask(projectId, taskId) {
    if (!projectId || !taskId) return
    supabase.from('projects').select('tasks').eq('id', projectId).single()
      .then(function(res) {
        if (res.error) throw res.error
        var next = safeTasks(res.data.tasks).map(function(t) {
          return t.id === taskId ? Object.assign({}, t, { done: !t.done }) : t
        })
        return saveTasksToDB(projectId, next)
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleDeleteTask(projectId, taskId) {
    if (!projectId || !taskId) return
    supabase.from('projects').select('tasks').eq('id', projectId).single()
      .then(function(res) {
        if (res.error) throw res.error
        var next = safeTasks(res.data.tasks).filter(function(t) { return t.id !== taskId })
        return saveTasksToDB(projectId, next)
      })
      .then(function() { showToast('Tarea eliminada') })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleUpdateTaskPriority(projectId, taskId, newPriority) {
    if (!projectId || !taskId) return
    supabase.from('projects').select('tasks').eq('id', projectId).single()
      .then(function(res) {
        if (res.error) throw res.error
        var next = safeTasks(res.data.tasks).map(function(t) {
          return t.id === taskId ? Object.assign({}, t, { priority: newPriority }) : t
        })
        return saveTasksToDB(projectId, next)
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleUpdateTaskAssignee(projectId, taskId, userId) {
    if (!projectId || !taskId) return
    supabase.from('projects').select('tasks').eq('id', projectId).single()
      .then(function(res) {
        if (res.error) throw res.error
        var next = safeTasks(res.data.tasks).map(function(t) {
          return t.id === taskId ? Object.assign({}, t, { assignee: userId || '' }) : t
        })
        return saveTasksToDB(projectId, next)
      })
      .catch(function(e) { showToast(e.message, 'error') })
  }

  function handleUpdateProgress(projectId, progress) {
    supabase.from('projects').update({ progress: progress }).eq('id', projectId)
      .then(function(res) {
        if (res.error) { showToast(res.error.message, 'error'); return }
        setProjects(function(prev) {
          return prev.map(function(p) {
            return p.id === projectId ? Object.assign({}, p, { progress: progress }) : p
          })
        })
        setDetail(function(prev) {
          if (!prev || prev.id !== projectId) return prev
          return Object.assign({}, prev, { progress: progress })
        })
        showToast('Progreso actualizado')
      })
  }

  // –† NUEVO: cambiar la etapa de un proyecto sin abrir el formulario (para el Kanban)
  function handleUpdateStage(projectId, newStage) {
    setProjects(function(prev) {
      return prev.map(function(p) { return p.id === projectId ? Object.assign({}, p, { stage: newStage }) : p })
    })
    supabase.from('projects').update({ stage: newStage }).eq('id', projectId)
      .then(function(res) {
        if (res.error) {
          showToast(res.error.message, 'error')
          loadList() // revertimos si falla
          return
        }
        setDetail(function(prev) {
          if (!prev || prev.id !== projectId) return prev
          return Object.assign({}, prev, { stage: newStage })
        })
      })
  }

  // Guarda el contenido de la "página" (editor tipo Notion) del proyecto.
  function savePage(projectId, content) {
    supabase.from('projects').update({ page_content: content }).eq('id', projectId).then(function(res) {
      if (res.error) { showToast('No se pudo guardar la página', 'error'); return }
      setDetail(function(prev) {
        if (!prev || prev.id !== projectId) return prev
        return Object.assign({}, prev, { page_content: content })
      })
    })
  }

  return {
    projects: projects, loading: loading, error: error,
    search: search, setSearch: setSearch,
    status: status, setStatus: setStatus,
    clientId: clientId, setClientId: setClientId,
    priority: priority, setPriority: setPriority,
    stage: stage, setStage: setStage,
    sortBy: sortBy, setSortBy: setSortBy,
    sortDir: sortDir, setSortDir: setSortDir,
    clients: clients,
    selectedId: selectedId, setSelectedId: setSelectedId,
    detail: detail, detailLoading: detailLoading,
    modalOpen: modalOpen, editing: editing, formLoading: formLoading,
    openCreate: openCreate, openEdit: openEdit, closeModal: closeModal,
    handleSave: handleSave, handleArchive: handleArchive,
    handleAddTask: handleAddTask, handleToggleTask: handleToggleTask,
    handleDeleteTask: handleDeleteTask, handleUpdateTaskPriority: handleUpdateTaskPriority,
    handleUpdateTaskAssignee: handleUpdateTaskAssignee,
    handleUpdateProgress: handleUpdateProgress,
    handleUpdateStage: handleUpdateStage,
    savePage: savePage,
    toastMsg: toastMsg,
  }
}
