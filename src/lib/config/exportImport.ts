import type { PortfolioConfig } from '../../types'
import { portfolioConfig } from '../../config'
import {
  isValidSafeUrl,
  validateConfigRegistry,
  type ValidationIssue,
  type ValidationSummary,
  type ValidationSeverity,
} from './validationRegistry'

export {
  isValidSafeUrl,
  validateConfigRegistry,
  type ValidationIssue,
  type ValidationSummary,
  type ValidationSeverity,
}

const STORAGE_KEY = 'kuldeep-portfolio-config-draft'
const QUARANTINE_KEY = 'kuldeep-portfolio-config-draft-corrupt'
const CURRENT_SCHEMA_VERSION = 2

export interface StoredDraft {
  schemaVersion: number
  savedAt: string
  config: PortfolioConfig
}

function createStoredDraft(config: PortfolioConfig): StoredDraft {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    config,
  }
}

function migrateDraft(raw: unknown): PortfolioConfig | null {
  if (!raw || typeof raw !== 'object') return null

  const obj = raw as Record<string, unknown>

  if ('schemaVersion' in obj) {
    const version = obj.schemaVersion as number
    if (version === CURRENT_SCHEMA_VERSION && 'config' in obj) {
      return obj.config as PortfolioConfig
    }
    if (version === 1 && 'config' in obj) {
      return obj.config as PortfolioConfig
    }
    return null
  }

  if ('profile' in obj || 'experience' in obj || 'projects' in obj) {
    return obj as unknown as PortfolioConfig
  }

  return null
}

export function exportConfig(config: PortfolioConfig = portfolioConfig): string {
  const summary = validateConfigRegistry(config)
  if (!summary.isValid) {
    throw new Error(`Cannot export invalid configuration:\n${summary.errors.map((e) => e.message).join('\n')}`)
  }
  return JSON.stringify(createStoredDraft(config), null, 2)
}

export function downloadConfig(config: PortfolioConfig = portfolioConfig): void {
  const summary = validateConfigRegistry(config)
  if (!summary.isValid) {
    throw new Error(`Cannot export invalid configuration:\n${summary.errors.map((e) => e.message).join('\n')}`)
  }
  const blob = new Blob([exportConfig(config)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'portfolio-config.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function saveDraftToLocalStorage(config: PortfolioConfig): void {
  const summary = validateConfigRegistry(config)
  if (!summary.isValid) {
    throw new Error(`Cannot save invalid draft:\n${summary.errors.map((e) => e.message).join('\n')}`)
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createStoredDraft(config), null, 2))
  } catch {
  }
}

export function loadDraftFromLocalStorage(): PortfolioConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      quarantineDraft(raw)
      return null
    }

    const migrated = migrateDraft(parsed)
    if (!migrated) {
      quarantineDraft(raw)
      return null
    }

    const errors = validateFullConfig(migrated)
    if (errors.length > 0) {
      quarantineDraft(raw)
      return null
    }

    return migrated
  } catch {
    return null
  }
}

function quarantineDraft(raw: unknown): void {
  try {
    const payload = typeof raw === 'string' ? raw : JSON.stringify(raw)
    localStorage.setItem(QUARANTINE_KEY, payload)
  } catch {
  }
}

export function getQuarantinedDraft(): string | null {
  try {
    return localStorage.getItem(QUARANTINE_KEY)
  } catch {
    return null
  }
}

export function clearQuarantine(): void {
  try {
    localStorage.removeItem(QUARANTINE_KEY)
  } catch {
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}

/**
 * Validates the full PortfolioConfig and returns an array of blocking error messages.
 * Preserves 100% backward compatibility with existing tests and call sites.
 */
export function validateFullConfig(config: PortfolioConfig): string[] {
  const summary = validateConfigRegistry(config)
  return summary.errors.map((e) => e.message)
}

/**
 * Diagnostic parser for imported JSON configurations.
 * Guarantees fail-closed intake: rejects syntax errors and validation errors with detailed diagnostics.
 */
export function parseImportedConfig(json: string): PortfolioConfig {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (err: any) {
    throw new Error(`Validation failed: Invalid JSON syntax - ${err?.message || 'Syntax error'}`)
  }

  let targetConfig: PortfolioConfig | null = null

  // Handle versioned envelope format
  if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed && 'config' in parsed) {
    const envelope = parsed as StoredDraft
    targetConfig = envelope.config
  } else if (parsed && typeof parsed === 'object') {
    // Handle legacy raw config format
    targetConfig = parsed as PortfolioConfig
  }

  if (!targetConfig) {
    throw new Error('Validation failed: Unrecognized configuration format. Payload must contain a valid portfolio configuration or versioned envelope.')
  }

  const summary = validateConfigRegistry(targetConfig)
  if (!summary.isValid) {
    throw new Error(`Validation failed:\n${summary.errors.map((e) => e.message).join('\n')}`)
  }

  return targetConfig
}

export interface DiagnosticImportResult {
  config?: PortfolioConfig
  summary: ValidationSummary
  syntaxError?: string
}

export function parseImportedConfigDiagnostic(json: string): DiagnosticImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (err: any) {
    const syntaxError = `Invalid JSON syntax: ${err?.message || 'Syntax error'}`
    const fakeSummary: ValidationSummary = {
      isValid: false,
      errors: [
        {
          id: 'import-syntax-error',
          section: 'profile',
          severity: 'error',
          message: syntaxError,
          remediation: 'Verify file syntax with a JSON linter.',
        },
      ],
      warnings: [],
      errorCount: 1,
      warningCount: 0,
      issuesBySection: {},
      issuesByEntity: {},
      issuesByField: {},
    }
    return {
      summary: fakeSummary,
      syntaxError,
    }
  }

  let candidate: PortfolioConfig | null = null
  if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed && 'config' in parsed) {
    const envelope = parsed as StoredDraft
    candidate = envelope.config
  } else if (parsed && typeof parsed === 'object') {
    candidate = parsed as PortfolioConfig
  }

  if (!candidate) {
    const formatError =
      'Unrecognized configuration format. Payload must contain a valid portfolio configuration or versioned envelope.'
    const fakeSummary: ValidationSummary = {
      isValid: false,
      errors: [
        {
          id: 'import-format-error',
          section: 'profile',
          severity: 'error',
          message: formatError,
          remediation: 'Export a valid config from the CMS to inspect expected schema format.',
        },
      ],
      warnings: [],
      errorCount: 1,
      warningCount: 0,
      issuesBySection: {},
      issuesByEntity: {},
      issuesByField: {},
    }
    return {
      summary: fakeSummary,
      syntaxError: formatError,
    }
  }

  const summary = validateConfigRegistry(candidate)
  return {
    config: candidate,
    summary,
  }
}

export function validateProfile(profile: PortfolioConfig['profile']): string[] {
  const errors: string[] = []
  if (!profile.name?.trim()) errors.push('Name is required')
  if (!profile.email?.trim()) errors.push('Email is required')
  else if (!profile.email.includes('@')) errors.push('Email must be valid')
  return errors
}

