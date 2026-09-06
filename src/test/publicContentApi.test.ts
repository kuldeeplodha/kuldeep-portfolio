import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PublicContentError,
  getBlogBySlug,
  getCaseStudyBySlug,
  listPublishedBlogs,
  listPublishedCaseStudies,
} from '../lib/content/api'
import { latestForRole } from '../lib/content/usePublicContent'

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response
}

describe('public content API client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('listPublishedBlogs hits the unauthenticated /api/blogs route', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([{ id: 'b1' }]))
    const result = await listPublishedBlogs()
    expect(result).toEqual([{ id: 'b1' }])
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/blogs')
    expect(init).toBeUndefined()
  })

  it('listPublishedCaseStudies hits /api/case-studies', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([]))
    await listPublishedCaseStudies()
    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/case-studies')
  })

  it('getBlogBySlug encodes the slug and hits the single-item route', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ id: 'b1', slug: 'a b' }))
    await getBlogBySlug('a b')
    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/blogs/a%20b')
  })

  it('getCaseStudyBySlug hits the single-item case-study route', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ id: 'c1' }))
    await getCaseStudyBySlug('gesture-pipeline')
    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/case-studies/gesture-pipeline')
  })

  it('a 404 (e.g. a draft) surfaces as a typed PublicContentError', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ detail: 'Not Found' }, 404))
    await expect(getBlogBySlug('draft-only')).rejects.toBeInstanceOf(PublicContentError)
  })

  it('a non-404 failure also surfaces as a PublicContentError with its status', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({}, 500))
    await expect(listPublishedBlogs()).rejects.toMatchObject({ status: 500 })
  })

  it('a network failure surfaces as a PublicContentError, not a raw throw', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('fetch failed'))
    await expect(listPublishedBlogs()).rejects.toBeInstanceOf(PublicContentError)
  })
})

describe('latestForRole', () => {
  const items = [
    { id: '1', relevant_roles: ['ai'], published_at: '2026-01-01T00:00:00Z' },
    { id: '2', relevant_roles: [], published_at: '2026-03-01T00:00:00Z' },
    { id: '3', relevant_roles: ['data'], published_at: '2026-02-01T00:00:00Z' },
  ]

  it('returns the newest-first, role-matching items up to the given count', () => {
    const result = latestForRole(items, 'ai', 3)
    expect(result.map((i) => i.id)).toEqual(['2', '1'])
  })

  it('the "system" role matches everything', () => {
    const result = latestForRole(items, 'system', 3)
    expect(result).toHaveLength(3)
    expect(result[0].id).toBe('2') // newest first
  })

  it('respects the count cap', () => {
    const result = latestForRole(items, 'system', 1)
    expect(result).toHaveLength(1)
  })

  it('an item with no relevant_roles is treated as visible to every role', () => {
    const result = latestForRole(items, 'software', 3)
    expect(result.map((i) => i.id)).toEqual(['2'])
  })
})
