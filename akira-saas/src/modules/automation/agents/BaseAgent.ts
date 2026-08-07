import { Agent, AgentType } from '../types'
import { supabase } from '@/lib/supabase'

export abstract class BaseAgent implements Agent {
  name: AgentType
  description: string

  constructor(name: AgentType, description: string) {
    this.name = name
    this.description = description
  }

  abstract execute(input: any): Promise<any>

  validate(input: any): boolean {
    return true
  }

  protected async getGeminiResponse(prompt: string): Promise<string> {
    try {
      const module = await import('@google/generative-ai')
      const GoogleGenerativeAI = module.GoogleGenerativeAI

      const client = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY)
      const model = client.getGenerativeModel({ model: 'gemini-pro' })

      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error(`[${this.name}] Gemini error:`, error)
      throw error
    }
  }

  protected buildPrompt(template: string, variables: Record<string, any>): string {
    let prompt = template
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(`{${key}}`, String(value))
    })
    return prompt
  }

  protected async logExecution(
    executionId: string,
    input: any,
    output: any,
    status: 'success' | 'failed',
    duration: number
  ) {
    try {
      await supabase.from('agent_logs').insert({
        execution_id: executionId,
        agent_name: this.name,
        input: JSON.stringify(input),
        output: JSON.stringify(output),
        status,
        duration,
      })
    } catch (error) {
      console.warn('[BaseAgent] Failed to log execution:', error)
    }
  }
}
