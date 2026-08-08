import { BaseAgent } from './BaseAgent'

export class StrategyAgent extends BaseAgent {
  constructor() {
    super('strategy', 'Strategic planning and decision making')
  }

  async execute(input: { goal: string; constraints?: string; resources?: string }): Promise<string> {
    if (!input.goal) throw new Error('Goal is required')

    const prompt = this.buildPrompt(
      `Create a strategic plan for the following objective:

Goal: {goal}
Constraints: {constraints}
Available Resources: {resources}

Provide a comprehensive strategy including:
1. Objectives (SMART goals)
2. Key Strategies (3-5 main approaches)
3. Timeline (phases and milestones)
4. Resource Allocation
5. Success Metrics
6. Risk Mitigation

Format as JSON`,
      input
    )

    const response = await this.getGeminiResponse(prompt)
    return response
  }

  validate(input: any): boolean {
    return input.goal && typeof input.goal === 'string'
  }
}
