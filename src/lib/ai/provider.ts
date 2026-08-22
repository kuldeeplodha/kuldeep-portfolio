import { generateAnswer } from './knowledgeSearch'
import { portfolioConfig } from '../../config'
import type { AIKnowledgeEntry } from '../../types'

export interface AIProvider {
  search(query: string): Promise<string>
}

export class ClientSearchProvider implements AIProvider {
  private entries: AIKnowledgeEntry[]

  constructor(entries: AIKnowledgeEntry[] = portfolioConfig.aiKnowledge) {
    this.entries = entries
  }

  async search(query: string): Promise<string> {
    return generateAnswer(query, this.entries)
  }
}

export class ServerLLMProvider implements AIProvider {
  async search(_query: string): Promise<string> {
    throw new Error('ServerLLMProvider is not configured')
  }
}

let currentProvider: AIProvider = new ClientSearchProvider()

export function getAIProvider(): AIProvider {
  return currentProvider
}

export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider
}
