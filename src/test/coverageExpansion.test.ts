import { describe, expect, it, beforeEach, afterAll } from 'vitest'
import { portfolioConfig } from '../config'
import type { PortfolioConfig } from '../types'
import {
  isValidSafeUrl,
  isValidEmail,
  isValidPhone,
  isValidCssColor,
  isValidGpa,
  validateConfigRegistry,
  registerRule,
  clearCustomRules,
  getFieldIssue,
  getFieldIssues,
  getSectionIssues,
  type ValidationRule,
  type ValidationSummary,
} from '../lib/config/validationRegistry'
import {
  exportConfig,
  downloadConfig,
  saveDraftToLocalStorage,
  loadDraftFromLocalStorage,
  parseImportedConfig,
  parseImportedConfigDiagnostic,
  validateProfile,
  getQuarantinedDraft,
  clearQuarantine,
  clearDraft,
} from '../lib/config/exportImport'
import {
  ClientSearchProvider,
  ServerLLMProvider,
  getAIProvider,
  setAIProvider,
  type AIProvider,
} from '../lib/ai/provider'

const clone = (): PortfolioConfig => JSON.parse(JSON.stringify(portfolioConfig))
const ids = (s: ValidationSummary) => new Set(s.errors.concat(s.warnings).map((i) => i.id))

/**
 * These suites are dedicated to raising branch coverage of the pure logic layer
 * (validationRegistry, exportImport, provider) toward the V1.4 coverage floor.
 * They deliberately drive the "invalid" arms of every field validator that the
 * golden-config suites never reach because the shipped config is valid.
 */
describe('coverage expansion — validationRegistry helpers', () => {
  beforeEach(() => clearCustomRules())

  it('isValidSafeUrl: whitespace-only is treated as empty/valid', () => {
    expect(isValidSafeUrl('   ')).toBe(true)
    expect(isValidSafeUrl(undefined)).toBe(true)
  })

  it('isValidEmail: rejects blank and malformed', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail(null)).toBe(false)
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('a@b.co')).toBe(true)
  })

  it('isValidPhone: blank is optional/valid, too-short rejected', () => {
    expect(isValidPhone(undefined)).toBe(true)
    expect(isValidPhone('')).toBe(true)
    expect(isValidPhone('123')).toBe(false)
    expect(isValidPhone('+1 (555) 123-4567')).toBe(true)
  })

  it('isValidCssColor: hex/rgb/hsl accepted; null, non-string, blank, garbage rejected', () => {
    expect(isValidCssColor('#abc')).toBe(true)
    expect(isValidCssColor('rgb(1, 2, 3)')).toBe(true)
    expect(isValidCssColor('rgba(1,2,3,0.5)')).toBe(true)
    expect(isValidCssColor('hsl(120, 50%, 50%)')).toBe(true)
    expect(isValidCssColor(null)).toBe(false)
    expect(isValidCssColor(123 as unknown as string)).toBe(false)
    expect(isValidCssColor('   ')).toBe(false)
    expect(isValidCssColor('not-a-color')).toBe(false)
  })

  it('isValidGpa: blank valid, CGPA/scale forms valid, out-of-range and non-numeric rejected', () => {
    expect(isValidGpa('')).toBe(true)
    expect(isValidGpa(null)).toBe(true)
    expect(isValidGpa('CGPA 9.5')).toBe(true)
    expect(isValidGpa('3.8/4.0')).toBe(true)
    expect(isValidGpa('8.5 out of 10')).toBe(true)
    expect(isValidGpa('5.0')).toBe(false) // exceeds default 4.0 scale
    expect(isValidGpa('abc')).toBe(false)
    expect(isValidGpa('.')).toBe(false) // matches shape but parses to NaN
  })
})

describe('coverage expansion — validateConfigRegistry error arms', () => {
  beforeEach(() => clearCustomRules())

  it('flags missing / non-array top-level sections', () => {
    const c = clone() as unknown as Record<string, unknown>
    c.profile = undefined
    c.roles = undefined
    c.themes = undefined
    c.experience = 'nope'
    c.projects = null
    c.skills = null
    c.education = null
    c.certifications = null
    c.research = null
    c.metrics = null
    c.aiKnowledge = null
    const s = validateConfigRegistry(c as unknown as PortfolioConfig)
    const got = ids(s)
    for (const id of [
      'profile-missing',
      'roles-missing',
      'themes-missing',
      'experience-not-array',
      'projects-not-array',
      'skills-not-array',
      'education-not-array',
      'certifications-not-array',
      'research-not-array',
      'metrics-not-array',
      'aiKnowledge-not-array',
    ]) {
      expect(got.has(id)).toBe(true)
    }
    expect(s.isValid).toBe(false)
  })

  it('flags empty collection sections', () => {
    const c = clone()
    c.experience = []
    c.projects = []
    c.skills = []
    c.education = []
    c.metrics = []
    c.aiKnowledge = []
    const got = ids(validateConfigRegistry(c))
    for (const id of [
      'experience-empty',
      'projects-empty',
      'skills-empty',
      'education-empty',
      'metrics-empty',
      'aiKnowledge-empty',
    ]) {
      expect(got.has(id)).toBe(true)
    }
  })

  it('flags every required field across a fully-broken entity per section', () => {
    const c = clone() as any
    // profile
    c.profile.name = ''
    c.profile.title = ''
    c.profile.location = ''
    c.profile.email = ''
    c.profile.summary = ''
    c.profile.navDisplayName = ''
    c.profile.avatarUrl = 'javascript:alert(1)'
    c.profile.links = { linkedin: 'javascript:x', github: 'javascript:x' }
    // roles: break software role wholesale
    c.roles.software.label = ''
    c.roles.software.themeId = 'ghost-theme'
    c.roles.software.hero = { headline: '', subtitle: '', primaryCta: '' }
    c.roles.software.resumeVariant = 'bogus'
    c.roles.software.highlightedSkillIds = ['ghost-skill']
    c.roles.software.highlightedProjectIds = ['ghost-proj']
    c.roles.software.highlightedMetricIds = ['ghost-metric']
    c.roles.software.experiencePriorityIds = ['ghost-exp']
    // themes: break software theme
    c.themes.software.background = 'not-a-color'
    c.themes.software.heroGradient = ''
    c.themes.software.layoutVariant = 'bogus'
    // experience[0]
    c.experience[0] = {
      id: '',
      organization: '',
      role: '',
      period: '',
      location: '',
      relevantRoles: [],
      responsibilities: [],
      achievements: [{ text: '', sourceVariants: [], relevantRoles: [] }],
      technologies: [],
      imageUrl: 'javascript:x',
      attachments: [{ label: '', url: 'javascript:x' }],
    }
    // projects[0]
    c.projects[0] = {
      id: '',
      title: '',
      overview: '',
      technologies: [],
      githubUrl: 'javascript:x',
      relevantRoles: [],
      imageUrl: 'javascript:x',
      attachments: [{ label: '', url: 'javascript:x' }],
    }
    // skills[0]
    c.skills[0] = {
      id: '',
      name: '',
      relevantRoles: [],
      skills: [{ id: '', name: '', relatedIds: ['ghost'] }],
    }
    // education[0]
    c.education[0] = {
      id: '',
      degree: '',
      institution: '',
      period: '',
      location: '',
      gpa: 'weird!!',
    }
    // certifications[0]
    c.certifications[0] = {
      id: '',
      name: '',
      issuer: '',
      sourceVariants: [],
      url: 'javascript:x',
      date: '',
    }
    // research[0]
    c.research[0] = { id: '', title: '', description: '', status: '' }
    // metrics[0]
    c.metrics[0] = { id: '', label: '', value: '', sourceVariants: [], relevantRoles: [] }
    // aiKnowledge[0]
    c.aiKnowledge[0] = {
      id: '',
      answer: '',
      questionPatterns: [''],
      tags: [],
      source: '',
    }

    const s = validateConfigRegistry(c as PortfolioConfig)
    const got = ids(s)
    for (const id of [
      'profile-name-required',
      'profile-title-required',
      'profile-location-required',
      'profile-email-required',
      'profile-summary-required',
      'profile-nav-display-name-empty-warn',
      'profile-avatar-url-invalid',
      'profile-linkedin-invalid',
      'profile-github-invalid',
      'roles-software-label-required',
      'roles-software-invalid-theme',
      'roles-software-headline-required',
      'roles-software-subtitle-required',
      'roles-software-primary-cta-required',
      'roles-software-invalid-resume-variant',
      'themes-software-background-invalid',
      'themes-software-gradient-required',
      'themes-software-invalid-layout',
    ]) {
      expect(got.has(id)).toBe(true)
    }
    // spot-check dynamic per-entity ids by prefix
    const all = [...got]
    expect(all.some((id) => id.startsWith('experience-') && id.endsWith('-org-required'))).toBe(true)
    expect(all.some((id) => id.includes('-ach-0-text-required'))).toBe(true)
    expect(all.some((id) => id.includes('-att-0-url-invalid'))).toBe(true)
    expect(all.some((id) => id.startsWith('projects-') && id.endsWith('-title-required'))).toBe(true)
    expect(all.some((id) => id.startsWith('skills-') && id.endsWith('-name-required'))).toBe(true)
    expect(all.some((id) => id.startsWith('education-') && id.endsWith('-degree-required'))).toBe(true)
    expect(all.some((id) => id.startsWith('certifications-') && id.endsWith('-name-required'))).toBe(true)
    expect(all.some((id) => id.startsWith('research-') && id.endsWith('-title-required'))).toBe(true)
    expect(all.some((id) => id.startsWith('metrics-') && id.endsWith('-label-required'))).toBe(true)
    expect(all.some((id) => id.startsWith('aiKnowledge-') && id.endsWith('-answer-required'))).toBe(true)
    // orphan-reference warnings
    expect(all.some((id) => id.includes('orphan-skill'))).toBe(true)
    expect(all.some((id) => id.includes('orphan-project'))).toBe(true)
    expect(all.some((id) => id.includes('orphan-metric'))).toBe(true)
    expect(all.some((id) => id.includes('orphan-exp'))).toBe(true)
    expect(all.some((id) => id.includes('orphan-rel'))).toBe(true)
  })

  it('flags length limits, format warnings, and non-canonical-host warnings', () => {
    const c = clone() as any
    c.profile.name = 'x'.repeat(81)
    c.profile.navDisplayName = 'y'.repeat(31)
    c.profile.title = 'z'.repeat(121)
    c.profile.email = 'bad@email' // has @ but no TLD → invalid arm
    c.profile.phone = '!!!'
    c.profile.summary = 'A short summary' // 10..40 → short warning
    c.profile.links = { linkedin: 'https://example.com', github: 'https://example.com' }
    c.projects[0].overview = 'tooshort'
    c.projects[0].githubUrl = 'https://example.com'
    c.projects[0].period = ''
    c.projects[0].problem = ''
    c.projects[0].approach = ''
    c.projects[0].result = ''
    c.research[0].description = 'shortdesc'
    c.aiKnowledge[0].answer = 'a'.repeat(601)
    c.aiKnowledge[0].questionPatterns = ['the']
    c.certifications[0].date = ''
    c.education[0].gpa = 'abc'
    const got = ids(validateConfigRegistry(c as PortfolioConfig))
    const all = [...got]
    for (const id of [
      'profile-name-max-length',
      'profile-nav-display-name-max-length',
      'profile-title-max-length',
      'profile-email-invalid',
      'profile-phone-unusual',
      'profile-summary-short-warn',
      'profile-linkedin-warn',
      'profile-github-warn',
    ]) {
      expect(got.has(id)).toBe(true)
    }
    expect(all.some((id) => id.endsWith('-overview-min-length'))).toBe(true)
    expect(all.some((id) => id.endsWith('-github-warn') && id.startsWith('projects-'))).toBe(true)
    expect(all.some((id) => id.endsWith('-period-warn'))).toBe(true)
    expect(all.some((id) => id.endsWith('-problem-warn'))).toBe(true)
    expect(all.some((id) => id.endsWith('-approach-warn'))).toBe(true)
    expect(all.some((id) => id.endsWith('-result-warn'))).toBe(true)
    expect(all.some((id) => id.endsWith('-desc-min-length'))).toBe(true)
    expect(all.some((id) => id.endsWith('-answer-long-warn'))).toBe(true)
    expect(all.some((id) => id.includes('-pat-0-broad-warn'))).toBe(true)
    expect(all.some((id) => id.endsWith('-date-warn'))).toBe(true)
    expect(all.some((id) => id.endsWith('-gpa-unusual'))).toBe(true)
  })

  it('duplicate entity IDs are flagged', () => {
    const c = clone() as any
    c.experience.push({ ...c.experience[0] })
    c.projects.push({ ...c.projects[0] })
    c.metrics.push({ ...c.metrics[0] })
    const all = [...ids(validateConfigRegistry(c as PortfolioConfig))]
    expect(all.some((id) => id.startsWith('experience-') && id.endsWith('-duplicate-id'))).toBe(true)
    expect(all.some((id) => id.startsWith('projects-') && id.endsWith('-duplicate-id'))).toBe(true)
    expect(all.some((id) => id.startsWith('metrics-') && id.endsWith('-duplicate-id'))).toBe(true)
  })
})

describe('coverage expansion — custom rule execution failure path', () => {
  beforeEach(() => clearCustomRules())
  afterAll(() => clearCustomRules())

  it('treats a throwing custom rule as an execution error', () => {
    const throwingRule: ValidationRule = {
      id: 'boom-rule',
      section: 'profile',
      severity: 'error',
      message: 'unused',
      validate: () => {
        throw new Error('kaboom')
      },
    }
    registerRule(throwingRule)
    const s = validateConfigRegistry(clone())
    expect(s.errors.some((e) => e.id === 'boom-rule-execution-error')).toBe(true)
    expect(s.isValid).toBe(false)
  })

  it('a passing custom rule adds no issue', () => {
    registerRule({
      id: 'always-pass',
      section: 'profile',
      severity: 'warning',
      message: 'unused',
      validate: () => true,
    })
    const s = validateConfigRegistry(clone())
    expect([...ids(s)].some((id) => id.startsWith('always-pass'))).toBe(false)
  })
})

describe('coverage expansion — index lookup helpers', () => {
  it('getFieldIssue / getFieldIssues / getSectionIssues resolve by entity, section, and field fallback', () => {
    const c = clone() as any
    c.profile.name = ''
    c.experience[0].organization = ''
    const summary = validateConfigRegistry(c as PortfolioConfig)
    const expItemId = summary.errors.find((e) => e.field === 'organization')?.itemId

    // entity-scoped lookup arm
    expect(getFieldIssue(summary, 'experience', 'organization', expItemId)?.field).toBe('organization')
    expect(getFieldIssues(summary, 'experience', 'organization', expItemId).length).toBeGreaterThan(0)
    // section.field arm
    expect(getFieldIssue(summary, 'profile', 'name')?.field).toBe('name')
    expect(getFieldIssues(summary, 'profile', 'name').length).toBeGreaterThan(0)
    // bare-field fallback arm with a non-matching section
    expect(getFieldIssues(summary, 'nonexistent-section', 'name').length).toBeGreaterThan(0)
    // empty fallback
    expect(getFieldIssue(summary, 'profile', 'no-such-field')).toBeUndefined()
    expect(getFieldIssues(summary, 'profile', 'no-such-field')).toEqual([])
    // section grouping
    const profileIssues = getSectionIssues(summary, 'profile')
    expect(profileIssues.errors.length).toBeGreaterThan(0)
    expect(getSectionIssues(summary, 'no-such-section')).toEqual({ errors: [], warnings: [] })
  })
})

describe('coverage expansion — exportImport paths', () => {
  const originalLocalStorage = globalThis.localStorage

  beforeEach(() => {
    globalThis.localStorage = {
      ...originalLocalStorage,
      store: {} as Record<string, string>,
      getItem(key: string) {
        return (this as any).store[key] ?? null
      },
      setItem(key: string, value: string) {
        ;(this as any).store[key] = value
      },
      removeItem(key: string) {
        delete (this as any).store[key]
      },
      clear() {
        ;(this as any).store = {}
      },
      key(index: number) {
        return Object.keys((this as any).store)[index] ?? null
      },
      length: 0,
    } as unknown as Storage
    clearDraft()
    clearQuarantine()
  })

  afterAll(() => {
    globalThis.localStorage = originalLocalStorage
  })

  it('exportConfig throws on invalid config', () => {
    const bad = clone()
    bad.profile.name = ''
    expect(() => exportConfig(bad)).toThrow('Cannot export invalid configuration')
  })

  it('saveDraftToLocalStorage throws on invalid config', () => {
    const bad = clone()
    bad.profile.email = ''
    expect(() => saveDraftToLocalStorage(bad)).toThrow('Cannot save invalid draft')
  })

  it('downloadConfig throws on invalid config and succeeds on valid config', () => {
    const bad = clone()
    bad.profile.title = ''
    expect(() => downloadConfig(bad)).toThrow('Cannot export invalid configuration')

    // stub the DOM/URL surface downloadConfig touches
    const origCreate = URL.createObjectURL
    const origRevoke = URL.revokeObjectURL
    let clicked = false
    ;(URL as any).createObjectURL = () => 'blob:mock'
    ;(URL as any).revokeObjectURL = () => {}
    const origCreateEl = document.createElement.bind(document)
    document.createElement = ((tag: string) => {
      const el = origCreateEl(tag) as HTMLAnchorElement
      if (tag === 'a') el.click = () => {
        clicked = true
      }
      return el
    }) as typeof document.createElement
    try {
      expect(() => downloadConfig(clone())).not.toThrow()
      expect(clicked).toBe(true)
    } finally {
      document.createElement = origCreateEl
      URL.createObjectURL = origCreate
      URL.revokeObjectURL = origRevoke
    }
  })

  it('parseImportedConfig rejects invalid JSON syntax', () => {
    expect(() => parseImportedConfig('{ not json')).toThrow('Invalid JSON syntax')
  })

  it('parseImportedConfig rejects unrecognized (non-object) payload', () => {
    expect(() => parseImportedConfig('42')).toThrow('Unrecognized configuration format')
  })

  it('parseImportedConfigDiagnostic: syntax error branch', () => {
    const r = parseImportedConfigDiagnostic('{ oops')
    expect(r.config).toBeUndefined()
    expect(r.syntaxError).toContain('Invalid JSON syntax')
    expect(r.summary.isValid).toBe(false)
    expect(r.summary.errors[0].id).toBe('import-syntax-error')
  })

  it('parseImportedConfigDiagnostic: unrecognized-format branch', () => {
    const r = parseImportedConfigDiagnostic('123')
    expect(r.config).toBeUndefined()
    expect(r.summary.errors[0].id).toBe('import-format-error')
  })

  it('parseImportedConfigDiagnostic: valid envelope + legacy raw branches', () => {
    const envelope = parseImportedConfigDiagnostic(exportConfig(clone()))
    expect(envelope.config).toBeDefined()
    expect(envelope.summary.isValid).toBe(true)

    const legacy = parseImportedConfigDiagnostic(JSON.stringify(clone()))
    expect(legacy.config).toBeDefined()
    expect(legacy.summary.isValid).toBe(true)
  })

  it('loadDraftFromLocalStorage ignores an unrecognized (non-migratable) envelope', () => {
    localStorage.setItem('kuldeep-portfolio-config-draft', JSON.stringify({ schemaVersion: 3, config: {} }))
    expect(loadDraftFromLocalStorage()).toBeNull()
    expect(getQuarantinedDraft()).toBeTruthy()
  })

  it('validateProfile reports required and malformed fields', () => {
    expect(validateProfile({ name: '', email: '' } as PortfolioConfig['profile'])).toEqual([
      'Name is required',
      'Email is required',
    ])
    expect(
      validateProfile({ name: 'K', email: 'no-at-sign' } as PortfolioConfig['profile']),
    ).toEqual(['Email must be valid'])
    expect(
      validateProfile({ name: 'K', email: 'k@example.com' } as PortfolioConfig['profile']),
    ).toEqual([])
  })
})

describe('coverage expansion — AI provider registry', () => {
  it('getAIProvider/setAIProvider swap the active provider', async () => {
    const original = getAIProvider()
    expect(original).toBeInstanceOf(ClientSearchProvider)

    const custom: AIProvider = { search: async (q: string) => `echo:${q}` }
    setAIProvider(custom)
    expect(getAIProvider()).toBe(custom)
    expect(await getAIProvider().search('hi')).toBe('echo:hi')

    setAIProvider(original)
    expect(getAIProvider()).toBe(original)
  })

  it('ServerLLMProvider is not configured', async () => {
    await expect(new ServerLLMProvider().search('x')).rejects.toThrow('not configured')
  })
})
