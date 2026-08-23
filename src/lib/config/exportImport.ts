import type { PortfolioConfig } from '../../types'
import { portfolioConfig } from '../../config'

const STORAGE_KEY = 'kuldeep-portfolio-config-draft'
const QUARANTINE_KEY = 'kuldeep-portfolio-config-draft-corrupt'
const CURRENT_SCHEMA_VERSION = 2

export interface StoredDraft {
  schemaVersion: number
  savedAt: string
  config: PortfolioConfig
}

export function isValidSafeUrl(url: string): boolean {
  if (!url) return true;
  if (url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
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
  return JSON.stringify(createStoredDraft(config), null, 2)
}

export function downloadConfig(config: PortfolioConfig = portfolioConfig): void {
  const blob = new Blob([exportConfig(config)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'portfolio-config.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function saveDraftToLocalStorage(config: PortfolioConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, exportConfig(config))
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

export function validateFullConfig(config: PortfolioConfig): string[] {
  const errors: string[] = []
  
  if (!config.profile) {
    errors.push('Profile is missing')
  } else {
    if (!config.profile.name?.trim()) errors.push('Profile: Name is required')
    if (!config.profile.email?.trim()) {
      errors.push('Profile: Email is required')
    } else if (!config.profile.email.includes('@')) {
      errors.push('Profile: Email must be valid')
    }
    if (config.profile.avatarUrl && !isValidSafeUrl(config.profile.avatarUrl)) {
      errors.push('Profile: Invalid avatar URL')
    }
    if (config.profile.links) {
      if (config.profile.links.linkedin && !isValidSafeUrl(config.profile.links.linkedin)) {
        errors.push('Profile: Invalid LinkedIn URL')
      }
      if (config.profile.links.github && !isValidSafeUrl(config.profile.links.github)) {
        errors.push('Profile: Invalid GitHub URL')
      }
    }
  }

  if (!config.roles || typeof config.roles !== 'object') {
    errors.push('Roles section is missing or invalid')
  }
  
  if (!config.themes || typeof config.themes !== 'object') {
    errors.push('Themes section is missing or invalid')
  }

  if (Array.isArray(config.experience)) {
    config.experience.forEach((exp, idx) => {
      const prefix = `Experience #${idx + 1} (${exp.role || 'unnamed'}):`
      if (!exp.organization?.trim()) errors.push(`${prefix} Organization is required`)
      if (!exp.role?.trim()) errors.push(`${prefix} Role is required`)
      if (!exp.period?.trim()) errors.push(`${prefix} Period is required`)
      if (exp.imageUrl && !isValidSafeUrl(exp.imageUrl)) errors.push(`${prefix} Invalid image URL`)
      if (Array.isArray(exp.attachments)) {
        exp.attachments.forEach((att, aIdx) => {
          if (!isValidSafeUrl(att.url)) errors.push(`${prefix} Invalid attachment URL at index ${aIdx}`)
        })
      }
    })
  } else {
    errors.push('Experience section must be an array')
  }

  if (Array.isArray(config.projects)) {
    config.projects.forEach((proj, idx) => {
      const prefix = `Project #${idx + 1} (${proj.title || 'unnamed'}):`
      if (!proj.title?.trim()) errors.push(`${prefix} Title is required`)
      if (!proj.overview?.trim()) errors.push(`${prefix} Overview is required`)
      if (proj.imageUrl && !isValidSafeUrl(proj.imageUrl)) errors.push(`${prefix} Invalid image URL`)
      if (proj.githubUrl && !isValidSafeUrl(proj.githubUrl)) errors.push(`${prefix} Invalid GitHub URL`)
      if (Array.isArray(proj.attachments)) {
        proj.attachments.forEach((att, aIdx) => {
          if (!isValidSafeUrl(att.url)) errors.push(`${prefix} Invalid attachment URL at index ${aIdx}`)
        })
      }
    })
  } else {
    errors.push('Projects section must be an array')
  }

  if (Array.isArray(config.skills)) {
    config.skills.forEach((cat, idx) => {
      const prefix = `Skill Category #${idx + 1} (${cat.name || 'unnamed'}):`
      if (!cat.name?.trim()) errors.push(`${prefix} Name is required`)
      if (Array.isArray(cat.skills)) {
        cat.skills.forEach((skill, sIdx) => {
          if (!skill.name?.trim()) errors.push(`${prefix} Skill #${sIdx + 1} name is required`)
        })
      } else {
        errors.push(`${prefix} skills must be an array`)
      }
    })
  } else {
    errors.push('Skills section must be an array')
  }

  if (Array.isArray(config.education)) {
    config.education.forEach((edu, idx) => {
      const prefix = `Education #${idx + 1} (${edu.degree || 'unnamed'}):`
      if (!edu.degree?.trim()) errors.push(`${prefix} Degree is required`)
      if (!edu.institution?.trim()) errors.push(`${prefix} Institution is required`)
      if (!edu.period?.trim()) errors.push(`${prefix} Period is required`)
    })
  } else {
    errors.push('Education section must be an array')
  }

  if (Array.isArray(config.certifications)) {
    config.certifications.forEach((cert, idx) => {
      const prefix = `Certification #${idx + 1} (${cert.name || 'unnamed'}):`
      if (!cert.name?.trim()) errors.push(`${prefix} Name is required`)
      if (!cert.issuer?.trim()) errors.push(`${prefix} Issuer is required`)
      if (cert.url && !isValidSafeUrl(cert.url)) errors.push(`${prefix} Invalid URL`)
    })
  } else {
    errors.push('Certifications section must be an array')
  }

  if (Array.isArray(config.research)) {
    config.research.forEach((res, idx) => {
      const prefix = `Research #${idx + 1} (${res.title || 'unnamed'}):`
      if (!res.title?.trim()) errors.push(`${prefix} Title is required`)
      if (!res.description?.trim()) errors.push(`${prefix} Description is required`)
    })
  } else {
    errors.push('Research section must be an array')
  }

  if (Array.isArray(config.metrics)) {
    config.metrics.forEach((metric, idx) => {
      const prefix = `Metric #${idx + 1} (${metric.label || 'unnamed'}):`
      if (!metric.label?.trim()) errors.push(`${prefix} Label is required`)
      if (!metric.value?.trim()) errors.push(`${prefix} Value is required`)
    })
  } else {
    errors.push('Metrics section must be an array')
  }

  if (Array.isArray(config.aiKnowledge)) {
    config.aiKnowledge.forEach((entry, idx) => {
      const prefix = `AI Knowledge Entry #${idx + 1}:`
      if (!entry.answer?.trim()) errors.push(`${prefix} Answer is required`)
      if (!Array.isArray(entry.questionPatterns) || entry.questionPatterns.length === 0) {
        errors.push(`${prefix} At least one question pattern is required`)
      }
    })
  } else {
    errors.push('AI Knowledge section must be an array')
  }

  return errors
}

export function parseImportedConfig(json: string): PortfolioConfig {
  const parsed = JSON.parse(json) as unknown
  
  // Handle versioned envelope format
  if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed && 'config' in parsed) {
    const envelope = parsed as StoredDraft
    const errors = validateFullConfig(envelope.config)
    if (errors.length > 0) {
      throw new Error(`Validation failed:\n${errors.join('\n')}`)
    }
    return envelope.config
  }
  
  // Handle legacy raw config format
  const legacyConfig = parsed as PortfolioConfig
  const errors = validateFullConfig(legacyConfig)
  if (errors.length > 0) {
    throw new Error(`Validation failed:\n${errors.join('\n')}`)
  }
  return legacyConfig
}

export function validateProfile(profile: PortfolioConfig['profile']): string[] {
  const errors: string[] = []
  if (!profile.name.trim()) errors.push('Name is required')
  if (!profile.email.trim()) errors.push('Email is required')
  if (!profile.email.includes('@')) errors.push('Email must be valid')
  return errors
}