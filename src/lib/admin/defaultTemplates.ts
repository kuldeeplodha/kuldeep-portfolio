import type {
  AIKnowledgeEntry,
  Certification,
  Education,
  Experience,
  Metric,
  Project,
  Research,
  RoleId,
  SkillCategory,
} from '../../types'
import type { ConfigSection } from './configReducer'

export function createDefaultEntity(section: ConfigSection, id: string = crypto.randomUUID()): any {
  switch (section) {
    case 'experience':
      return {
        id,
        organization: 'New Organization',
        role: 'New Role',
        period: '2024 — Present',
        location: 'Remote',
        responsibilities: ['Core responsibilities...'],
        achievements: [],
        technologies: ['TypeScript', 'React'],
        relevantRoles: ['software' as RoleId],
      } satisfies Experience

    case 'projects':
      return {
        id,
        title: 'New Project',
        period: '2024',
        overview: 'Project overview and objectives...',
        technologies: ['TypeScript', 'Node.js'],
        pipeline: ['Architecture', 'Implementation', 'Deployment'],
        relevantRoles: ['software' as RoleId],
      } satisfies Project

    case 'metrics':
      return {
        id,
        label: 'New Metric',
        value: '100%',
        sourceVariants: ['software'],
        relevantRoles: ['software' as RoleId],
      } satisfies Metric

    case 'skills':
      return {
        id,
        name: 'New Skill Category',
        skills: [{ id: crypto.randomUUID(), name: 'New Skill' }],
        relevantRoles: ['software' as RoleId],
      } satisfies SkillCategory

    case 'education':
      return {
        id,
        degree: 'Bachelor of Science',
        institution: 'University Name',
        period: '2020 — 2024',
        location: 'Location',
      } satisfies Education

    case 'certifications':
      return {
        id,
        name: 'New Certification',
        issuer: 'Issuing Organization',
        date: '2024',
        sourceVariants: ['software'],
      } satisfies Certification

    case 'research':
      return {
        id,
        title: 'Research Project',
        description: 'Description of research findings...',
        status: 'In Progress',
      } satisfies Research

    case 'aiKnowledge':
      return {
        id,
        questionPatterns: ['New question pattern'],
        answer: 'Grounding answer for assistant...',
        tags: ['general'],
        source: 'portfolio',
      } satisfies AIKnowledgeEntry

    default:
      return { id }
  }
}
