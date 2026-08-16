import { BaseAgent } from './BaseAgent'

export class AnalyticsAgent extends BaseAgent {
  constructor() {
    super('analytics', 'Analytics, metrics, and insights generation')
  }

  async execute(input: { data: any; metrics?: string[]; period?: string }): Promise<string> {
    if (!input.data) throw new Error('Data is required')

    const metricsList = input.metrics?.join(', ') || 'revenue, growth, engagement'

    const prompt = `Analyze the following data and provide insights:

DATA: ${JSON.stringify(input.data, null, 2)}
KEY METRICS: ${metricsList}
PERIOD: ${input.period || 'Current'}

Provide:
1. Data Summary (key statistics)
2. Trend Analysis (patterns and changes)
3. Performance Metrics (detailed breakdown)
4. Anomalies (unusual patterns)
5. Comparisons (if data available)
6. Insights (what the data means)
7. Recommendations (actionable next steps)
8. Forecasts (short-term predictions)

Format as JSON`

    const response = await this.getGeminiResponse(prompt)
    return response
  }

  validate(input: any): boolean {
    return input.data !== null && input.data !== undefined
  }
}
