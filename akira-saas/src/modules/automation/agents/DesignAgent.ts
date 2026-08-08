import { BaseAgent } from './BaseAgent'

export class DesignAgent extends BaseAgent {
  constructor() {
    super('design', 'Design recommendations and UX/UI suggestions')
  }

  async execute(input: { objective: string; constraints?: string; inspiration?: string }): Promise<string> {
    if (!input.objective) throw new Error('Objective is required')

    const prompt = this.buildPrompt(
      `Provide design recommendations for:

Objective: {objective}
Constraints: {constraints}
Inspiration/Reference: {inspiration}

Include:
1. Design Principles (3-5 key principles)
2. Layout Recommendations (wireframe description)
3. Color Palette (3-5 colors with rationale)
4. Typography (font pairing suggestions)
5. Component Library (key components needed)
6. Accessibility Considerations
7. Interactive Elements

Format as JSON`,
      { ...input, constraints: input.constraints || 'None specified', inspiration: input.inspiration || 'Modern best practices' }
    )

    const response = await this.getGeminiResponse(prompt)
    return response
  }

  validate(input: any): boolean {
    return input.objective && typeof input.objective === 'string'
  }
}
