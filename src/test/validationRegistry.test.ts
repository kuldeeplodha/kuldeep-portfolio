import { describe, expect, it, beforeEach } from 'vitest'
import { portfolioConfig } from '../config'
import {
  isValidSafeUrl,
  isValidEmail,
  isValidPhone,
  isValidCssColor,
  isValidGpa,
  validateConfigRegistry,
  registerRule,
  clearCustomRules,
  type ValidationRule,
} from '../lib/config/validationRegistry'
import {
  exportConfig,
  parseImportedConfig,
  saveDraftToLocalStorage,
} from '../lib/config/exportImport'
import { validateDraft, isDraftValid } from '../lib/admin/configReducer'
import type { PortfolioConfig } from '../types'

describe('validationRegistry', () => {
  const clone = (): PortfolioConfig => JSON.parse(JSON.stringify(portfolioConfig))

  beforeEach(() => {
    clearCustomRules()
  })

  describe('Golden file validation against shipped portfolioConfig', () => {
    it('evaluates shipped portfolioConfig with 0 errors and isValid === true', () => {
      const summary = validateConfigRegistry(portfolioConfig)
      expect(summary.isValid).toBe(true)
      expect(summary.errors).toEqual([])
      expect(summary.errorCount).toBe(0)
    })
  })

  describe('URL safety validation (isValidSafeUrl)', () => {
    it('accepts valid relative URLs', () => {
      expect(isValidSafeUrl('/images/avatar.jpg')).toBe(true)
      expect(isValidSafeUrl('/documents/resume.pdf')).toBe(true)
    })

    it('accepts valid https and http URLs', () => {
      expect(isValidSafeUrl('https://github.com/kuldeeplodha')).toBe(true)
      expect(isValidSafeUrl('http://localhost:3000')).toBe(true)
    })

    it('rejects protocol-relative URLs', () => {
      expect(isValidSafeUrl('//evil.com/script.js')).toBe(false)
    })

    it('rejects javascript, data, and vbscript URIs', () => {
      expect(isValidSafeUrl('javascript:alert(1)')).toBe(false)
      expect(isValidSafeUrl('JAVASCRIPT:alert(1)')).toBe(false)
      expect(isValidSafeUrl('  javascript:alert(1)  ')).toBe(false)
      expect(isValidSafeUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(false)
      expect(isValidSafeUrl('vbscript:msgbox(1)')).toBe(false)
    })

    it('treats empty or null URLs as valid (optional fields)', () => {
      expect(isValidSafeUrl('')).toBe(true)
      expect(isValidSafeUrl(undefined)).toBe(true)
      expect(isValidSafeUrl(null)).toBe(true)
    })
  })

  describe('Helper validators', () => {
    it('validates email format', () => {
      expect(isValidEmail('kuldeeplodha04@gmail.com')).toBe(true)
      expect(isValidEmail('test@example.co.uk')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('validates phone format', () => {
      expect(isValidPhone('+917987507342')).toBe(true)
      expect(isValidPhone('+1 (555) 123-4567')).toBe(true)
      expect(isValidPhone('1234567')).toBe(true)
      expect(isValidPhone('abc')).toBe(false)
      expect(isValidPhone('123')).toBe(false) // too short
    })

    it('validates CSS color tokens', () => {
      expect(isValidCssColor('#fff')).toBe(true)
      expect(isValidCssColor('#1a2332')).toBe(true)
      expect(isValidCssColor('#1a2332ff')).toBe(true)
      expect(isValidCssColor('rgb(255, 0, 0)')).toBe(true)
      expect(isValidCssColor('rgba(255, 0, 0, 0.5)')).toBe(true)
      expect(isValidCssColor('hsl(200, 50%, 50%)')).toBe(true)
      expect(isValidCssColor('not-a-color')).toBe(false)
      expect(isValidCssColor('#gg1234')).toBe(false)
    })

    it('validates GPA format', () => {
      expect(isValidGpa('3.8')).toBe(true)
      expect(isValidGpa('3.85 / 4.0')).toBe(true)
      expect(isValidGpa('4.0')).toBe(true)
      expect(isValidGpa('5.2')).toBe(false) // > 4.0 max
      expect(isValidGpa('invalid')).toBe(false)
    })
  })

  describe('Two-tier error vs warning model', () => {
    it('flags fatal blocking errors and sets isValid to false', () => {
      const cfg = clone()
      cfg.profile.name = ''
      cfg.profile.email = 'not-an-email'

      const summary = validateConfigRegistry(cfg)
      expect(summary.isValid).toBe(false)
      expect(summary.errorCount).toBeGreaterThanOrEqual(2)
      expect(summary.errors.some((e) => e.field === 'name')).toBe(true)
      expect(summary.errors.some((e) => e.field === 'email')).toBe(true)
    })

    it('flags non-blocking warnings while preserving isValid === true if no errors', () => {
      const cfg = clone()
      // Remove navDisplayName -> triggers warning "Profile: Navbar name is empty; will fall back to full name."
      cfg.profile.navDisplayName = ''
      // Provide short summary (between 10 and 39 chars)
      cfg.profile.summary = 'Short summary text here.'

      const summary = validateConfigRegistry(cfg)
      expect(summary.isValid).toBe(true) // Warnings do not block validity!
      expect(summary.errorCount).toBe(0)
      expect(summary.warningCount).toBeGreaterThan(0)
      expect(summary.warnings.some((w) => w.field === 'navDisplayName')).toBe(true)
      expect(summary.warnings.some((w) => w.field === 'summary')).toBe(true)
    })

    it('detects orphaned role cross-references as warnings', () => {
      const cfg = clone()
      cfg.roles.software.highlightedSkillIds.push('non-existent-skill-id')
      cfg.roles.software.highlightedProjectIds.push('non-existent-project-id')

      const summary = validateConfigRegistry(cfg)
      expect(summary.isValid).toBe(true)
      expect(summary.warningCount).toBeGreaterThanOrEqual(2)
      expect(summary.warnings.some((w) => w.message.includes('non-existent-skill-id'))).toBe(true)
      expect(summary.warnings.some((w) => w.message.includes('non-existent-project-id'))).toBe(true)
    })
  })

  describe('O(1) Rendering Indexes (issuesBySection, issuesByEntity, issuesByField)', () => {
    it('populates lookup maps for instant field, entity, and section queries', () => {
      const cfg = clone()
      const targetExp = cfg.experience[0]
      targetExp.organization = ''
      cfg.profile.name = ''

      const summary = validateConfigRegistry(cfg)

      // Section lookup
      expect(summary.issuesBySection['profile']).toBeDefined()
      expect(summary.issuesBySection['experience']).toBeDefined()

      // Entity lookup
      expect(summary.issuesByEntity[targetExp.id]).toBeDefined()
      expect(summary.issuesByEntity[targetExp.id].some((i) => i.field === 'organization')).toBe(true)

      // Field lookup (direct, section.field, and entity.field)
      expect(summary.issuesByField['name']).toBeDefined()
      expect(summary.issuesByField['profile.name']).toBeDefined()
      expect(summary.issuesByField['organization']).toBeDefined()
      expect(summary.issuesByField[`${targetExp.id}.organization`]).toBeDefined()
    })
  })

  describe('Fail-closed import and export', () => {
    it('exportConfig throws when configuration has blocking errors', () => {
      const badConfig = clone()
      badConfig.profile.name = ''
      expect(() => exportConfig(badConfig)).toThrow(/Cannot export invalid configuration/)
    })

    it('saveDraftToLocalStorage throws when configuration has blocking errors', () => {
      const badConfig = clone()
      badConfig.projects[0].title = ''
      expect(() => saveDraftToLocalStorage(badConfig)).toThrow(/Cannot save invalid draft/)
    })

    it('parseImportedConfig provides detailed diagnostics on invalid JSON or validation failure', () => {
      expect(() => parseImportedConfig('{ malformed json }')).toThrow(/Invalid JSON syntax/)

      const badConfig = clone()
      badConfig.profile.email = 'invalid-email'
      expect(() => parseImportedConfig(JSON.stringify(badConfig))).toThrow(/Validation failed/)
    })
  })

  describe('Extensible custom rule registry', () => {
    it('registers and executes custom validation rules', () => {
      const customRule: ValidationRule = {
        id: 'profile-custom-check',
        section: 'profile',
        field: 'name',
        severity: 'error',
        message: 'Name cannot be John Doe',
        remediation: 'Use real name.',
        validate: (profile) => profile.name !== 'John Doe',
      }
      registerRule(customRule)

      const cfg = clone()
      cfg.profile.name = 'John Doe'

      const summary = validateConfigRegistry(cfg)
      expect(summary.isValid).toBe(false)
      expect(summary.errors.some((e) => e.id === 'profile-custom-check')).toBe(true)

      clearCustomRules()
      const cleanSummary = validateConfigRegistry(cfg)
      expect(cleanSummary.errors.some((e) => e.id === 'profile-custom-check')).toBe(false)
    })
  })

  describe('configReducer validation integration', () => {
    it('validateDraft and isDraftValid reflect configuration validity', () => {
      const cleanConfig = clone()
      expect(isDraftValid(cleanConfig)).toBe(true)

      const summary = validateDraft(cleanConfig)
      expect(summary.isValid).toBe(true)
      expect(summary.errors).toHaveLength(0)

      const invalidConfig = clone()
      invalidConfig.profile.name = ''
      expect(isDraftValid(invalidConfig)).toBe(false)
      expect(validateDraft(invalidConfig).isValid).toBe(false)
    })
  })
})
