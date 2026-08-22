import type { ResumeVariant } from '../types'

export interface ResumeFile {
  variant: ResumeVariant
  label: string
  filename: string
  /** Path relative to site root for GitHub Pages */
  path: string
}

export const resumes: ResumeFile[] = [
  {
    variant: 'software',
    label: 'Software Engineering Resume',
    filename: 'software-engineering.pdf',
    path: '/resumes/software-engineering.pdf',
  },
  {
    variant: 'ai_ml',
    label: 'AI / ML Resume',
    filename: 'ai-ml.pdf',
    path: '/resumes/ai-ml.pdf',
  },
  {
    variant: 'data_analyst',
    label: 'Data Analyst Resume',
    filename: 'data-analyst.pdf',
    path: '/resumes/data-analyst.pdf',
  },
]

export function getResumeForVariant(variant: ResumeVariant): ResumeFile {
  return resumes.find((r) => r.variant === variant) ?? resumes[0]
}
