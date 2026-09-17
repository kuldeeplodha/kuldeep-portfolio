// CMS-FE-ADMIN-EDITOR: JWT-authenticated client for the generic
// site_content admin endpoints (backend/routers/content.py, PR #62).
// Reuses the same token/base-URL plumbing as the blog/case-study admin
// client (lib/admin/cms.ts) — it's the same login session.
import { getApiBase, getCmsToken, clearCmsToken, CmsApiError } from './cms'

export interface SiteContentRecord {
  section_key: string
  data: unknown
  status: string
  published_at: string | null
  updated_at: string
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

export function getAdminContent(sectionKey: string): Promise<SiteContentRecord> {
  return request(`/admin/content/${encodeURIComponent(sectionKey)}`)
}

export function updateAdminContent(
  sectionKey: string,
  record: Pick<SiteContentRecord, 'data' | 'status' | 'published_at' | 'updated_at'>,
): Promise<SiteContentRecord> {
  return request(`/admin/content/${encodeURIComponent(sectionKey)}`, {
    method: 'PUT',
    body: JSON.stringify({ section_key: sectionKey, ...record }),
  })
}
