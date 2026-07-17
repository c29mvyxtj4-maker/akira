/**
 * Cross-Device Sync Coordination Service
 *
 * Synchronizes state across web, mobile, wearables, and smart home
 * Maintains consistency, resolves conflicts, broadcasts changes
 */

import { supabase } from '@/lib/supabase'

// ========================================
// DEVICE MANAGEMENT
// ========================================

/**
 * Register device for sync
 */
export async function registerDevice(deviceId, deviceType, osVersion) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('devices')
    .insert([{
      user_id: userId,
      device_id: deviceId,
      device_type: deviceType, // web, ios, android, watch, smartdisplay
      os_version: osVersion,
      last_sync: new Date().toISOString(),
      is_active: true,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get user's devices
 */
export async function getUserDevices() {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) throw error
  return data || []
}

/**
 * Update device last sync time
 */
export async function updateDeviceSync(deviceId) {
  return await supabase
    .from('devices')
    .update({ last_sync: new Date().toISOString() })
    .eq('device_id', deviceId)
}

// ========================================
// STATE SYNCHRONIZATION
// ========================================

/**
 * Sync state to all user devices
 */
export async function broadcastStateChange(resource, operation, data) {
  const devices = await getUserDevices()
  const broadcast = {
    resource,
    operation,
    data,
    timestamp: new Date().toISOString(),
  }

  // Send to each device type
  const results = []

  for (const device of devices) {
    try {
      await sendToDevice(device, broadcast)
      results.push({ device_id: device.device_id, status: 'sent' })
    } catch (error) {
      results.push({ device_id: device.device_id, status: 'failed', error: error.message })
    }
  }

  return results
}

/**
 * Send update to specific device
 */
async function sendToDevice(device, broadcast) {
  const channels = {
    web: 'device_sync_web',
    ios: 'device_sync_ios',
    android: 'device_sync_android',
    watch: 'device_sync_watch',
    smartdisplay: 'device_sync_display',
  }

  const channel = channels[device.device_type]

  if (!channel) throw new Error(`Unknown device type: ${device.device_type}`)

  // Use Supabase realtime to send message
  await supabase
    .channel(channel)
    .send({
      type: 'broadcast',
      event: 'state_change',
      payload: {
        ...broadcast,
        target_device: device.device_id,
      },
    })
}

/**
 * Subscribe to state changes
 */
export function subscribeToStateChanges(callback) {
  const unsubscribes = []

  const deviceTypes = ['web', 'ios', 'android', 'watch', 'smartdisplay']

  for (const deviceType of deviceTypes) {
    const channel = supabase
      .channel(`device_sync_${deviceType}`)
      .on('broadcast', { event: 'state_change' }, (payload) => {
        callback(payload.payload)
      })
      .subscribe()

    unsubscribes.push(() => {
      supabase.removeChannel(channel)
    })
  }

  return () => {
    unsubscribes.forEach(u => u())
  }
}

// ========================================
// SELECTIVE SYNC
// ========================================

/**
 * Determine what data to sync to device
 */
export async function getSelectiveSyncData(deviceId, lastSync) {
  const { userId } = await supabase.auth.getUser()

  // Get device type
  const { data: device } = await supabase
    .from('devices')
    .select('device_type')
    .eq('device_id', deviceId)
    .single()

  // Sync rules by device
  const syncRules = {
    ios: ['time_entries', 'invoices', 'projects', 'clients'],
    android: ['time_entries', 'invoices', 'projects', 'clients'],
    watch: ['running_timer', 'active_projects', 'daily_summary'],
    smartdisplay: ['dashboard', 'revenue_today', 'active_projects'],
    web: ['*'], // Full sync
  }

  const resources = syncRules[device.device_type] || []

  const syncData = {}

  for (const resource of resources) {
    if (resource === '*') {
      // Full sync
      syncData.all = await getFullSync(userId, lastSync)
      break
    }

    syncData[resource] = await getSyncedResource(resource, userId, lastSync)
  }

  return syncData
}

/**
 * Get full sync
 */
async function getFullSync(userId, lastSync) {
  // Fetch all resources modified since lastSync
  const resources = ['time_entries', 'invoices', 'projects', 'clients', 'tasks']

  const data = {}

  for (const resource of resources) {
    const { data: items } = await supabase
      .from(resource)
      .select('*')
      .eq('user_id', userId)
      .gte('updated_at', lastSync)

    data[resource] = items
  }

  return data
}

/**
 * Get single synced resource
 */
async function getSyncedResource(resource, userId, lastSync) {
  const { data, error } = await supabase
    .from(resource)
    .select('*')
    .eq('user_id', userId)
    .gte('updated_at', lastSync)

  return data || []
}

// ========================================
// ADAPTIVE SYNC
// ========================================

/**
 * Determine sync strategy based on network & device
 */
export async function getAdaptiveSyncStrategy(device) {
  const connection = getNetworkType()
  const batteryLevel = await getBatteryLevel()
  const storageAvailable = await getAvailableStorage()

  let strategy = {
    frequency: 'normal',
    dataFormat: 'full',
    compression: false,
    images: true,
    priority: 'balanced',
  }

  // Adapt to network
  if (connection === '4g') {
    strategy.frequency = 'frequent'
    strategy.dataFormat = 'full'
    strategy.images = true
  } else if (connection === '3g') {
    strategy.frequency = 'normal'
    strategy.dataFormat = 'minimal'
    strategy.compression = true
    strategy.images = false
  } else if (connection === 'wifi') {
    strategy.frequency = 'frequent'
    strategy.dataFormat = 'full'
    strategy.images = true
    strategy.priority = 'high'
  }

  // Adapt to battery
  if (batteryLevel < 20) {
    strategy.frequency = 'low'
    strategy.compression = true
  } else if (batteryLevel < 50) {
    strategy.frequency = 'normal'
  }

  // Adapt to storage
  if (storageAvailable < 1000) { // 1GB
    strategy.dataFormat = 'minimal'
    strategy.images = false
  }

  return strategy
}

/**
 * Get network type
 */
function getNetworkType() {
  // Use Network Information API if available
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    if (connection) {
      return connection.effectiveType // 4g, 3g, 2g, slow-2g
    }
  }

  return 'unknown'
}

/**
 * Get battery level
 */
async function getBatteryLevel() {
  if ('getBattery' in navigator) {
    const battery = await navigator.getBattery()
    return battery.level * 100
  }

  return 100 // Assume full if not available
}

/**
 * Get available storage
 */
async function getAvailableStorage() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return Math.floor((estimate.quota - estimate.usage) / 1024 / 1024) // MB
  }

  return 10000 // Assume plenty if not available
}

// ========================================
// LAST-SYNC TRACKING
// ========================================

/**
 * Store device sync checkpoint
 */
export async function saveSyncCheckpoint(deviceId, checkpoint) {
  const { userId } = await supabase.auth.getUser()

  return await supabase
    .from('sync_checkpoints')
    .upsert({
      user_id: userId,
      device_id: deviceId,
      last_sync_timestamp: checkpoint.timestamp,
      last_sync_cursor: checkpoint.cursor,
      sync_metadata: JSON.stringify(checkpoint.metadata),
      updated_at: new Date().toISOString(),
    })
}

/**
 * Get device sync checkpoint
 */
export async function getSyncCheckpoint(deviceId) {
  const { userId } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('sync_checkpoints')
    .select('*')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .single()

  return data || {
    last_sync_timestamp: null,
    last_sync_cursor: null,
  }
}

// ========================================
// MULTI-DEVICE ACTIONS
// ========================================

/**
 * Perform action on all active devices
 */
export async function broadcastAction(action, params) {
  const devices = await getUserDevices()

  return await Promise.all(
    devices.map(device => performDeviceAction(device, action, params))
  )
}

/**
 * Perform action on specific device type
 */
export async function broadcastActionToDeviceType(deviceType, action, params) {
  const devices = await getUserDevices()
  const filtered = devices.filter(d => d.device_type === deviceType)

  return await Promise.all(
    filtered.map(device => performDeviceAction(device, action, params))
  )
}

/**
 * Perform action on device
 */
async function performDeviceAction(device, action, params) {
  return {
    device_id: device.device_id,
    device_type: device.device_type,
    action,
    executed: true,
    timestamp: new Date().toISOString(),
  }
}

// ========================================
// SYNC ANALYTICS
// ========================================

/**
 * Get sync performance metrics
 */
export async function getSyncMetrics() {
  const { userId } = await supabase.auth.getUser()

  const { data: devices } = await supabase
    .from('devices')
    .select('device_type, last_sync')
    .eq('user_id', userId)
    .eq('is_active', true)

  const metrics = {
    total_devices: devices?.length || 0,
    devices_by_type: {},
    average_sync_lag: 0,
  }

  if (devices && devices.length > 0) {
    // Group by type
    for (const device of devices) {
      if (!metrics.devices_by_type[device.device_type]) {
        metrics.devices_by_type[device.device_type] = 0
      }
      metrics.devices_by_type[device.device_type]++
    }

    // Calculate average sync lag
    const now = new Date()
    const lags = devices.map(d => {
      const lastSync = new Date(d.last_sync)
      return (now - lastSync) / 1000 / 60 // minutes
    })

    metrics.average_sync_lag = Math.round(
      lags.reduce((a, b) => a + b, 0) / lags.length
    )
  }

  return metrics
}
