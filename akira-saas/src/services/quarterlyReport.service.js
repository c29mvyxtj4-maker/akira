import { supabase } from '@/lib/supabase'
import { scopeToOrg } from '@/shared/lib/activeOrg'

function quarterRange(year, quarter) {
  var startMonth = (quarter - 1) * 3
  var start = new Date(year, startMonth, 1)
  var end   = new Date(year, startMonth + 3, 0)
  return {
    start: start.toISOString().split('T')[0],
    end:   end.toISOString().split('T')[0],
  }
}

export async function getQuarterlyReport(year, quarter) {
  var range = quarterRange(year, quarter)

  var results = await Promise.allSettled([
    scopeToOrg(supabase
      .from('commercial_documents')
      .select('id, invoice_number, issue_date, subtotal, tax_rate, tax_amount, irpf_rate, irpf_amount, total, client_id, clients(id, name, company)')
      .eq('document_type', 'invoice')
      .eq('archived', false)
      .gte('issue_date', range.start)
      .lte('issue_date', range.end))
      .order('issue_date', { ascending: true }),
    scopeToOrg(supabase
      .from('finance_entries')
      .select('id, description, category, amount, entry_date')
      .eq('type', 'expense')
      .eq('archived', false)
      .gte('entry_date', range.start)
      .lte('entry_date', range.end))
      .order('entry_date', { ascending: true }),
  ])

  function safe(r) { return r.status === 'fulfilled' && !r.value.error ? (r.value.data || []) : [] }

  var invoices = safe(results[0])
  var expenses = safe(results[1])

  var totalSubtotal   = invoices.reduce(function(s, i) { return s + Number(i.subtotal || 0) }, 0)
  var totalIvaRepercu = invoices.reduce(function(s, i) { return s + Number(i.tax_amount || 0) }, 0)
  var totalIrpf        = invoices.reduce(function(s, i) { return s + Number(i.irpf_amount || 0) }, 0)
  var totalFacturado    = invoices.reduce(function(s, i) { return s + Number(i.total || 0) }, 0)
  var totalGastos       = expenses.reduce(function(s, e) { return s + Number(e.amount || 0) }, 0)
  var beneficio          = totalSubtotal - totalGastos

  return {
    year: year, quarter: quarter, range: range,
    invoices: invoices, expenses: expenses,
    totals: {
      subtotal: totalSubtotal,
      ivaRepercutido: totalIvaRepercu,
      irpfRetenido: totalIrpf,
      totalFacturado: totalFacturado,
      totalGastos: totalGastos,
      beneficio: beneficio,
    },
  }
}
