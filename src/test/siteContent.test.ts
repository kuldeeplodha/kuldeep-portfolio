import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SiteContentError, fetchAllSiteContent } from '../lib/content/siteContent'
import { clearCmsToken, setCmsToken } from '../lib/admin/cms'

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response
}

describe('fetchAllSiteContent', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    clearCmsToken()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    clearCmsToken()
  })

  it('hits the unauthenticated /api/content route and returns the parsed list', async () => {
    const items = [{ section_key: 'profile', data: { name: 'Kuldeep' }, status: 'published', published_at: null, updated_at: 'now' }]
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse(items))
    const result = await fetchAllSiteContent()
    expect(result).toEqual(items)
    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/content')
  })

  it('with no admin token: plain request, no cache-bust, no cache override', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([]))
    await fetchAllSiteContent()
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('http://localhost:8000/api/content')
    expect(init).toBeUndefined()
  })

  it('with a valid admin token: cache-busts the request but never sends the token itself', async () => {
    setCmsToken('a-real-jwt')
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([]))
    await fetchAllSiteContent()
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toMatch(/\/api\/content\?t=\d+/)
    expect(init).toMatchObject({ cache: 'no-store' })
    expect(JSON.stringify(init)).not.toContain('a-real-jwt')
  })

  it('a non-2xx response surfaces as a typed SiteContentError', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({}, 500))
    await expect(fetchAllSiteContent()).rejects.toBeInstanceOf(SiteContentError)
  })

  it('a network failure surfaces as a SiteContentError, not a raw throw', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('fetch failed'))
    await expect(fetchAllSiteContent()).rejects.toBeInstanceOf(SiteContentError)
  })
})
