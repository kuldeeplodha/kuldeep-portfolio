import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoleSwitcher } from '../components/ui/RoleSwitcher'
import { validateProfile, parseImportedConfig, exportConfig } from '../lib/config/exportImport'
import { portfolioConfig } from '../config'

describe('RoleSwitcher', () => {
  it('renders all role buttons and calls onRoleChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <RoleSwitcher
        currentRole="software"
        roles={[
          { id: 'software', label: 'Software Engineer' },
          { id: 'ai', label: 'AI / ML' },
        ]}
        onRoleChange={onChange}
      />,
    )

    expect(screen.getByRole('tab', { name: 'Software Engineer' })).toHaveAttribute('aria-selected', 'true')
    await user.click(screen.getByRole('tab', { name: 'AI / ML' }))
    expect(onChange).toHaveBeenCalledWith('ai')
  })
})

describe('config export/import', () => {
  it('exports and parses valid config', () => {
    const json = exportConfig(portfolioConfig)
    const parsed = parseImportedConfig(json)
    expect(parsed.profile.name).toBe('Kuldeep Lodha')
    // Deep round-trip check
    expect(parsed).toEqual(portfolioConfig)
  })

  it('rejects invalid config', () => {
    expect(() => parseImportedConfig('{}')).toThrow('Profile is missing')
  })

  it('rejects config when experience is not an array', () => {
    const malformed = {
      ...portfolioConfig,
      experience: 'not-an-array' as any,
    }
    expect(() => parseImportedConfig(JSON.stringify(malformed))).toThrow('Experience section must be an array')
  })

  it('rejects config when experience is missing required fields', () => {
    const malformed = {
      ...portfolioConfig,
      experience: [
        {
          id: 'exp1',
          role: 'Developer',
          period: '2020-2021',
          // missing organization
        } as any,
      ],
    }
    expect(() => parseImportedConfig(JSON.stringify(malformed))).toThrow('Organization is required')
  })

  it('rejects config when project is missing title', () => {
    const malformed = {
      ...portfolioConfig,
      projects: [
        {
          id: 'proj1',
          overview: 'Brief overview',
          // missing title
        } as any,
      ],
    }
    expect(() => parseImportedConfig(JSON.stringify(malformed))).toThrow('Title is required')
  })

  it('rejects config when AI knowledge matches are empty', () => {
    const malformed = {
      ...portfolioConfig,
      aiKnowledge: [
        {
          id: 'k1',
          questionPatterns: [],
          answer: 'Some answer',
        } as any,
      ],
    }
    expect(() => parseImportedConfig(JSON.stringify(malformed))).toThrow('At least one question pattern is required')
  })

  it('validates profile fields', () => {
    const errors = validateProfile({
      ...portfolioConfig.profile,
      email: 'invalid',
    })
    expect(errors.some((e) => e.includes('Email'))).toBe(true)
  })
})

describe('role filtering', () => {
  it('software role highlights backend metrics', () => {
    const role = portfolioConfig.roles.software
    const metrics = portfolioConfig.metrics.filter((m) =>
      role.highlightedMetricIds.includes(m.id),
    )
    expect(metrics.some((m) => m.id === 'deployment-improvement')).toBe(true)
  })

  it('ai role highlights ML projects', () => {
    const role = portfolioConfig.roles.ai
    expect(role.highlightedProjectIds).toContain('gesture-recognition')
  })
})
