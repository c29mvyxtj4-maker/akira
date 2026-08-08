import { supabase } from '@/lib/supabase'
import { syncEngine } from '../SyncEngine'

export async function subscribeToClientsChanges(orgId, callback) {
  syncEngine.subscribe({
    name: 'clients-sync',
    table: 'clients',
    filter: `org_id=eq.${orgId}`,
    callback,
  })
}

export async function subscribeToProjectsChanges(orgId, callback) {
  syncEngine.subscribe({
    name: 'projects-sync',
    table: 'projects',
    filter: `org_id=eq.${orgId}`,
    callback,
  })
}

export async function subscribeToInvoicesChanges(orgId, callback) {
  syncEngine.subscribe({
    name: 'invoices-sync',
    table: 'invoices',
    filter: `org_id=eq.${orgId}`,
    callback,
  })
}

export async function subscribeToMessagesChanges(orgId, callback) {
  syncEngine.subscribe({
    name: 'messages-sync',
    table: 'messages',
    filter: `org_id=eq.${orgId}`,
    callback,
  })
}

export async function unsubscribeAll() {
  syncEngine.unsubscribeAll()
}

export async function syncData(table, orgId) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('org_id', orgId)

    if (error) throw error
    return data
  } catch (error) {
    console.error(`[syncService] Failed to sync ${table}:`, error)
    return []
  }
}

export async function queueInsert(table, record) {
  return syncEngine.queueMutation(table, 'INSERT', record)
}

export async function queueUpdate(table, id, updates) {
  return syncEngine.queueMutation(table, 'UPDATE', { id, ...updates })
}

export async function queueDelete(table, id) {
  return syncEngine.queueMutation(table, 'DELETE', { id })
}

export function getSyncState() {
  return syncEngine.getState()
}

export function isOnline() {
  return syncEngine.isOnline()
}

export function getQueueLength() {
  return syncEngine.getQueueLength()
}
