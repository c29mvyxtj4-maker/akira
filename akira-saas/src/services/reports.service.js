import { supabase } from '@/lib/supabase'

export async function fetchReports() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [] }

  return supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
}

export async function getReport(reportId) {
  return supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()
}

export async function saveReport(report) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  if (report.id) {
    return supabase
      .from('reports')
      .update({
        name: report.name,
        type: report.type,
        format: report.format,
        date_range: report.dateRange,
        schedule: report.schedule,
        updated_at: new Date().toISOString(),
      })
      .eq('id', report.id)
      .select()
  } else {
    return supabase
      .from('reports')
      .insert({
        user_id: user.id,
        name: report.name,
        type: report.type,
        format: report.format,
        date_range: report.dateRange,
        schedule: report.schedule,
      })
      .select()
  }
}

export async function deleteReport(reportId) {
  return supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
}

export async function generateReport(reportConfig) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Call edge function to generate report
  const response = await fetch('/api/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: user.id,
      ...reportConfig,
    }),
  })

  if (!response.ok) {
    throw new Error('Error generating report')
  }

  return response.json()
}

export async function scheduleReport(scheduleConfig) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  return supabase
    .from('scheduled_reports')
    .insert({
      user_id: user.id,
      name: scheduleConfig.name,
      type: scheduleConfig.type,
      format: scheduleConfig.format,
      frequency: scheduleConfig.frequency,
      recipients: scheduleConfig.email.split(',').map(e => e.trim()),
      enabled: true,
    })
    .select()
}

export async function getScheduledReports() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [] }

  return supabase
    .from('scheduled_reports')
    .select('*')
    .eq('user_id', user.id)
    .eq('enabled', true)
}

export async function disableScheduledReport(reportId) {
  return supabase
    .from('scheduled_reports')
    .update({ enabled: false })
    .eq('id', reportId)
}

export async function getReportTemplate(templateType) {
  return supabase
    .from('report_templates')
    .select('*')
    .eq('type', templateType)
    .single()
}

export async function exportReport(reportId, format) {
  const { data } = await getReport(reportId)
  if (!data) throw new Error('Report not found')

  // Call edge function to export
  const response = await fetch('/api/export-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      report_id: reportId,
      format: format,
    }),
  })

  if (!response.ok) {
    throw new Error(`Error exporting report as ${format}`)
  }

  return response.json()
}
