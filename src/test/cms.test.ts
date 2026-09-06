import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CmsApiError,
  cmsLogin,
  cmsVerify,
  clearCmsToken,
  createBlog,
  deleteBlog,
  estimateReadingTimeMinutes,
  getCmsToken,
  isCmsAuthenticated,
  listAdminBlogs,
  slugify,
  updateBlog,
  uploadMedia,
} from '../lib/admin/cms'
import type { CmsBlogPost } from '../lib/admin/cms'

function jsonResponse(body: unknown, init: Partial<Response> & { status?: number } = {}) {
  return {
    ok: (init.status ?? 200) < 400,
    status: init.status ?? 200,
    statusText: 'OK',
    json: async () => body,
  } as Response
}

const sampleBlog: CmsBlogPost = {
  id: 'b1',
  slug: 'hello',
  title: 'Hello',
  excerpt: 'x',
  body: 'word '.repeat(400),
  status: 'draft',
  published_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  tags: [],
  relevant_roles: [],
  reading_time_minutes: 1,
  featured_media_url: null,
  media_urls: [],
}

describe('cms client', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('slugify normalizes titles into URL-safe slugs', () => {
    expect(slugify('  Hello, World! ')).toBe('hello-world')
  })

  it('estimateReadingTimeMinutes rounds word count to whole minutes, minimum 1', () => {
    expect(estimateReadingTimeMinutes('one two three')).toBe(1)
    expect(estimateReadingTimeMinutes('word '.repeat(400))).toBe(2)
  })

  it('cmsLogin stores the returned token and isCmsAuthenticated reflects it', async () => {
    expect(isCmsAuthenticated()).toBe(false)
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ token: 'jwt-abc', expiresIn: 86400 }),
    )
    await cmsLogin('correct-password')
    expect(getCmsToken()).toBe('jwt-abc')
    expect(isCmsAuthenticated()).toBe(true)
  })

  it('cmsLogin surfaces a CmsApiError on invalid credentials', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ detail: 'Invalid credentials' }, { status: 401 }),
    )
    await expect(cmsLogin('wrong')).rejects.toBeInstanceOf(CmsApiError)
  })

  it('cmsVerify returns false and clears the token on a 401', async () => {
    sessionStorage.setItem('kuldeep-portfolio-cms-jwt', 'stale-token')
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ detail: 'expired' }, { status: 401 }),
    )
    expect(await cmsVerify()).toBe(false)
    expect(getCmsToken()).toBeNull()
  })

  it('listAdminBlogs attaches the bearer token and hits the admin endpoint', async () => {
    sessionStorage.setItem('kuldeep-portfolio-cms-jwt', 'jwt-abc')
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([sampleBlog]))
    const posts = await listAdminBlogs()
    expect(posts).toEqual([sampleBlog])
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/admin/blogs')
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer jwt-abc')
  })

  it('createBlog POSTs the full payload', async () => {
    sessionStorage.setItem('kuldeep-portfolio-cms-jwt', 'jwt-abc')
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse(sampleBlog))
    await createBlog(sampleBlog)
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string).id).toBe('b1')
  })

  it('updateBlog issues a PUT to the per-id route (may 404 until the backend adds it)', async () => {
    sessionStorage.setItem('kuldeep-portfolio-cms-jwt', 'jwt-abc')
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ detail: 'Not Found' }, { status: 404 }),
    )
    await expect(updateBlog('b1', sampleBlog)).rejects.toBeInstanceOf(CmsApiError)
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/admin/blogs/b1')
    expect(init.method).toBe('PUT')
  })

  it('deleteBlog issues a DELETE to the per-id route', async () => {
    sessionStorage.setItem('kuldeep-portfolio-cms-jwt', 'jwt-abc')
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: 'No Content',
      json: async () => undefined,
    } as Response)
    await deleteBlog('b1')
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/admin/blogs/b1')
    expect(init.method).toBe('DELETE')
  })

  it('a network failure surfaces as a CmsApiError instead of throwing raw', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('fetch failed'))
    await expect(listAdminBlogs()).rejects.toBeInstanceOf(CmsApiError)
  })

  it('uploadMedia signs via the backend then uploads directly to Cloudinary', async () => {
    sessionStorage.setItem('kuldeep-portfolio-cms-jwt', 'jwt-abc')
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ signature: 'sig', timestamp: 111, apiKey: 'key', cloudName: 'cloud' }),
      )
      .mockResolvedValueOnce(jsonResponse({ secure_url: 'https://res.cloudinary.com/cloud/img.jpg' }))

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })
    const url = await uploadMedia(file)
    expect(url).toBe('https://res.cloudinary.com/cloud/img.jpg')
    expect(fetchMock.mock.calls[1][0]).toContain('api.cloudinary.com/v1_1/cloud/auto/upload')
  })

  it('clearCmsToken removes the stored session', () => {
    sessionStorage.setItem('kuldeep-portfolio-cms-jwt', 'jwt-abc')
    clearCmsToken()
    expect(getCmsToken()).toBeNull()
  })
})
