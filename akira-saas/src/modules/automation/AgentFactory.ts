import { Agent, AgentType } from './types'
import { ResearchAgent } from './agents/ResearchAgent'
import { StrategyAgent } from './agents/StrategyAgent'
import { ContentAgent } from './agents/ContentAgent'
import { ReviewAgent } from './agents/ReviewAgent'
import { DesignAgent } from './agents/DesignAgent'
import { PublishAgent } from './agents/PublishAgent'
import { AnalyticsAgent } from './agents/AnalyticsAgent'
import { ManagerAgent } from './agents/ManagerAgent'

export class AgentFactory {
  private static instances: Map<AgentType, Agent> = new Map()

  static getAgent(type: AgentType): Agent {
    if (!this.instances.has(type)) {
      const agent = this.createAgent(type)
      this.instances.set(type, agent)
    }
    return this.instances.get(type)!
  }

  private static createAgent(type: AgentType): Agent {
    switch (type) {
      case 'research':
        return new ResearchAgent()
      case 'strategy':
        return new StrategyAgent()
      case 'content':
        return new ContentAgent()
      case 'review':
        return new ReviewAgent()
      case 'design':
        return new DesignAgent()
      case 'publish':
        return new PublishAgent()
      case 'analytics':
        return new AnalyticsAgent()
      case 'manager':
        return new ManagerAgent()
      default:
        throw new Error(`Unknown agent type: ${type}`)
    }
  }

  static getAllAgents(): Agent[] {
    const types: AgentType[] = [
      'research',
      'strategy',
      'content',
      'review',
      'design',
      'publish',
      'analytics',
      'manager',
    ]
    return types.map((type) => this.getAgent(type))
  }

  static resetCache(): void {
    this.instances.clear()
  }
}
