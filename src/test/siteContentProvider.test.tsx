import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SiteContentProvider, useSiteContent } from '../lib/content/SiteContentProvider'

// CMS-FE-PROVIDER: the site-content provider must never let a section go
// blank or crash — every read falls back to the bundled src/config default
// on a miss, an empty publish, or a backend error, and shows that fallback
// immediately (no spinner) rather than waiting on the network.

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response
}

interface Profile {
  name: string
}

const FALLBACK_PROFILE: Profile = { name: 'Fallback Name' }

function ProfileProbe() {
  const profile = useSiteContent('profile', FALLBACK_PROFILE)
  return <p>{profile.name}</p>
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useSiteContent — loading state', () => {
  it('renders the fallback immediately, before the fetch resolves (no spinner, no layout shift)', () => {
    // A fetch that never resolves during this test — the initial render is
    // all we're asserting on.
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(new Promise(() => {}))
    render(
      <SiteContentProvider>
        <ProfileProbe />
      </SiteContentProvider>,
    )
    expect(screen.getByText('Fallback Name')).toBeInTheDocument()
  })
})

describe('useSiteContent — fallback path', () => {
  it('falls back when the section_key is absent from the published response', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([{ section_key: 'contact', data: { title: 'x' }, status: 'published', published_at: null, updated_at: 'now' }]),
    )
    render(
      <SiteContentProvider>
        <ProfileProbe />
      </SiteContentProvider>,
    )
    await waitFor(() => expect(screen.getByText('Fallback Name')).toBeInTheDocument())
  })

  it('falls back when the section_key is present but published with empty data', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([{ section_key: 'profile', data: {}, status: 'published', published_at: null, updated_at: 'now' }]),
    )
    render(
      <SiteContentProvider>
        <ProfileProbe />
      </SiteContentProvider>,
    )
    await waitFor(() => expect(screen.getByText('Fallback Name')).toBeInTheDocument())
  })

  it('uses the DB value once it loads, when present and non-empty', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([{ section_key: 'profile', data: { name: 'DB Name' }, status: 'published', published_at: null, updated_at: 'now' }]),
    )
    render(
      <SiteContentProvider>
        <ProfileProbe />
      </SiteContentProvider>,
    )
    await waitFor(() => expect(screen.getByText('DB Name')).toBeInTheDocument())
  })
})

describe('useSiteContent — error path', () => {
  it('falls back forever when the backend is unreachable', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('fetch failed'))
    render(
      <SiteContentProvider>
        <ProfileProbe />
      </SiteContentProvider>,
    )
    await waitFor(() => expect(screen.getByText('Fallback Name')).toBeInTheDocument())
  })

  it('falls back when the backend responds with a non-2xx status', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ detail: 'error' }, 500))
    render(
      <SiteContentProvider>
        <ProfileProbe />
      </SiteContentProvider>,
    )
    await waitFor(() => expect(screen.getByText('Fallback Name')).toBeInTheDocument())
  })
})

describe('useSiteContent — outside a provider', () => {
  it('returns the fallback when there is no SiteContentProvider ancestor', () => {
    render(<ProfileProbe />)
    expect(screen.getByText('Fallback Name')).toBeInTheDocument()
  })
})
