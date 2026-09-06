import { Link } from 'react-router-dom'
import { useRole } from '../../hooks/useRole'
import { withRoleQuery } from '../../lib/roleLink'
import { usePublishedBlogs, latestForRole } from '../../lib/content/usePublicContent'
import { RoleTransition } from '../ui/RoleTransition'
import { SectionHeader } from '../ui/SectionHeader'
import { SectionShell } from '../ui/SectionShell'

// V2.2 P3 (PRD §6.1.2): CMS-backed "Latest Engineering Articles" homepage
// strip. Separate content source from the existing markdown /blog (see
// src/pages/BlogListPage.tsx, kept but no longer routed — P4 handles the
// migration/retirement of that path).
export function LatestArticlesSection() {
  const { roleId } = useRole()
  const { data, loading, error } = usePublishedBlogs()

  const latest = data ? latestForRole(data, roleId, 3) : []

  if (!loading && (error || latest.length === 0)) return null

  return (
    <SectionShell id="articles" muted>
      <RoleTransition>
        <SectionHeader
          slug="articles"
          title="Latest Engineering Articles"
          description="Notes on the systems and decisions behind the work."
        />
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-[var(--radius-card)] border"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {latest.map((post) => (
              <Link
                key={post.id}
                to={withRoleQuery(`/blog/${post.slug}`, roleId)}
                className="role-card hover-lift group flex flex-col border p-6 transition-colors duration-300 hover:border-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
              >
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {post.published_at && <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString()}</time>}
                  <span>{post.reading_time_minutes} min read</span>
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {post.excerpt}
                </p>
                {post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                          color: 'var(--color-accent)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link
            to={withRoleQuery('/blog', roleId)}
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-accent)' }}
          >
            View All Articles →
          </Link>
        </div>
      </RoleTransition>
    </SectionShell>
  )
}
