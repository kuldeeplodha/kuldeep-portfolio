import { profile } from './profile'
import { roles } from './roles'
import { themes } from './themes'
import { experience } from './experience'
import { projects } from './projects'
import { skills } from './skills'
import { education, certifications, research, metrics } from './education'
import { aiKnowledge } from './aiKnowledge'
import { careerJourney } from './careerJourney'
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
export * from './resumes'
