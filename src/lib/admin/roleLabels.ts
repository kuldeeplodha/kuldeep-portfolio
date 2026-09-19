import type { RoleId } from '../../types'

export const ROLE_IDS: RoleId[] = ['software', 'ai', 'data', 'system']

export const ROLE_LABELS: Record<RoleId, string> = {
  software: 'Software Engineer',
  ai: 'AI / ML',
  data: 'Data Analyst',
  system: 'System View',
}

export const RESUME_LABELS: Record<RoleId, string> = {
  software: 'Software resume',
  ai: 'AI/ML resume',
  data: 'Data Analyst resume',
  system: 'All resumes',
}
