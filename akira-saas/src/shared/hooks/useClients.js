import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { scopeToOrg, getActiveOrgId } from '@/shared/lib/activeOrg'

export function useClients() {
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('all')
  const [niche, setNiche]       = useState('all')
  const [sortBy, setSortBy]     = useState('updated_at')
  const [sortDir, setSortDir]   = useState('desc')
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail]     = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [timeline, setTimeline] = useState([])
  const [relProjects, setRelProjects] = useState([])
  const [finance, setFinance]   = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)

  const showToast = useCallback((msg, type) => {
    setToastMsg({ msg, type: type || 'success' })
    setTimeout(() => setToastMsg(null), 3500)
  }, [])

  // â”€â”€ Cargar lista â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let q = supabase
        .from('clients')
        .select('*')
        .eq('archived', false)
      q = scopeToOrg(q) // aislar por workspace activo (defensivo: no filtra si no hay)

      if (status !== 'all') q = q.eq('status', status)
      if (niche  !== 'all') q = q.eq('niche',  niche)
      if (search.trim()) {
        const s = `%${search.trim()}%`
        q = q.or(`name.ilike.${s},company.ilike.${s},email.ilike.${s}`)
      }
      q = q.order(sortBy, { ascending: sortDir === 'asc', nullsFirst: false })

      const { data, error: qErr } = await q
      if (qErr) {
        console.error('[useClients] loadList error:', qErr)
        setError(qErr.message)
      } else {
        setClients(data || [])
      }
    } catch (e) {
      console.error('[useClients] loadList catch:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, status, niche, sortBy, sortDir])

  useEffect(() => {
    const t = setTimeout(loadList, 300)
    return () => clearTimeout(t)
  }, [loadList])

  // â”€â”€ Cargar detalle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      setTimeline([])
      setRelProjects([])
      setFinance(null)
      return
    }
    setDetailLoading(true)

    Promise.allSettled([
      supabase.from('clients').select('*').eq('id', selectedId).single(),
      supabase.from('client_timeline').select('*').eq('client_id', selectedId).order('occurred_at', { ascending: false }),
      supabase.from('projects').select('id,name,status,stage,due_date,budget,actual_cost,progress,tasks').eq('client_id', selectedId).eq('archived', false),
      supabase.from('finance_entries').select('type,amount,status,entry_date,description').eq('client_id', selectedId).eq('archived', false).order('entry_date', { ascending: false }),
    ]).then(([rClient, rTimeline, rProjects, rFinance]) => {
      if (rClient.status === 'fulfilled' && !rClient.value.error) {
        setDetail(rClient.value.data)
      }
      if (rTimeline.status === 'fulfilled' && !rTimeline.value.error) {
        setTimeline(rTimeline.value.data || [])
      }
      if (rProjects.status === 'fulfilled' && !rProjects.value.error) {
        const rows = (rProjects.value.data || []).map(p => ({
          ...p,
          tasks: Array.isArray(p.tasks) ? p.tasks : [],
        }))
        setRelProjects(rows)
      }
      if (rFinance.status === 'fulfilled' && !rFinance.value.error) {
        const rows = rFinance.value.data || []
        const income  = rows.filter(r => ['income','payment'].includes(r.type)).reduce((s,r) => s + Number(r.amount), 0)
        const expense = rows.filter(r => r.type === 'expense').reduce((s,r) => s + Number(r.amount), 0)
        const pending = rows.filter(r => r.type === 'invoice' && r.status === 'pending').reduce((s,r) => s + Number(r.amount), 0)
        setFinance({ income, expense, profit: income - expense, pending, entries: rows })
      }
      setDetailLoading(false)
    })
  }, [selectedId])

  // â”€â”€ Tiempo real: recargar cuando cambia algo en otro dispositivo â”€â”€ â† NUEVO
  useEffect(() => {
    const channel = supabase.channel('clients-store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
        loadList()
        // Si el cliente que tienes abierto ahora mismo cambiÃ³ en otro dispositivo, lo refrescamos tambiÃ©n
        if (selectedId && payload.new && payload.new.id === selectedId) {
          setDetail(prev => (prev ? { ...prev, ...payload.new } : prev))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_timeline' }, (payload) => {
        const clientId = (payload.new && payload.new.client_id) || (payload.old && payload.old.client_id)
        if (clientId && clientId === selectedId) {
          supabase
            .from('client_timeline')
            .select('*')
            .eq('client_id', selectedId)
            .order('occurred_at', { ascending: false })
            .then(({ data }) => setTimeline(data || []))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [loadList, selectedId])

  // â”€â”€ Acciones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit   = (c) => { setEditing(c);   setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = async (form) => {
    setFormLoading(true)
    try {
      // Obtener usuario actual
      const { data: userData, error: authErr } = await supabase.auth.getUser()
      if (authErr) throw authErr
      if (!userData?.user) throw new Error('No hay sesion activa')

      const ownerId = userData.user.id
      

      const payload = {
        name:             form.name?.trim(),
        company:          form.company          || null,
        email:            form.email            || null,
        phone:            form.phone            || null,
        website:          form.website          || null,
        instagram:        form.instagram        || null,
        niche:            form.niche            || null,
        status:           form.status           || 'lead',
        source:           form.source           || 'unknown',
        monthly_value:    Number(form.monthly_value) || 0,
        notes:            form.notes            || null,
        next_followup_at: form.next_followup_at || null,
        owner_id:         ownerId,
        org_id:           getActiveOrgId() || null, // etiquetar al workspace activo
        archived:         false,
      }

      if (!payload.name) throw new Error('El nombre es obligatorio')


      if (editing) {
        const { data, error: updateErr } = await supabase
          .from('clients')
          .update(payload)
          .eq('id', editing.id)
          .select()
          .single()

        if (updateErr) throw updateErr

        setClients(prev => prev.map(c => c.id === data.id ? data : c))
        if (selectedId === data.id) setDetail(data)
        showToast('Cliente actualizado')
      } else {
        const { data, error: insertErr } = await supabase
          .from('clients')
          .insert(payload)
          .select()
          .single()

        if (insertErr) throw insertErr

        setClients(prev => [data, ...prev])
        setSelectedId(data.id)
        showToast('Cliente creado')
      }

      closeModal()
    } catch (e) {
      console.error('[useClients] handleSave ERROR:', e)
      showToast(e.message, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const handleArchive = async (id) => {
    try {
      const { error: archErr } = await supabase
        .from('clients')
        .update({ archived: true })
        .eq('id', id)
      if (archErr) throw archErr
      setClients(prev => prev.filter(c => c.id !== id))
      if (selectedId === id) setSelectedId(null)
      showToast('Cliente archivado')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const handleAddEntry = async ({ type, content, occurred_at }) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const ownerId = userData?.user?.id
      if (!ownerId) throw new Error('No hay sesion activa')

      const { data, error: insErr } = await supabase
        .from('client_timeline')
        .insert({
          client_id:   selectedId,
          owner_id:    ownerId,
          type:        type || 'note',
          content,
          occurred_at: occurred_at || new Date().toISOString(),
        })
        .select()
        .single()

      if (insErr) throw insErr
      setTimeline(prev => [data, ...prev])

      await supabase
        .from('clients')
        .update({ last_contact_at: occurred_at || new Date().toISOString() })
        .eq('id', selectedId)

      showToast('Entrada aÃ±adida')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const handleDeleteEntry = async (entryId) => {
    try {
      const { error: delErr } = await supabase
        .from('client_timeline')
        .delete()
        .eq('id', entryId)
      if (delErr) throw delErr
      setTimeline(prev => prev.filter(e => e.id !== entryId))
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return {
    clients, loading, error,
    search, setSearch,
    status, setStatus,
    niche, setNiche,
    sortBy, setSortBy,
    sortDir, setSortDir,
    selectedId, setSelectedId,
    detail, detailLoading,
    timeline, relProjects, finance,
    modalOpen, editing, formLoading,
    openCreate, openEdit, closeModal,
    handleSave, handleArchive,
    handleAddEntry, handleDeleteEntry,
    toastMsg,
  }
}
