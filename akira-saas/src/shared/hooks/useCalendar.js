import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'

function toLocalDate(iso) {
  if (!iso) return null
  var d = new Date(iso)
  var y = d.getFullYear()
  var m = String(d.getMonth() + 1).padStart(2, '0')
  var day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}
function toLocalTime(iso) {
  if (!iso) return null
  var d = new Date(iso)
  var h = String(d.getHours()).padStart(2, '0')
  var mi = String(d.getMinutes()).padStart(2, '0')
  return h + ':' + mi
}

function combineDateTime(dateStr, timeStr) {
  if (!dateStr) return null
  // Construimos la fecha con los componentes de HORA LOCAL y devolvemos su ISO
  // (UTC). Así, al guardarse en la columna timestamptz y volver a leerse con
  // new Date(...).getHours(), recuperamos exactamente la hora que puso el
  // usuario (antes se guardaba texto "naÀ¯ve" -> Postgres lo tomaba como UTC y
  // el evento se desplazaba segÀºn la zona horaria).
  var dp = String(dateStr).split('-')
  var tp = String(timeStr || '00:00').split(':')
  var d = new Date(
    Number(dp[0]), Number(dp[1]) - 1, Number(dp[2]),
    Number(tp[0]) || 0, Number(tp[1]) || 0, 0, 0
  )
  return d.toISOString()
}

function dbStatusToUi(status) {
  return status === 'scheduled' ? 'pending' : status
}
function uiStatusToDb(status) {
  return status === 'pending' ? 'scheduled' : status
}

function mapRow(row) {
  return Object.assign({}, row, {
    event_date: toLocalDate(row.start_at),
    start_time: row.all_day ? null : toLocalTime(row.start_at),
    end_time:   row.all_day ? null : toLocalTime(row.end_at),
    event_type: row.type,
    status:     dbStatusToUi(row.status),
    is_auto:    false,
  })
}

function fmtCur(n) {
  return Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '–‚¬'
}

export function useCalendar() {
  const today = new Date()

  const [currentYear, setCurrentYear]   = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())

  const [dbEvents, setDbEvents] = useState([])   // eventos reales creados a mano
  const [autoEvents, setAutoEvents] = useState([]) // –† NUEVO: cobros y renovaciones automáticos
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const [modalOpen, setModalOpen]     = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const [selectors, setSelectors] = useState({ clients: [] })

  const [toastMsg, setToastMsg] = useState(null)
  const showToast = useCallback((msg, type) => {
    setToastMsg({ msg, type: type || 'success' })
    setTimeout(() => setToastMsg(null), 3500)
  }, [])

  // –”€–”€ Cargar eventos reales –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€
  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: userData, error: authErr } = await supabase.auth.getUser()
      if (authErr) throw authErr

      let q = supabase
        .from('calendar_events')
        .select('*')
        .eq('archived', false)
        .order('start_at', { ascending: true })

      if (userData?.user) {
        q = q.eq('owner_id', userData.user.id)
      }

      const { data, error: qErr } = await q
      if (qErr) {
        console.error('[useCalendar] loadEvents error:', qErr)
        setError(qErr.message)
      } else {
        setDbEvents((data || []).map(mapRow))
      }
    } catch (e) {
      console.error('[useCalendar] loadEvents catch:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // –”€–”€ Cargar eventos automáticos: facturas pendientes + renovaciones –”€–”€ –† NUEVO
  const loadAutoEvents = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) { setAutoEvents([]); return }
      const ownerId = userData.user.id

      const [invRes, subRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('id, invoice_number, due_date, total, status, clients(id, name, company)')
          .eq('owner_id', ownerId)
          .eq('archived', false)
          .in('status', ['draft', 'sent'])
          .not('due_date', 'is', null),
        supabase
          .from('subscriptions')
          .select('id, name, price, period, next_billing, status, clients(id, name, company)')
          .eq('owner_id', ownerId)
          .eq('archived', false)
          .eq('status', 'active')
          .not('next_billing', 'is', null),
      ])

      const invoiceEvents = (invRes.data || []).map(function(inv) {
        var who = inv.clients ? (inv.clients.company || inv.clients.name) : inv.invoice_number
        return {
          id: 'invoice-' + inv.id,
          title: 'Cobro: ' + who + ' –” ' + fmtCur(inv.total),
          event_date: inv.due_date,
          start_time: null,
          end_time: null,
          event_type: 'billing',
          status: 'pending',
          description: 'Factura ' + inv.invoice_number + ' pendiente de cobro',
          is_auto: true,
          auto_kind: 'invoice',
          auto_ref_id: inv.id,
        }
      })

      const subEvents = (subRes.data || []).map(function(sub) {
        var who = sub.clients ? ' (' + (sub.clients.company || sub.clients.name) + ')' : ''
        return {
          id: 'sub-' + sub.id,
          title: 'Renovar: ' + sub.name + who,
          event_date: sub.next_billing,
          start_time: null,
          end_time: null,
          event_type: 'sub_billing',
          status: 'pending',
          description: 'Suscripcion "' + sub.name + '" se renueva por ' + fmtCur(sub.price),
          is_auto: true,
          auto_kind: 'subscription',
          auto_ref_id: sub.id,
        }
      })

      setAutoEvents(invoiceEvents.concat(subEvents))
    } catch (e) {
      console.error('[useCalendar] loadAutoEvents error:', e)
    }
  }, [])

  useEffect(() => {
    loadAutoEvents()
  }, [loadAutoEvents])

  // –”€–”€ Cargar selectores –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€
  useEffect(() => {
    supabase
      .from('clients')
      .select('id,name')
      .eq('archived', false)
      .order('name', { ascending: true })
      .then(({ data, error: selErr }) => {
        if (!selErr) {
          setSelectors({ clients: data || [] })
        }
      })
  }, [])

  // –”€–”€ Tiempo real –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€
  useEffect(() => {
    const channel = supabase.channel('calendar-store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, () => {
        loadEvents()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => { // –† NUEVO
        loadAutoEvents()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => { // –† NUEVO
        loadAutoEvents()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [loadEvents, loadAutoEvents])

  // –”€–”€ Navegación de mes –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€
  const prevMonth = useCallback(() => {
    setCurrentMonth((m) => {
      if (m === 0) {
        setCurrentYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }, [])

  const nextMonth = useCallback(() => {
    setCurrentMonth((m) => {
      if (m === 11) {
        setCurrentYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }, [])

  const goToToday = useCallback(() => {
    const t = new Date()
    setCurrentYear(t.getFullYear())
    setCurrentMonth(t.getMonth())
  }, [])

  // –”€–”€ Modal (crear) –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€
  const openModal = useCallback((dateStr) => {
    setEditingEvent(null)
    setSelectedDate(dateStr)
    setModalOpen(true)
  }, [])

  // –”€–”€ Modal (editar) –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€
  const openEditModal = useCallback((event) => {
    if (event.is_auto) return // –† NUEVO: los automáticos no se editan
    setEditingEvent(event)
    setSelectedDate(event.event_date)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setSelectedDate(null)
    setEditingEvent(null)
  }, [])

  // –”€–”€ Crear evento –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€
  const handleCreate = async (form) => {
    setFormLoading(true)
    try {
      const { data: userData, error: authErr } = await supabase.auth.getUser()
      if (authErr) throw authErr
      if (!userData?.user) throw new Error('No hay sesion activa')

      const isAllDay = !form.start_time

      const payload = {
        title:       form.title?.trim(),
        start_at:    combineDateTime(form.event_date, form.start_time),
        end_at:      form.end_time ? combineDateTime(form.event_date, form.end_time) : null,
        all_day:     isAllDay,
        type:        form.event_type || 'other',
        description: form.description || null,
        location:    form.location     || null,
        client_id:   form.client_id    || null,
        project_id:  form.project_id   || null,
        status:      'scheduled',
        owner_id:    userData.user.id,
        archived:    false,
      }

      if (!payload.title)    throw new Error('El titulo es obligatorio')
      if (!payload.start_at) throw new Error('La fecha es obligatoria')

      const { data, error: insErr } = await supabase
        .from('calendar_events')
        .insert(payload)
        .select()
        .single()

      if (insErr) throw insErr

      setDbEvents((prev) => [...prev, mapRow(data)])
      showToast('Evento creado')
      closeModal()
    } catch (e) {
      console.error('[useCalendar] handleCreate ERROR:', e)
      showToast(e.message, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // –”€–”€ Editar evento –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€
  const handleUpdate = async (id, form) => {
    setFormLoading(true)
    try {
      const isAllDay = !form.start_time

      const payload = {
        title:       form.title?.trim(),
        start_at:    combineDateTime(form.event_date, form.start_time),
        end_at:      form.end_time ? combineDateTime(form.event_date, form.end_time) : null,
        all_day:     isAllDay,
        type:        form.event_type || 'other',
        description: form.description || null,
        location:    form.location     || null,
        client_id:   form.client_id    || null,
        project_id:  form.project_id   || null,
      }

      if (!payload.title)    throw new Error('El titulo es obligatorio')
      if (!payload.start_at) throw new Error('La fecha es obligatoria')

      const { data, error: updErr } = await supabase
        .from('calendar_events')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (updErr) throw updErr

      const mapped = mapRow(data)
      setDbEvents((prev) => prev.map((e) => (e.id === id ? mapped : e)))
      showToast('Evento actualizado')
      closeModal()
    } catch (e) {
      console.error('[useCalendar] handleUpdate ERROR:', e)
      showToast(e.message, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // –”€–”€ Cambiar estado de evento –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€
  const updateEventStatus = async (id, status) => {
    if (String(id).startsWith('invoice-') || String(id).startsWith('sub-')) return // –† NUEVO
    try {
      const dbStatus = uiStatusToDb(status)
      const { error: updErr } = await supabase
        .from('calendar_events')
        .update({ status: dbStatus })
        .eq('id', id)
      if (updErr) throw updErr

      setDbEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
    } catch (e) {
      console.error('[useCalendar] updateEventStatus ERROR:', e)
      showToast(e.message, 'error')
    }
  }

  // –”€–”€ Eliminar evento –”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€–”€
  const deleteEvent = async (id) => {
    if (String(id).startsWith('invoice-') || String(id).startsWith('sub-')) return // –† NUEVO
    try {
      const { error: delErr } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
      if (delErr) throw delErr

      setDbEvents((prev) => prev.filter((e) => e.id !== id))
      showToast('Evento eliminado')
    } catch (e) {
      console.error('[useCalendar] deleteEvent ERROR:', e)
      showToast(e.message, 'error')
    }
  }

  // Union de eventos reales + automáticos, lo que ve Calendar.jsx –† NUEVO
  const events = dbEvents.concat(autoEvents)

  return {
    currentYear, currentMonth,
    events, loading, error,
    modalOpen, selectedDate, editingEvent, formLoading,
    selectors,
    prevMonth, nextMonth, goToToday,
    openModal, openEditModal, closeModal,
    handleCreate, handleUpdate, updateEventStatus, deleteEvent,
    toastMsg,
  }
}
