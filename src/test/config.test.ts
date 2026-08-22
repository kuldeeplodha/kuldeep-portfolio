import { describe, expect, it } from 'vitest'
import { portfolioConfig } from '../config'
import { generateAnswer, searchKnowledge } from '../lib/ai/knowledgeSearch'
import { ClientSearchProvider, ServerLLMProvider } from '../lib/ai/provider'
import { validateFullConfig } from '../lib/config/exportImport'

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

  it('retrieves and combines multiple answers (multi-match)', () => {
    // A mock knowledge set where query matches multiple patterns
    const mockKnowledge = [
      {
        id: '1',
        questionPatterns: ['django python backend'],
        answer: 'Kuldeep builds backends using Django.',
        tags: ['backend', 'python'],
        source: 'resume'
      },
      {
        id: '2',
        questionPatterns: ['react typescript frontend'],
        answer: 'Kuldeep builds frontends using React.',
        tags: ['frontend', 'react'],
        source: 'resume'
      },
      {
        id: '3',
        questionPatterns: ['postgres database backend'],
        answer: 'Kuldeep works with PostgreSQL database.',
        tags: ['backend', 'database'],
        source: 'resume'
      }
    ]
    const answer = generateAnswer('tell me about backend python database', mockKnowledge)
    expect(answer).toContain('builds backends using Django')
    expect(answer).toContain('Additionally:')
    expect(answer).toContain('works with PostgreSQL')
  })

  it('prioritizes based on tag and pattern matches', () => {
    const mockKnowledge = [
      {
        id: '1',
        questionPatterns: ['generic work experience'],
        answer: 'Generic experience.',
        tags: ['work'],
        source: 'resume'
      },
      {
        id: '2',
        questionPatterns: ['machine learning experience'],
        answer: 'Machine learning specialist.',
        tags: ['ml', 'machine-learning'],
        source: 'resume'
      }
    ]
    const results = searchKnowledge('machine learning', mockKnowledge)
    expect(results[0].entry.id).toBe('2')
  })

  it('ignores stop words and punctuation', () => {
    const mockKnowledge = [
      {
        id: '1',
        questionPatterns: ['nlp thesis'],
        answer: 'NLP research topic.',
        tags: ['nlp'],
        source: 'resume'
      }
    ]
    const results = searchKnowledge('Tell me about the NLP!!!', mockKnowledge)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].entry.answer).toContain('NLP research topic')
  })
})

describe('AI Providers', () => {
  it('ClientSearchProvider returns correct answer for valid queries', async () => {
    const provider = new ClientSearchProvider(portfolioConfig.aiKnowledge)
    const result = await provider.search('What backend technologies does Kuldeep use?')
    expect(result.toLowerCase()).toContain('django')
  })

  it('ClientSearchProvider handles empty query', async () => {
    const provider = new ClientSearchProvider(portfolioConfig.aiKnowledge)
    const result = await provider.search('   ')
    expect(result).toContain('do not have that information')
  })

  it('ClientSearchProvider handles no-match query fallback', async () => {
    const provider = new ClientSearchProvider(portfolioConfig.aiKnowledge)
    const result = await provider.search('nonexistent keyword query')
    expect(result).toContain('do not have that information')
  })

  it('ServerLLMProvider throws not configured error', async () => {
    const provider = new ServerLLMProvider()
    await expect(provider.search('test')).rejects.toThrow('ServerLLMProvider is not configured')
  })
})

describe('role themes', () => {
  it('each role has a matching theme', () => {
    for (const role of Object.values(portfolioConfig.roles)) {
      expect(portfolioConfig.themes[role.themeId]).toBeDefined()
    }
  })
})

describe('validateFullConfig href-bound URL safety', () => {
  const malicious = ['javascript:alert(1)', 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==']

  const clone = () => JSON.parse(JSON.stringify(portfolioConfig))

  const cases: Array<{ label: string; inject: (cfg: any, url: string) => void }> = [
    {
      label: 'profile.links.linkedin',
      inject: (cfg, url) => { cfg.profile.links.linkedin = url },
    },
    {
      label: 'profile.links.github',
      inject: (cfg, url) => { cfg.profile.links.github = url },
    },
    {
      label: 'project.githubUrl',
      inject: (cfg, url) => { cfg.projects[0].githubUrl = url },
    },
    {
      label: 'certification.url',
      inject: (cfg, url) => { cfg.certifications[0].url = url },
    },
  ]

  it.each(cases.flatMap(({ label }) =>
    malicious.map((url) => ({ label, url })),
  ))('rejects $url in $label', ({ label, url }) => {
    const cfg = clone()
    cases.find((c) => c.label === label)!.inject(cfg, url)
    const errors = validateFullConfig(cfg)
    expect(errors.some((e) => /Invalid/i.test(e))).toBe(true)
  })

  it('accepts https URLs in all four fields', () => {
    const cfg = clone()
    cfg.profile.links.linkedin = 'https://www.linkedin.com/in/kuldeeplodha'
    cfg.profile.links.github = 'https://github.com/kuldeeplodha'
    cfg.projects[0].githubUrl = 'https://github.com/kuldeeplodha/kuldeep-portfolio'
    cfg.certifications[0].url = 'https://example.com/cert'
    expect(validateFullConfig(cfg)).toEqual([])
  })
})
