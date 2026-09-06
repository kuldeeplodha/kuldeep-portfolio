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
  /** Honest category label, e.g. "Machine Learning · Deep Learning" (V2 §2.4) */
  category?: string
  /** V2.1 P2 (spec §30): purely an editorial/visual flag for the "one
   * larger featured card" treatment — not a claim about the project itself. */
  featured?: boolean
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
  /** Named focus areas, e.g. "Machine Learning", "MLOps" (V2 §Education) */
  focus?: string[]
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
  /** e.g. "MS Research Thesis · 2024" (V2 §2.7) */
  type?: string
  /** Named research areas, e.g. "Explainable AI", "Low-Resource NLP" */
  areas?: string[]
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

/** One tile in the "Engineering Signal" grid (V2 §2.3), from home.valueProposition.items. */
export interface EngineeringSignalItem {
  title: string
  description: string
}

/** One numbered point in "How I Engineer" (V2 §2.6), from content.philosophy.items. */
export interface PhilosophyItem {
  title: string
  description: string
}

/** One tile in the impact-metrics strip (V2 §2.4), from top-level content.impact.items. */
export interface ImpactMetricItem {
  metric: string
  label: string
  context: string
}

/** One domain of ownership within a role, e.g. EMR/Billing/CRM (V2 §2.5). */
export interface ExperienceDomain {
  name: string
  description: string
}

/**
 * A single role in the premium experience timeline (V2 §2.5), from
 * content.experience. Fields are optional because the three real roles
 * carry different shapes (the current lead role has domains/integrations/
 * leadership/selectedHighlights; the two prior roles have highlights/impact
 * instead) — do not assume every field is present.
 */
export interface ExperienceStoryEntry {
  id: string
  company: string
  role: string
  period: string
  location: string
  current: boolean
  summary: string
  highlights?: string[]
  selectedHighlights?: string[]
  domains?: ExperienceDomain[]
  integrations?: string[]
  leadership?: string[]
  technology: string[]
  impact?: { value: string; label: string }[]
}

/** One category in the Engineering Stack matrix (V2 §2.8), e.g. "backend" -> techs. No proficiency levels. */
export interface EngineeringStackCategory {
  id: string
  label: string
  technologies: string[]
}

/** One "Currently Exploring" item (V2 §2.7), from content.currentlyExploring.items. */
export interface CurrentlyExploringItem {
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
  engineeringSignal: EngineeringSignalItem[]
  philosophy: { title: string; items: PhilosophyItem[] }
  impactMetrics: { title: string; description: string; items: ImpactMetricItem[] }
  experienceStory: ExperienceStoryEntry[]
  engineeringStack: EngineeringStackCategory[]
  researchIntro: string
  currentlyExploring: { title: string; items: CurrentlyExploringItem[] }
  askKuldeepContent: { title: string; description: string; suggestedQuestions: string[]; responseHeading: string }
  /** V2.1 P4 (spec §46), verbatim from content.contact. */
  contactContent: { title: string; description: string }
  /** V2.1 P4 (spec §47), verbatim from content.footer. */
  footerContent: { text: string; subtext: string; copyright: string }
}
