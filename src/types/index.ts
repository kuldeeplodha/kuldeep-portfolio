export type RoleId = 'software' | 'ai' | 'data' | 'system'

export type ResumeVariant = 'software' | 'ai_ml' | 'data_analyst'

export interface Profile {
  name: string
  /** Compact name for navbar on small screens (keeps one line) */
  navDisplayName?: string
  title: string
  location: string
  email: string
  phone?: string
  showPhone: boolean
  summary: string
  /** Path under public/ e.g. /images/avatar.jpg */
  avatarUrl?: string
  links: {
    linkedin?: string
    github?: string
  }
}

export interface MediaAttachment {
  label: string
  url: string
}

export interface ThemeTokens {
  id: RoleId
  name: string
  background: string
  surface: string
  text: string
  textMuted: string
  accent: string
  accentMuted: string
  border: string
  heroGradient: string
  /** Drives per-role layout and typography */
  layoutVariant: 'terminal' | 'neural' | 'dashboard' | 'hybrid'
}

export interface HeroConfig {
  /** Small uppercase label above the headline, e.g. "SENIOR SOFTWARE DEVELOPER • LEAD" */
  eyebrow: string
  headline: string
  subtitle: string
  /** High-signal keyword chips shown under the description (V2 §2.2 focus keywords) */
  focus: string[]
  primaryCta: string
  /** Always an in-page anchor, e.g. '#projects' */
  primaryCtaTarget: string
  secondaryCta?: string
  /** '#anchor' for an in-page scroll, or 'resume' to trigger the resume download */
  secondaryCtaTarget?: string
}

export interface RoleConfig {
  id: RoleId
  label: string
  themeId: RoleId
  hero: HeroConfig
  highlightedSkillIds: string[]
  highlightedProjectIds: string[]
  highlightedMetricIds: string[]
  experiencePriorityIds: string[]
  resumeVariant: ResumeVariant
  navEmphasis: string[]
}

export interface Achievement {
  id: string
  text: string
  /** Resume variants where this metric/claim appears */
  sourceVariants: ResumeVariant[]
  /** Role profiles that should emphasize this achievement */
  relevantRoles: RoleId[]
}

export interface Experience {
  id: string
  organization: string
  role: string
  period: string
  location: string
  responsibilities: string[]
  achievements: Achievement[]
  technologies: string[]
  relevantRoles: RoleId[]
  imageUrl?: string
  attachments?: MediaAttachment[]
}

export interface Project {
  id: string
  title: string
  period: string
  overview: string
  problem?: string
  approach?: string
  technologies: string[]
  pipeline: string[]
  result?: string
  githubUrl?: string
  futureImprovements?: string
  relevantRoles: RoleId[]
  imageUrl?: string
  attachments?: MediaAttachment[]
}

export interface SkillCategory {
  id: string
  name: string
  skills: Skill[]
  relevantRoles: RoleId[]
}

export interface Skill {
  id: string
  name: string
  relatedIds?: string[]
}

export interface Education {
  id: string
  degree: string
  institution: string
  period: string
  location: string
  highlights?: string[]
  gpa?: string
  research?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date?: string
  sourceVariants: ResumeVariant[]
  url?: string
}

export interface Research {
  id: string
  title: string
  description: string
  status: string
}

export interface Metric {
  id: string
  label: string
  value: string
  sourceVariants: ResumeVariant[]
  relevantRoles: RoleId[]
}

export interface AIKnowledgeEntry {
  id: string
  questionPatterns: string[]
  answer: string
  tags: string[]
  source: string
}

/** One step in the "software → data → ML → AI" career evolution (V2 §Career Journey). */
export interface CareerJourneyStep {
  period: string
  title: string
  description: string
}

export interface PortfolioConfig {
  profile: Profile
  roles: Record<RoleId, RoleConfig>
  themes: Record<RoleId, ThemeTokens>
  experience: Experience[]
  projects: Project[]
  skills: SkillCategory[]
  education: Education[]
  certifications: Certification[]
  research: Research[]
  metrics: Metric[]
  aiKnowledge: AIKnowledgeEntry[]
  careerJourney: CareerJourneyStep[]
}
