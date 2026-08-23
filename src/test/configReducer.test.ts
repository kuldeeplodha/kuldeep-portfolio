import { describe, expect, it } from 'vitest'
import {
  configDraftReducer,
  type ConfigAction,
} from '../lib/admin/configReducer'
import { portfolioConfig } from '../config'

describe('configDraftReducer', () => {
  const initialState = portfolioConfig

  it('patchProfile updates profile fields', () => {
    const action: ConfigAction = {
      type: 'patchProfile',
      patch: { name: 'New Name', title: 'New Title' },
    }
    const result = configDraftReducer(initialState, action)
    expect(result.profile.name).toBe('New Name')
    expect(result.profile.title).toBe('New Title')
    expect(result.profile.email).toBe(initialState.profile.email)
  })

  it('patchRole updates role hero config', () => {
    const action: ConfigAction = {
      type: 'patchRole',
      id: 'software',
      patch: { hero: { headline: 'New Headline', subtitle: 'New Subtitle', primaryCta: 'CTA', secondaryCta: 'Sec' } },
    }
    const result = configDraftReducer(initialState, action)
    expect(result.roles.software.hero.headline).toBe('New Headline')
    expect(result.roles.software.hero.subtitle).toBe('New Subtitle')
  })

  it('patchEntity updates experience entry', () => {
    const expId = initialState.experience[0].id
    const action: ConfigAction = {
      type: 'patchEntity',
      section: 'experience',
      id: expId,
      patch: { organization: 'New Org', role: 'New Role' },
    }
    const result = configDraftReducer(initialState, action)
    const updated = result.experience.find((e) => e.id === expId)
    expect(updated?.organization).toBe('New Org')
    expect(updated?.role).toBe('New Role')
  })

  it('patchEntity updates project entry', () => {
    const projId = initialState.projects[0].id
    const action: ConfigAction = {
      type: 'patchEntity',
      section: 'projects',
      id: projId,
      patch: { title: 'New Project', overview: 'New Overview' },
    }
    const result = configDraftReducer(initialState, action)
    const updated = result.projects.find((p) => p.id === projId)
    expect(updated?.title).toBe('New Project')
    expect(updated?.overview).toBe('New Overview')
  })

  it('patchEntity updates skill category', () => {
    const skillId = initialState.skills[0].id
    const action: ConfigAction = {
      type: 'patchEntity',
      section: 'skills',
      id: skillId,
      patch: { name: 'New Category' },
    }
    const result = configDraftReducer(initialState, action)
    const updated = result.skills.find((s) => s.id === skillId)
    expect(updated?.name).toBe('New Category')
  })

  it('insertEntity adds new experience at start when no afterId', () => {
    const action: ConfigAction = {
      type: 'insertEntity',
      section: 'experience',
      entity: { organization: 'New Co', role: 'Intern', period: '2024', location: 'Remote', responsibilities: [], achievements: [], technologies: [], relevantRoles: ['software'], id: '' },
    }
    const result = configDraftReducer(initialState, action)
    expect(result.experience.length).toBe(initialState.experience.length + 1)
    expect(result.experience[0].organization).toBe('New Co')
    expect(result.experience[0].id).toBeTruthy()
  })

  it('insertEntity inserts after specified id', () => {
    const afterId = initialState.experience[0].id
    const action: ConfigAction = {
      type: 'insertEntity',
      section: 'experience',
      entity: { organization: 'Inserted Co', role: 'Intern', period: '2024', location: 'Remote', responsibilities: [], achievements: [], technologies: [], relevantRoles: ['software'], id: '' },
      afterId,
    }
    const result = configDraftReducer(initialState, action)
    expect(result.experience.length).toBe(initialState.experience.length + 1)
    const insertedIdx = result.experience.findIndex((e) => e.organization === 'Inserted Co')
    expect(insertedIdx).toBe(1)
  })

  it('removeEntity removes experience and sweeps cross-references', () => {
    const expId = initialState.experience[0].id
    initialState.roles.software.experiencePriorityIds = [expId]
    const action: ConfigAction = { type: 'removeEntity', section: 'experience', id: expId }
    const result = configDraftReducer(initialState, action)
    expect(result.experience.find((e) => e.id === expId)).toBeUndefined()
    expect(result.roles.software.experiencePriorityIds).not.toContain(expId)
  })

  it('duplicateEntity clones experience with new id', () => {
    const expId = initialState.experience[0].id
    const action: ConfigAction = { type: 'duplicateEntity', section: 'experience', id: expId }
    const result = configDraftReducer(initialState, action)
    expect(result.experience.length).toBe(initialState.experience.length + 1)
    const clone = result.experience.find((e) => e.organization === initialState.experience[0].organization && e.id !== expId)
    expect(clone).toBeTruthy()
    expect(clone?.id).not.toBe(expId)
  })

  it('moveEntity moves experience up', () => {
    if (initialState.experience.length < 2) return
    const idToMove = initialState.experience[1].id
    const action: ConfigAction = { type: 'moveEntity', section: 'experience', id: idToMove, delta: -1 }
    const result = configDraftReducer(initialState, action)
    expect(result.experience[0].id).toBe(idToMove)
  })

  it('moveEntity moves experience down', () => {
    if (initialState.experience.length < 2) return
    const idToMove = initialState.experience[0].id
    const action: ConfigAction = { type: 'moveEntity', section: 'experience', id: idToMove, delta: 1 }
    const result = configDraftReducer(initialState, action)
    expect(result.experience[1].id).toBe(idToMove)
  })

  it('moveEntity no-ops at boundaries', () => {
    const firstId = initialState.experience[0].id
    const lastId = initialState.experience[initialState.experience.length - 1].id
    const upAction: ConfigAction = { type: 'moveEntity', section: 'experience', id: firstId, delta: -1 }
    const downAction: ConfigAction = { type: 'moveEntity', section: 'experience', id: lastId, delta: 1 }
    const upResult = configDraftReducer(initialState, upAction)
    const downResult = configDraftReducer(initialState, downAction)
    expect(upResult.experience).toEqual(initialState.experience)
    expect(downResult.experience).toEqual(initialState.experience)
  })

  it('replaceConfig replaces entire config', () => {
    const newConfig = { ...portfolioConfig, profile: { ...portfolioConfig.profile, name: 'Replaced' } }
    const action: ConfigAction = { type: 'replaceConfig', config: newConfig }
    const result = configDraftReducer(initialState, action)
    expect(result.profile.name).toBe('Replaced')
  })

  it('generates unique ids on insert', () => {
    const ids = new Set<string>()
    let state = initialState
    for (let i = 0; i < 5; i++) {
      const action: ConfigAction = {
        type: 'insertEntity',
        section: 'experience',
        entity: { organization: `Co${i}`, role: 'Role', period: '2024', location: 'Remote', responsibilities: [], achievements: [], technologies: [], relevantRoles: ['software'], id: '' },
      }
      state = configDraftReducer(state, action)
      const newEntry = state.experience.find((e) => e.organization === `Co${i}`)
      expect(newEntry).toBeTruthy()
      expect(ids.has(newEntry!.id)).toBe(false)
      ids.add(newEntry!.id)
    }
  })
})