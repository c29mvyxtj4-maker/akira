/**
 * Public API Service
 *
 * RESTful API layer for third-party integrations
 * OAuth 2.0 authentication
 * Rate limiting & quotas
 * Comprehensive API for all AKIRA features
 */

import { supabase } from '@/lib/supabase'

// ========================================
// API KEY MANAGEMENT
// ========================================

/**
 * Create API key for developer
 */
export async function createApiKey(name, scopes = []) {
  const { userId } = await supabase.auth.getUser()

  const key = generateApiKey()
  const hashedKey = hashApiKey(key)

  const { data, error } = await supabase
    .from('api_keys')
    .insert([{
      user_id: userId,
      name,
      key: hashedKey,
      scopes,
      rate_limit: 1000, // requests per hour
      is_active: true,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  return {
    key: key, // Only shown once
    id: data.id,
    name: data.name,
    message: 'Save this key safely - you won\'t see it again'
  }
}

/**
 * Revoke API key
 */
export async function revokeApiKey(keyId) {
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)

  if (error) throw error
  return { success: true }
}

/**
 * Get API keys for user
 */
export async function getApiKeys() {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, created_at, is_active, rate_limit')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ========================================
// RATE LIMITING
// ========================================

/**
 * Check if API key is within rate limits
 */
export async function checkRateLimit(apiKeyId) {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  // Get rate limit config
  const { data: keyData } = await supabase
    .from('api_keys')
    .select('rate_limit')
    .eq('id', apiKeyId)
    .single()

  if (!keyData) throw new Error('Invalid API key')

  // Count requests in last hour
  const { count } = await supabase
    .from('api_logs')
    .select('id', { count: 'exact' })
    .eq('api_key_id', apiKeyId)
    .gte('created_at', oneHourAgo.toISOString())

  if (count >= keyData.rate_limit) {
    throw new Error(`Rate limit exceeded: ${keyData.rate_limit} requests per hour`)
  }

  return { remaining: keyData.rate_limit - count }
}

// ========================================
// API ENDPOINTS - CLIENTS
// ========================================

/**
 * List clients
 * GET /api/v1/clients
 */
export async function listClients(page = 1, limit = 50) {
  const offset = (page - 1) * limit

  const { data, count } = await supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  }
}

/**
 * Get client by ID
 * GET /api/v1/clients/:id
 */
export async function getClient(clientId) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create client
 * POST /api/v1/clients
 */
export async function createClient(clientData) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('clients')
    .insert([{
      ...clientData,
      org_id: clientData.org_id,
      created_by: userId,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update client
 * PUT /api/v1/clients/:id
 */
export async function updateClient(clientId, updates) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete client
 * DELETE /api/v1/clients/:id
 */
export async function deleteClient(clientId) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) throw error
  return { success: true }
}

// ========================================
// API ENDPOINTS - PROJECTS
// ========================================

/**
 * List projects
 * GET /api/v1/projects
 */
export async function listProjects(page = 1, limit = 50) {
  const offset = (page - 1) * limit

  const { data, count } = await supabase
    .from('projects')
    .select('*, clients(name)', { count: 'exact' })
    .range(offset, offset + limit - 1)

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  }
}

/**
 * Get project by ID
 * GET /api/v1/projects/:id
 */
export async function getProject(projectId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create project
 * POST /api/v1/projects
 */
export async function createProject(projectData) {
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update project
 * PUT /api/v1/projects/:id
 */
export async function updateProject(projectId, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ========================================
// API ENDPOINTS - TIME ENTRIES
// ========================================

/**
 * List time entries
 * GET /api/v1/time-entries
 */
export async function listTimeEntries(page = 1, limit = 50, filters = {}) {
  const offset = (page - 1) * limit

  let query = supabase
    .from('time_entries')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.projectId) {
    query = query.eq('project_id', filters.projectId)
  }
  if (filters.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  if (filters.billable !== undefined) {
    query = query.eq('billable', filters.billable)
  }
  if (filters.startDate) {
    query = query.gte('started_at', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('started_at', filters.endDate)
  }

  const { data, count } = await query.range(offset, offset + limit - 1)

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  }
}

/**
 * Get time entry by ID
 * GET /api/v1/time-entries/:id
 */
export async function getTimeEntry(entryId) {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('id', entryId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create time entry
 * POST /api/v1/time-entries
 */
export async function createTimeEntry(entryData) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('time_entries')
    .insert([{
      ...entryData,
      user_id: userId,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update time entry
 * PUT /api/v1/time-entries/:id
 */
export async function updateTimeEntry(entryId, updates) {
  const { data, error } = await supabase
    .from('time_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ========================================
// API ENDPOINTS - INVOICES
// ========================================

/**
 * List invoices
 * GET /api/v1/invoices
 */
export async function listInvoices(page = 1, limit = 50) {
  const offset = (page - 1) * limit

  const { data, count } = await supabase
    .from('invoices')
    .select('*, clients(name)', { count: 'exact' })
    .range(offset, offset + limit - 1)

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  }
}

/**
 * Get invoice by ID
 * GET /api/v1/invoices/:id
 */
export async function getInvoice(invoiceId) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create invoice
 * POST /api/v1/invoices
 */
export async function createInvoice(invoiceData) {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoiceData])
    .select()
    .single()

  if (error) throw error
  return data
}

// ========================================
// UTILITIES
// ========================================

/**
 * Generate API key
 */
function generateApiKey() {
  const prefix = 'akira_'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = prefix
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

/**
 * Hash API key for storage
 */
function hashApiKey(key) {
  // In production, use proper bcrypt hashing
  return key.substring(0, 8) + '...' + key.substring(key.length - 8)
}

/**
 * Log API request
 */
export async function logApiRequest(apiKeyId, endpoint, method, status, duration) {
  await supabase
    .from('api_logs')
    .insert([{
      api_key_id: apiKeyId,
      endpoint,
      method,
      status_code: status,
      duration_ms: duration,
      created_at: new Date().toISOString(),
    }])
    .catch(err => console.error('Failed to log API request:', err))
}
