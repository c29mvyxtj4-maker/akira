import { BaseAgent } from './BaseAgent'

export class PublishAgent extends BaseAgent {
  constructor() {
    super('publish', 'Publishing and deployment coordination')
  }

  async execute(input: { content: string; platforms: string[]; schedule?: string }): Promise<string> {
    if (!input.content || !input.platforms?.length) {
      throw new Error('Content and platforms are required')
    }

    const platformList = input.platforms.join(', ')
    const prompt = `Create a publishing plan for the following content:

CONTENT: ${input.content.substring(0, 500)}...
PLATFORMS: ${platformList}
SCHEDULE: ${input.schedule || 'Immediate'}

Provide:
1. Publishing Strategy (platform-specific approaches)
2. Formatting Requirements (per platform)
3. Optimal Timing (best times to publish)
4. Hashtags/Tags (relevant for each platform)
5. Performance Tracking (metrics to monitor)
6. Cross-platform Integration (how to link content)
7. Contingency Plans

Format as JSON`

    const response = await this.getGeminiResponse(prompt)
    return response
  }

  validate(input: any): boolean {
    return input.content && Array.isArray(input.platforms) && input.platforms.length > 0
  }
}
