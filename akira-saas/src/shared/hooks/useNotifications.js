import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { scopeToOrg } from '@/shared/lib/activeOrg'

var STALE_DAYS = 7

function fmtCur(n) {
  return (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '–‚¬'
}
function fmtDate(d) {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function buildInvoiceReminderMailto(invoice, company) {
  var client = invoice.clients
  var email  = client && client.email
  if (!email) return null

  var subject = 'Recordatorio de pago –” Factura ' + invoice.invoice_number
  var greeting = 'Hola' + (client.name ? ' ' + client.name.split(' ')[0] : '') + ','
  var body = greeting + '\n\n' +
    'Te escribo para recordarte que la factura ' + invoice.invoice_number + ' por ' + fmtCur(invoice.total) +
    ', con fecha de vencimiento ' + fmtDate(invoice.due_date) + ', sigue pendiente de pago.\n\n' +
    'Si ya la has abonado, ignora este mensaje. Si tienes cualquier duda, no dudes en escribirme.\n\n' +
    'Gracias,\n' + (company && company.company_name ? company.company_name : '')

  return 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
}

export function useNotifications() {
  var [overdueInvoices, setOverdueInvoices] = useState([])
  var [staleClients,    setStaleClients]    = useState([])
  var [loading,         setLoading]         = useState(true)

  // Nombre de canal unico por cada sitio que use este hook (campana, Dashboard, etc.) –” NUEVO
  var channelNameRef = useRef('notifications-store-' + Math.random().toString(36).slice(2))

  var load = useCallback(function() {
    setLoading(true)
    var todayStr = new Date().toISOString().split('T')[0]
    var cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - STALE_DAYS)

    Promise.all([
      scopeToOrg(supabase
        .from('commercial_documents')
        .select('id, invoice_number, due_date, total, status, clients(id, name, company, email)')
        .eq('document_type', 'invoice')
        .eq('archived', false)
        .in('status', ['draft', 'sent'])
        .lt('due_date', todayStr))
        .order('due_date', { ascending: true }),
      scopeToOrg(supabase
        .from('clients')
        .select('id, name, company, email, status, last_contact_at')
        .eq('archived', false)
        .eq('status', 'active')),
    ]).then(function(results) {
      var invRes = results[0]
      var cliRes = results[1]

      setOverdueInvoices(invRes.error ? [] : (invRes.data || []))

      var stale = (cliRes.error ? [] : (cliRes.data || [])).filter(function(c) {
        if (!c.last_contact_at) return true
        return new Date(c.last_contact_at) < cutoff
      })
      setStaleClients(stale)
    }).finally(function() { setLoading(false) })
  }, [])

  useEffect(function() { load() }, [load])

  useEffect(function() {
    var channel = supabase.channel(channelNameRef.current) // –† CAMBIADO: nombre unico, no fijo
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commercial_documents' }, function() { load() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' },  function() { load() })
      .subscribe()
    return function() { supabase.removeChannel(channel) }
  }, [load])

  var total = overdueInvoices.length + staleClients.length

  return {
    overdueInvoices: overdueInvoices,
    staleClients: staleClients,
    loading: loading,
    total: total,
    refresh: load,
  }
}
