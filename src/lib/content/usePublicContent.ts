import { useEffect, useState } from 'react'
import type { RoleId } from '../../types'
import {
  PublicContentError,
  getBlogBySlug,
  getCaseStudyBySlug,
  listPublishedBlogs,
  listPublishedCaseStudies,
  type CmsBlogPost,
  type CmsCaseStudy,
} from './api'

interface ContentState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// `relevant_roles` on both CMS entities is a raw string[] from the backend,
// but its values are drawn from the same RoleId set the rest of the app
// uses (see V2.2 P2 notes) — 'system' means "shown for every role", same
// convention as portfolioConfig content.
function matchesRole(relevantRoles: string[], roleId: RoleId): boolean {
  return roleId === 'system' || relevantRoles.length === 0 || relevantRoles.includes(roleId) || relevantRoles.includes('system')
}

function useList<T>(fetcher: () => Promise<T[]>): ContentState<T[]> {
  const [state, setState] = useState<ContentState<T[]>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof PublicContentError ? err.message : 'Failed to load content.',
          })
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}

export function usePublishedBlogs(): ContentState<CmsBlogPost[]> {
  return useList(listPublishedBlogs)
}

export function usePublishedCaseStudies(): ContentState<CmsCaseStudy[]> {
  return useList(listPublishedCaseStudies)
}

/** Latest N, role-filtered, newest published_at first — for the homepage strips. */
export function latestForRole<T extends { relevant_roles: string[]; published_at: string | null }>(
  items: T[],
  roleId: RoleId,
  count: number,
): T[] {
  return items
    .filter((item) => matchesRole(item.relevant_roles, roleId))
    .sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime())
    .slice(0, count)
}

function useBySlug<T>(slug: string | undefined, fetcher: (slug: string) => Promise<T>): ContentState<T> {
  // Lazy initializer decides "not found" vs. "loading" synchronously from
  // the slug present on first render, so the effect below never needs to
  // setState for the no-slug case itself (a route without :slug wouldn't
  // render this hook's caller at all, so slug flipping to undefined
  // mid-lifecycle isn't a real transition this app produces).
  const [state, setState] = useState<ContentState<T>>(() =>
    slug ? { data: null, loading: true, error: null } : { data: null, loading: false, error: 'Not found' },
  )

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    // No eager loading-state reset here (kept out of an effect's own
    // synchronous body on purpose): P3 doesn't cross-link between detail
    // pages of the same type, so `slug` changing while this stays mounted
    // isn't a path this app exercises yet. If a future phase adds
    // "related posts" links, revisit this — the previous slug's content
    // would stay on screen (no stale flash, but no spinner either) until
    // the new fetch resolves.
    fetcher(slug)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof PublicContentError ? err.message : 'Failed to load content.',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [slug, fetcher])

  return state
}

export function useBlogBySlug(slug: string | undefined): ContentState<CmsBlogPost> {
  return useBySlug(slug, getBlogBySlug)
}

export function useCaseStudyBySlug(slug: string | undefined): ContentState<CmsCaseStudy> {
  return useBySlug(slug, getCaseStudyBySlug)
}
