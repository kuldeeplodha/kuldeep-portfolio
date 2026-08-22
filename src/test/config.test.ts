import { describe, expect, it } from 'vitest'
import { portfolioConfig } from '../config'
import { generateAnswer, searchKnowledge } from '../lib/ai/knowledgeSearch'

describe('portfolioConfig', () => {
  it('loads all four roles', () => {
    expect(Object.keys(portfolioConfig.roles)).toEqual(
      expect.arrayContaining(['software', 'ai', 'data', 'system']),
    )
  })

  it('has experience entries with achievements', () => {
    expect(portfolioConfig.experience.length).toBeGreaterThan(0)
    expect(portfolioConfig.experience[0].achievements.length).toBeGreaterThan(0)
  })
})

describe('knowledgeSearch', () => {
  it('finds backend-related answers', () => {
    const results = searchKnowledge(
      'What backend technologies does Kuldeep use?',
      portfolioConfig.aiKnowledge,
    )
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].entry.answer.toLowerCase()).toContain('django')
  })

  it('returns fallback for unknown queries', () => {
    const answer = generateAnswer('xyz unknown topic qwerty', portfolioConfig.aiKnowledge)
    expect(answer).toContain('do not have that information')
  })
})

describe('role themes', () => {
  it('each role has a matching theme', () => {
    for (const role of Object.values(portfolioConfig.roles)) {
      expect(portfolioConfig.themes[role.themeId]).toBeDefined()
    }
  })
})
