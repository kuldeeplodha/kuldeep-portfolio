import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { RoleSwitcher } from '../components/ui/RoleSwitcher'
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

// CMS-UNIFY-CONFIG-EDITOR: 'config export/import' (exportConfig/
// parseImportedConfig/validateProfile) removed along with the retired
// src/lib/config/exportImport.ts.

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

describe('catch-all route', () => {
  it('renders NotFound content for unknown paths', () => {
    render(
      <MemoryRouter initialEntries={['/some-unknown-path']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeVisible()
    expect(screen.getByText(/doesn't exist or has moved/i)).toBeVisible()
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })

  it('still matches known routes exactly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: "1", title: "Gesture Recognition" }) }));
    render(
      <MemoryRouter initialEntries={['/projects/gesture-recognition']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /gesture recognition/i })).toBeVisible()
    expect(screen.queryByRole('heading', { name: /page not found/i })).toBeNull()
    vi.unstubAllGlobals();
  })
})
