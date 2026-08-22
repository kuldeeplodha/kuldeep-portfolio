import type { AIKnowledgeEntry } from '../../types'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'what', 'how', 'does', 'do',
  'his', 'her', 'he', 'she', 'about', 'tell', 'me', 'kuldeep', 'has', 'have',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
}

function scoreEntry(query: string, entry: AIKnowledgeEntry): number {
  const queryTokens = tokenize(query)
  const patterns = entry.questionPatterns.join(' ')
  const patternTokens = tokenize(patterns)
  const answerTokens = tokenize(entry.answer)

  let score = 0
  for (const token of queryTokens) {
    if (patternTokens.includes(token)) score += 3
    if (answerTokens.includes(token)) score += 1
    if (entry.tags.some((tag: string) => tag.includes(token))) score += 2
  }
  return score
}

export interface KnowledgeSearchResult {
  entry: AIKnowledgeEntry
  score: number
}

export function searchKnowledge(
  query: string,
  entries: AIKnowledgeEntry[],
): KnowledgeSearchResult[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  return entries
    .map((entry) => ({ entry, score: scoreEntry(trimmed, entry) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function generateAnswer(
  query: string,
  entries: AIKnowledgeEntry[],
): string {
  const results = searchKnowledge(query, entries)
  if (results.length === 0) {
    return 'I do not have that information in the portfolio knowledge base. Please check the Experience, Projects, or Skills sections, or contact Kuldeep directly.'
  }

  const top = results[0]
  if (results.length === 1) {
    return top.entry.answer
  }

  const supplemental = results
    .slice(1, 3)
    .map((r) => r.entry.answer)
    .filter((a) => a !== top.entry.answer)

  if (supplemental.length === 0) {
    return top.entry.answer
  }

  return `${top.entry.answer}\n\nAdditionally: ${supplemental[0]}`
}
