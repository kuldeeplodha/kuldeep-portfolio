import { profile } from './profile'
import { roles } from './roles'
import { themes } from './themes'
import { experience } from './experience'
import { projects } from './projects'
import { skills } from './skills'
import { education, certifications, research, metrics, researchIntro } from './education'
import { aiKnowledge } from './aiKnowledge'
import { careerJourney } from './careerJourney'
import { engineeringSignal } from './engineeringSignal'
import { philosophy } from './philosophy'
import { impactMetrics } from './impactMetrics'
import { experienceStory } from './experienceStory'
import { engineeringStack } from './engineeringStack'
import { currentlyExploring } from './currentlyExploring'
import { askKuldeepContent } from './askKuldeepContent'
import { contactContent, footerContent } from './contactContent'
import type { PortfolioConfig } from '../types'

export const portfolioConfig: PortfolioConfig = {
  profile,
  roles: roles as PortfolioConfig['roles'],
  themes: themes as PortfolioConfig['themes'],
  experience,
  projects,
  skills,
  education,
  certifications,
  research,
  metrics,
  aiKnowledge,
  careerJourney,
  engineeringSignal,
  philosophy,
  impactMetrics,
  experienceStory,
  engineeringStack,
  researchIntro,
  currentlyExploring,
  askKuldeepContent,
  contactContent,
  footerContent,
}

export * from './profile'
export * from './roles'
export * from './themes'
export * from './experience'
export * from './projects'
export * from './skills'
export * from './education'
export * from './aiKnowledge'
export * from './careerJourney'
export * from './engineeringSignal'
export * from './philosophy'
export * from './impactMetrics'
export * from './experienceStory'
export * from './engineeringStack'
export * from './currentlyExploring'
export * from './askKuldeepContent'
export * from './contactContent'
export * from './resumes'
