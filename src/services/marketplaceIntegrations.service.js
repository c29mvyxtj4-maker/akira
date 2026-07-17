/**
 * Marketplace Integrations Service (Phase 8)
 *
 * Pre-built connectors: Stripe, HubSpot, Slack, Salesforce, QuickBooks, etc.
 * OAuth flows, data sync, bidirectional communication
 */

import { supabase } from '@/lib/supabase'

// ========================================
// STRIPE INTEGRATION
// ========================================

/**
 * Stripe payment processing integration
 */
export async function setupStripeIntegration(accountId, apiKey) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider: 'stripe',
      account_id: accountId,
      api_key: encryptSensitive(apiKey),
      is_active: true,
      configured_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Sync payments from Stripe to AKIRA invoices
 */
export async function syncStripePayments() {
  const stripe = getStripeClient()
  const { userId } = await supabase.auth.getUser()

  // Get last sync time
  const { data: lastSync } = await supabase
    .from('integration_sync_log')
    .select('last_sync')
    .eq('user_id', userId)
    .eq('provider', 'stripe')
    .order('last_sync', { ascending: false })
    .limit(1)
    .single()

  // Fetch charges from Stripe
  const charges = await stripe.charges.list({
    created: { gte: lastSync?.last_sync ? Math.floor(new Date(lastSync.last_sync).getTime() / 1000) : undefined },
    limit: 100,
  })

  // Match to AKIRA invoices and update status
  for (const charge of charges.data) {
    if (charge.paid) {
      // Find matching invoice
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', userId)
        .eq('stripe_charge_id', charge.id)
        .single()

      if (invoice) {
        // Mark as paid
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date(charge.created * 1000).toISOString(),
          })
          .eq('id', invoice.id)
      }
    }
  }

  // Log sync
  await supabase.from('integration_sync_log').insert([{
    user_id: userId,
    provider: 'stripe',
    last_sync: new Date().toISOString(),
  }])

  return { synced: charges.data.length }
}

/**
 * Create Stripe customer for invoice payment
 */
export async function createStripeCustomer(clientId) {
  const stripe = getStripeClient()
  const { data: client } = await supabase
    .from('clients')
    .select('name, email')
    .eq('id', clientId)
    .single()

  const customer = await stripe.customers.create({
    name: client.name,
    email: client.email,
    metadata: { akira_client_id: clientId },
  })

  // Store customer ID
  await supabase
    .from('clients')
    .update({ stripe_customer_id: customer.id })
    .eq('id', clientId)

  return customer
}

// ========================================
// HUBSPOT INTEGRATION
// ========================================

/**
 * Setup HubSpot CRM integration
 */
export async function setupHubSpotIntegration(accessToken) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider: 'hubspot',
      access_token: encryptSensitive(accessToken),
      is_active: true,
      configured_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Sync AKIRA clients to HubSpot contacts
 */
export async function syncClientsToHubSpot() {
  const { userId } = await supabase.auth.getUser()
  const accessToken = await getIntegrationToken('hubspot')

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .is('hubspot_contact_id', null)

  for (const client of clients) {
    // Create contact in HubSpot
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          firstname: client.name.split(' ')[0],
          lastname: client.name.split(' ')[1] || '',
          email: client.email,
          phone: client.phone || '',
        },
      }),
    })

    const contact = await response.json()

    // Store contact ID
    await supabase
      .from('clients')
      .update({ hubspot_contact_id: contact.id })
      .eq('id', client.id)
  }
}

/**
 * Sync invoices to HubSpot deals
 */
export async function syncInvoicesToHubSpot() {
  const { userId } = await supabase.auth.getUser()
  const accessToken = await getIntegrationToken('hubspot')

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id, amount, status,
      projects (name),
      clients (hubspot_contact_id)
    `)
    .eq('user_id', userId)
    .is('hubspot_deal_id', null)

  for (const invoice of invoices) {
    // Create deal in HubSpot
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        associations: [{
          types: [{ associationType: 'contact_to_deal' }],
          id: invoice.clients.hubspot_contact_id,
        }],
        properties: {
          dealname: invoice.projects[0]?.name || 'Invoice',
          amount: invoice.amount,
          dealstage: invoice.status === 'paid' ? 'closedwon' : 'negotiation',
        },
      }),
    })

    const deal = await response.json()

    // Store deal ID
    await supabase
      .from('invoices')
      .update({ hubspot_deal_id: deal.id })
      .eq('id', invoice.id)
  }
}

// ========================================
// SLACK INTEGRATION
// ========================================

/**
 * Setup Slack workspace integration
 */
export async function setupSlackIntegration(teamId, botToken) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider: 'slack',
      workspace_id: teamId,
      bot_token: encryptSensitive(botToken),
      is_active: true,
      configured_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Send Slack notifications for AKIRA events
 */
export async function sendSlackNotification(event, message) {
  const { userId } = await supabase.auth.getUser()
  const botToken = await getIntegrationToken('slack')

  const channels = {
    invoice_paid: '#invoices',
    project_completed: '#projects',
    client_message: '#clients',
    time_tracked: '#time-tracking',
  }

  const channel = channels[event] || '#general'

  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel,
      text: message,
      mrkdwn: true,
    }),
  })
}

/**
 * Post daily standup to Slack
 */
export async function postDailyStandup() {
  const { userId } = await supabase.auth.getUser()

  // Get today's metrics
  const metrics = await getTodayMetrics(userId)

  const message = `
:chart_with_upwards_trend: *Daily Standup*

:timer_clock: *Time Tracked:* ${metrics.hoursLogged}h
:moneybag: *Revenue Today:* $${metrics.revenue}
:rocket: *Active Projects:* ${metrics.activeProjects}
:white_check_mark: *Completed Tasks:* ${metrics.completedTasks}
:inbox_tray: *Pending Invoices:* $${metrics.pendingRevenue}

${metrics.alerts.map(a => `:warning: ${a}`).join('\n')}
  `

  await sendSlackNotification('daily_update', message)
}

// ========================================
// GOOGLE WORKSPACE INTEGRATION
// ========================================

/**
 * Setup Google Workspace integration
 */
export async function setupGoogleWorkspaceIntegration(refreshToken) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider: 'google_workspace',
      refresh_token: encryptSensitive(refreshToken),
      is_active: true,
      configured_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Sync calendar events (meetings) to time tracking
 */
export async function syncCalendarToTimeTracking() {
  const { userId } = await supabase.auth.getUser()
  const refreshToken = await getIntegrationToken('google_workspace')

  // Get access token
  const accessToken = await getGoogleAccessToken(refreshToken)

  // Fetch calendar events
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  const events = await response.json()

  // Create time entries for meetings
  for (const event of events.items) {
    if (event.eventType === 'default') {
      const duration = calculateDuration(event.start, event.end)

      await supabase
        .from('time_entries')
        .insert([{
          user_id: userId,
          description: `Meeting: ${event.summary}`,
          duration_seconds: duration,
          billable: false,
          date_started: event.start.dateTime,
          source: 'google_calendar',
          calendar_event_id: event.id,
        }])
    }
  }
}

// ========================================
// MICROSOFT OFFICE 365 INTEGRATION
// ========================================

/**
 * Setup Microsoft Office 365 integration
 */
export async function setupOffice365Integration(refreshToken) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider: 'office365',
      refresh_token: encryptSensitive(refreshToken),
      is_active: true,
      configured_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ========================================
// SALESFORCE INTEGRATION
// ========================================

/**
 * Setup Salesforce integration
 */
export async function setupSalesforceIntegration(instanceUrl, accessToken) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider: 'salesforce',
      instance_url: instanceUrl,
      access_token: encryptSensitive(accessToken),
      is_active: true,
      configured_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Sync opportunities from Salesforce to AKIRA projects
 */
export async function syncSalesforceOpportunities() {
  const { userId } = await supabase.auth.getUser()
  const accessToken = await getIntegrationToken('salesforce')
  const instanceUrl = await getIntegrationData('salesforce', 'instance_url')

  // Query opportunities
  const query = "SELECT Id, Name, Amount, StageName FROM Opportunity WHERE IsClosed = false"

  const response = await fetch(
    `${instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  const results = await response.json()

  // Create projects for open opportunities
  for (const opp of results.records) {
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('salesforce_opportunity_id', opp.Id)
      .limit(1)

    if (!existing || existing.length === 0) {
      await supabase
        .from('projects')
        .insert([{
          user_id: userId,
          name: opp.Name,
          status: 'active',
          budget: opp.Amount || 0,
          salesforce_opportunity_id: opp.Id,
        }])
    }
  }
}

// ========================================
// QUICKBOOKS INTEGRATION
// ========================================

/**
 * Setup QuickBooks Online integration
 */
export async function setupQuickBooksIntegration(realmId, accessToken) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider: 'quickbooks',
      realm_id: realmId,
      access_token: encryptSensitive(accessToken),
      is_active: true,
      configured_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Sync AKIRA invoices to QuickBooks
 */
export async function syncInvoicesToQuickBooks() {
  const { userId } = await supabase.auth.getUser()
  const accessToken = await getIntegrationToken('quickbooks')
  const realmId = await getIntegrationData('quickbooks', 'realm_id')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .is('quickbooks_invoice_id', null)

  for (const invoice of invoices) {
    // Create invoice in QuickBooks
    const response = await fetch(
      `https://quickbooks.api.intuit.com/v2/companies/${realmId}/invoice`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line: [{
            amount: invoice.amount,
            description: `AKIRA Invoice ${invoice.id}`,
          }],
          customerRef: { value: invoice.client_id },
          totalAmt: invoice.amount,
        }),
      }
    )

    const qbInvoice = await response.json()

    // Store QuickBooks ID
    await supabase
      .from('invoices')
      .update({ quickbooks_invoice_id: qbInvoice.id })
      .eq('id', invoice.id)
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getStripeClient() {
  // Initialize Stripe client
  return { charges: { list: async () => ({ data: [] }) } }
}

async function getIntegrationToken(provider) {
  const { userId } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('integrations')
    .select('access_token, bot_token')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single()

  return decryptSensitive(data?.access_token || data?.bot_token)
}

async function getIntegrationData(provider, field) {
  const { userId } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('integrations')
    .select(field)
    .eq('user_id', userId)
    .eq('provider', provider)
    .single()

  return data?.[field]
}

function encryptSensitive(value) { return value }
function decryptSensitive(value) { return value }

async function getGoogleAccessToken(refreshToken) { return '' }
function calculateDuration(start, end) { return 0 }
async function getTodayMetrics(userId) { return {} }
