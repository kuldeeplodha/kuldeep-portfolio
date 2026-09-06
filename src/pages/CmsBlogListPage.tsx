import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { useRole } from '../hooks/useRole'
import { withRoleQuery } from '../lib/roleLink'
import { usePublishedBlogs } from '../lib/content/usePublicContent'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { GRID_PADDING, GRID_WIDTH } from '../components/ui/grid'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// V2.2 P3 (PRD §6.2, AC-3.2): CMS-backed "/blog Archive" — "Bento grid
// layout of all published articles with tag filtering and instant
// client-side title/excerpt search." Replaces the markdown-sourced
// BlogListPage at this route (see src/pages/BlogListPage.tsx — kept,
// unrouted, for P4's migration/fallback work; NOT deleted).
export function CmsBlogListPage() {
  useDocumentMeta('Blog | Kuldeep Lodha', 'Engineering articles and notes.')
  const { roleId } = useRole()
  const { data, loading, error } = usePublishedBlogs()
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const roleFiltered = useMemo(() => {
    if (!data) return []
    return roleId === 'system'
      ? data
      : data.filter((p) => p.relevant_roles.length === 0 || p.relevant_roles.includes(roleId) || p.relevant_roles.includes('system'))
  }, [data, roleId])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    roleFiltered.forEach((p) => p.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [roleFiltered])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    return roleFiltered
      .filter((p) => tagFilter === 'all' || p.tags.includes(tagFilter))
      .filter((p) => !query || p.title.toLowerCase().includes(query) || p.excerpt.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime())
  }, [roleFiltered, tagFilter, search])

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`${GRID_PADDING} mx-auto ${GRID_WIDTH} py-16 sm:py-20`}
      style={{ minHeight: '80vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Notes on the systems and decisions behind the work.
      </p>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="sr-only" htmlFor="blog-search">
          Search articles
        </label>
        <input
          id="blog-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or excerpt…"
          className="w-full max-w-xs rounded-[var(--radius-base)] border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
        />
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
            <button
              type="button"
              onClick={() => setTagFilter('all')}
              aria-pressed={tagFilter === 'all'}
              className="rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-medium"
              style={{
                borderColor: tagFilter === 'all' ? 'var(--color-accent)' : 'var(--color-border)',
                color: tagFilter === 'all' ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag)}
                aria-pressed={tagFilter === tag}
                className="rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-medium"
                style={{
                  borderColor: tagFilter === tag ? 'var(--color-accent)' : 'var(--color-border)',
                  color: tagFilter === tag ? 'var(--color-accent)' : 'var(--color-text-muted)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <p role="status" style={{ color: 'var(--color-text-muted)' }}>
          Loading posts…
        </p>
      )}
      {error && !loading && (
        <p role="alert" style={{ color: 'var(--color-text-muted)' }}>
          Posts aren't available right now. Please check back later.
        </p>
      )}
      {!loading && !error && visible.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>No posts match your search.</p>
      )}

      {!loading && !error && visible.length > 0 && (
        <m.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {visible.map((post) => (
            <m.article
              key={post.id}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3 rounded-[var(--radius-card)] border p-6"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <Link to={withRoleQuery(`/blog/${post.slug}`, roleId)} className="hover:underline" style={{ color: 'var(--color-text)' }}>
                <h2 className="text-xl font-semibold">{post.title}</h2>
              </Link>
              <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {post.published_at && <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString()}</time>}
                <span>{post.reading_time_minutes} min read</span>
              </div>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {post.excerpt}
              </p>
              <Link
                to={withRoleQuery(`/blog/${post.slug}`, roleId)}
                className="mt-2 w-max text-sm font-medium hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Read more →
              </Link>
            </m.article>
          ))}
        </m.div>
      )}
    </main>
  )
}
