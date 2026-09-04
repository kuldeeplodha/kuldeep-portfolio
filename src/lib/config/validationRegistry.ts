import type {
  PortfolioConfig,
  ThemeTokens,
  RoleId,
  ResumeVariant,
} from '../../types'

export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue {
  id: string
  section: keyof PortfolioConfig
  itemId?: string
  field?: string
  severity: ValidationSeverity
  message: string
  remediation?: string
}

export interface ValidationSummary {
  isValid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  errorCount: number
  warningCount: number
  issuesBySection: Record<string, ValidationIssue[]>
  issuesByEntity: Record<string, ValidationIssue[]>
  issuesByField: Record<string, ValidationIssue[]>
}

export interface ValidationRule<T = any> {
  id: string
  section: keyof PortfolioConfig
  field?: string
  severity: ValidationSeverity
  message: string
  remediation?: string
  validate: (target: T, rootConfig: PortfolioConfig) => boolean
}

const REQUIRED_ROLE_IDS: RoleId[] = ['software', 'ai', 'data', 'system']
const VALID_RESUME_VARIANTS: ResumeVariant[] = ['software', 'ai_ml', 'data_analyst']
const VALID_LAYOUT_VARIANTS = ['terminal', 'neural', 'dashboard', 'hybrid']

/**
 * Validates whether a given URL is safe (http, https, or valid relative path).
 * Disallows javascript:, data:, vbscript:, protocol-relative //, and malformed inputs.
 */
export function isValidSafeUrl(url: string | undefined | null): boolean {
  if (!url) return true
  const trimmed = url.trim()
  if (!trimmed) return true
  // Allow relative paths starting with '/' but not protocol-relative '//'
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function isValidPhone(phone: string | undefined | null): boolean {
  if (!phone) return true
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/
  return phoneRegex.test(phone.trim())
}

export function isValidCssColor(color: string | undefined | null): boolean {
  if (!color || typeof color !== 'string') return false
  const trimmed = color.trim()
  if (!trimmed) return false
  // Hex color (#rgb, #rgba, #rrggbb, #rrggbbaa)
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) return true
  // rgb(...) or rgba(...)
  if (/^rgba?\(\s*[\d.%\s,/-]+\)$/i.test(trimmed)) return true
  // hsl(...) or hsla(...)
  if (/^hsla?\(\s*[\d.%\s,/-]+\)$/i.test(trimmed)) return true
  return false
}

export function isValidGpa(gpa: string | undefined | null): boolean {
  if (!gpa || !gpa.trim()) return true
  const trimmed = gpa.trim()
  const match = trimmed.match(/^([\d.]+)(?:\s*\/\s*([\d.]+))?$/)
  if (!match) return false
  const val = parseFloat(match[1])
  const max = match[2] ? parseFloat(match[2]) : 4.0
  if (isNaN(val) || isNaN(max)) return false
  if (val < 0 || val > max) return false
  return true
}

// Extensible registry array for custom rules
const customRules: ValidationRule[] = []

export function registerRule(rule: ValidationRule): void {
  customRules.push(rule)
}

export function clearCustomRules(): void {
  customRules.length = 0
}

/**
 * Evaluates the entire PortfolioConfig using the declarative validation registry.
 * Returns a structured ValidationSummary with errors, warnings, and O(1) lookup indexes.
 */
export function validateConfigRegistry(config: PortfolioConfig): ValidationSummary {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const issuesBySection: Record<string, ValidationIssue[]> = {}
  const issuesByEntity: Record<string, ValidationIssue[]> = {}
  const issuesByField: Record<string, ValidationIssue[]> = {}

  function pushIssue(issue: ValidationIssue) {
    if (issue.severity === 'error') {
      errors.push(issue)
    } else {
      warnings.push(issue)
    }

    // Index by section
    if (!issuesBySection[issue.section]) {
      issuesBySection[issue.section] = []
    }
    issuesBySection[issue.section].push(issue)

    // Index by entity
    if (issue.itemId) {
      if (!issuesByEntity[issue.itemId]) {
        issuesByEntity[issue.itemId] = []
      }
      issuesByEntity[issue.itemId].push(issue)
    }

    // Index by field
    if (issue.field) {
      if (!issuesByField[issue.field]) {
        issuesByField[issue.field] = []
      }
      issuesByField[issue.field].push(issue)

      const sectionField = `${issue.section}.${issue.field}`
      if (!issuesByField[sectionField]) {
        issuesByField[sectionField] = []
      }
      issuesByField[sectionField].push(issue)

      if (issue.itemId) {
        const entityField = `${issue.itemId}.${issue.field}`
        if (!issuesByField[entityField]) {
          issuesByField[entityField] = []
        }
        issuesByField[entityField].push(issue)
      }
    }
  }

  // --- 1. PROFILE SECTION ---
  if (!config.profile) {
    pushIssue({
      id: 'profile-missing',
      section: 'profile',
      severity: 'error',
      message: 'Profile is missing',
      remediation: 'Provide profile configuration object.',
    })
  } else {
    const prof = config.profile

    // name
    if (!prof.name?.trim()) {
      pushIssue({
        id: 'profile-name-required',
        section: 'profile',
        field: 'name',
        severity: 'error',
        message: 'Profile: Name is required',
        remediation: 'Enter full personal name.',
      })
    } else if (prof.name.trim().length > 80) {
      pushIssue({
        id: 'profile-name-max-length',
        section: 'profile',
        field: 'name',
        severity: 'error',
        message: 'Profile: Name must be 80 characters or fewer',
        remediation: 'Shorten full personal name.',
      })
    }

    // navDisplayName
    if (prof.navDisplayName?.trim() && prof.navDisplayName.trim().length > 30) {
      pushIssue({
        id: 'profile-nav-display-name-max-length',
        section: 'profile',
        field: 'navDisplayName',
        severity: 'error',
        message: 'Profile: Navbar name must be 30 characters or fewer',
        remediation: 'Shorten display name to preserve single-line mobile navbar.',
      })
    } else if (!prof.navDisplayName?.trim()) {
      pushIssue({
        id: 'profile-nav-display-name-empty-warn',
        section: 'profile',
        field: 'navDisplayName',
        severity: 'warning',
        message: 'Profile: Navbar name is empty; will fall back to full name.',
        remediation: "Set a short name (e.g. 'K. Lodha') for compact mobile display.",
      })
    }

    // title
    if (!prof.title?.trim()) {
      pushIssue({
        id: 'profile-title-required',
        section: 'profile',
        field: 'title',
        severity: 'error',
        message: 'Profile: Professional title is required',
        remediation: "Provide a core title (e.g. 'Software Engineer').",
      })
    } else if (prof.title.trim().length > 120) {
      pushIssue({
        id: 'profile-title-max-length',
        section: 'profile',
        field: 'title',
        severity: 'error',
        message: 'Profile: Title must be 120 characters or fewer',
        remediation: 'Shorten professional title.',
      })
    }

    // location
    if (!prof.location?.trim()) {
      pushIssue({
        id: 'profile-location-required',
        section: 'profile',
        field: 'location',
        severity: 'error',
        message: 'Profile: Location is required',
        remediation: "Enter location (e.g. 'San Francisco, CA').",
      })
    }

    // email
    if (!prof.email?.trim()) {
      pushIssue({
        id: 'profile-email-required',
        section: 'profile',
        field: 'email',
        severity: 'error',
        message: 'Profile: Email is required',
        remediation: 'Provide a valid contact email.',
      })
    } else if (!prof.email.includes('@') || !isValidEmail(prof.email)) {
      pushIssue({
        id: 'profile-email-invalid',
        section: 'profile',
        field: 'email',
        severity: 'error',
        message: 'Profile: Email must be valid',
        remediation: 'Provide a valid contact email address.',
      })
    }

    // phone
    if (prof.phone?.trim() && !isValidPhone(prof.phone)) {
      pushIssue({
        id: 'profile-phone-unusual',
        section: 'profile',
        field: 'phone',
        severity: 'warning',
        message: 'Profile: Phone number format appears unusual.',
        remediation: 'Use standard international format (+1 ...).',
      })
    }

    // summary
    if (!prof.summary?.trim() || prof.summary.trim().length < 10) {
      pushIssue({
        id: 'profile-summary-required',
        section: 'profile',
        field: 'summary',
        severity: 'error',
        message: 'Profile: Summary must be at least 10 characters',
        remediation: 'Provide a concise professional summary.',
      })
    } else if (prof.summary.trim().length < 40) {
      pushIssue({
        id: 'profile-summary-short-warn',
        section: 'profile',
        field: 'summary',
        severity: 'warning',
        message: 'Profile: Summary is very short.',
        remediation: 'Elaborate on key background and expertise.',
      })
    }

    // avatarUrl
    if (prof.avatarUrl && !isValidSafeUrl(prof.avatarUrl)) {
      pushIssue({
        id: 'profile-avatar-url-invalid',
        section: 'profile',
        field: 'avatarUrl',
        severity: 'error',
        message: 'Profile: Invalid avatar URL',
        remediation: 'Use /images/... or a valid secure HTTPS link.',
      })
    }

    // links
    if (prof.links) {
      if (prof.links.linkedin && !isValidSafeUrl(prof.links.linkedin)) {
        pushIssue({
          id: 'profile-linkedin-invalid',
          section: 'profile',
          field: 'links.linkedin',
          severity: 'error',
          message: 'Profile: Invalid LinkedIn URL',
          remediation: 'Provide a valid HTTPS link.',
        })
      } else if (prof.links.linkedin?.trim() && !prof.links.linkedin.includes('linkedin.com/')) {
        pushIssue({
          id: 'profile-linkedin-warn',
          section: 'profile',
          field: 'links.linkedin',
          severity: 'warning',
          message: 'Profile: LinkedIn link does not appear to point to linkedin.com.',
          remediation: 'Verify the LinkedIn profile URL.',
        })
      }

      if (prof.links.github && !isValidSafeUrl(prof.links.github)) {
        pushIssue({
          id: 'profile-github-invalid',
          section: 'profile',
          field: 'links.github',
          severity: 'error',
          message: 'Profile: Invalid GitHub URL',
          remediation: 'Provide a valid HTTPS link.',
        })
      } else if (prof.links.github?.trim() && !prof.links.github.includes('github.com/')) {
        pushIssue({
          id: 'profile-github-warn',
          section: 'profile',
          field: 'links.github',
          severity: 'warning',
          message: 'Profile: GitHub link does not appear to point to github.com.',
          remediation: 'Verify the GitHub account URL.',
        })
      }
    }
  }

  // Collect all valid IDs across sections for reference checks
  const existingSkillIds = new Set<string>()
  if (Array.isArray(config.skills)) {
    config.skills.forEach((cat) => {
      if (Array.isArray(cat.skills)) {
        cat.skills.forEach((s) => {
          if (s?.id) existingSkillIds.add(s.id)
        })
      }
    })
  }

  const existingProjectIds = new Set<string>()
  if (Array.isArray(config.projects)) {
    config.projects.forEach((p) => {
      if (p?.id) existingProjectIds.add(p.id)
    })
  }

  const existingMetricIds = new Set<string>()
  if (Array.isArray(config.metrics)) {
    config.metrics.forEach((m) => {
      if (m?.id) existingMetricIds.add(m.id)
    })
  }

  const existingExperienceIds = new Set<string>()
  if (Array.isArray(config.experience)) {
    config.experience.forEach((e) => {
      if (e?.id) existingExperienceIds.add(e.id)
    })
  }

  // --- 2. ROLES SECTION ---
  if (!config.roles || typeof config.roles !== 'object') {
    pushIssue({
      id: 'roles-missing',
      section: 'roles',
      severity: 'error',
      message: 'Roles section is missing or invalid',
      remediation: 'Ensure roles definition is an object.',
    })
  } else {
    for (const roleId of REQUIRED_ROLE_IDS) {
      const role = config.roles[roleId]
      if (!role) {
        pushIssue({
          id: `roles-missing-${roleId}`,
          section: 'roles',
          itemId: roleId,
          severity: 'error',
          message: `Roles: Missing required role definition for '${roleId}'`,
          remediation: 'Ensure all 4 roles exist.',
        })
        continue
      }

      if (!role.label?.trim()) {
        pushIssue({
          id: `roles-${roleId}-label-required`,
          section: 'roles',
          itemId: roleId,
          field: 'label',
          severity: 'error',
          message: `Roles (${roleId}): Role label is required`,
          remediation: 'Name the role persona.',
        })
      }

      if (!role.themeId || !config.themes?.[role.themeId]) {
        pushIssue({
          id: `roles-${roleId}-invalid-theme`,
          section: 'roles',
          itemId: roleId,
          field: 'themeId',
          severity: 'error',
          message: `Roles (${roleId}): Invalid theme reference '${role.themeId}'`,
          remediation: 'Link to a declared theme ID.',
        })
      }

      if (!role.hero?.headline?.trim()) {
        pushIssue({
          id: `roles-${roleId}-headline-required`,
          section: 'roles',
          itemId: roleId,
          field: 'hero.headline',
          severity: 'error',
          message: `Roles (${roleId}): Hero headline is required`,
          remediation: 'Enter headline for this role.',
        })
      }

      if (!role.hero?.subtitle?.trim()) {
        pushIssue({
          id: `roles-${roleId}-subtitle-required`,
          section: 'roles',
          itemId: roleId,
          field: 'hero.subtitle',
          severity: 'error',
          message: `Roles (${roleId}): Hero subtitle is required`,
          remediation: 'Enter supporting subtitle.',
        })
      }

      if (!role.hero?.primaryCta?.trim()) {
        pushIssue({
          id: `roles-${roleId}-primary-cta-required`,
          section: 'roles',
          itemId: roleId,
          field: 'hero.primaryCta',
          severity: 'error',
          message: `Roles (${roleId}): Primary CTA label is required`,
          remediation: "Enter CTA text (e.g. 'View Projects').",
        })
      }

      if (!VALID_RESUME_VARIANTS.includes(role.resumeVariant)) {
        pushIssue({
          id: `roles-${roleId}-invalid-resume-variant`,
          section: 'roles',
          itemId: roleId,
          field: 'resumeVariant',
          severity: 'error',
          message: `Roles (${roleId}): Invalid resume variant specified '${role.resumeVariant}'`,
          remediation: 'Select a valid resume variant.',
        })
      }

      // Check for orphaned references (Warnings)
      if (Array.isArray(role.highlightedSkillIds)) {
        role.highlightedSkillIds.forEach((skillId) => {
          if (!existingSkillIds.has(skillId)) {
            pushIssue({
              id: `roles-${roleId}-orphan-skill-${skillId}`,
              section: 'roles',
              itemId: roleId,
              field: 'highlightedSkillIds',
              severity: 'warning',
              message: `Roles (${roleId}): Highlighted skill ID '${skillId}' not found.`,
              remediation: 'Update reference or add the skill.',
            })
          }
        })
      }

      if (Array.isArray(role.highlightedProjectIds)) {
        role.highlightedProjectIds.forEach((projId) => {
          if (!existingProjectIds.has(projId)) {
            pushIssue({
              id: `roles-${roleId}-orphan-project-${projId}`,
              section: 'roles',
              itemId: roleId,
              field: 'highlightedProjectIds',
              severity: 'warning',
              message: `Roles (${roleId}): Highlighted project ID '${projId}' not found.`,
              remediation: 'Update reference or add the project.',
            })
          }
        })
      }

      if (Array.isArray(role.highlightedMetricIds)) {
        role.highlightedMetricIds.forEach((metricId) => {
          if (!existingMetricIds.has(metricId)) {
            pushIssue({
              id: `roles-${roleId}-orphan-metric-${metricId}`,
              section: 'roles',
              itemId: roleId,
              field: 'highlightedMetricIds',
              severity: 'warning',
              message: `Roles (${roleId}): Highlighted metric ID '${metricId}' not found.`,
              remediation: 'Update reference or add the metric.',
            })
          }
        })
      }

      if (Array.isArray(role.experiencePriorityIds)) {
        role.experiencePriorityIds.forEach((expId) => {
          if (!existingExperienceIds.has(expId)) {
            pushIssue({
              id: `roles-${roleId}-orphan-exp-${expId}`,
              section: 'roles',
              itemId: roleId,
              field: 'experiencePriorityIds',
              severity: 'warning',
              message: `Roles (${roleId}): Priority experience ID '${expId}' not found.`,
              remediation: 'Update reference or add experience.',
            })
          }
        })
      }
    }
  }

  // --- 3. THEMES SECTION ---
  if (!config.themes || typeof config.themes !== 'object') {
    pushIssue({
      id: 'themes-missing',
      section: 'themes',
      severity: 'error',
      message: 'Themes section is missing or invalid',
      remediation: 'Restore default theme mapping.',
    })
  } else {
    for (const roleId of REQUIRED_ROLE_IDS) {
      const theme = config.themes[roleId]
      if (!theme) {
        pushIssue({
          id: `themes-missing-${roleId}`,
          section: 'themes',
          itemId: roleId,
          severity: 'error',
          message: `Themes: Missing theme for required role '${roleId}'`,
          remediation: 'Restore default theme mapping.',
        })
        continue
      }

      const colorKeys: (keyof ThemeTokens)[] = [
        'background',
        'surface',
        'text',
        'textMuted',
        'accent',
        'accentMuted',
        'border',
      ]
      colorKeys.forEach((colorKey) => {
        const val = theme[colorKey] as string
        if (!isValidCssColor(val)) {
          pushIssue({
            id: `themes-${roleId}-${colorKey}-invalid`,
            section: 'themes',
            itemId: roleId,
            field: colorKey,
            severity: 'error',
            message: `Themes (${roleId}): Invalid CSS color token: '${val}'.`,
            remediation: 'Provide a valid hex or rgb color code.',
          })
        }
      })

      if (!theme.heroGradient?.trim()) {
        pushIssue({
          id: `themes-${roleId}-gradient-required`,
          section: 'themes',
          itemId: roleId,
          field: 'heroGradient',
          severity: 'error',
          message: `Themes (${roleId}): Hero gradient is required.`,
          remediation: 'Provide a CSS linear/radial gradient definition.',
        })
      }

      if (!VALID_LAYOUT_VARIANTS.includes(theme.layoutVariant)) {
        pushIssue({
          id: `themes-${roleId}-invalid-layout`,
          section: 'themes',
          itemId: roleId,
          field: 'layoutVariant',
          severity: 'error',
          message: `Themes (${roleId}): Invalid layout variant.`,
          remediation: 'Select an authorized layout variant.',
        })
      }
    }
  }

  // --- 4. EXPERIENCE SECTION ---
  if (!Array.isArray(config.experience)) {
    pushIssue({
      id: 'experience-not-array',
      section: 'experience',
      severity: 'error',
      message: 'Experience section must be an array',
      remediation: 'Ensure experience is configured as a list.',
    })
  } else {
    if (config.experience.length === 0) {
      pushIssue({
        id: 'experience-empty',
        section: 'experience',
        severity: 'error',
        message: 'At least one experience entry is required.',
        remediation: 'Add work experience.',
      })
    }

    const seenExpIds = new Set<string>()
    config.experience.forEach((exp, idx) => {
      const prefix = `Experience #${idx + 1} (${exp.role || 'unnamed'}):`
      const itemId = exp.id || `exp-${idx}`

      if (!exp.id || seenExpIds.has(exp.id)) {
        pushIssue({
          id: `experience-${itemId}-duplicate-id`,
          section: 'experience',
          itemId,
          field: 'id',
          severity: 'error',
          message: `${prefix} Duplicate or missing experience ID`,
          remediation: 'Re-generate unique entity ID.',
        })
      } else {
        seenExpIds.add(exp.id)
      }

      if (!exp.organization?.trim()) {
        pushIssue({
          id: `experience-${itemId}-org-required`,
          section: 'experience',
          itemId,
          field: 'organization',
          severity: 'error',
          message: `${prefix} Organization is required`,
          remediation: 'Provide company or institution name.',
        })
      }

      if (!exp.role?.trim()) {
        pushIssue({
          id: `experience-${itemId}-role-required`,
          section: 'experience',
          itemId,
          field: 'role',
          severity: 'error',
          message: `${prefix} Role is required`,
          remediation: 'Provide role title.',
        })
      }

      if (!exp.period?.trim()) {
        pushIssue({
          id: `experience-${itemId}-period-required`,
          section: 'experience',
          itemId,
          field: 'period',
          severity: 'error',
          message: `${prefix} Period is required`,
          remediation: 'Provide date range.',
        })
      }

      if (!exp.location?.trim()) {
        pushIssue({
          id: `experience-${itemId}-location-required`,
          section: 'experience',
          itemId,
          field: 'location',
          severity: 'error',
          message: `${prefix} Location is required`,
          remediation: "Provide city, state, or 'Remote'.",
        })
      }

      if (!Array.isArray(exp.relevantRoles) || exp.relevantRoles.length === 0) {
        pushIssue({
          id: `experience-${itemId}-relevant-roles-required`,
          section: 'experience',
          itemId,
          field: 'relevantRoles',
          severity: 'error',
          message: `${prefix} At least one relevant role must be selected.`,
          remediation: 'Check at least one role badge.',
        })
      }

      if (!Array.isArray(exp.responsibilities) || exp.responsibilities.length === 0) {
        pushIssue({
          id: `experience-${itemId}-responsibilities-warn`,
          section: 'experience',
          itemId,
          field: 'responsibilities',
          severity: 'warning',
          message: `${prefix} No responsibilities listed.`,
          remediation: 'Add bullet points describing day-to-day duties.',
        })
      }

      if (!Array.isArray(exp.achievements) || exp.achievements.length === 0) {
        pushIssue({
          id: `experience-${itemId}-achievements-warn`,
          section: 'experience',
          itemId,
          field: 'achievements',
          severity: 'warning',
          message: `${prefix} No quantified achievements listed.`,
          remediation: 'Add measurable impacts or metrics.',
        })
      } else {
        exp.achievements.forEach((ach, aIdx) => {
          if (!ach.text?.trim()) {
            pushIssue({
              id: `experience-${itemId}-ach-${aIdx}-text-required`,
              section: 'experience',
              itemId,
              field: `achievements[${aIdx}].text`,
              severity: 'error',
              message: `${prefix} Achievement text cannot be empty.`,
              remediation: 'Enter achievement description.',
            })
          }
          if (!Array.isArray(ach.sourceVariants) || ach.sourceVariants.length === 0) {
            pushIssue({
              id: `experience-${itemId}-ach-${aIdx}-variants-required`,
              section: 'experience',
              itemId,
              field: `achievements[${aIdx}].sourceVariants`,
              severity: 'error',
              message: `${prefix} Achievement must map to at least one resume variant.`,
              remediation: 'Select source resume variant(s).',
            })
          }
          if (!Array.isArray(ach.relevantRoles) || ach.relevantRoles.length === 0) {
            pushIssue({
              id: `experience-${itemId}-ach-${aIdx}-roles-required`,
              section: 'experience',
              itemId,
              field: `achievements[${aIdx}].relevantRoles`,
              severity: 'error',
              message: `${prefix} Achievement must map to at least one role.`,
              remediation: 'Select relevant role(s).',
            })
          }
        })
      }

      if (!Array.isArray(exp.technologies) || exp.technologies.length === 0) {
        pushIssue({
          id: `experience-${itemId}-tech-warn`,
          section: 'experience',
          itemId,
          field: 'technologies',
          severity: 'warning',
          message: `${prefix} No technologies tagged.`,
          remediation: 'Add tech stack tags.',
        })
      }

      if (exp.imageUrl && !isValidSafeUrl(exp.imageUrl)) {
        pushIssue({
          id: `experience-${itemId}-image-url-invalid`,
          section: 'experience',
          itemId,
          field: 'imageUrl',
          severity: 'error',
          message: `${prefix} Invalid image URL`,
          remediation: 'Provide a valid safe path or URL.',
        })
      }

      if (Array.isArray(exp.attachments)) {
        exp.attachments.forEach((att, aIdx) => {
          if (!att.label?.trim()) {
            pushIssue({
              id: `experience-${itemId}-att-${aIdx}-label-required`,
              section: 'experience',
              itemId,
              field: `attachments[${aIdx}].label`,
              severity: 'error',
              message: `${prefix} Attachment label is required at index ${aIdx}`,
              remediation: 'Name the attachment.',
            })
          }
          if (!isValidSafeUrl(att.url)) {
            pushIssue({
              id: `experience-${itemId}-att-${aIdx}-url-invalid`,
              section: 'experience',
              itemId,
              field: `attachments[${aIdx}].url`,
              severity: 'error',
              message: `${prefix} Invalid attachment URL at index ${aIdx}`,
              remediation: 'Provide safe URL.',
            })
          }
        })
      }
    })
  }

  // --- 5. PROJECTS SECTION ---
  if (!Array.isArray(config.projects)) {
    pushIssue({
      id: 'projects-not-array',
      section: 'projects',
      severity: 'error',
      message: 'Projects section must be an array',
      remediation: 'Ensure projects is configured as a list.',
    })
  } else {
    if (config.projects.length === 0) {
      pushIssue({
        id: 'projects-empty',
        section: 'projects',
        severity: 'error',
        message: 'At least one project entry is required.',
        remediation: 'Add a portfolio project.',
      })
    }

    const seenProjIds = new Set<string>()
    config.projects.forEach((proj, idx) => {
      const prefix = `Project #${idx + 1} (${proj.title || 'unnamed'}):`
      const itemId = proj.id || `proj-${idx}`

      if (!proj.id || seenProjIds.has(proj.id)) {
        pushIssue({
          id: `projects-${itemId}-duplicate-id`,
          section: 'projects',
          itemId,
          field: 'id',
          severity: 'error',
          message: `${prefix} Duplicate or missing project ID`,
          remediation: 'Re-generate unique entity ID.',
        })
      } else {
        seenProjIds.add(proj.id)
      }

      if (!proj.title?.trim()) {
        pushIssue({
          id: `projects-${itemId}-title-required`,
          section: 'projects',
          itemId,
          field: 'title',
          severity: 'error',
          message: `${prefix} Title is required`,
          remediation: 'Provide project name.',
        })
      }

      if (!proj.overview?.trim()) {
        pushIssue({
          id: `projects-${itemId}-overview-required`,
          section: 'projects',
          itemId,
          field: 'overview',
          severity: 'error',
          message: `${prefix} Overview is required`,
          remediation: 'Provide a descriptive overview.',
        })
      } else if (proj.overview.trim().length < 20) {
        pushIssue({
          id: `projects-${itemId}-overview-min-length`,
          section: 'projects',
          itemId,
          field: 'overview',
          severity: 'error',
          message: `${prefix} Project overview must be at least 20 characters`,
          remediation: 'Provide a more detailed overview.',
        })
      }

      if (proj.period !== undefined && !proj.period?.trim()) {
        pushIssue({
          id: `projects-${itemId}-period-warn`,
          section: 'projects',
          itemId,
          field: 'period',
          severity: 'warning',
          message: `${prefix} Project timeframe/period is omitted.`,
          remediation: 'Specify completion date or duration.',
        })
      }

      if (proj.problem !== undefined && !proj.problem?.trim()) {
        pushIssue({
          id: `projects-${itemId}-problem-warn`,
          section: 'projects',
          itemId,
          field: 'problem',
          severity: 'warning',
          message: `${prefix} Problem statement is empty.`,
          remediation: 'Detail the problem being solved.',
        })
      }

      if (proj.approach !== undefined && !proj.approach?.trim()) {
        pushIssue({
          id: `projects-${itemId}-approach-warn`,
          section: 'projects',
          itemId,
          field: 'approach',
          severity: 'warning',
          message: `${prefix} Technical approach is empty.`,
          remediation: 'Detail your architectural solution.',
        })
      }

      if (proj.result !== undefined && !proj.result?.trim()) {
        pushIssue({
          id: `projects-${itemId}-result-warn`,
          section: 'projects',
          itemId,
          field: 'result',
          severity: 'warning',
          message: `${prefix} Results/metrics are empty.`,
          remediation: 'Add quantifiable outcomes.',
        })
      }

      if (!Array.isArray(proj.technologies) || proj.technologies.length === 0) {
        pushIssue({
          id: `projects-${itemId}-tech-warn`,
          section: 'projects',
          itemId,
          field: 'technologies',
          severity: 'warning',
          message: `${prefix} No technologies listed.`,
          remediation: 'Add key tools and languages.',
        })
      }

      if (proj.githubUrl && !isValidSafeUrl(proj.githubUrl)) {
        pushIssue({
          id: `projects-${itemId}-github-invalid`,
          section: 'projects',
          itemId,
          field: 'githubUrl',
          severity: 'error',
          message: `${prefix} Invalid GitHub URL`,
          remediation: 'Provide valid HTTPS URL.',
        })
      } else if (proj.githubUrl?.trim() && !proj.githubUrl.includes('github.com/')) {
        pushIssue({
          id: `projects-${itemId}-github-warn`,
          section: 'projects',
          itemId,
          field: 'githubUrl',
          severity: 'warning',
          message: `${prefix} Project link does not point to github.com.`,
          remediation: 'Verify repository URL.',
        })
      }

      if (!Array.isArray(proj.relevantRoles) || proj.relevantRoles.length === 0) {
        pushIssue({
          id: `projects-${itemId}-roles-required`,
          section: 'projects',
          itemId,
          field: 'relevantRoles',
          severity: 'error',
          message: `${prefix} Project must be assigned to at least one role.`,
          remediation: 'Select relevant role(s).',
        })
      }

      if (proj.imageUrl && !isValidSafeUrl(proj.imageUrl)) {
        pushIssue({
          id: `projects-${itemId}-image-invalid`,
          section: 'projects',
          itemId,
          field: 'imageUrl',
          severity: 'error',
          message: `${prefix} Invalid image URL`,
          remediation: 'Provide safe image path.',
        })
      }

      if (Array.isArray(proj.attachments)) {
        proj.attachments.forEach((att, aIdx) => {
          if (!att.label?.trim()) {
            pushIssue({
              id: `projects-${itemId}-att-${aIdx}-label-required`,
              section: 'projects',
              itemId,
              field: `attachments[${aIdx}].label`,
              severity: 'error',
              message: `${prefix} Attachment label is required at index ${aIdx}`,
              remediation: 'Name the attachment.',
            })
          }
          if (!isValidSafeUrl(att.url)) {
            pushIssue({
              id: `projects-${itemId}-att-${aIdx}-url-invalid`,
              section: 'projects',
              itemId,
              field: `attachments[${aIdx}].url`,
              severity: 'error',
              message: `${prefix} Invalid attachment URL at index ${aIdx}`,
              remediation: 'Provide safe URL.',
            })
          }
        })
      }
    })
  }

  // --- 6. SKILLS SECTION ---
  if (!Array.isArray(config.skills)) {
    pushIssue({
      id: 'skills-not-array',
      section: 'skills',
      severity: 'error',
      message: 'Skills section must be an array',
      remediation: 'Ensure skills is configured as a list.',
    })
  } else {
    if (config.skills.length === 0) {
      pushIssue({
        id: 'skills-empty',
        section: 'skills',
        severity: 'error',
        message: 'At least one skill category is required.',
        remediation: 'Add a skill category.',
      })
    }

    const seenCatIds = new Set<string>()
    const seenSkillIds = new Set<string>()

    config.skills.forEach((cat, idx) => {
      const prefix = `Skill Category #${idx + 1} (${cat.name || 'unnamed'}):`
      const catId = cat.id || `cat-${idx}`

      if (!cat.id || seenCatIds.has(cat.id)) {
        pushIssue({
          id: `skills-${catId}-duplicate-id`,
          section: 'skills',
          itemId: catId,
          field: 'id',
          severity: 'error',
          message: `${prefix} Duplicate or missing skill category ID`,
          remediation: 'Re-generate unique category ID.',
        })
      } else {
        seenCatIds.add(cat.id)
      }

      if (!cat.name?.trim()) {
        pushIssue({
          id: `skills-${catId}-name-required`,
          section: 'skills',
          itemId: catId,
          field: 'name',
          severity: 'error',
          message: `${prefix} Name is required`,
          remediation: "Name the category (e.g. 'Languages').",
        })
      }

      if (!Array.isArray(cat.relevantRoles) || cat.relevantRoles.length === 0) {
        pushIssue({
          id: `skills-${catId}-roles-required`,
          section: 'skills',
          itemId: catId,
          field: 'relevantRoles',
          severity: 'error',
          message: `${prefix} Skill category must have at least one role assigned.`,
          remediation: 'Select relevant role(s).',
        })
      }

      if (!Array.isArray(cat.skills)) {
        pushIssue({
          id: `skills-${catId}-skills-not-array`,
          section: 'skills',
          itemId: catId,
          field: 'skills',
          severity: 'error',
          message: `${prefix} skills must be an array`,
          remediation: 'Ensure skills array is defined.',
        })
      } else if (cat.skills.length === 0) {
        pushIssue({
          id: `skills-${catId}-skills-empty`,
          section: 'skills',
          itemId: catId,
          field: 'skills',
          severity: 'error',
          message: `${prefix} Category must contain at least one skill.`,
          remediation: 'Add a skill to this category.',
        })
      } else {
        cat.skills.forEach((skill, sIdx) => {
          const sId = skill.id || `skill-${sIdx}`
          if (!skill.id || seenSkillIds.has(skill.id)) {
            pushIssue({
              id: `skills-${catId}-${sId}-duplicate`,
              section: 'skills',
              itemId: sId,
              field: 'id',
              severity: 'error',
              message: `${prefix} Duplicate skill ID: '${skill.id || ''}'`,
              remediation: 'Ensure each skill has a unique ID.',
            })
          } else {
            seenSkillIds.add(skill.id)
          }

          if (!skill.name?.trim()) {
            pushIssue({
              id: `skills-${catId}-${sId}-name-required`,
              section: 'skills',
              itemId: sId,
              field: 'name',
              severity: 'error',
              message: `${prefix} Skill #${sIdx + 1} name is required`,
              remediation: 'Provide skill name.',
            })
          }

          if (Array.isArray(skill.relatedIds)) {
            skill.relatedIds.forEach((relId) => {
              if (!existingSkillIds.has(relId)) {
                pushIssue({
                  id: `skills-${catId}-${sId}-orphan-rel-${relId}`,
                  section: 'skills',
                  itemId: sId,
                  field: 'relatedIds',
                  severity: 'warning',
                  message: `${prefix} Related skill ID '${relId}' does not exist.`,
                  remediation: 'Link to a valid skill ID.',
                })
              }
            })
          }
        })
      }
    })
  }

  // --- 7. EDUCATION SECTION ---
  if (!Array.isArray(config.education)) {
    pushIssue({
      id: 'education-not-array',
      section: 'education',
      severity: 'error',
      message: 'Education section must be an array',
      remediation: 'Ensure education is configured as a list.',
    })
  } else {
    if (config.education.length === 0) {
      pushIssue({
        id: 'education-empty',
        section: 'education',
        severity: 'error',
        message: 'At least one education entry is required.',
        remediation: 'Add an educational institution.',
      })
    }

    const seenEduIds = new Set<string>()
    config.education.forEach((edu, idx) => {
      const prefix = `Education #${idx + 1} (${edu.degree || 'unnamed'}):`
      const itemId = edu.id || `edu-${idx}`

      if (!edu.id || seenEduIds.has(edu.id)) {
        pushIssue({
          id: `education-${itemId}-duplicate-id`,
          section: 'education',
          itemId,
          field: 'id',
          severity: 'error',
          message: `${prefix} Duplicate education ID`,
          remediation: 'Re-generate unique ID.',
        })
      } else {
        seenEduIds.add(edu.id)
      }

      if (!edu.degree?.trim()) {
        pushIssue({
          id: `education-${itemId}-degree-required`,
          section: 'education',
          itemId,
          field: 'degree',
          severity: 'error',
          message: `${prefix} Degree is required`,
          remediation: 'Enter degree title.',
        })
      }

      if (!edu.institution?.trim()) {
        pushIssue({
          id: `education-${itemId}-institution-required`,
          section: 'education',
          itemId,
          field: 'institution',
          severity: 'error',
          message: `${prefix} Institution is required`,
          remediation: 'Enter university/school name.',
        })
      }

      if (!edu.period?.trim()) {
        pushIssue({
          id: `education-${itemId}-period-required`,
          section: 'education',
          itemId,
          field: 'period',
          severity: 'error',
          message: `${prefix} Period is required`,
          remediation: 'Provide years of study.',
        })
      }

      if (!edu.location?.trim()) {
        pushIssue({
          id: `education-${itemId}-location-required`,
          section: 'education',
          itemId,
          field: 'location',
          severity: 'error',
          message: `${prefix} Location is required`,
          remediation: 'Enter city, state, or country.',
        })
      }

      if (edu.gpa?.trim() && !isValidGpa(edu.gpa)) {
        pushIssue({
          id: `education-${itemId}-gpa-unusual`,
          section: 'education',
          itemId,
          field: 'gpa',
          severity: 'warning',
          message: `${prefix} GPA format appears unusual.`,
          remediation: 'Verify GPA format.',
        })
      }
    })
  }

  // --- 8. CERTIFICATIONS SECTION ---
  if (!Array.isArray(config.certifications)) {
    pushIssue({
      id: 'certifications-not-array',
      section: 'certifications',
      severity: 'error',
      message: 'Certifications section must be an array',
      remediation: 'Ensure certifications is configured as a list.',
    })
  } else {
    const seenCertIds = new Set<string>()
    config.certifications.forEach((cert, idx) => {
      const prefix = `Certification #${idx + 1} (${cert.name || 'unnamed'}):`
      const itemId = cert.id || `cert-${idx}`

      if (!cert.id || seenCertIds.has(cert.id)) {
        pushIssue({
          id: `certifications-${itemId}-duplicate-id`,
          section: 'certifications',
          itemId,
          field: 'id',
          severity: 'error',
          message: `${prefix} Duplicate certification ID`,
          remediation: 'Re-generate unique ID.',
        })
      } else {
        seenCertIds.add(cert.id)
      }

      if (!cert.name?.trim()) {
        pushIssue({
          id: `certifications-${itemId}-name-required`,
          section: 'certifications',
          itemId,
          field: 'name',
          severity: 'error',
          message: `${prefix} Name is required`,
          remediation: 'Enter certificate title.',
        })
      }

      if (!cert.issuer?.trim()) {
        pushIssue({
          id: `certifications-${itemId}-issuer-required`,
          section: 'certifications',
          itemId,
          field: 'issuer',
          severity: 'error',
          message: `${prefix} Issuer is required`,
          remediation: "Enter issuer (e.g. 'AWS').",
        })
      }

      if (!Array.isArray(cert.sourceVariants) || cert.sourceVariants.length === 0) {
        pushIssue({
          id: `certifications-${itemId}-variants-required`,
          section: 'certifications',
          itemId,
          field: 'sourceVariants',
          severity: 'error',
          message: `${prefix} At least one resume variant must be selected.`,
          remediation: 'Select resume variant(s).',
        })
      }

      if (cert.url && !isValidSafeUrl(cert.url)) {
        pushIssue({
          id: `certifications-${itemId}-url-invalid`,
          section: 'certifications',
          itemId,
          field: 'url',
          severity: 'error',
          message: `${prefix} Invalid URL`,
          remediation: 'Provide valid HTTPS verification link.',
        })
      }

      if (cert.date !== undefined && !cert.date?.trim()) {
        pushIssue({
          id: `certifications-${itemId}-date-warn`,
          section: 'certifications',
          itemId,
          field: 'date',
          severity: 'warning',
          message: `${prefix} Certification issuance date is omitted.`,
          remediation: 'Add date achieved.',
        })
      }
    })
  }

  // --- 9. RESEARCH SECTION ---
  if (!Array.isArray(config.research)) {
    pushIssue({
      id: 'research-not-array',
      section: 'research',
      severity: 'error',
      message: 'Research section must be an array',
      remediation: 'Ensure research is configured as a list.',
    })
  } else {
    const seenResearchIds = new Set<string>()
    config.research.forEach((res, idx) => {
      const prefix = `Research #${idx + 1} (${res.title || 'unnamed'}):`
      const itemId = res.id || `res-${idx}`

      if (!res.id || seenResearchIds.has(res.id)) {
        pushIssue({
          id: `research-${itemId}-duplicate-id`,
          section: 'research',
          itemId,
          field: 'id',
          severity: 'error',
          message: `${prefix} Duplicate research ID`,
          remediation: 'Re-generate unique ID.',
        })
      } else {
        seenResearchIds.add(res.id)
      }

      if (!res.title?.trim()) {
        pushIssue({
          id: `research-${itemId}-title-required`,
          section: 'research',
          itemId,
          field: 'title',
          severity: 'error',
          message: `${prefix} Title is required`,
          remediation: 'Enter research topic or paper title.',
        })
      }

      if (!res.description?.trim()) {
        pushIssue({
          id: `research-${itemId}-desc-required`,
          section: 'research',
          itemId,
          field: 'description',
          severity: 'error',
          message: `${prefix} Description is required`,
          remediation: 'Describe the research scope and methods.',
        })
      } else if (res.description.trim().length < 20) {
        pushIssue({
          id: `research-${itemId}-desc-min-length`,
          section: 'research',
          itemId,
          field: 'description',
          severity: 'error',
          message: `${prefix} Research description must be at least 20 characters`,
          remediation: 'Describe the research scope and methods in detail.',
        })
      }

      if (!res.status?.trim()) {
        pushIssue({
          id: `research-${itemId}-status-required`,
          section: 'research',
          itemId,
          field: 'status',
          severity: 'error',
          message: `${prefix} Research status is required.`,
          remediation: "Enter status (e.g. 'Published', 'In Progress').",
        })
      }
    })
  }

  // --- 10. METRICS SECTION ---
  if (!Array.isArray(config.metrics)) {
    pushIssue({
      id: 'metrics-not-array',
      section: 'metrics',
      severity: 'error',
      message: 'Metrics section must be an array',
      remediation: 'Ensure metrics is configured as a list.',
    })
  } else {
    if (config.metrics.length === 0) {
      pushIssue({
        id: 'metrics-empty',
        section: 'metrics',
        severity: 'error',
        message: 'At least one key metric is required.',
        remediation: 'Add an impactful business metric.',
      })
    }

    const seenMetricIds = new Set<string>()
    config.metrics.forEach((metric, idx) => {
      const prefix = `Metric #${idx + 1} (${metric.label || 'unnamed'}):`
      const itemId = metric.id || `metric-${idx}`

      if (!metric.id || seenMetricIds.has(metric.id)) {
        pushIssue({
          id: `metrics-${itemId}-duplicate-id`,
          section: 'metrics',
          itemId,
          field: 'id',
          severity: 'error',
          message: `${prefix} Duplicate metric ID`,
          remediation: 'Re-generate unique ID.',
        })
      } else {
        seenMetricIds.add(metric.id)
      }

      if (!metric.label?.trim()) {
        pushIssue({
          id: `metrics-${itemId}-label-required`,
          section: 'metrics',
          itemId,
          field: 'label',
          severity: 'error',
          message: `${prefix} Label is required`,
          remediation: "Describe what is measured (e.g. 'Latency Reduction').",
        })
      }

      if (!metric.value?.trim()) {
        pushIssue({
          id: `metrics-${itemId}-value-required`,
          section: 'metrics',
          itemId,
          field: 'value',
          severity: 'error',
          message: `${prefix} Value is required`,
          remediation: "Provide value (e.g. '75%', '10k+ users').",
        })
      }

      if (!Array.isArray(metric.sourceVariants) || metric.sourceVariants.length === 0) {
        pushIssue({
          id: `metrics-${itemId}-variants-required`,
          section: 'metrics',
          itemId,
          field: 'sourceVariants',
          severity: 'error',
          message: `${prefix} Metric must be associated with at least one resume variant.`,
          remediation: 'Select resume variant(s).',
        })
      }

      if (!Array.isArray(metric.relevantRoles) || metric.relevantRoles.length === 0) {
        pushIssue({
          id: `metrics-${itemId}-roles-required`,
          section: 'metrics',
          itemId,
          field: 'relevantRoles',
          severity: 'error',
          message: `${prefix} Metric must be assigned to at least one role.`,
          remediation: 'Select relevant role(s).',
        })
      }
    })
  }

  // --- 11. AI KNOWLEDGE SECTION ---
  if (!Array.isArray(config.aiKnowledge)) {
    pushIssue({
      id: 'aiKnowledge-not-array',
      section: 'aiKnowledge',
      severity: 'error',
      message: 'AI Knowledge section must be an array',
      remediation: 'Ensure AI knowledge is configured as a list.',
    })
  } else {
    if (config.aiKnowledge.length === 0) {
      pushIssue({
        id: 'aiKnowledge-empty',
        section: 'aiKnowledge',
        severity: 'error',
        message: 'At least one AI knowledge entry is required.',
        remediation: 'Add an AI grounding entry.',
      })
    }

    const seenAiIds = new Set<string>()
    config.aiKnowledge.forEach((entry, idx) => {
      const prefix = `AI Knowledge Entry #${idx + 1}:`
      const itemId = entry.id || `ai-${idx}`

      if (!entry.id || seenAiIds.has(entry.id)) {
        pushIssue({
          id: `aiKnowledge-${itemId}-duplicate-id`,
          section: 'aiKnowledge',
          itemId,
          field: 'id',
          severity: 'error',
          message: `${prefix} Duplicate AI knowledge entry ID`,
          remediation: 'Re-generate unique ID.',
        })
      } else {
        seenAiIds.add(entry.id)
      }

      if (!entry.answer?.trim()) {
        pushIssue({
          id: `aiKnowledge-${itemId}-answer-required`,
          section: 'aiKnowledge',
          itemId,
          field: 'answer',
          severity: 'error',
          message: `${prefix} Answer is required`,
          remediation: 'Provide a factual, grounded response.',
        })
      } else if (entry.answer.trim().length < 10) {
        pushIssue({
          id: `aiKnowledge-${itemId}-answer-min-length`,
          section: 'aiKnowledge',
          itemId,
          field: 'answer',
          severity: 'error',
          message: `${prefix} Knowledge answer must be at least 10 characters`,
          remediation: 'Provide a factual, grounded response.',
        })
      } else if (entry.answer.trim().length > 600) {
        pushIssue({
          id: `aiKnowledge-${itemId}-answer-long-warn`,
          section: 'aiKnowledge',
          itemId,
          field: 'answer',
          severity: 'warning',
          message: `${prefix} Answer is very long for a quick AI chat response.`,
          remediation: 'Consider tightening response for readability.',
        })
      }

      if (!Array.isArray(entry.questionPatterns) || entry.questionPatterns.length === 0) {
        pushIssue({
          id: `aiKnowledge-${itemId}-patterns-required`,
          section: 'aiKnowledge',
          itemId,
          field: 'questionPatterns',
          severity: 'error',
          message: `${prefix} At least one question pattern is required`,
          remediation: 'Add search queries users might ask.',
        })
      } else {
        const stopWords = new Set(['the', 'a', 'an', 'is', 'it'])
        entry.questionPatterns.forEach((pat, pIdx) => {
          if (!pat?.trim()) {
            pushIssue({
              id: `aiKnowledge-${itemId}-pat-${pIdx}-empty`,
              section: 'aiKnowledge',
              itemId,
              field: `questionPatterns[${pIdx}]`,
              severity: 'error',
              message: `${prefix} Question pattern cannot be empty.`,
              remediation: 'Provide trigger phrase.',
            })
          } else if (pat.trim().length < 3 || stopWords.has(pat.trim().toLowerCase())) {
            pushIssue({
              id: `aiKnowledge-${itemId}-pat-${pIdx}-broad-warn`,
              section: 'aiKnowledge',
              itemId,
              field: `questionPatterns[${pIdx}]`,
              severity: 'warning',
              message: `${prefix} Question pattern '${pat}' is too broad.`,
              remediation: 'Use multi-word keywords for accurate matching.',
            })
          }
        })
      }

      if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
        pushIssue({
          id: `aiKnowledge-${itemId}-tags-warn`,
          section: 'aiKnowledge',
          itemId,
          field: 'tags',
          severity: 'warning',
          message: `${prefix} No search tags assigned to this entry.`,
          remediation: 'Add tags for faceted retrieval.',
        })
      }

      if (!entry.source?.trim()) {
        pushIssue({
          id: `aiKnowledge-${itemId}-source-required`,
          section: 'aiKnowledge',
          itemId,
          field: 'source',
          severity: 'error',
          message: `${prefix} Source citation is required.`,
          remediation: "Cite source (e.g. 'Resume', 'Portfolio').",
        })
      }
    })
  }

  // --- 12. RUN REGISTERED CUSTOM RULES ---
  for (const rule of customRules) {
    try {
      const target = config[rule.section]
      const pass = rule.validate(target, config)
      if (!pass) {
        pushIssue({
          id: rule.id,
          section: rule.section,
          field: rule.field,
          severity: rule.severity,
          message: rule.message,
          remediation: rule.remediation,
        })
      }
    } catch {
      // Custom rule execution error treated as validation error
      pushIssue({
        id: `${rule.id}-execution-error`,
        section: rule.section,
        field: rule.field,
        severity: 'error',
        message: `Validation rule '${rule.id}' threw an error.`,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    errorCount: errors.length,
    warningCount: warnings.length,
    issuesBySection,
    issuesByEntity,
    issuesByField,
  }
}

export function getFieldIssue(
  summary: ValidationSummary,
  section: string,
  field: string,
  itemId?: string
): ValidationIssue | undefined {
  if (itemId) {
    const entityFieldKey = `${itemId}.${field}`
    const entityMatches = summary.issuesByField[entityFieldKey]
    if (entityMatches && entityMatches.length > 0) return entityMatches[0]
  }
  const sectionFieldKey = `${section}.${field}`
  const sectionMatches = summary.issuesByField[sectionFieldKey]
  if (sectionMatches && sectionMatches.length > 0) return sectionMatches[0]

  const fieldMatches = summary.issuesByField[field]
  return fieldMatches?.[0]
}

export function getFieldIssues(
  summary: ValidationSummary,
  section: string,
  field: string,
  itemId?: string
): ValidationIssue[] {
  if (itemId) {
    const entityFieldKey = `${itemId}.${field}`
    const entityMatches = summary.issuesByField[entityFieldKey]
    if (entityMatches && entityMatches.length > 0) return entityMatches
  }
  const sectionFieldKey = `${section}.${field}`
  const sectionMatches = summary.issuesByField[sectionFieldKey]
  if (sectionMatches && sectionMatches.length > 0) return sectionMatches

  return summary.issuesByField[field] || []
}

export function getSectionIssues(
  summary: ValidationSummary,
  section: string
): { errors: ValidationIssue[]; warnings: ValidationIssue[] } {
  const issues = summary.issuesBySection[section] || []
  return {
    errors: issues.filter((i) => i.severity === 'error'),
    warnings: issues.filter((i) => i.severity === 'warning'),
  }
}
