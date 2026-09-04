import { describe, expect, it, afterEach } from 'vitest'
import { act } from 'react'
import { renderHook, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useRole } from '../hooks/useRole'

/**
 * Exercises useRole's branch logic: role parsing (valid / invalid / default),
 * setRole (no-op, set, delete), and the role-scoped filtering memos across a
 * highlighted-id role and the "system" fallback role. Raises hook branch
 * coverage toward the V1.4 floor.
 */
function wrapperFor(initialEntry: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  )
}

afterEach(() => cleanup())

describe('useRole', () => {
  it('defaults to system role when no ?role param is present', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapperFor('/') })
    expect(result.current.roleId).toBe('system')
    expect(result.current.allRoles.length).toBe(4)
    // system role: skills/certs use the roleId==='system' inclusion arm
    expect(result.current.filteredSkills.length).toBeGreaterThan(0)
    expect(result.current.filteredCertifications.length).toBeGreaterThan(0)
    expect(result.current.skillChains.length).toBeGreaterThan(0)
  })

  it('falls back to system for an unknown role value', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapperFor('/?role=bogus') })
    expect(result.current.roleId).toBe('system')
  })

  it('parses a valid non-system role and applies role-scoped filtering', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapperFor('/?role=software') })
    expect(result.current.roleId).toBe('software')
    expect(result.current.role.themeId).toBeDefined()
    // memos should all resolve without throwing and return arrays
    expect(Array.isArray(result.current.filteredMetrics)).toBe(true)
    expect(Array.isArray(result.current.filteredProjects)).toBe(true)
    expect(Array.isArray(result.current.sortedExperience)).toBe(true)
    expect(Array.isArray(result.current.filteredSkills)).toBe(true)
    expect(Array.isArray(result.current.filteredCertifications)).toBe(true)
    expect(result.current.skillChains.length).toBeGreaterThan(0)
  })

  it('setRole to the current role is a no-op', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapperFor('/?role=ai') })
    expect(result.current.roleId).toBe('ai')
    act(() => result.current.setRole('ai'))
    expect(result.current.roleId).toBe('ai')
    expect(result.current.isTransitioning).toBe(false)
  })

  it('setRole to a different non-system role sets the query param', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapperFor('/?role=software') })
    act(() => result.current.setRole('data'))
    expect(result.current.roleId).toBe('data')
    expect(result.current.isTransitioning).toBe(true)
  })

  it('setRole to system removes the query param', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapperFor('/?role=software') })
    act(() => result.current.setRole('system'))
    expect(result.current.roleId).toBe('system')
  })
})
