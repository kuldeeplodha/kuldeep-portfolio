// CMS-RESTORE-FRIENDLY-PANEL: bridges the restored multi-tab
// Configuration Panel (src/pages/AdminPage.tsx, a single in-memory
// PortfolioConfig-shaped reducer — see lib/admin/configReducer.ts) to
// the DB-backed site_content store, replacing the old localStorage-only
// persistence (the root cause of the PR #78 Save-Draft-does-nothing bug).
//
// The reducer needs ONE synchronous PortfolioConfig object; the DB has
// one row per section_key. This module fetches/writes each friendly
// tab's slice independently and merges/splits it against that object.
import { getAdminContent, updateAdminContent, type SiteContentRecord } from './siteContent'
import { CmsApiError } from './cms'
import type { PortfolioConfig } from '../../types'

// Every friendly-tab field this panel edits, mapped to its DB
// section_key (kebab-case, matches backend/routers/content.py). 'certs'
// (the tab id) and 'aiKnowledge' (the config field name) both differ
// from their DB key spelling — captured here once, not scattered.
export const FRIENDLY_FIELD_TO_KEY: Record<string, string> = {
  profile: 'profile',
  experience: 'experience',
  projects: 'projects',
  roles: 'roles',
  metrics: 'metrics',
  skills: 'skills',
  education: 'education',
  certifications: 'certifications',
  aiKnowledge: 'ai-knowledge',
  // research is special-cased below: one DB record holds both
  // `research` (array) and `researchIntro` (string).
}

export const FRIENDLY_DB_KEYS = [
  'profile',
  'experience',
  'projects',
  'roles',
  'metrics',
  'skills',
  'education',
  'certifications',
  'ai-knowledge',
  'research',
]

// configReducer.ts's ConfigSection names (used by patchEntity/insertEntity/
// removeEntity/duplicateEntity/moveEntity) already match FRIENDLY_FIELD_TO_KEY's
// keys 1:1 except for the two actions that don't carry a `section` at all
// (patchProfile -> profile, patchRole -> roles) — those are handled by name
// directly wherever this map is consulted.
export function friendlyFieldToDbKey(field: string): string | undefined {
  return FRIENDLY_FIELD_TO_KEY[field]
}

export interface FriendlyLoadResult {
  config: Partial<PortfolioConfig>
  failedKeys: string[]
}

/**
 * Fetches every friendly-panel DB key and returns a partial config
 * patch built from whichever succeeded. A 404 (key never published)
 * is not a failure — it just means "no DB override yet, keep the
 * bundled default", same fallback semantics as useSiteContent().
 */
export async function loadFriendlyConfigFromDB(): Promise<FriendlyLoadResult> {
  const patch: Partial<PortfolioConfig> = {}
  const failedKeys: string[] = []

  const entries = Object.entries(FRIENDLY_FIELD_TO_KEY) as [keyof PortfolioConfig, string][]
  const results = await Promise.allSettled([
    ...entries.map(([field, dbKey]) =>
      getAdminContent(dbKey).then((r) => ({ field, dbKey, record: r })),
    ),
    getAdminContent('research').then((r) => ({ field: '__research__' as const, dbKey: 'research', record: r })),
  ])

  for (const result of results) {
    if (result.status === 'rejected') {
      const err = result.reason
      if (err instanceof CmsApiError && err.status === 404) continue
      continue
    }
    const { field, record } = result.value
    if (record.data == null) continue
    if (field === '__research__') {
      const data = record.data as { research?: unknown; researchIntro?: unknown }
      if (Array.isArray(data.research)) patch.research = data.research as PortfolioConfig['research']
      if (typeof data.researchIntro === 'string') patch.researchIntro = data.researchIntro
      continue
    }
    ;(patch as any)[field] = record.data
  }

  return { config: patch, failedKeys }
}

export interface FriendlySaveResult {
  savedKeys: string[]
  failedKeys: string[]
}

/**
 * Writes ONLY the dirty (changed-since-load) friendly-panel keys back
 * to the DB. `status` controls draft vs. publish; published_at only
 * advances on a publish.
 *
 * CMS-RESTORE-FRIENDLY-PANEL steer (god, conv-cms-restore): an earlier
 * version of this function blanket-wrote all 10 keys on every save.
 * Since DB status is per-key and live, that would have flipped every
 * currently-PUBLISHED-but-untouched section back to 'draft' on any
 * single-field edit elsewhere — pulling it off the public site until
 * manually re-published. Only sections the human actually touched may
 * ever be written; everything else keeps its existing DB status
 * untouched, full stop.
 */
export async function saveFriendlyConfigToDB(
  config: PortfolioConfig,
  status: 'draft' | 'published',
  dirtyKeys: ReadonlySet<string> | readonly string[],
): Promise<FriendlySaveResult> {
  const ts = new Date().toISOString()
  const savedKeys: string[] = []
  const failedKeys: string[] = []
  const dirty = dirtyKeys instanceof Set ? dirtyKeys : new Set(dirtyKeys)

  const allWrites: { dbKey: string; data: unknown }[] = Object.entries(FRIENDLY_FIELD_TO_KEY).map(
    ([field, dbKey]) => ({ dbKey, data: (config as any)[field] }),
  )
  allWrites.push({ dbKey: 'research', data: { research: config.research, researchIntro: config.researchIntro } })
  const writes = allWrites.filter((w) => dirty.has(w.dbKey))

  const results = await Promise.allSettled(
    writes.map(async ({ dbKey, data }) => {
      const existing = await getAdminContent(dbKey).catch((err) => {
        if (err instanceof CmsApiError && err.status === 404) return null
        throw err
      })
      const record: Omit<SiteContentRecord, 'section_key'> = {
        data,
        status,
        published_at: status === 'published' ? ts : (existing?.published_at ?? null),
        updated_at: ts,
      }
      await updateAdminContent(dbKey, record)
      return dbKey
    }),
  )

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') savedKeys.push(r.value)
    else failedKeys.push(writes[i].dbKey)
  })

  return { savedKeys, failedKeys }
}
