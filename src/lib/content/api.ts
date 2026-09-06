// V2.2 P3: unauthenticated reads against the public content endpoints
// (backend/routers/{blogs,case_studies}.py). Shares the base-URL resolution
// and entity types with the admin CMS client (src/lib/admin/cms.ts) rather
// than duplicating them — these are the same two tables, just the
// published-only, no-JWT side of that same API.
import { getApiBase, type CmsBlogPost, type CmsCaseStudy } from '../admin/cms'

export class PublicContentError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'PublicContentError'
    this.status = status
  }
}

async function get<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${getApiBase()}/api${path}`)
  } catch {
    throw new PublicContentError('Could not reach the content backend.', 0)
  }
  if (res.status === 404) {
    throw new PublicContentError('Not found', 404)
  }
  if (!res.ok) {
    throw new PublicContentError(`Request failed (${res.status})`, res.status)
  }
  return (await res.json()) as T
}

export function listPublishedBlogs(): Promise<CmsBlogPost[]> {
  return get('/blogs')
}

export function getBlogBySlug(slug: string): Promise<CmsBlogPost> {
  return get(`/blogs/${encodeURIComponent(slug)}`)
}

export function listPublishedCaseStudies(): Promise<CmsCaseStudy[]> {
  return get('/case-studies')
}

export function getCaseStudyBySlug(slug: string): Promise<CmsCaseStudy> {
  return get(`/case-studies/${encodeURIComponent(slug)}`)
}

export type { CmsBlogPost, CmsCaseStudy }
