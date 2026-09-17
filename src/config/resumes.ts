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

// CMS-FE-WIRE-P3: `resumesList` defaults to the static config array, but a
// caller reading the `resumes` site_content key (via useSiteContent) can
// pass the current DB-or-fallback list instead — this stays a plain
// function (not a hook) since it's also called from non-component
// contexts.
export function getResumeForVariant(variant: ResumeVariant, resumesList: ResumeFile[] = resumes): ResumeFile {
  return resumesList.find((r) => r.variant === variant) ?? resumesList[0]
}
