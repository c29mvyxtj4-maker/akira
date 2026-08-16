export type AgentType =
  | 'research'
  | 'strategy'
  | 'content'
  | 'review'
  | 'design'
  | 'publish'
  | 'analytics'
  | 'manager'

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed'
export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'paused'

export interface WorkflowStep {
  id: string
  name: string
  agent: AgentType
  input: Record<string, any>
  parallelizable?: boolean
  required?: boolean
  retryCount?: number
  timeout?: number
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  steps: WorkflowStep[]
  estimatedDuration: number
  icon?: string
}

export interface Workflow {
  id: string
  orgId: string
  userId: string
  name: string
  templateId?: string
  status: WorkflowStatus
  steps: WorkflowStep[]
  config: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ExecutionStep {
  id: string
  stepId: string
  agentName: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input: any
  output: any
  error?: string
  startedAt: string
  completedAt?: string
  duration: number
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  orgId: string
  status: ExecutionStatus
  progress: number
  steps: ExecutionStep[]
  startedAt: string
  completedAt?: string
  result?: any
  error?: string
}

export interface Agent {
  name: AgentType
  description: string
  execute(input: any): Promise<any>
  validate?(input: any): boolean
}

export interface AgentLog {
  id: string
  executionId: string
  agentName: string
  input: string
  output: string
  status: 'success' | 'failed'
  duration: number
  createdAt: string
}
