import { BaseAgent } from './BaseAgent'

export class ContentAgent extends BaseAgent {
  constructor() {
    super('content', 'Content creation, copywriting, and adaptation')
  }

  async execute(input: { topic: string; format: string; tone?: string; audience?: string }): Promise<string> {
    if (!input.topic || !input.format) throw new Error('Topic and format are required')

    const prompt = this.buildPrompt(
      `Create content with the following specifications:

Topic: {topic}
Format: {format}
Tone: {tone}
Target Audience: {audience}

Provide high-quality, engaging content optimized for the specified format and audience.
Include: main content, headlines, call-to-action, and key takeaways.`,
      { ...input, tone: input.tone || 'professional', audience: input.audience || 'general' }
    )

    const response = await this.getGeminiResponse(prompt)
    return response
  }

  validate(input: any): boolean {
    return input.topic && input.format
  }
}
