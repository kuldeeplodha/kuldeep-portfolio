import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchAllSiteContent } from './siteContent'

type ContentMap = Record<string, unknown>

interface SiteContentContextValue {
  contentByKey: ContentMap
  status: 'loading' | 'ready' | 'error'
}

const initialState: SiteContentContextValue = { contentByKey: {}, status: 'loading' }

// Calling useSiteContent() outside a provider (e.g. a unit test that
// doesn't wrap its component) hits this default — status stays 'loading'
// forever, which useSiteContent already treats as "use the fallback".
const SiteContentContext = createContext<SiteContentContextValue>(initialState)

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SiteContentContextValue>(initialState)

  useEffect(() => {
    let cancelled = false
    fetchAllSiteContent()
      .then((items) => {
        if (cancelled) return
        const contentByKey: ContentMap = {}
        for (const item of items) contentByKey[item.section_key] = item.data
        setState({ contentByKey, status: 'ready' })
      })
      .catch(() => {
        if (!cancelled) setState({ contentByKey: {}, status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <SiteContentContext.Provider value={state}>{children}</SiteContentContext.Provider>
}

function isEmpty(value: unknown): boolean {
  if (Array.isArray(value)) return value.length === 0
  if (value !== null && typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Reads DB-backed content for `sectionKey`, falling back to the bundled
 * `src/config` default whenever the key is missing, published with empty
 * data, or the backend is unreachable/erroring — every section must keep
 * rendering real content even if the DB is down (PRD AC-4).
 *
 * There is no separate loading UI: the fallback IS what renders while the
 * fetch is in flight (identical shape to what will load, so there's no
 * layout shift), and it's what stays on screen permanently if the fetch
 * never succeeds. `status` only ever flips the DISPLAYED value once, from
 * fallback to the live DB value — never to a spinner or blank state.
 */
export function useSiteContent<T>(sectionKey: string, fallback: T): T {
  const { contentByKey, status } = useContext(SiteContentContext)
  if (status !== 'ready') return fallback
  const value = contentByKey[sectionKey]
  if (value === undefined || value === null || isEmpty(value)) return fallback
  return value as T
}
