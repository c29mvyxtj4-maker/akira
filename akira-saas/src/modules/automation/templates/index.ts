import { WorkflowTemplate } from '../types'

export const ContentProductionTemplate: WorkflowTemplate = {
  id: 'content-production',
  name: 'Content Production Pipeline',
  description: 'Blog → Social Media → Email Campaign',
  category: 'content',
  steps: [
    {
      id: 'research',
      name: 'Research Topic',
      agent: 'research',
      input: { topic: '', scope: 'market' },
      required: true,
    },
    {
      id: 'strategy',
      name: 'Create Content Strategy',
      agent: 'strategy',
      input: { goal: 'Define content direction' },
      required: true,
    },
    {
      id: 'content-blog',
      name: 'Write Blog Post',
      agent: 'content',
      input: { format: 'blog', tone: 'informative' },
      required: true,
    },
    {
      id: 'content-social',
      name: 'Create Social Posts',
      agent: 'content',
      input: { format: 'social', tone: 'engaging' },
      parallelizable: true,
    },
    {
      id: 'content-email',
      name: 'Write Email Campaign',
      agent: 'content',
      input: { format: 'email', tone: 'persuasive' },
      parallelizable: true,
    },
    {
      id: 'review',
      name: 'Quality Review',
      agent: 'review',
      input: { criteria: 'Clarity, accuracy, professionalism' },
      required: true,
    },
    {
      id: 'publish',
      name: 'Publish All Channels',
      agent: 'publish',
      input: { platforms: ['blog', 'twitter', 'linkedin', 'email'] },
      required: true,
    },
  ],
  estimatedDuration: 120,
}

export const SaasDevelopmentTemplate: WorkflowTemplate = {
  id: 'saas-development',
  name: 'SaaS Development Lifecycle',
  description: 'Spec → Development → Testing → Release',
  category: 'development',
  steps: [
    {
      id: 'research',
      name: 'Market Research',
      agent: 'research',
      input: { scope: 'competitive' },
      required: true,
    },
    {
      id: 'strategy',
      name: 'Development Strategy',
      agent: 'strategy',
      input: { goal: 'Define development roadmap' },
      required: true,
    },
    {
      id: 'design',
      name: 'Design Architecture',
      agent: 'design',
      input: { objective: 'SaaS platform architecture' },
      required: true,
    },
    {
      id: 'review-design',
      name: 'Review Design',
      agent: 'review',
      input: { criteria: 'Technical feasibility' },
      required: true,
    },
    {
      id: 'analytics',
      name: 'Performance Planning',
      agent: 'analytics',
      input: { data: { metric: 'scalability' } },
    },
    {
      id: 'publish',
      name: 'Release Plan',
      agent: 'publish',
      input: { platforms: ['github', 'docker', 'staging', 'production'] },
      required: true,
    },
  ],
  estimatedDuration: 480,
}

export const ClientProjectTemplate: WorkflowTemplate = {
  id: 'client-project',
  name: 'Client Project Delivery',
  description: 'Intake → Planning → Execution → Delivery',
  category: 'project',
  steps: [
    {
      id: 'research',
      name: 'Client Research',
      agent: 'research',
      input: { scope: 'technical' },
      required: true,
    },
    {
      id: 'strategy',
      name: 'Project Strategy',
      agent: 'strategy',
      input: { goal: 'Define project scope' },
      required: true,
    },
    {
      id: 'content',
      name: 'Create Project Brief',
      agent: 'content',
      input: { format: 'document' },
      required: true,
    },
    {
      id: 'design',
      name: 'Design Deliverables',
      agent: 'design',
      input: { objective: 'Client project design' },
      required: true,
    },
    {
      id: 'review',
      name: 'Quality Assurance',
      agent: 'review',
      input: { criteria: 'Client requirements' },
      required: true,
    },
    {
      id: 'publish',
      name: 'Deliver to Client',
      agent: 'publish',
      input: { platforms: ['email', 'portal', 'meeting'] },
      required: true,
    },
  ],
  estimatedDuration: 240,
}

export const MarketingCampaignTemplate: WorkflowTemplate = {
  id: 'marketing-campaign',
  name: 'Marketing Campaign Launch',
  description: 'Strategy → Content → Launch → Analytics',
  category: 'marketing',
  steps: [
    {
      id: 'research',
      name: 'Market & Audience Research',
      agent: 'research',
      input: { scope: 'market' },
      required: true,
    },
    {
      id: 'strategy',
      name: 'Campaign Strategy',
      agent: 'strategy',
      input: { goal: 'Define campaign goals' },
      required: true,
    },
    {
      id: 'design',
      name: 'Creative Design',
      agent: 'design',
      input: { objective: 'Marketing campaign visuals' },
      required: true,
    },
    {
      id: 'content',
      name: 'Campaign Copy',
      agent: 'content',
      input: { format: 'marketing' },
      required: true,
    },
    {
      id: 'review',
      name: 'Campaign Review',
      agent: 'review',
      input: { criteria: 'Brand consistency, persuasiveness' },
      required: true,
    },
    {
      id: 'publish',
      name: 'Launch Campaign',
      agent: 'publish',
      input: { platforms: ['email', 'social', 'ads', 'website'] },
      required: true,
    },
    {
      id: 'analytics',
      name: 'Monitor Performance',
      agent: 'analytics',
      input: { metrics: ['ctr', 'conversion', 'roi'] },
    },
  ],
  estimatedDuration: 180,
}

export const workflowTemplates: WorkflowTemplate[] = [
  ContentProductionTemplate,
  SaasDevelopmentTemplate,
  ClientProjectTemplate,
  MarketingCampaignTemplate,
]

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return workflowTemplates.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return workflowTemplates.filter((t) => t.category === category)
}
