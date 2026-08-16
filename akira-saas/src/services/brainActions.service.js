import { supabase } from '@/shared/lib/supabase'
import { createFinanceEntry } from '@/services/finance.service'
import { getCompanySettings } from '@/services/company.service'

export var ACTION_LABELS = {
  create_client:        'Crear cliente',
  create_project:       'Crear proyecto',
  create_invoice:       'Crear factura',
  create_calendar_event: 'Crear evento de calendario',
  create_finance_entry: 'Registrar movimiento',
}

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

async function createClientAction(data) {
  var ownerId = await uid()
  if (!data.name || !data.name.trim()) throw new Error('Falta el nombre del cliente')

  var res = await supabase.from('clients').insert({
    name:             data.name.trim(),
    company:          data.company || null,
    email:            data.email   || null,
    phone:            data.phone   || null,
    niche:            data.niche   || null,
    status:           data.status  || 'lead',
    source:           data.source  || 'unknown',
    monthly_value:    Number(data.monthly_value) || 0,
    notes:            data.notes   || null,
    owner_id:         ownerId,
    archived:         false,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

async function createProjectAction(data) {
  var ownerId = await uid()
  if (!data.name || !data.name.trim()) throw new Error('Falta el nombre del proyecto')

  var res = await supabase.from('projects').insert({
    name:            data.name.trim(),
    client_id:       data.client_id || null,
    description:     data.description || null,
    status:          data.status   || 'pending',
    priority:        data.priority || 'medium',
    stage:           data.stage    || 'preproduction',
    budget:          Number(data.budget) || 0,
    actual_cost:     0,
    estimated_hours: 0,
    due_date:        data.due_date || null,
    owner_id:        ownerId,
    archived:        false,
    tasks:           [],
    progress:        0,
  }).select().single()
  if (res.error) throw res.error
  return res.data
}

async function createInvoiceAction(data) {
  if (!data.items || data.items.length === 0) throw new Error('La factura necesita al menos una linea')

  var taxRate = data.tax_rate
  if (taxRate === undefined || taxRate === null) {
    try {
      var cs = await getCompanySettings()
      taxRate = cs.default_tax_rate || 21
    } catch (e) {
      taxRate = 21
    }
  }

  // TODO: Fix invoice creation
  throw new Error('Invoice creation not yet implemented in brain actions')
}

async function createCalendarEventAction(data) {
  var ownerId = await uid()
  if (!data.title || !data.title.trim()) throw new Error('Falta el titulo del evento')
  if (!data.event_date) throw new Error('Falta la fecha del evento')

  var isAllDay = !data.start_time

  var payload = {
    title:       data.title.trim(),
    start_at:    data.event_date + 'T' + (data.start_time || '00:00') + ':00',
    end_at:      data.end_time ? data.event_date + 'T' + data.end_time + ':00' : null,
    all_day:     isAllDay,
    type:        data.event_type || 'meeting',
    description: data.description || null,
    location:    data.location || null,
    client_id:   data.client_id || null,
    status:      'scheduled',
    owner_id:    ownerId,
    archived:    false,
  }

  var res = await supabase.from('calendar_events').insert(payload).select().single()
  if (res.error) throw res.error
  return res.data
}

async function createFinanceEntryAction(data) {
  if (!data.description || !data.description.trim()) throw new Error('Falta la descripcion del movimiento')
  if (!data.amount) throw new Error('Falta el importe')

  return createFinanceEntry({
    type:        data.type || 'income',
    category:    data.category || 'General',
    description: data.description.trim(),
    amount:      data.amount,
    entry_date:  data.entry_date || new Date().toISOString().split('T')[0],
    status:      data.status || 'confirmed',
    client_id:   data.client_id  || '',
    project_id:  data.project_id || '',
    notes:       data.notes || '',
  })
}

export async function executeAction(type, data) {
  if (type === 'create_client')         return createClientAction(data)
  if (type === 'create_project')        return createProjectAction(data)
  if (type === 'create_invoice')        return createInvoiceAction(data)
  if (type === 'create_calendar_event') return createCalendarEventAction(data)
  if (type === 'create_finance_entry')  return createFinanceEntryAction(data)
  throw new Error('Tipo de accion desconocido: ' + type)
}

/* –”€–”€ Resumen legible para la tarjeta de confirmacion –”€–”€–”€–”€–”€–”€–”€–”€ */
export function summarizeAction(type, data) {
  if (type === 'create_client') {
    return [
      ['Nombre', data.name],
      ['Empresa', data.company || '--'],
      ['Estado', data.status || 'lead'],
      ['Valor mensual', data.monthly_value ? data.monthly_value + '–‚¬' : '--'],
    ]
  }
  if (type === 'create_project') {
    return [
      ['Nombre', data.name],
      ['Estado', data.status || 'pending'],
      ['Prioridad', data.priority || 'medium'],
      ['Presupuesto', data.budget ? data.budget + '–‚¬' : '--'],
      ['Entrega', data.due_date || '--'],
    ]
  }
  if (type === 'create_invoice') {
    var total = (data.items || []).reduce(function(s, it) { return s + (Number(it.quantity) || 1) * (Number(it.price) || 0) }, 0)
    return [
      ['Lineas', (data.items || []).map(function(it) { return it.description + ' (' + it.quantity + ' x ' + it.price + '–‚¬)' }).join(', ')],
      ['Subtotal', total.toFixed(2) + '–‚¬'],
      ['IVA', (data.tax_rate != null ? data.tax_rate : 21) + '%'],
      ['Vencimiento', data.due_date || '--'],
    ]
  }
  if (type === 'create_calendar_event') {
    return [
      ['Titulo', data.title],
      ['Fecha', data.event_date],
      ['Hora', data.start_time ? data.start_time + (data.end_time ? ' - ' + data.end_time : '') : 'Todo el dia'],
      ['Tipo', data.event_type || 'meeting'],
    ]
  }
  if (type === 'create_finance_entry') {
    return [
      ['Tipo', data.type],
      ['Descripcion', data.description],
      ['Importe', data.amount + '–‚¬'],
      ['Fecha', data.entry_date || 'Hoy'],
    ]
  }
  return []
}
