import { BaseAgent } from './BaseAgent'

export class ManagerAgent extends BaseAgent {
  constructor() {
    super('manager', 'Workflow orchestration and management')
  }

  async execute(input: { workflow: any; context?: any }): Promise<string> {
    if (!input.workflow) throw new Error('Workflow is required')

    const prompt = `Analyze and provide management recommendations for this workflow:

WORKFLOW:
${JSON.stringify(input.workflow, null, 2)}

CONTEXT:
${input.context ? JSON.stringify(input.context, null, 2) : 'None provided'}

Provide:
1. Workflow Assessment (viability, complexity, resource needs)
2. Optimization Suggestions (efficiency improvements)
3. Risk Assessment (potential issues)
4. Timeline Estimation (how long it will take)
5. Team Assignment (who should do what)
6. Milestone Planning (key checkpoints)
7. Success Criteria (how to measure success)
8. Alternative Approaches (if applicable)

Format as JSON`

    const response = await this.getGeminiResponse(prompt)
    return response
  }

  validate(input: any): boolean {
    return input.workflow && typeof input.workflow === 'object'
  }
}
