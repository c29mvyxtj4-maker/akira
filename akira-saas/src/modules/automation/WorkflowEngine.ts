import { Workflow, WorkflowExecution, ExecutionStep, ExecutionStatus } from './types'
import { AgentFactory } from './AgentFactory'
import { supabase } from '@/lib/supabase'

export class WorkflowEngine {
  async executeWorkflow(workflow: Workflow): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId: workflow.id,
      orgId: workflow.orgId,
      status: 'running',
      progress: 0,
      steps: [],
      startedAt: new Date().toISOString(),
    }

    try {
      // Save execution start
      await this.saveExecution(execution)

      // Execute steps
      const totalSteps = workflow.steps.length
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i]
        const executionStep = await this.executeStep(step, workflow, execution.id)
        execution.steps.push(executionStep)

        // Update progress
        execution.progress = Math.round(((i + 1) / totalSteps) * 100)
        await this.updateExecution(execution)

        if (executionStep.status === 'failed' && step.required) {
          throw new Error(`Required step "${step.name}" failed: ${executionStep.error}`)
        }
      }

      execution.status = 'completed'
      execution.completedAt = new Date().toISOString()
      execution.result = this.aggregateResults(execution)
    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      execution.completedAt = new Date().toISOString()
    }

    await this.updateExecution(execution)
    return execution
  }

  private async executeStep(step: any, workflow: Workflow, executionId: string): Promise<ExecutionStep> {
    const startTime = Date.now()
    let output: any = null
    let error: string | undefined = undefined
    let status: 'pending' | 'running' | 'completed' | 'failed' = 'running'

    try {
      const agent = AgentFactory.getAgent(step.agent)

      if (!agent.validate(step.input)) {
        throw new Error(`Invalid input for ${step.name}`)
      }

      output = await agent.execute(step.input)
      status = 'completed'
    } catch (err) {
      status = 'failed'
      error = err instanceof Error ? err.message : 'Unknown error'
    }

    const duration = Date.now() - startTime

    const executionStep: ExecutionStep = {
      id: `step-${Date.now()}`,
      stepId: step.id,
      agentName: step.agent,
      status,
      input: step.input,
      output,
      error,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      duration,
    }

    // Log to database
    await supabase.from('agent_logs').insert({
      execution_id: executionId,
      agent_name: step.agent,
      input: JSON.stringify(step.input),
      output: JSON.stringify(output),
      status: status === 'completed' ? 'success' : 'failed',
      duration,
    }).catch((err) => console.warn('Failed to log step:', err))

    return executionStep
  }

  private aggregateResults(execution: WorkflowExecution): any {
    const results: Record<string, any> = {}
    execution.steps.forEach((step) => {
      results[step.stepId] = {
        status: step.status,
        output: step.output,
        error: step.error,
      }
    })
    return results
  }

  private async saveExecution(execution: WorkflowExecution): Promise<void> {
    try {
      await supabase.from('workflow_executions').insert({
        id: execution.id,
        workflow_id: execution.workflowId,
        org_id: execution.orgId,
        status: execution.status,
        progress: execution.progress,
        started_at: execution.startedAt,
      }).catch((err) => {
        console.warn('Failed to save execution to DB, using localStorage:', err)
        this.saveExecutionLocal(execution)
      })
    } catch (error) {
      console.warn('[WorkflowEngine] Failed to save execution:', error)
      this.saveExecutionLocal(execution)
    }
  }

  private async updateExecution(execution: WorkflowExecution): Promise<void> {
    try {
      await supabase
        .from('workflow_executions')
        .update({
          status: execution.status,
          progress: execution.progress,
          completed_at: execution.completedAt,
          result: execution.result,
          error: execution.error,
        })
        .eq('id', execution.id)
        .catch((err) => {
          console.warn('Failed to update execution in DB, using localStorage:', err)
          this.saveExecutionLocal(execution)
        })
    } catch (error) {
      console.warn('[WorkflowEngine] Failed to update execution:', error)
      this.saveExecutionLocal(execution)
    }
  }

  private saveExecutionLocal(execution: WorkflowExecution): void {
    try {
      const key = 'akira_workflow_executions'
      const stored = localStorage.getItem(key)
      const executions = stored ? JSON.parse(stored) : []
      const idx = executions.findIndex((e: any) => e.id === execution.id)
      if (idx >= 0) {
        executions[idx] = execution
      } else {
        executions.push(execution)
      }
      localStorage.setItem(key, JSON.stringify(executions))
    } catch (err) {
      console.error('Failed to save execution to localStorage:', err)
    }
  }
}

export const workflowEngine = new WorkflowEngine()

