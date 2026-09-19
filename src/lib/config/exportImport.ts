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

// saveDraftToLocalStorage / loadDraftFromLocalStorage / clearDraft /
// getQuarantinedDraft / clearQuarantine were removed here (CMS-RESTORE-
// FRIENDLY-PANEL): localStorage is no longer a persistence path for
// config drafts — that was the original Save-Draft-does-nothing bug
// (PR #78 QA). Draft/publish now goes through updateAdminContent()
// (src/lib/admin/siteContent.ts) straight to the DB, loaded fresh from
// getAdminContent() on every /admin mount.

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

