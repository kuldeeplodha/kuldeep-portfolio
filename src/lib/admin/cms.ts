// V2.2 P2: thin client for the FastAPI/Turso content backend (Alex's V2.2-P1
// scaffold, backend/). This is a SEPARATE auth system from lib/admin/auth.ts
// (the existing client-side hash gate for the static-config panel) — the CMS
// endpoints are real server-side JWT-protected routes, so the token here is
// meaningful bearer auth, not just a local unlock flag.
//
// Known gap (flagged to Alex/god, see hive outbox): the backend only exposes
// GET (list) and POST (create) for /api/admin/blogs and /api/admin/case-studies.
// PUT (update) and DELETE do not exist yet, even though the PRD (AC-2.1/2.2)
// and this UI need them. The request builders below are written against the
// PRD's documented paths (PUT/DELETE `/api/admin/{resource}/{id}`) so the UI
// is ready the moment those routes land — until then, calling update()/
// remove() will fail with a 404/405 from the live backend, which the UI
// surfaces as a normal request-error state rather than crashing.

const TOKEN_KEY = 'kuldeep-portfolio-cms-jwt'

export function getApiBase(): string {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000'
}

export function getCmsToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setCmsToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearCmsToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function isCmsAuthenticated(): boolean {
  return Boolean(getCmsToken())
}

export class CmsApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'CmsApiError'
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getCmsToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${getApiBase()}/api${path}`, { ...init, headers })
  } catch {
    throw new CmsApiError('Could not reach the backend. Is it running locally?', 0)
  }

  if (res.status === 401) {
    clearCmsToken()
    throw new CmsApiError('Session expired — please sign in again.', 401)
  }
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body?.detail ?? detail
    } catch {
      // response had no JSON body — keep statusText
    }
    throw new CmsApiError(detail || `Request failed (${res.status})`, res.status)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// --- Auth ---

export async function cmsLogin(password: string): Promise<void> {
  const { token } = await request<{ token: string; expiresIn: number }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
  setCmsToken(token)
}

export async function cmsVerify(): Promise<boolean> {
  if (!getCmsToken()) return false
  try {
    await request('/auth/verify')
    return true
  } catch {
    return false
  }
}

// --- Content types (mirrors backend/models.py) ---

export type ContentStatus = 'draft' | 'published' | 'archived'

export interface CmsBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  status: ContentStatus
  published_at: string | null
  created_at: string
  updated_at: string
  tags: string[]
  relevant_roles: string[]
  reading_time_minutes: number
  featured_media_url: string | null
  media_urls: string[]
}

export interface CmsCaseStudy {
  id: string
  slug: string
  title: string
  subtitle: string
  summary: string
  client_or_org: string
  period: string
  category: string
  status: ContentStatus
  featured: number
  published_at: string | null
  created_at: string
  updated_at: string
  technologies: string[]
  relevant_roles: string[]
  problem: string
  context: string
  architecture: string
  outcome: string
  future_improvements: string | null
  github_url: string | null
  live_url: string | null
  featured_media_url: string | null
  media_urls: string[]
}

// --- Blogs ---

export function listAdminBlogs(): Promise<CmsBlogPost[]> {
  return request('/admin/blogs')
}

export function createBlog(blog: CmsBlogPost): Promise<CmsBlogPost> {
  return request('/admin/blogs', { method: 'POST', body: JSON.stringify(blog) })
}

// Not yet supported by the live backend — see the file-header note.
export function updateBlog(id: string, blog: CmsBlogPost): Promise<CmsBlogPost> {
  return request(`/admin/blogs/${id}`, { method: 'PUT', body: JSON.stringify(blog) })
}

// Not yet supported by the live backend — see the file-header note.
export function deleteBlog(id: string): Promise<void> {
  return request(`/admin/blogs/${id}`, { method: 'DELETE' })
}

// --- Case studies ---

export function listAdminCaseStudies(): Promise<CmsCaseStudy[]> {
  return request('/admin/case-studies')
}

export function createCaseStudy(cs: CmsCaseStudy): Promise<CmsCaseStudy> {
  return request('/admin/case-studies', { method: 'POST', body: JSON.stringify(cs) })
}

// Not yet supported by the live backend — see the file-header note.
export function updateCaseStudy(id: string, cs: CmsCaseStudy): Promise<CmsCaseStudy> {
  return request(`/admin/case-studies/${id}`, { method: 'PUT', body: JSON.stringify(cs) })
}

// Not yet supported by the live backend — see the file-header note.
export function deleteCaseStudy(id: string): Promise<void> {
  return request(`/admin/case-studies/${id}`, { method: 'DELETE' })
}

// --- Media (Cloudinary signed upload) ---

interface MediaSignature {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
}

function getMediaSignature(): Promise<MediaSignature> {
  return request('/admin/media/sign')
}

// Signs via the backend, then uploads directly to Cloudinary from the
// browser — the API secret never leaves the server (see backend/routers/media.py).
export async function uploadMedia(file: File): Promise<string> {
  const sig = await getMediaSignature()
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.apiKey)
  form.append('timestamp', String(sig.timestamp))
  form.append('signature', sig.signature)

  let res: Response
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
      method: 'POST',
      body: form,
    })
  } catch {
    throw new CmsApiError('Could not reach Cloudinary for upload.', 0)
  }
  if (!res.ok) {
    throw new CmsApiError(`Upload failed (${res.status})`, res.status)
  }
  const body = await res.json()
  return body.secure_url as string
}

// --- Small shared helpers ---

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function estimateReadingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function nowIso(): string {
  return new Date().toISOString()
}
