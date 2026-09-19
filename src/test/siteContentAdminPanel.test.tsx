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
      .mockResolvedValueOnce(jsonResponse({ section_key: 'contact', data: { title: 'Contact title' }, status: 'published', published_at: 'now', updated_at: 'now' }))
      .mockResolvedValueOnce(jsonResponse({ section_key: 'footer', data: { text: 'Footer text' }, status: 'published', published_at: 'now', updated_at: 'now' }))
    const user = userEvent.setup()
    render(<SiteContentAdminPanel />)

    await user.click(await screen.findByRole('button', { name: 'Switch to Raw JSON' }))

    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Data (JSON)' }) as HTMLTextAreaElement).value).toContain('Contact title'))

    await user.click(screen.getByRole('button', { name: 'Footer' }))
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Data (JSON)' }) as HTMLTextAreaElement).value).toContain('Footer text'))
    expect(fetchMock.mock.calls[1][0]).toContain('/api/admin/content/footer')
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
      .mockResolvedValueOnce(jsonResponse({ section_key: 'contact', data: { title: 'Contact' }, status: 'published', published_at: 'now', updated_at: 'now' }))
      .mockResolvedValueOnce(jsonResponse({ section_key: 'contact', data: { title: 'Updated' }, status: 'draft', published_at: 'now', updated_at: 'now' }))

    const { container } = render(<SiteContentAdminPanel />)

    // 'contact' is the first/default key — no click needed to select it,
    // but wait for the initial GET to resolve before the form renders.
    await screen.findByRole('button', { name: 'Switch to Raw JSON' })
    const input = await waitFor(() => {
      const el = container.querySelector('input[type="text"]') as HTMLInputElement | null
      if (!el) throw new Error('input not rendered yet')
      return el
    })
    fireEvent.change(input, { target: { value: 'Updated' } })

    // Click Save draft
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Save draft' }))

    // Assert success
    await waitFor(() => expect(screen.getByText('Saved.')).toBeInTheDocument())

    // Assert PUT payload
    const [, putInit] = fetchMock.mock.calls[1]
    expect(putInit.method).toBe('PUT')
    const body = JSON.parse(putInit.body)
    expect(body.data.title).toBe('Updated')
    expect(body.status).toBe('draft')
  })

  // CMS-RESTORE-FRIENDLY-PANEL: profile/experience/projects/roles/
  // metrics/skills/education/certifications/research/ai-knowledge moved
  // to the restored friendly forms (AdminPage.tsx) and were removed from
  // this panel's SECTION_GROUPS, so they're no longer listed or
  // fetchable here — this generic editor is now the catch-all for the
  // other 10 keys only. 'experience-story' still has no CmsFormEditor
  // case (falls through to `default: return null`), so it still must
  // always render the raw-JSON textarea.
  it("'experience-story' always shows the raw JSON textarea, never a blank form-editor panel", async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ section_key: 'experience-story', data: { probe: 'value' }, status: 'published', published_at: 'now', updated_at: 'now' }),
    )
    const user = userEvent.setup()
    render(<SiteContentAdminPanel />)

    await user.click(await screen.findByRole('button', { name: 'Experience Story' }))

    await waitFor(() =>
      expect((screen.getByRole('textbox', { name: 'Data (JSON)' }) as HTMLTextAreaElement).value).toContain('probe'),
    )
    expect(screen.getByText('Complex Shape: Edit as JSON')).toBeInTheDocument()
  })

  it('lists the 10 catch-all keys not covered by the friendly forms', () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(new Promise(() => {}))
    render(<SiteContentAdminPanel />)
    for (const label of [
      'Contact',
      'Footer',
      'Engineering Signal',
      'Impact Metrics',
      'Experience Story',
      'Career Journey',
      'Currently Exploring',
      'Philosophy',
      'Ask Kuldeep',
      'Resumes',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    // The 10 friendly-form-owned keys must NOT appear here anymore.
    expect(screen.queryByRole('button', { name: 'Role Pages' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Profile' })).not.toBeInTheDocument()
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
        if (key === 'resumes') return Promise.resolve(jsonResponse({ detail: 'Content not found' }, 404))
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
