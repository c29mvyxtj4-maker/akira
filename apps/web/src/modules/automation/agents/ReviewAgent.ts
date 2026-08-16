import { BaseAgent } from './BaseAgent'

export class ReviewAgent extends BaseAgent {
  constructor() {
    super('review', 'Quality assurance and content review')
  }

  async execute(input: { content: string; criteria?: string; checklistItems?: string[] }): Promise<string> {
    if (!input.content) throw new Error('Content is required')

    const checklist = input.checklistItems?.join('\n') || '- Clarity and readability\n- Accuracy\n- Completeness\n- Professionalism'

    const prompt = `Review the following content and provide detailed feedback:

CONTENT:
${input.content}

REVIEW CRITERIA:
${checklist}

Provide a structured review including:
1. Overall Assessment (score 1-10)
2. Strengths (3+ points)
3. Areas for Improvement (3+ points)
4. Specific Feedback (line-by-line if applicable)
5. Revised Version (improved content)
6. Final Recommendation

Format as JSON`

    const response = await this.getGeminiResponse(prompt)
    return response
  }

  validate(input: any): boolean {
    return input.content && typeof input.content === 'string'
  }
}
