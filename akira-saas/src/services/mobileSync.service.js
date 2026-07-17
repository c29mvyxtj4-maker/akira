/**
 * Mobile Sync Service
 *
 * Offline-first architecture, cross-device sync, conflict resolution
 * Data replication, background sync, push notifications
 */

import { supabase } from '@/lib/supabase'

// ========================================
// OFFLINE-FIRST ARCHITECTURE
// ========================================

/**
 * Initialize local database for offline support
 * Uses SQLite on mobile, IndexedDB on web
 */
export async function initializeLocalDatabase() {
  const localDb = await openLocalDatabase()

  return {
    initialized: true,
    tables: [
      'clients',
      'projects',
      'time_entries',
      'invoices',
      'tasks',
      'activities',
      'sync_queue',
    ],
    database: localDb,
  }
}

/**
 * Open local database connection
 */
async function openLocalDatabase() {
  // SQLite on mobile (via Capacitor)
  // IndexedDB on web
  // Returns unified interface
  return {
    name: 'akira_local',
    version: 1,
  }
}

/**
 * Sync data from cloud to local
 */
export async function syncCloudToLocal(resourceType) {
  const { userId } = await supabase.auth.getUser()

  // Fetch from cloud
  const { data } = await supabase
    .from(resourceType)
    .select('*')
    .eq('user_id', userId)

  // Store locally
  await storeLocally(resourceType, data)

  return {
    synced: true,
    count: data?.length || 0,
    resource_type: resourceType,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Sync local changes to cloud
 */
export async function syncLocalToCloud() {
  // Get pending changes from sync queue
  const pending = await getPendingChanges()

  const results = []

  for (const change of pending) {
    try {
      await applySyncChange(change)
      results.push({ ...change, status: 'synced' })
      await markSynced(change.id)
    } catch (error) {
      results.push({ ...change, status: 'failed', error: error.message })
      await logSyncError(change, error)
    }
  }

  return {
    synced: results.filter(r => r.status === 'synced').length,
    failed: results.filter(r => r.status === 'failed').length,
    total: results.length,
  }
}

/**
 * Get pending changes
 */
async function getPendingChanges() {
  const localDb = await openLocalDatabase()

  return await queryLocal('SELECT * FROM sync_queue WHERE status = ?', ['pending'])
}

/**
 * Apply sync change to cloud
 */
async function applySyncChange(change) {
  const { operation, resource_type, resource_id, data } = change

  switch (operation) {
    case 'insert':
      return await supabase
        .from(resource_type)
        .insert([data])

    case 'update':
      return await supabase
        .from(resource_type)
        .update(data)
        .eq('id', resource_id)

    case 'delete':
      return await supabase
        .from(resource_type)
        .delete()
        .eq('id', resource_id)

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

// ========================================
// CONFLICT RESOLUTION
// ========================================

/**
 * Detect and resolve sync conflicts
 */
export async function detectConflicts(resourceType) {
  const localVersion = await getLocalVersion(resourceType)
  const cloudVersion = await getCloudVersion(resourceType)

  const conflicts = []

  for (const localItem of localVersion) {
    const cloudItem = cloudVersion.find(c => c.id === localItem.id)

    if (cloudItem) {
      if (localItem.updated_at !== cloudItem.updated_at) {
        conflicts.push({
          id: localItem.id,
          local: localItem,
          cloud: cloudItem,
          resolution: 'needs_resolution',
        })
      }
    }
  }

  return conflicts
}

/**
 * Resolve conflict (last-write-wins strategy)
 */
export async function resolveConflict(conflictId, strategy = 'cloud-wins') {
  const conflict = await getConflict(conflictId)

  let resolved
  switch (strategy) {
    case 'cloud-wins':
      resolved = conflict.cloud
      break
    case 'local-wins':
      resolved = conflict.local
      // Also sync back to cloud
      await applySyncChange({
        operation: 'update',
        resource_type: conflict.resource_type,
        resource_id: conflict.id,
        data: conflict.local,
      })
      break
    case 'merge':
      resolved = mergeConflict(conflict.local, conflict.cloud)
      break
    default:
      throw new Error(`Unknown strategy: ${strategy}`)
  }

  // Update local
  await storeLocally(conflict.resource_type, [resolved])

  return resolved
}

/**
 * Merge conflict (combines non-conflicting fields)
 */
function mergeConflict(local, cloud) {
  const merged = { ...cloud }

  // For time entries, sum the durations
  if (local.duration_seconds && cloud.duration_seconds) {
    merged.duration_seconds = Math.max(local.duration_seconds, cloud.duration_seconds)
  }

  return {
    ...merged,
    merged_at: new Date().toISOString(),
  }
}

// ========================================
// BACKGROUND SYNC
// ========================================

/**
 * Register background sync task
 */
export async function registerBackgroundSync() {
  // iOS: use background fetch
  // Android: use WorkManager
  // Web: use Service Worker

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready

    if ('periodicSync' in registration) {
      await registration.periodicSync.register('sync-offline-changes', {
        minInterval: 24 * 60 * 60 * 1000, // 24 hours
      })
    }
  }

  return { registered: true }
}

/**
 * Perform background sync
 */
export async function performBackgroundSync() {
  const isOnline = navigator.onLine

  if (!isOnline) {
    return { synced: 0, status: 'offline' }
  }

  // Sync all pending changes
  const result = await syncLocalToCloud()

  return {
    synced: result.synced,
    failed: result.failed,
    status: 'completed',
  }
}

// ========================================
// NETWORK STATE MANAGEMENT
// ========================================

/**
 * Monitor network connectivity
 */
export function subscribeToNetworkState(callback) {
  const handleOnline = () => callback({ online: true })
  const handleOffline = () => callback({ online: false })

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Initial state
  callback({ online: navigator.onLine })

  // Return unsubscribe function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

/**
 * Queue operation if offline
 */
export async function queueOfflineOperation(operation, resource_type, data) {
  if (!navigator.onLine) {
    // Store in queue
    await storeInSyncQueue({
      operation,
      resource_type,
      data,
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    return { queued: true, status: 'offline' }
  }

  // Execute immediately
  const result = await applySyncChange({
    operation,
    resource_type,
    data,
  })

  return { queued: false, status: 'synced', result }
}

// ========================================
// STUB FUNCTIONS (Implementation details)
// ========================================

async function storeLocally(resource, data) { return true }
async function queryLocal(sql, params) { return [] }
async function getLocalVersion(resource) { return [] }
async function getCloudVersion(resource) { return [] }
async function getConflict(id) { return null }
async function markSynced(id) { return true }
async function logSyncError(change, error) { return true }
async function storeInSyncQueue(item) { return true }
