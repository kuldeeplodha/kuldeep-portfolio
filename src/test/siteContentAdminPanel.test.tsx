import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteContentAdminPanel } from '../components/admin/cms/SiteContentAdminPanel'

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SiteContentAdminPanel', () => {
  it('loads the first section and shows its data as JSON', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ section_key: 'profile', data: { name: 'Kuldeep Lodha' }, status: 'published', published_at: 'now', updated_at: 'now' }),
    )
    const user = userEvent.setup()
    render(<SiteContentAdminPanel />)
    
    await user.click(await screen.findByRole('button', { name: 'Switch to Raw JSON' }))
    
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Data (JSON)' }) as HTMLTextAreaElement).value).toContain('Kuldeep Lodha'))
    expect(screen.getByText(/\bpublished\b/)).toBeInTheDocument()
  })

  it('switching sections loads the newly selected key', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ section_key: 'profile', data: { name: 'Kuldeep' }, status: 'published', published_at: 'now', updated_at: 'now' }))
      .mockResolvedValueOnce(jsonResponse({ section_key: 'contact', data: { title: 'Contact title' }, status: 'published', published_at: 'now', updated_at: 'now' }))
    const user = userEvent.setup()
    render(<SiteContentAdminPanel />)
    
    await user.click(await screen.findByRole('button', { name: 'Switch to Raw JSON' }))
    
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Data (JSON)' }) as HTMLTextAreaElement).value).toContain('Kuldeep'))

    await user.click(screen.getByRole('button', { name: 'Contact' }))
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Data (JSON)' }) as HTMLTextAreaElement).value).toContain('Contact title'))
    expect(fetchMock.mock.calls[1][0]).toContain('/api/admin/content/contact')
  })

  it('a 404 (unpublished key) shows an empty draft instead of an error', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ detail: 'Content not found' }, 404))
    const user = userEvent.setup()
    render(<SiteContentAdminPanel />)
    
    await user.click(await screen.findByRole('button', { name: 'Switch to Raw JSON' }))
    
    await waitFor(() => expect(screen.getByText('Not yet published — save to create it.')).toBeInTheDocument())
    expect(screen.getByRole('textbox', { name: 'Data (JSON)' })).toHaveValue('{}')
  })

  it('publishing valid JSON calls PUT and shows a success message', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ section_key: 'profile', data: { name: 'Kuldeep' }, status: 'draft', published_at: null, updated_at: 'now' }))
      .mockResolvedValueOnce(jsonResponse({ section_key: 'profile', data: { name: 'Updated' }, status: 'published', published_at: 'now', updated_at: 'now' }))
    const user = userEvent.setup()
    render(<SiteContentAdminPanel />)
    
    await user.click(await screen.findByRole('button', { name: 'Switch to Raw JSON' }))
    
    const textarea = await screen.findByRole('textbox', { name: 'Data (JSON)' })
    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toContain('Kuldeep'))

    fireEvent.change(textarea, { target: { value: '{"name": "Updated"}' } })
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => expect(screen.getByText('Saved.')).toBeInTheDocument())
    const [, putInit] = fetchMock.mock.calls[1]
    expect(putInit.method).toBe('PUT')
  })

  it('invalid JSON surfaces a parse error instead of calling save', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ section_key: 'profile', data: { name: 'Kuldeep' }, status: 'published', published_at: 'now', updated_at: 'now' }),
    )
    const user = userEvent.setup()
    render(<SiteContentAdminPanel />)
    
    await user.click(await screen.findByRole('button', { name: 'Switch to Raw JSON' }))
    
    const textarea = await screen.findByRole('textbox', { name: 'Data (JSON)' })
    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toContain('Kuldeep'))

    fireEvent.change(textarea, { target: { value: 'not valid json' } })
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText(/Invalid JSON/)).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('save draft via form editor calls PUT with edited payload', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ section_key: 'profile', data: { name: 'Profile' }, status: 'published', published_at: 'now', updated_at: 'now' }))
      .mockResolvedValueOnce(jsonResponse({ section_key: 'contact', data: { title: 'Contact' }, status: 'published', published_at: 'now', updated_at: 'now' }))
      .mockResolvedValueOnce(jsonResponse({ section_key: 'contact', data: { title: 'Updated' }, status: 'draft', published_at: 'now', updated_at: 'now' }))
    
    const user = userEvent.setup()
    const { container } = render(<SiteContentAdminPanel />)
    
    // Switch to contact
    await user.click(await screen.findByRole('button', { name: 'Contact' }))
    
    // Wait for input to render and edit it
    const input = await waitFor(() => container.querySelector('input[type="text"]') as HTMLInputElement)
    fireEvent.change(input, { target: { value: 'Updated' } })
    
    // Click Save draft
    await user.click(screen.getByRole('button', { name: 'Save draft' }))

    // Assert success
    await waitFor(() => expect(screen.getByText('Saved.')).toBeInTheDocument())
    
    // Assert PUT payload
    const [, putInit] = fetchMock.mock.calls[2]
    expect(putInit.method).toBe('PUT')
    const body = JSON.parse(putInit.body)
    expect(body.data.title).toBe('Updated')
    expect(body.status).toBe('draft')
  })

  // 'metrics' alone would also match "Impact Metrics"; anchor to the start
  // of the label to disambiguate the newly-unified "Metrics (legacy...)".
  const LABEL_OVERRIDES: Record<string, RegExp> = {
    roles: /^Role Pages$/i,
    metrics: /^Metrics/i,
  }
  function labelPattern(key: string): RegExp {
    return LABEL_OVERRIDES[key] ?? new RegExp(key, 'i')
  }

  // CMS-UNIFY-CONFIG-EDITOR: the 5 newly-unified keys (roles, certifications,
  // research, projects, metrics) have no CmsFormEditor case — its switch
  // falls through to `default: return null`, i.e. a BLANK form. They must
  // always render the raw-JSON textarea instead of silently showing nothing.
  it.each(['roles', 'certifications', 'research', 'projects', 'metrics'])(
    "'%s' always shows the raw JSON textarea, never a blank form-editor panel",
    async (key) => {
      // mockResolvedValue (not -Once): the panel loads its default first
      // key (profile) on mount before the click below selects the target
      // key, so both fetches need a response.
      ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        jsonResponse({ section_key: key, data: { probe: 'value' }, status: 'published', published_at: 'now', updated_at: 'now' }),
      )
      const user = userEvent.setup()
      render(<SiteContentAdminPanel />)

      await user.click(await screen.findByRole('button', { name: labelPattern(key) }))

      await waitFor(() =>
        expect((screen.getByRole('textbox', { name: 'Data (JSON)' }) as HTMLTextAreaElement).value).toContain('probe'),
      )
      // The "Complex Shape" warning banner only renders on the isComplexShape
      // branch -- its presence confirms these keys never fall through to
      // CmsFormEditor's `default: return null` (a silently blank panel).
      expect(screen.getByText('Complex Shape: Edit as JSON')).toBeInTheDocument()
    },
  )

  it('lists all 20 site_content keys across the sidebar groups (15 original + 5 unified)', () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(new Promise(() => {}))
    render(<SiteContentAdminPanel />)
    for (const key of ['roles', 'certifications', 'research', 'projects', 'metrics']) {
      expect(screen.getByRole('button', { name: labelPattern(key) })).toBeInTheDocument()
    }
  })

  // CMS-UNIFY-CONFIG-EDITOR step (c): bulk export/import against the DB,
  // replacing the retired legacy panel's localStorage-config-JSON download.
  describe('bulk export/import (against the DB, not localStorage)', () => {
    beforeEach(() => {
      vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() })
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    })

    it('exports every key by fetching each admin record and downloading one JSON bundle', async () => {
      ;(fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
        const key = url.split('/').pop()
        return Promise.resolve(
          jsonResponse({ section_key: key, data: { probe: key }, status: 'published', published_at: 'now', updated_at: 'now' }),
        )
      })
      const user = userEvent.setup()
      render(<SiteContentAdminPanel />)

      await user.click(await screen.findByRole('button', { name: 'Export all as JSON' }))

      await waitFor(() => expect(screen.getByText(/Exported all \d+ keys\./)).toBeInTheDocument())
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
    })

    it('reports partial export when some keys 404 (not yet published)', async () => {
      ;(fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
        const key = url.split('/').pop()
        if (key === 'metrics') return Promise.resolve(jsonResponse({ detail: 'Content not found' }, 404))
        return Promise.resolve(
          jsonResponse({ section_key: key, data: { probe: key }, status: 'published', published_at: 'now', updated_at: 'now' }),
        )
      })
      const user = userEvent.setup()
      render(<SiteContentAdminPanel />)

      await user.click(await screen.findByRole('button', { name: 'Export all as JSON' }))

      await waitFor(() => expect(screen.getByText(/\(1 not yet published\)/)).toBeInTheDocument())
    })

    it('imports a bundle by PUTting each key with its own status, then reports a summary', async () => {
      ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        jsonResponse({ section_key: 'profile', data: { name: 'x' }, status: 'published', published_at: 'now', updated_at: 'now' }),
      )
      const user = userEvent.setup()
      render(<SiteContentAdminPanel />)
      await screen.findByRole('button', { name: 'Export all as JSON' })

      const bundle = {
        contact: { section_key: 'contact', data: { title: 'Imported' }, status: 'published', published_at: 'now', updated_at: 'now' },
        footer: { section_key: 'footer', data: { text: 'Imported footer' }, status: 'draft', published_at: null, updated_at: 'now' },
      }
      const file = new File([JSON.stringify(bundle)], 'export.json', { type: 'application/json' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(input, file)

      await waitFor(() => expect(screen.getByText('Imported 2 key(s).')).toBeInTheDocument())

      const putCalls = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.filter(([, init]) => init?.method === 'PUT')
      expect(putCalls.length).toBe(2)
      const bodies = putCalls.map(([, init]) => JSON.parse(init.body))
      expect(bodies.find((b) => b.section_key === 'contact')?.status).toBe('published')
      expect(bodies.find((b) => b.section_key === 'footer')?.status).toBe('draft')
    })

    it('rejects a non-JSON-object import file without calling PUT', async () => {
      ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        jsonResponse({ section_key: 'profile', data: { name: 'x' }, status: 'published', published_at: 'now', updated_at: 'now' }),
      )
      const user = userEvent.setup()
      render(<SiteContentAdminPanel />)
      await screen.findByRole('button', { name: 'Export all as JSON' })

      const file = new File(['not valid json'], 'export.json', { type: 'application/json' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(input, file)

      await waitFor(() => expect(screen.getByText(/Import failed: invalid JSON/)).toBeInTheDocument())
      const putCalls = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.filter(([, init]) => init?.method === 'PUT')
      expect(putCalls.length).toBe(0)
    })
  })
})
