// CMS-FE-PROVIDER: unauthenticated read against the generic site-content
// endpoint (backend/routers/content.py, PR #62). Shares the base-URL
// resolution with the other public/admin content clients rather than
// duplicating it (src/lib/admin/cms.ts, src/lib/content/api.ts).
import { getApiBase } from '../admin/cms'

export interface SiteContentItem {
  section_key: string
  data: unknown
  status: string
  published_at: string | null
  updated_at: string
}

export class SiteContentError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'SiteContentError'
    this.status = status
  }
}

/**
 * Fetches every published section in one request (GET /api/content) rather
 * than one request per section_key — this is the whole "cache/dedupe
 * requests" story: there is nothing to dedupe because the app only ever
 * makes this one call, once, on mount (see SiteContentProvider).
 */
export async function fetchAllSiteContent(): Promise<SiteContentItem[]> {
  let res: Response
  try {
    res = await fetch(`${getApiBase()}/api/content`)
  } catch {
    throw new SiteContentError('Could not reach the content backend.', 0)
  }
  if (!res.ok) {
    throw new SiteContentError(`Request failed (${res.status})`, res.status)
  }
  return (await res.json()) as SiteContentItem[]
}
