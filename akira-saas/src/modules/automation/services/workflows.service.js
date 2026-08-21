import { supabase } from '@/lib/supabase'

export async function fetchWorkflows(orgId) {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchWorkflow(id) {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createWorkflow(workflow) {
  const { data, error } = await supabase
    .from('workflows')
    .insert(workflow)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateWorkflow(id, updates) {
  const { data, error } = await supabase
    .from('workflows')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteWorkflow(id) {
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function fetchExecutions(workflowId) {
  const { data, error } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('started_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchExecution(id) {
  const { data, error } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function saveExecution(execution) {
  const { data, error } = await supabase
    .from('workflow_executions')
    .insert(execution)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchAgentLogs(executionId) {
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('execution_id', executionId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

