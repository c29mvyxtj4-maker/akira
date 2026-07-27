import { supabase } from '@/lib/supabase'

export var FINANCE_TYPES = {
  income:   { label: 'Ingreso',   color: '#22c55e', sign: 1 },
  expense:  { label: 'Gasto',     color: '#ef4444', sign: -1 },
  invoice:  { label: 'Factura',   color: '#f59e0b', sign: 1 },
  payment:  { label: 'Cobro',     color: '#22c55e', sign: 1 },
  refund:   { label: 'Devolucion', color: '#a855f7', sign: -1 },
}

export var FINANCE_STATUS = {
  confirmed: { label: 'Confirmado', color: 'success' },
  pending:   { label: 'Pendiente',  color: 'warning' },
  cancelled: { label: 'Cancelado',  color: 'default' },
}

async function uid() {
  var res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error('No autenticado')
  return res.data.user.id
}

// Una entrada cuenta como ingreso real si es income/payment,
// o si es una factura (invoice) ya confirmada. // ← NUEVO
function isIncomeRow(r) {
  return ['income', 'payment'].includes(r.type) || (r.type === 'invoice' && r.status === 'confirmed')
}

function isExpenseRow(r) {
  return ['expense', 'refund'].includes(r.type)
}

export async function getFinanceEntries(filters) {
  var search     = (filters && filters.search)     || ''
  var type       = (filters && filters.type)       || 'all'
  var status     = (filters && filters.status)     || 'all'
  var clientId   = (filters && filters.clientId)   || 'all'
  var projectId  = (filters && filters.projectId)  || 'all'
  var dateFrom   = (filters && filters.dateFrom)   || ''
  var dateTo     = (filters && filters.dateTo)     || ''

  var q = supabase
    .from('finance_entries')
    .select('*, clients(id, name, company), projects(id, name)')
    .eq('archived', false)
    .order('entry_date', { ascending: false })

  if (type     !== 'all') q = q.eq('type',       type)
  if (status   !== 'all') q = q.eq('status',     status)
  if (clientId !== 'all') q = q.eq('client_id',  clientId)
  if (projectId !== 'all') q = q.eq('project_id', projectId)
  if (dateFrom) q = q.gte('entry_date', dateFrom)
  if (dateTo)   q = q.lte('entry_date', dateTo)
  if (search.trim()) q = q.ilike('description', '%' + search.trim() + '%')

  var res = await q
  if (res.error) throw res.error
  return res.data || []
}

export async function createFinanceEntry(form) {
  var ownerId = await uid()
  var res = await supabase.from('finance_entries').insert({
    type:        form.type        || 'income',
    category:    form.category    || 'General',
    description: form.description || '',
    amount:      Number(form.amount) || 0,
    entry_date:  form.entry_date  || new Date().toISOString().split('T')[0],
    status:      form.status      || 'confirmed',
    client_id:   form.client_id   || null,
    project_id:  form.project_id   || null,
    notes:       form.notes       || null,
    owner_id:    ownerId,
    archived:    false,
  }).select('*, clients(id, name, company), projects(id, name)').single()
  if (res.error) throw res.error
  return res.data
}

export async function updateFinanceEntry(id, form) {
  var res = await supabase.from('finance_entries').update({
    type:        form.type        || 'income',
    category:    form.category    || 'General',
    description: form.description || '',
    amount:      Number(form.amount) || 0,
    entry_date:  form.entry_date  || null,
    status:      form.status      || 'confirmed',
    client_id:   form.client_id   || null,
    project_id:  form.project_id   || null,
    notes:       form.notes       || null,
  }).eq('id', id).select('*, clients(id, name, company), projects(id, name)').single()
  if (res.error) throw res.error
  return res.data
}

export async function archiveFinanceEntry(id) {
  var res = await supabase.from('finance_entries').update({ archived: true }).eq('id', id)
  if (res.error) throw res.error
  return true
}

export async function getFinanceKpis() {
  var now        = new Date()
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  var monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  var prevStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  var prevEnd    = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

  var res = await supabase.from('finance_entries').select('type, amount, status, entry_date').eq('archived', false)
  if (res.error) throw res.error
  var rows = res.data || []

  // ← NUEVO: ahora recibe una funcion "predicate" en vez de una lista fija de tipos,
  // para poder incluir el caso especial de factura+confirmada
  function sumWhere(arr, predicate, dateFrom, dateTo) {
    return arr.filter(function(r) {
      var ok = predicate(r)
      if (dateFrom) ok = ok && r.entry_date >= dateFrom
      if (dateTo)   ok = ok && r.entry_date <= dateTo
      return ok
    }).reduce(function(s, r) { return s + Number(r.amount) }, 0)
  }

  var totalIncome   = sumWhere(rows, isIncomeRow)
  var totalExpense  = sumWhere(rows, isExpenseRow)
  var pendingInv    = rows.filter(function(r) { return r.type === 'invoice' && r.status === 'pending' }).reduce(function(s, r) { return s + Number(r.amount) }, 0)
  var monthIncome   = sumWhere(rows, isIncomeRow, monthStart, monthEnd)
  var monthExpense  = sumWhere(rows, isExpenseRow, monthStart, monthEnd)
  var prevIncome    = sumWhere(rows, isIncomeRow, prevStart, prevEnd)

  var incomeTrend = prevIncome > 0 ? Math.round(((monthIncome - prevIncome) / prevIncome) * 100) : null

  // Sparkline ultimos 6 meses
  var sparkline = Array.from({ length: 6 }, function(_, i) {
    var d  = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    var ds = d.toISOString().split('T')[0]
    var de = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
    return {
      name:  d.toLocaleDateString('es-ES', { month: 'short' }),
      income:  sumWhere(rows, isIncomeRow, ds, de),
      expense: sumWhere(rows, isExpenseRow, ds, de),
    }
  })

  return {
    totalIncome:  totalIncome,
    totalExpense: totalExpense,
    netProfit:    totalIncome - totalExpense,
    pendingInv:   pendingInv,
    monthIncome:  monthIncome,
    monthExpense: monthExpense,
    monthProfit:  monthIncome - monthExpense,
    incomeTrend:  incomeTrend,
    sparkline:    sparkline,
  }
}

export async function getClientRanking() {
  var res = await supabase
    .from('finance_entries')
    .select('type, amount, status, client_id, clients(id, name, company)')
    .eq('archived', false)
    .not('client_id', 'is', null)
  if (res.error) return []

  var map = {}
  ;(res.data || []).forEach(function(r) {
    var cid = r.client_id
    if (!map[cid]) map[cid] = { id: cid, name: (r.clients && (r.clients.company || r.clients.name)) || cid, income: 0, expense: 0 }
    if (isIncomeRow(r))  map[cid].income  += Number(r.amount) // ← NUEVO: usa el mismo criterio
    if (isExpenseRow(r)) map[cid].expense += Number(r.amount)
  })

  return Object.values(map)
    .map(function(c) { return Object.assign({}, c, { profit: c.income - c.expense }) })
    .sort(function(a, b) { return b.income - a.income })
    .slice(0, 8)
}

export async function getSelectorsForFinance() {
  var [rc, rp] = await Promise.all([
    supabase.from('clients').select('id, name, company').eq('archived', false).order('name'),
    supabase.from('projects').select('id, name').eq('archived', false).order('name'),
  ])
  return {
    clients:  rc.data || [],
    projects: rp.data || [],
  }
}