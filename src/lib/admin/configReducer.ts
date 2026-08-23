import type { PortfolioConfig, Profile, RoleConfig, RoleId } from '../../types'
import { portfolioConfig } from '../../config'

export type ConfigSection =
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'certifications'
  | 'research'
  | 'metrics'
  | 'aiKnowledge'

export type ConfigAction =
  | { type: 'patchProfile'; patch: Partial<Profile> }
  | { type: 'patchEntity'; section: ConfigSection; id: string; patch: Partial<any> }
  | { type: 'patchRole'; id: RoleId; patch: Partial<RoleConfig> }
  | { type: 'insertEntity'; section: ConfigSection; entity: any; afterId?: string }
  | { type: 'removeEntity'; section: ConfigSection; id: string }
  | { type: 'duplicateEntity'; section: ConfigSection; id: string }
  | { type: 'moveEntity'; section: ConfigSection; id: string; delta?: -1 | 1; direction?: -1 | 1 }
  | { type: 'replaceConfig'; config: PortfolioConfig }

const SECTION_KEYS: ConfigSection[] = [
  'experience',
  'projects',
  'skills',
  'education',
  'certifications',
  'research',
  'metrics',
  'aiKnowledge',
]

function generateId(existingIds: Set<string>): string {
  let id: string
  do {
    id = crypto.randomUUID()
  } while (existingIds.has(id))
  return id
}

function getAllIds(config: PortfolioConfig): Set<string> {
  const ids = new Set<string>()
  SECTION_KEYS.forEach((section) => {
    const arr = config[section] as any[]
    arr?.forEach((item) => {
      if (item?.id) ids.add(item.id)
    })
  })
  return ids
}

function sweepCrossReferences(config: PortfolioConfig, removedId: string): PortfolioConfig {
  const next = structuredClone(config)

  Object.values(next.roles).forEach((role) => {
    role.highlightedSkillIds = role.highlightedSkillIds.filter((id) => id !== removedId)
    role.highlightedProjectIds = role.highlightedProjectIds.filter((id) => id !== removedId)
    role.highlightedMetricIds = role.highlightedMetricIds.filter((id) => id !== removedId)
    role.experiencePriorityIds = role.experiencePriorityIds.filter((id) => id !== removedId)
  })

  return next
}

function insertAtIndex<T>(arr: T[], item: T, afterId?: string): T[] {
  if (!afterId) return [item, ...arr]
  const idx = arr.findIndex((x: any) => x.id === afterId)
  if (idx === -1) return [item, ...arr]
  return [...arr.slice(0, idx + 1), item, ...arr.slice(idx + 1)]
}

function moveByDelta<T extends { id: string }>(arr: T[], id: string, delta: -1 | 1): T[] {
  const idx = arr.findIndex((x) => x.id === id)
  if (idx === -1) return arr
  const newIdx = idx + delta
  if (newIdx < 0 || newIdx >= arr.length) return arr
  const next = [...arr]
  const [item] = next.splice(idx, 1)
  next.splice(newIdx, 0, item)
  return next
}

export function configDraftReducer(state: PortfolioConfig, action: ConfigAction): PortfolioConfig {
  switch (action.type) {
    case 'replaceConfig':
      return action.config

    case 'patchProfile':
      return {
        ...state,
        profile: { ...state.profile, ...action.patch },
      }

    case 'patchRole': {
      const { id, patch } = action
      return {
        ...state,
        roles: {
          ...state.roles,
          [id]: { ...state.roles[id], ...patch },
        },
      }
    }

    case 'patchEntity': {
      const { section, id, patch } = action
      const arr = state[section] as any[]
      return {
        ...state,
        [section]: arr.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      }
    }

    case 'insertEntity': {
      const { section, entity, afterId } = action
      const existingIds = getAllIds(state)
      const newEntity = { ...entity, id: entity.id || generateId(existingIds) }
      return {
        ...state,
        [section]: insertAtIndex(state[section] as any[], newEntity, afterId),
      }
    }

    case 'removeEntity': {
      const { section, id } = action
      const withoutEntity = {
        ...state,
        [section]: (state[section] as any[]).filter((item) => item.id !== id),
      }
      return sweepCrossReferences(withoutEntity, id)
    }

    case 'duplicateEntity': {
      const { section, id } = action
      const arr = state[section] as any[]
      const original = arr.find((item) => item.id === id)
      if (!original) return state
      const existingIds = getAllIds(state)
      const clone = { ...original, id: generateId(existingIds) }
      const idx = arr.findIndex((item) => item.id === id)
      const nextArr = [...arr.slice(0, idx + 1), clone, ...arr.slice(idx + 1)]
      return { ...state, [section]: nextArr }
    }

    case 'moveEntity': {
      const { section, id } = action
      const delta = (action.delta ?? action.direction ?? 1) as -1 | 1
      return {
        ...state,
        [section]: moveByDelta(state[section] as any[], id, delta),
      }
    }

    default:
      return state
  }
}

export const initialConfig = portfolioConfig