// CMS-FE-PROVIDER: unauthenticated read against the generic site-content
// endpoint (backend/routers/content.py, PR #62). Shares the base-URL
// resolution with the other public/admin content clients rather than
// duplicating it (src/lib/admin/cms.ts, src/lib/content/api.ts).
import { getApiBase, getCmsToken } from '../admin/cms'

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
 *
 * The endpoint is public (no auth) — GET /api/content sets a 60s CDN
 * s-maxage so anonymous visitors get the fast cached path. A logged-in
 * admin (a valid CMS token present — see getCmsToken/lib/admin/cms.ts)
 * needs to see their own just-published edit immediately rather than
 * wait out that window, so ONLY when a token is present we cache-bust:
 * a unique query param plus `cache: 'no-store'` forces the browser (and
 * any intermediary) past the cached response to the origin. The token
 * itself is never sent — this is cache-busting, not auth, and doing it
 * for every visitor would defeat the entire point of the CDN cache.
 */
export async function fetchAllSiteContent(): Promise<SiteContentItem[]> {
  const isAdmin = Boolean(getCmsToken())
  const url = isAdmin ? `${getApiBase()}/api/content?t=${Date.now()}` : `${getApiBase()}/api/content`
  let res: Response
  try {
    res = isAdmin
      ? await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      : await fetch(url)
  } catch {
    throw new SiteContentError('Could not reach the content backend.', 0)
  }
  if (!res.ok) {
    throw new SiteContentError(`Request failed (${res.status})`, res.status)
  }
  return (await res.json()) as SiteContentItem[]
}
