// Automation Module exports
export { WorkflowEngine, workflowEngine } from './WorkflowEngine'
export { AgentFactory } from './AgentFactory'

// Agents
export { ResearchAgent } from './agents/ResearchAgent'
export { StrategyAgent } from './agents/StrategyAgent'
export { ContentAgent } from './agents/ContentAgent'
export { ReviewAgent } from './agents/ReviewAgent'
export { DesignAgent } from './agents/DesignAgent'
export { PublishAgent } from './agents/PublishAgent'
export { AnalyticsAgent } from './agents/AnalyticsAgent'
export { ManagerAgent } from './agents/ManagerAgent'

// Templates
export {
  ContentProductionTemplate,
  SaasDevelopmentTemplate,
  ClientProjectTemplate,
  MarketingCampaignTemplate,
  workflowTemplates,
  getTemplateById,
  getTemplatesByCategory,
} from './templates'

// Types
export type {
  AgentType,
  WorkflowStatus,
  ExecutionStatus,
  WorkflowStep,
  WorkflowTemplate,
  Workflow,
  ExecutionStep,
  WorkflowExecution,
  Agent,
  AgentLog,
} from './types'

// Services
export * as workflowsService from './services/workflows.service'
