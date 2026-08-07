import { BaseAgent } from './BaseAgent'

export class ResearchAgent extends BaseAgent {
  constructor() {
    super('research', 'Research topics, competitive analysis, and market insights')
  }

  async execute(input: { topic: string; scope: 'competitive' | 'market' | 'technical'; context?: string }): Promise<string> {
    if (!input.topic) throw new Error('Topic is required')

    const prompt = this.buildPrompt(
      `Research the following topic and provide comprehensive insights:

Topic: {topic}
Scope: {scope}
Context: {context}

Provide:
1. Key Findings (3-5 bullet points)
2. Competitive Landscape
3. Market Trends
4. Recommendations
5. Data Sources

Format as JSON with keys: findings, landscape, trends, recommendations, sources`,
      input
    )

    try {
      const response = await this.getGeminiResponse(prompt)
      return response
    } catch (error) {
      throw new Error(`Research agent failed: ${error}`)
    }
  }

  validate(input: any): boolean {
    return input.topic && typeof input.topic === 'string'
  }
}
