/**
 * Webhooks Service
 *
 * Real-time event delivery to third-party integrations
 * Automatic retry logic, event queuing, delivery status tracking
 */

import { supabase } from '@/lib/supabase'

// ========================================
// WEBHOOK MANAGEMENT
// ========================================

/**
 * Create webhook subscription
 * User specifies which events they want to receive
 */
export async function createWebhook(url, events, options = {}) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('webhooks')
    .insert([{
      user_id: userId,
      url,
      events,
      is_active: true,
      retry_max: options.retryMax || 3,
      timeout_seconds: options.timeout || 30,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    url: data.url,
    events: data.events,
    is_active: data.is_active,
  }
}

/**
 * List webhooks for user
 */
export async function listWebhooks() {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Delete webhook
 */
export async function deleteWebhook(webhookId) {
  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', webhookId)

  if (error) throw error
  return { success: true }
}

/**
 * Test webhook delivery
 */
export async function testWebhook(webhookId) {
  const testPayload = {
    event: 'test.webhook',
    timestamp: new Date().toISOString(),
    data: { message: 'Webhook test' }
  }

  const { data: webhook } = await supabase
    .from('webhooks')
    .select('url')
    .eq('id', webhookId)
    .single()

  if (!webhook) throw new Error('Webhook not found')

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      timeout: 5000,
    })

    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Webhook test successful' : 'Webhook test failed'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to deliver webhook'
    }
  }
}

// ========================================
// EVENT PUBLISHING
// ========================================

/**
 * Available events
 */
export const EVENTS = {
  // Client events
  CLIENT_CREATED: 'client.created',
  CLIENT_UPDATED: 'client.updated',
  CLIENT_DELETED: 'client.deleted',

  // Project events
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  PROJECT_STARTED: 'project.started',
  PROJECT_COMPLETED: 'project.completed',

  // Invoice events
  INVOICE_CREATED: 'invoice.created',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',

  // Time entry events
  TIME_ENTRY_CREATED: 'time_entry.created',
  TIME_ENTRY_UPDATED: 'time_entry.updated',
  TIME_ENTRY_COMPLETED: 'time_entry.completed',

  // Operative events
  OPERATIVE_EXECUTED: 'operative.executed',
  OPERATIVE_FAILED: 'operative.failed',
  OPERATIVE_COMPLETED: 'operative.completed',
}

/**
 * Publish event to all subscribed webhooks
 */
export async function publishEvent(eventType, data, metadata = {}) {
  // Get all active webhooks subscribed to this event
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('is_active', true)
    .filter('events', 'cs', `["${eventType}"]`) // Array contains check

  if (!webhooks || webhooks.length === 0) return

  // Create event record
  const event = {
    event_type: eventType,
    data,
    metadata,
    created_at: new Date().toISOString(),
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Queue delivery for each webhook
  for (const webhook of webhooks) {
    await queueWebhookDelivery(webhook, event)
  }
}

/**
 * Queue webhook delivery with retry logic
 */
async function queueWebhookDelivery(webhook, event) {
  const { error } = await supabase
    .from('webhook_deliveries')
    .insert([{
      webhook_id: webhook.id,
      event_id: event.id,
      event_type: event.event_type,
      payload: JSON.stringify(event),
      status: 'pending',
      retry_count: 0,
      max_retries: webhook.retry_max,
      next_retry_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }])

  if (error) console.error('Failed to queue webhook delivery:', error)
}

/**
 * Process pending webhook deliveries
 * (Should be run periodically by cron job)
 */
export async function processPendingDeliveries() {
  // Get pending deliveries that are ready to retry
  const { data: deliveries } = await supabase
    .from('webhook_deliveries')
    .select('*, webhooks(*)')
    .eq('status', 'pending')
    .lte('next_retry_at', new Date().toISOString())

  if (!deliveries) return { processed: 0 }

  let processed = 0

  for (const delivery of deliveries) {
    const success = await attemptDelivery(delivery)

    if (success) {
      // Mark as delivered
      await supabase
        .from('webhook_deliveries')
        .update({ status: 'delivered', delivered_at: new Date().toISOString() })
        .eq('id', delivery.id)

      processed++
    } else if (delivery.retry_count < delivery.max_retries) {
      // Schedule retry
      const nextRetry = new Date()
      nextRetry.setSeconds(nextRetry.getSeconds() + Math.pow(2, delivery.retry_count) * 60) // Exponential backoff

      await supabase
        .from('webhook_deliveries')
        .update({
          retry_count: delivery.retry_count + 1,
          next_retry_at: nextRetry.toISOString(),
        })
        .eq('id', delivery.id)
    } else {
      // Mark as failed (max retries exceeded)
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          failure_reason: 'Max retries exceeded'
        })
        .eq('id', delivery.id)
    }
  }

  return { processed }
}

/**
 * Attempt single webhook delivery
 */
async function attemptDelivery(delivery) {
  try {
    const response = await fetch(delivery.webhooks.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': generateSignature(delivery.payload),
        'X-Webhook-Event-ID': delivery.event_id,
        'X-Webhook-Event-Type': delivery.event_type,
      },
      body: delivery.payload,
      timeout: delivery.webhooks.timeout_seconds * 1000,
    })

    return response.ok
  } catch (error) {
    console.error('Webhook delivery failed:', error)
    return false
  }
}

/**
 * Generate HMAC signature for webhook payload
 * Allows receiver to verify authenticity
 */
function generateSignature(payload) {
  // In production, use HMAC-SHA256 with secret key
  // For now, simplified version
  const crypto = require('crypto')
  return crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET || 'dev-secret')
    .update(payload)
    .digest('hex')
}

// ========================================
// WEBHOOK ANALYTICS
// ========================================

/**
 * Get webhook delivery stats
 */
export async function getWebhookStats(webhookId) {
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('status')
    .eq('webhook_id', webhookId)

  if (error) throw error

  const stats = {
    total: data.length,
    delivered: data.filter(d => d.status === 'delivered').length,
    failed: data.filter(d => d.status === 'failed').length,
    pending: data.filter(d => d.status === 'pending').length,
  }

  stats.successRate = stats.total > 0 ? (stats.delivered / stats.total * 100).toFixed(1) : 0

  return stats
}

/**
 * Get recent webhook deliveries
 */
export async function getRecentDeliveries(webhookId, limit = 20) {
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('webhook_id', webhookId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
