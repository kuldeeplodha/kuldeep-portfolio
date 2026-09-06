import { describe, expect, it } from 'vitest'
import { roleQuery, withRoleQuery } from '../lib/roleLink'

describe('roleLink', () => {
  it('roleQuery returns an empty string for the aggregate "system" role', () => {
    expect(roleQuery('system')).toBe('')
  })

  it('roleQuery returns a ?role= param for a specific role', () => {
    expect(roleQuery('ai')).toBe('?role=ai')
    expect(roleQuery('data')).toBe('?role=data')
    expect(roleQuery('software')).toBe('?role=software')
  })

  it('withRoleQuery appends the role query to a bare path', () => {
    expect(withRoleQuery('/blog', 'ai')).toBe('/blog?role=ai')
    expect(withRoleQuery('/case-studies/foo', 'system')).toBe('/case-studies/foo')
  })
})
