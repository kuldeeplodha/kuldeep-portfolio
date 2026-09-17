import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAdminContent, updateAdminContent } from '../lib/admin/siteContent'
import { CmsApiError, getCmsToken } from '../lib/admin/cms'

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response
}

describe('admin site content client', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('getAdminContent hits the admin route with a bearer token', async () => {
    sessionStorage.setItem('kuldeep-portfolio-cms-jwt', 'jwt-abc')
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ section_key: 'profile', data: { name: 'x' }, status: 'published', published_at: null, updated_at: 'now' }),
    )
    const result = await getAdminContent('profile')
    expect(result.section_key).toBe('profile')
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/admin/content/profile')
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer jwt-abc')
  })

  it('updateAdminContent PUTs the section_key alongside the record', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ section_key: 'contact', data: { title: 'x' }, status: 'published', published_at: 'now', updated_at: 'now' }),
    )
    await updateAdminContent('contact', { data: { title: 'x' }, status: 'published', published_at: 'now', updated_at: 'now' })
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/admin/content/contact')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body as string)).toMatchObject({ section_key: 'contact', status: 'published' })
  })

  it('a 401 clears the token and surfaces a CmsApiError', async () => {
    sessionStorage.setItem('kuldeep-portfolio-cms-jwt', 'jwt-abc')
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({}, 401))
    await expect(getAdminContent('profile')).rejects.toBeInstanceOf(CmsApiError)
    expect(getCmsToken()).toBeNull()
  })

  it('a 404 (unpublished key) surfaces as a CmsApiError with status 404', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ detail: 'Content not found' }, 404))
    await expect(getAdminContent('never-seeded')).rejects.toMatchObject({ status: 404 })
  })

  it('a network failure surfaces as a CmsApiError, not a raw throw', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('fetch failed'))
    await expect(getAdminContent('profile')).rejects.toBeInstanceOf(CmsApiError)
  })
})
