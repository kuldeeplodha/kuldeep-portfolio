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
    render(<SiteContentAdminPanel />)
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
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Data (JSON)' }) as HTMLTextAreaElement).value).toContain('Kuldeep'))

    await user.click(screen.getByRole('button', { name: 'Contact' }))
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Data (JSON)' }) as HTMLTextAreaElement).value).toContain('Contact title'))
    expect(fetchMock.mock.calls[1][0]).toContain('/api/admin/content/contact')
  })

  it('a 404 (unpublished key) shows an empty draft instead of an error', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ detail: 'Content not found' }, 404))
    render(<SiteContentAdminPanel />)
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
    const textarea = await screen.findByRole('textbox', { name: 'Data (JSON)' })
    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toContain('Kuldeep'))

    fireEvent.change(textarea, { target: { value: 'not valid json' } })
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText(/Invalid JSON/)).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
